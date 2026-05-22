import {
  Cesium3DTileFeature,
  Color,
  ColorMaterialProperty,
  Cartographic,
  BoundingSphere,
  Entity,
  I3SDataProvider,
  createGuid,
  type Viewer,
} from 'cesium';
import { LayerBase, type LayerConfigParameters, type LayerOptions } from './LayerBase';
import { DataSourceController } from '../thematic/DataSourceController';
import { DataSourceKind, type DataSourceOptions } from '../thematic/types';

interface TaggedTileset {
  layerId?: string;
}

interface I3SFeature extends Cesium3DTileFeature {
  _storedBoundingSphere?: BoundingSphere;
  _storedOrientation?: { heading: number; pitch: number; roll: number };
  _batchId?: number;
  featureId: number;
  content: {
    tile: {
      i3sNode: {
        getFieldsForFeature(featureId: number): Record<string, unknown>;
      };
    };
  };
}

const GMLID_KEYS = ['gmlid', 'gml_id', 'gml-id', 'gml:id', 'id', 'OBJECTID'] as const;

export class I3SLayer extends LayerBase {
  readonly layerId: string = createGuid();
  name: string;
  url: string;
  active: boolean;
  region?: unknown;
  cameraPosition: Record<string, unknown> = {};

  thematicDataUrl: string;
  thematicDataSource: string;
  thematicDataProvider: string;
  tableType: string;
  layerDataType?: string;
  maximumScreenSpaceError: number | '';

  dataSourceController?: DataSourceController;

  private viewer?: Viewer;
  private i3sProvider?: I3SDataProvider;
  private hiddenObjects = new Set<I3SFeature>();

  constructor(options: LayerOptions) {
    super();
    this.url = options.url;
    this.name = options.name;
    this.region = options.region;
    this.active = options.active ?? true;
    this.thematicDataUrl = options.thematicDataUrl ?? '';
    this.thematicDataSource = options.thematicDataSource ?? '';
    this.thematicDataProvider = options.thematicDataProvider ?? '';
    this.tableType = options.tableType ?? '';
    this.maximumScreenSpaceError = options.maximumScreenSpaceError ?? '';
    this.layerDataType = options.layerDataType;

    if (this.thematicDataSource && this.thematicDataUrl) {
      const dsOptions: DataSourceOptions = {
        uri: this.thematicDataUrl,
        tableType: this.tableType as DataSourceOptions['tableType'],
      };
      this.dataSourceController = new DataSourceController(
        this.thematicDataSource as DataSourceKind,
        null,
        dsOptions,
      );
    }
  }

  get configParameters(): LayerConfigParameters {
    return {
      layerId: this.layerId,
      name: this.name,
      url: this.url,
      layerDataType: this.layerDataType,
      thematicDataUrl: this.thematicDataUrl,
      thematicDataProvider: this.thematicDataProvider,
      maximumScreenSpaceError: this.maximumScreenSpaceError,
    };
  }

  async addToCesium(viewer: Viewer): Promise<this> {
    this.viewer = viewer;

    // Source: https://sandcastle.cesium.com/?src=I3S%203D%20Object%20Layer.html
    const i3sProvider = await I3SDataProvider.fromUrl(this.url, {
      cesium3dTilesetOptions: this.buildTilesetOptions(),
      showFeatures: true,
    });

    this.tagLayers(i3sProvider);
    this.i3sProvider = i3sProvider;
    viewer.scene.primitives.add(i3sProvider);
    i3sProvider.show = this.active;
    return this;
  }

  removeFromCesium(_viewer: Viewer): void {
    if (this.i3sProvider && this.viewer) {
      this.viewer.scene.primitives.remove(this.i3sProvider);
      this.i3sProvider = undefined;
    }
    this.active = false;
  }

  activate(active: boolean): void {
    if (this.i3sProvider) this.i3sProvider.show = active;
    this.active = active;
  }

  async reActivate(): Promise<this> {
    if (!this.viewer) throw new Error('Layer has not been added to a viewer yet');
    this.hiddenObjects.clear();
    if (this.i3sProvider) {
      this.viewer.scene.primitives.remove(this.i3sProvider);
    }

    const i3sProvider = await I3SDataProvider.fromUrl(this.url, {
      cesium3dTilesetOptions: this.buildTilesetOptions(),
      adjustMaterialAlphaMode: true,
      showFeatures: true,
      applySymbology: true,
      calculateNormals: true,
    });

    this.tagLayers(i3sProvider);
    this.i3sProvider = i3sProvider;
    this.viewer.scene.primitives.add(i3sProvider);
    i3sProvider.show = this.active;
    // NOTE: original JS called this.registerMouseEventHandlers() here, but that method
    // did not exist on the prototype — it was a latent bug. Skipped.
    return this;
  }

