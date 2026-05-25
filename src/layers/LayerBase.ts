import { Color, ColorMaterialProperty, Entity, createGuid, type Viewer } from 'cesium';
import { DataSourceController } from '../thematic/DataSourceController';
import { DataSourceKind, type DataSourceOptions, type TableType } from '../thematic/types';

export interface LayerOptions {
  url: string;
  name: string;
  active?: boolean;
  thematicDataUrl?: string;
  thematicDataSource?: DataSourceKind;
  tableType?: TableType;
  maximumScreenSpaceError?: number;
}

export abstract class LayerBase {
  readonly layerId: string = createGuid();
  name: string;
  url: string;
  active: boolean;

  thematicDataUrl: string;
  thematicDataSource?: DataSourceKind;
  tableType?: TableType;
  maximumScreenSpaceError: number | '';

  dataSourceController?: DataSourceController;

  protected viewer?: Viewer;
  protected primitive?: unknown;
  /** Stores the *identity* of hidden features (see `identityOf`), not the pick wrapper itself,
   *  so freshly-picked wrappers for the same underlying entity still resolve as hidden. */
  protected hiddenObjects = new Set<unknown>();
  /** Cleanup callbacks bound to the current primitive (Cesium Event remove handles, etc.).
   *  Run and cleared on every detach so re-attach via reActivate starts clean. */
  private disposers: Array<() => void> = [];

  constructor(options: LayerOptions) {
    this.url = options.url;
    this.name = options.name;
    this.active = options.active ?? true;
    this.thematicDataUrl = options.thematicDataUrl ?? '';
    this.thematicDataSource = options.thematicDataSource;
    this.tableType = options.tableType;
    this.maximumScreenSpaceError = options.maximumScreenSpaceError ?? '';

    // Embedded was a KML-only legacy path that DataSourceController no longer supports;
    // skip controller construction rather than letting it throw inside `new LayerKind(...)`.
    if (
      this.thematicDataSource &&
      this.thematicDataSource !== DataSourceKind.Embedded &&
      this.thematicDataUrl
    ) {
      const dsOptions: DataSourceOptions = {
        uri: this.thematicDataUrl,
        tableType: this.tableType,
      };
      this.dataSourceController = new DataSourceController(
        this.thematicDataSource,
        null,
        dsOptions,
      );
    }
  }

  /** Each layer kind defines what "belongs to this layer". */
  abstract contains(object: unknown): boolean;

  hideSelected(feature: unknown): void {
    if (!this.contains(feature)) return;
    this.hiddenObjects.add(this.identityOf(feature));
    this.setFeatureVisible(feature, false);
  }

  show(feature: unknown): void {
    if (!this.contains(feature)) return;
    this.hiddenObjects.delete(this.identityOf(feature));
    this.setFeatureVisible(feature, true);
  }

  isHidden(feature: unknown): boolean {
    return this.hiddenObjects.has(this.identityOf(feature));
  }

  // --- Lifecycle hooks (subclasses MUST implement) ---

  /** Fetch / load the underlying Cesium primitive and tag it with `layerId`. */
  protected abstract loadPrimitive(viewer: Viewer): Promise<unknown>;
  /** Add the primitive to the scene. Async kinds (e.g. `dataSources.add`) may return a promise. */
  protected abstract attachPrimitive(viewer: Viewer, primitive: unknown): void | Promise<void>;
  /** Tear down — remove from the scene and, for destroyable kinds, destroy. */
  protected abstract detachPrimitive(viewer: Viewer, primitive: unknown): void;
  /** Toggle visibility without unloading. Collections without a `.show` property
   *  should re-add / remove from the collection (without destroying). */
  protected abstract setPrimitiveVisible(primitive: unknown, visible: boolean): void;
  protected abstract zoomToPrimitive(viewer: Viewer, primitive: unknown): void;

  /** Toggle a single picked feature's visibility. */
  protected abstract setFeatureVisible(feature: unknown, visible: boolean): void;

  /** Resolve a picked feature to a stable `{ key, object }` pair used by selection state,
   *  highlight tracking, and the InfoBox. Returns `undefined` for features not in this layer. */
  abstract getIdObject(feature: unknown): { key: string | number; object: unknown } | undefined;

  // --- Optional hooks ---

  /** Side-effects to run once the primitive is attached (point-cloud shading,
   *  tile event handlers, …). Default: no-op. */
  protected onAfterAttach(_viewer: Viewer, _primitive: unknown): void {}
  /** The stable identity used to track hidden features. Default: the pick wrapper itself
   *  (works for 3D Tiles / I3S, where Cesium caches wrappers per (content, batchId)).
   *  Pick wrappers that are freshly allocated per pick (e.g. GeoJSON `{ id: Entity }`)
   *  must override to return the underlying stable object. */
  protected identityOf(feature: unknown): unknown {
    return feature;
  }
  /** Clear cached selection / hidden state before a reload.
   *  Default impl clears `hiddenObjects`; subclasses with extra state should `super.resetSelectionState()`. */
  protected resetSelectionState(): void {
    this.hiddenObjects.clear();
  }

  /** Register a cleanup callback (e.g. the remove handle returned by `Event#addEventListener`).
   *  Runs on every detach (removeFromCesium / reActivate). Use from `onAfterAttach`. */
  protected addDisposer(fn: () => void): void {
    this.disposers.push(fn);
  }

