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
  /** Initial hidden / highlighted feature ids — used to restore a scene link before
   *  the underlying tiles have streamed in. The first `tileVisible` pass per id then
   *  captures the natural color and applies the highlight tint. */
  hiddenIds?: Iterable<string>;
  highlightedIds?: Iterable<string>;
}

type StoredColor = Color | ColorMaterialProperty | undefined;

interface HighlightEntry {
  /** Original color captured at highlight time, used to restore on removeHighlight. */
  color: StoredColor;
  /** Most recently seen wrapper for this id — refreshed by `applyStateToFeature` on tile
   *  re-render. May go stale after LOD eviction; consumers must tolerate that. Used only
   *  by `hide()` and the ActionsPanel fly-to (best-effort). */
  latestWrapper?: unknown;
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

  /** Color applied to highlighted features. Subclasses' tileVisible loops re-apply this
   *  when a streamed feature comes back into view. */
  protected readonly highlightColor: Color = Color.AQUAMARINE;

  /** IDs (from `getIdKey`) of features that should remain hidden. Survives LOD eviction —
   *  the id, not the wrapper, is the persistent identity. */
  protected hiddenIds = new Set<string>();
  /** Most recently seen wrapper per hidden id — populated by `applyStateToFeature`. Lets
   *  `getAllHiddenObjects` return a usable feature reference for the ActionsPanel fly-to
   *  even when the id was restored from a URL and no live wrapper exists yet. */
  protected hiddenWrappers = new Map<string, unknown>();
  /** IDs of features that should remain highlighted, plus the original color to restore. */
  protected highlightedIds = new Map<string, HighlightEntry>();

  /** Snapshot of currently-hidden ids for serialization (e.g. scene link). */
  get hiddenIdList(): string[] {
    return [...this.hiddenIds];
  }
  /** Snapshot of currently-highlighted ids for serialization. */
  get highlightedIdList(): string[] {
    return [...this.highlightedIds.keys()];
  }

  /** Notified after any hidden/highlight state mutation (including async wrapper discovery
   *  during tile streaming). Wired by `useLayersStore` to bump a shared reactive trigger,
   *  so Vue computeds depending on `getAllHiddenObjects` / `getAllHighlightedObjects`
   *  re-evaluate. Default no-op so unit tests that construct a layer directly don't have
   *  to install a listener. */
  onStateChange: () => void = () => {};

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