  zoomToStartPosition(): void {
    if (!this.viewer || !this.i3sProvider) return;
    this.viewer.scene.camera.flyTo({
      destination: this.i3sProvider.extent,
    });
  }

  contains(object: unknown): object is I3SFeature {
    return (
      object instanceof Cesium3DTileFeature &&
      ((object.primitive as unknown as TaggedTileset | undefined)?.layerId === this.layerId)
    );
  }

  isEqual(a: I3SFeature, b: I3SFeature): boolean {
    if (!this.contains(a) || !this.contains(b)) return false;
    // _batchId is per-tile; use reference equality (Cesium caches feature wrappers).
    return a === b;
  }

  inArray(array: I3SFeature[] | undefined, object: I3SFeature): boolean {
    if (!array) return false;
    return array.some((i) => this.isEqual(i, object));
  }

  getColor(colorOrFeature: unknown): Color | ColorMaterialProperty | undefined {
    if (colorOrFeature == null) return undefined;
    // Same caching pitfall as Cesium3DTileFeature — clone to detach from the live cache.
    if (this.contains(colorOrFeature)) return Color.clone(colorOrFeature.color);
    if (colorOrFeature instanceof Color) return Color.clone(colorOrFeature);
    if (colorOrFeature instanceof ColorMaterialProperty) return colorOrFeature;
    return undefined;
  }

  setColor(feature: I3SFeature, colorOrFeature: unknown): void {
    if (!this.contains(feature)) return;
    if (colorOrFeature == null) {
      feature.color = undefined as unknown as Color;
    } else if (colorOrFeature instanceof Color) {
      feature.color = colorOrFeature;
    } else {
      const c = this.getColor(colorOrFeature);
      if (c instanceof Color) feature.color = c;
    }
  }

  setSelected(feature: I3SFeature): void {
    if (!this.viewer || !this.contains(feature)) return;
    const entity = new Entity();
    (entity as Entity & { _storedBoundingSphere?: BoundingSphere })._storedBoundingSphere =
      feature._storedBoundingSphere;
    this.viewer.selectedEntity = entity;
  }

  storeCameraPosition(viewer: Viewer, movement: { position: { x: number; y: number } }, feature: I3SFeature): void {
    if (!this.contains(feature)) return;
    const cartesian = viewer.scene.pickPosition(movement.position as never);
    if (!cartesian) return;
    const destination = Cartographic.fromCartesian(cartesian);
    feature._storedBoundingSphere = new BoundingSphere(Cartographic.toCartesian(destination), 40);
    feature._storedOrientation = {
      heading: viewer.camera.heading,
      pitch: viewer.camera.pitch,
      roll: viewer.camera.roll,
    };
  }

  getProperties(feature: I3SFeature): Record<string, unknown> | undefined {
    if (!this.contains(feature)) return undefined;
    const result: Record<string, unknown> = {};
    for (const key of feature.getPropertyIds()) {
      result[key] = feature.getProperty(key);
    }
    return result;
  }

  hideSelected(feature: I3SFeature): void {
    if (!this.contains(feature)) return;
    this.hiddenObjects.add(feature);
    feature.show = false;
  }

  show(feature: I3SFeature): void {
    if (!this.contains(feature)) return;
    this.hiddenObjects.delete(feature);
    feature.show = true;
  }

  getIdObject(feature: I3SFeature): { key: string | number; object: I3SFeature } | undefined {
    if (!this.contains(feature)) return undefined;
    const fields = feature.content.tile.i3sNode.getFieldsForFeature(feature.featureId);
    for (const key of GMLID_KEYS) {
      const gmlid = fields[key];
      if (gmlid != null) {
        return { key: gmlid as string | number, object: feature };
      }
    }
    return { key: feature._batchId as number, object: feature };
  }

  private buildTilesetOptions(): Record<string, unknown> {
    const options: Record<string, unknown> = {
      skipLevelOfDetail: false,
      debugShowBoundingVolume: false,
    };
    if (typeof this.maximumScreenSpaceError === 'number') {
      options.maximumScreenSpaceError = this.maximumScreenSpaceError;
    }
    return options;
  }

  private tagLayers(provider: I3SDataProvider): void {
    for (const layer of provider.layers) {
      const tileset = (layer as unknown as { tileset?: TaggedTileset }).tileset;
      if (tileset) tileset.layerId = this.layerId;
    }
  }
}