  private runDisposers(): void {
    for (const fn of this.disposers) {
      try {
        fn();
      } catch {
        // A disposer's underlying object may already be destroyed; ignore.
      }
    }
    this.disposers.length = 0;
  }

  // --- Template methods ---

  async addToCesium(viewer: Viewer): Promise<this> {
    this.viewer = viewer;
    await this.loadAndAttach(viewer);
    return this;
  }

  removeFromCesium(_viewer: Viewer): void {
    if (this.viewer && this.primitive !== undefined) {
      this.runDisposers();
      this.detachPrimitive(this.viewer, this.primitive);
      this.primitive = undefined;
    }
    // Clear viewer last — addToCesium awaiting loadPrimitive watches this as a cancellation signal.
    this.viewer = undefined;
    this.active = false;
  }

  activate(active: boolean): void {
    if (this.primitive !== undefined) {
      this.setPrimitiveVisible(this.primitive, active);
    }
    this.active = active;
  }

  async reActivate(): Promise<this> {
    // Capture viewer locally — this.viewer can be cleared by removeFromCesium during an await,
    // which would otherwise turn later this.viewer.* accesses into TypeErrors.
    const viewer = this.viewer;
    if (!viewer) throw new Error('Layer has not been added to a viewer yet');
    this.resetSelectionState();
    if (this.primitive !== undefined) {
      this.runDisposers();
      this.detachPrimitive(viewer, this.primitive);
      this.primitive = undefined;
    }
    await this.loadAndAttach(viewer);
    return this;
  }

  // Shared load→attach→activate sequence for addToCesium and reActivate.
  // `this.viewer !== viewer` is the cancellation signal from removeFromCesium during an await.
  private async loadAndAttach(viewer: Viewer): Promise<void> {
    const primitive = await this.loadPrimitive(viewer);
    if (this.viewer !== viewer) {
      this.detachPrimitive(viewer, primitive);
      return;
    }
    this.primitive = primitive;
    await this.attachPrimitive(viewer, primitive);
    if (this.viewer !== viewer) {
      this.detachPrimitive(viewer, primitive);
      this.primitive = undefined;
      return;
    }
    this.setPrimitiveVisible(primitive, this.active);
    this.onAfterAttach(viewer, primitive);
  }

  zoomToStartPosition(): void {
    if (this.viewer && this.primitive !== undefined) {
      this.zoomToPrimitive(this.viewer, this.primitive);
    }
  }

  // Default impls below targeted Cesium3DTileFeature-shaped picks (3D Tiles, I3S).
  // GeoJSONLayer overrides those that need to address the Entity-wrapped pick shape.

  /** Cesium caches Cesium3DTileFeature wrappers per (content, batchId), so reference equality
   *  is the right check. Subclasses with non-cached pick shapes (e.g. GeoJSON entity wrappers)
   *  must override. */
  isEqual(a: unknown, b: unknown): boolean {
    if (!this.contains(a) || !this.contains(b)) return false;
    return a === b;
  }

  inArray(array: unknown[] | undefined, object: unknown): boolean {
    if (!array) return false;
    return array.some((i) => this.isEqual(i, object));
  }

  /** Cesium3DTileFeature#color is a cached `_color` instance mutated by batch-table reads,
   *  so we MUST clone — otherwise the stored "previous color" silently follows later edits. */
  getColor(colorOrFeature: unknown): Color | ColorMaterialProperty | undefined {
    if (colorOrFeature == null) return undefined;
    if (this.contains(colorOrFeature)) {
      return Color.clone((colorOrFeature as { color: Color }).color);
    }
    if (colorOrFeature instanceof Color) return Color.clone(colorOrFeature);
    if (colorOrFeature instanceof ColorMaterialProperty) return colorOrFeature;
    return undefined;
  }

  setColor(feature: unknown, colorOrFeature: unknown): void {
    if (!this.contains(feature)) return;
    const target = feature as { color: Color | undefined };
    if (colorOrFeature == null) {
      target.color = undefined;
    } else if (colorOrFeature instanceof Color) {
      target.color = colorOrFeature;
    } else {
      const c = this.getColor(colorOrFeature);
      if (c instanceof Color) target.color = c;
    }
  }

  /** 3D Tiles / I3S features aren't real Cesium Entities, so we hand the InfoBox a synthetic
   *  Entity that `fillInfoTable` writes `description` / `name` onto — Cesium reads those off
   *  `viewer.selectedEntity` to render the InfoBox.
   *  Note: Cesium's SelectionIndicator (the blue ring) can't position a synthetic entity
   *  because `DataSourceDisplay.getBoundingSphere` requires the entity to live in a registered
   *  DataSource's EntityCollection. Highlighting is handled separately via `setColor`.
   *  GeoJSONLayer overrides this with the real picked entity (selection ring works for it). */
  setSelected(feature: unknown): void {
    if (!this.viewer || !this.contains(feature)) return;
    this.viewer.selectedEntity = new Entity();
  }

  getProperties(feature: unknown): Record<string, unknown> | undefined {
    if (!this.contains(feature)) return undefined;
    const f = feature as { getPropertyIds(): string[]; getProperty(k: string): unknown };
    const result: Record<string, unknown> = {};
    for (const key of f.getPropertyIds()) {
      result[key] = f.getProperty(key);
    }
    return result;
  }
}