    if (options.hiddenIds) {
      for (const id of options.hiddenIds) this.hiddenIds.add(id);
    }
    if (options.highlightedIds) {
      // No live wrapper yet — `applyStateToFeature` on first tileVisible will refresh
      // latestWrapper and capture the natural color before applying the highlight tint.
      for (const id of options.highlightedIds) {
        this.highlightedIds.set(id, { color: undefined, latestWrapper: undefined });
      }
    }
  }

  /** Each layer kind defines what "belongs to this layer". */
  abstract contains(object: unknown): boolean;

  // --- Hide / show -----------------------------------------------------------

  hide(feature: unknown): void {
    const id = this.getIdKey(feature);
    if (id === undefined) return;
    this.hiddenWrappers.set(id, feature);
    this.hideById(id);
  }

  /** Hide-by-id path so URL-restored hidden ids can be set up before any wrapper exists.
   *  If a wrapper is already cached (either here or via an in-progress highlight), apply
   *  visibility now; otherwise `applyStateToFeature` will pick it up on tileVisible. */
  hideById(id: string): void {
    this.hiddenIds.add(id);
    const wrapper = this.hiddenWrappers.get(id) ?? this.highlightedIds.get(id)?.latestWrapper;
    if (wrapper) this.setFeatureVisible(wrapper, false);
    this.onStateChange();
  }

  show(feature: unknown): void {
    const id = this.getIdKey(feature);
    if (id === undefined) return;
    this.hiddenIds.delete(id);
    this.hiddenWrappers.delete(id);
    this.setFeatureVisible(feature, true);
    this.onStateChange();
  }

  isHidden(feature: unknown): boolean {
    const id = this.getIdKey(feature);
    return id !== undefined && this.hiddenIds.has(id);
  }

  /** Clear all hidden state. For streamed layers (3D Tiles / I3S) the next `tileVisible`
   *  pass restores `feature.show = true` on any currently-loaded feature. Persistent layers
   *  (GeoJSON) must walk their entities — see `restoreAllVisibility`. */
  showAll(): void {
    this.hiddenIds.clear();
    this.hiddenWrappers.clear();
    this.restoreAllVisibility();
    this.onStateChange();
  }

  /** Called by `showAll` after `hiddenIds` is cleared. Streamed layers can leave this as
   *  a no-op (the tileVisible loop re-shows). GeoJSON overrides to iterate entities. */
  protected restoreAllVisibility(): void {}

  // --- Highlight -------------------------------------------------------------

  addHighlight(feature: unknown): void {
    const id = this.getIdKey(feature);
    if (id === undefined) return;
    if (this.highlightedIds.has(id)) return;
    this.highlightedIds.set(id, {
      color: this.getColor(feature),
      latestWrapper: feature,
    });
    this.setColor(feature, this.highlightColor);
    this.onStateChange();
  }

  removeHighlight(feature: unknown): void {
    const id = this.getIdKey(feature);
    if (id === undefined) return;
    const entry = this.highlightedIds.get(id);
    if (!entry) return;
    this.setColor(feature, entry.color);
    this.highlightedIds.delete(id);
    this.onStateChange();
  }

  clearHighlights(): void {
    for (const entry of this.highlightedIds.values()) {
      if (entry.latestWrapper) {
        try {
          this.setColor(entry.latestWrapper, entry.color);
        } catch (err) {
          // Most likely a wrapper went stale post-LOD eviction (the fresh batch table
          // already shows default color, so the missed write is harmless). Log anyway —
          // a genuine bug here would otherwise be invisible.
          console.error(err);
        }
      }
    }
    this.highlightedIds.clear();
    this.onStateChange();
  }

  isHighlighted(feature: unknown): boolean {
    const id = this.getIdKey(feature);
    return id !== undefined && this.highlightedIds.has(id);
  }

  /** Iteration accessor for useWebMap / ActionsPanel — returns `{ id, latestWrapper }`
   *  per currently-highlighted feature. Wrapper may be stale (LOD eviction). */
  highlightEntries(): Array<{ id: string; latestWrapper?: unknown }> {
    return [...this.highlightedIds.entries()].map(([id, entry]) => ({
      id,
      latestWrapper: entry.latestWrapper,
    }));
  }

  /** Iteration accessor for hidden ids. `latestWrapper` is the most recently observed
   *  wrapper from either the hidden- or highlight-side bookkeeping. */
  hiddenEntries(): Array<{ id: string; latestWrapper?: unknown }> {
    return [...this.hiddenIds].map((id) => ({
      id,
      latestWrapper: this.hiddenWrappers.get(id) ?? this.highlightedIds.get(id)?.latestWrapper,
    }));
  }

  /** Apply persistent hidden/highlight state to a feature that's just (re)entered the
   *  scene. Called by subclass `tileVisible` loops every frame, so we guard the writes —
   *  Color.equals avoids dirtying the batch table when the feature is already the right
   *  color, and the show check avoids needless property writes. */
  protected applyStateToFeature(feature: unknown): void {
    // Hot path: most users never hide or highlight anything. Short-circuit before doing
    // the (per-feature) id resolution and getPropertyIds allocation.
    if (this.hiddenIds.size === 0 && this.highlightedIds.size === 0) return;

    const id = this.getIdKey(feature);
    if (id === undefined) return;

    // Track whether any wrapper transitioned from "never seen" to "seen" so we can fire
    // exactly one onStateChange per id over the layer lifetime (matters for URL-restored
    // ids whose dropdown fly-to should activate as soon as the tile streams in).
    let firstWrapper = false;

    const shouldShow = !this.hiddenIds.has(id);
    const target = feature as { show?: boolean; color?: Color };
    if (target.show !== shouldShow) this.setFeatureVisible(feature, shouldShow);

    if (this.hiddenIds.has(id)) {
      if (!this.hiddenWrappers.has(id)) firstWrapper = true;
      this.hiddenWrappers.set(id, feature);
    } else {
      this.hiddenWrappers.delete(id);
    }

    const entry = this.highlightedIds.get(id);
    if (entry) {
      // URL-restored highlights enter the runtime with no captured color. Capture from
      // the first live wrapper we see — before we overwrite it with the highlight tint —
      // so a later Clear-highlight restores the natural color instead of clearing to
      // undefined. `latestWrapper === undefined` is the "never seen a wrapper" signal;
      // it can't be confused with the click-time path because `addHighlight` always
      // sets latestWrapper before applyStateToFeature runs.
      if (entry.latestWrapper === undefined) firstWrapper = true;
      if (entry.color === undefined && entry.latestWrapper === undefined) {
        entry.color = this.getColor(feature);
      }
      entry.latestWrapper = feature;
      if (!target.color || !Color.equals(target.color, this.highlightColor)) {
        this.setColor(feature, this.highlightColor);
      }
    }

    if (firstWrapper) this.onStateChange();
  }

  /** Called once after `onAfterAttach` to apply seeded hidden/highlight state to features
   *  that are already loaded. Streamed layers leave this as a no-op — their `tileVisible`
   *  loop catches features as tiles become visible. Non-streamed layers (GeoJSON) override
   *  to walk their entity collection. */
  protected applyStateToAllLoadedFeatures(): void {}

  // --- Lifecycle hooks (subclasses MUST implement) ---------------------------

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

  /** Resolve a picked feature to a stable `{ key, object }` pair used by the InfoBox and
   *  by `getIdKey`. Returns `undefined` for features not in this layer. */
  abstract getIdObject(feature: unknown): { key: string | number; object: unknown } | undefined;

  /** Stable string identity used by hidden/highlight tracking. Default: stringified
   *  `getIdObject(...).key`. Returns undefined if the feature isn't ours. */
  getIdKey(feature: unknown): string | undefined {
    const idObj = this.getIdObject(feature);
    return idObj === undefined ? undefined : String(idObj.key);
  }

  // --- Optional hooks --------------------------------------------------------

  /** Side-effects to run once the primitive is attached (point-cloud shading,
   *  tile event handlers, …). Default: no-op. */
  protected onAfterAttach(_viewer: Viewer, _primitive: unknown): void {}

  /** Clear cached selection / hidden state before a reload. */
  protected resetSelectionState(): void {
    this.hiddenIds.clear();
    this.hiddenWrappers.clear();
    this.highlightedIds.clear();
    this.onStateChange();
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

  // --- Template methods ------------------------------------------------------

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
    this.applyStateToAllLoadedFeatures();
  }

  zoomToStartPosition(): void {
    if (this.viewer && this.primitive !== undefined) {
      this.zoomToPrimitive(this.viewer, this.primitive);
    }
  }

  // Default impls below targeted Cesium3DTileFeature-shaped picks (3D Tiles, I3S).
  // GeoJSONLayer overrides those that need to address the Entity-wrapped pick shape.

  /** Cesium caches Cesium3DTileFeature wrappers per (content, batchId) only while the tile
   *  is loaded — across LOD eviction the wrappers are different instances. Reference
   *  equality is still useful for short-lived "is this the same pick?" checks (hover
   *  vs. click within one frame). Persistent identity is handled by `getIdKey`. */
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
