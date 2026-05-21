import {
  Cesium3DTileFeature,
  Cesium3DTileset,
  Cesium3DTilePointFeature,
  Color,
  ColorMaterialProperty,
  Cartographic,
  BoundingSphere,
  Entity,
  createGuid,
  type Viewer,
} from 'cesium';
import { LayerBase, type LayerConfigParameters, type LayerOptions } from './LayerBase';
import { DataSourceController } from '../thematic/DataSourceController';
import { DataSourceKind, type DataSourceOptions } from '../thematic/types';

interface TaggedTileset extends Cesium3DTileset {
  layerId?: string;
}

interface TaggedFeature extends Cesium3DTileFeature {
  _storedBoundingSphere?: BoundingSphere;
  _storedOrientation?: { heading: number; pitch: number; roll: number };
  _batchId?: number;
}

export class Cesium3DTilesLayer extends LayerBase {
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

  highlightColor: Color = Color.AQUAMARINE;
  mouseOverHighlightColor: Color = Color.YELLOW;

  private viewer?: Viewer;
  private tileset?: TaggedTileset;
  private prevSelectedFeatures: TaggedFeature[] = [];
  private prevSelectedColors: Color[] = [];
  private hiddenObjects: TaggedFeature[] = [];

  constructor(options: LayerOptions) {
    super();
    this.url = this.autofillUrl(options.url);
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

  autofillUrl(strUrl: string): string {
    const suffix = strUrl.split('.').pop()?.toLowerCase();
    if (suffix === 'json') return strUrl;
    const sep = strUrl.endsWith('/') || strUrl.endsWith('\\') ? '' : '/';
    return `${strUrl}${sep}tileset.json`;
  }

  async addToCesium(viewer: Viewer): Promise<this> {
    this.viewer = viewer;

    const tilesetOptions: Record<string, unknown> = {};
    if (typeof this.maximumScreenSpaceError === 'number') {
      tilesetOptions.maximumScreenSpaceError = this.maximumScreenSpaceError;
    }

    const tileset = (await Cesium3DTileset.fromUrl(this.autofillUrl(this.url), tilesetOptions)) as TaggedTileset;
    tileset.layerId = this.layerId;
    this.tileset = tileset;
    viewer.scene.primitives.add(tileset);
    tileset.show = this.active;
    this.configPointCloudShading(tileset);
    this.registerTilesLoadedEventHandler();
    return this;
  }

  removeFromCesium(_viewer: Viewer): void {
    if (this.tileset && this.viewer) {
      this.viewer.scene.primitives.remove(this.tileset);
      this.tileset = undefined;
    }
    this.active = false;
  }

  activate(active: boolean): void {
    if (this.tileset) this.tileset.show = active;
    this.active = active;
  }

  async reActivate(): Promise<this> {
    if (!this.viewer) throw new Error('Layer has not been added to a viewer yet');
    this.prevSelectedFeatures = [];
    this.prevSelectedColors = [];
    this.hiddenObjects = [];
    if (this.tileset) {
      this.viewer.scene.primitives.remove(this.tileset);
    }
    const options: Record<string, unknown> = {};
    if (typeof this.maximumScreenSpaceError === 'number') {
      options.maximumScreenSpaceError = this.maximumScreenSpaceError;
    }
    const tileset = (await Cesium3DTileset.fromUrl(this.autofillUrl(this.url), options)) as TaggedTileset;
    tileset.layerId = this.layerId;
    this.tileset = tileset;
    this.viewer.scene.primitives.add(tileset);
    this.configPointCloudShading(tileset);
    this.registerTilesLoadedEventHandler();
    return this;
  }

  zoomToStartPosition(): void {
    if (this.viewer && this.tileset) {
      this.viewer.scene.camera.flyToBoundingSphere(this.tileset.boundingSphere);
    }
  }

  contains(object: unknown): object is TaggedFeature {
    return (
      object instanceof Cesium3DTileFeature &&
      (object.primitive as TaggedTileset | undefined)?.layerId === this.layerId
    );
  }

  isEqual(a: TaggedFeature, b: TaggedFeature): boolean {
    if (!this.contains(a) || !this.contains(b)) return false;
    return a._batchId === b._batchId;
  }

  inArray(array: TaggedFeature[] | undefined, object: TaggedFeature): boolean {
    if (!array) return false;
    return array.some((i) => this.isEqual(i, object));
  }

  isInHighlightedList(feature: TaggedFeature): boolean {
    return this.prevSelectedFeatures.includes(feature);
  }

  unHighlightAllObjects(): void {
    for (let i = 0; i < this.prevSelectedFeatures.length; i++) {
      this.prevSelectedFeatures[i].color = this.prevSelectedColors[i];
    }
    this.prevSelectedFeatures = [];
    this.prevSelectedColors = [];
  }

  getColor(colorOrFeature: unknown): Color | ColorMaterialProperty | undefined {
    if (colorOrFeature == null) return undefined;
    // Cesium3DTileFeature#color is a cached `_color` instance mutated by batch-table reads,
    // so we MUST clone — otherwise the stored "previous color" silently follows later edits.
    if (this.contains(colorOrFeature)) return Color.clone(colorOrFeature.color);
    if (colorOrFeature instanceof Color) return Color.clone(colorOrFeature);
    if (colorOrFeature instanceof ColorMaterialProperty) return colorOrFeature;
    return undefined;
  }

  setColor(feature: TaggedFeature, colorOrFeature: unknown): void {
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

  setSelected(feature: TaggedFeature): void {
    if (!this.viewer || !this.contains(feature)) return;
    const entity = new Entity();
    (entity as Entity & { _storedBoundingSphere?: BoundingSphere })._storedBoundingSphere =
      feature._storedBoundingSphere;
    this.viewer.selectedEntity = entity;
  }

  storeCameraPosition(viewer: Viewer, movement: { position: { x: number; y: number } }, feature: TaggedFeature): void {
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

  getProperties(feature: TaggedFeature): Record<string, unknown> | undefined {
    if (!this.contains(feature)) return undefined;
    const result: Record<string, unknown> = {};
    for (const key of feature.getPropertyIds()) {
      result[key] = feature.getProperty(key);
    }
    return result;
  }

  hideSelected(feature: TaggedFeature): void {
    if (!this.contains(feature)) return;
    feature.show = false;
  }

  show(feature: TaggedFeature): void {
    if (!this.contains(feature)) return;
    feature.show = true;
  }

  getIdObject(feature: TaggedFeature): { key: string; object: TaggedFeature } | undefined {
    if (!this.contains(feature)) return undefined;
    const gmlidKeys = ['gmlid', 'gml_id', 'gml-id', 'gml:id', 'id'];
    for (const key of gmlidKeys) {
      const gmlid = feature.getProperty(key);
      if (gmlid != null) {
        return { key: gmlid as string, object: feature };
      }
    }
    return undefined;
  }

  private configPointCloudShading(tileset: Cesium3DTileset): void {
    tileset.pointCloudShading.attenuation = true;
    tileset.pointCloudShading.maximumAttenuation = 3;
    tileset.pointCloudShading.eyeDomeLighting = true;
    tileset.pointCloudShading.eyeDomeLightingStrength = 0.5;
    tileset.pointCloudShading.eyeDomeLightingRadius = 0.5;
  }

  private registerTilesLoadedEventHandler(): void {
    if (!this.tileset) return;
    this.tileset.tileVisible.addEventListener((tile) => {
      const content = tile.content;
      if (content instanceof Cesium3DTilePointFeature) {
        (content as Cesium3DTilePointFeature & { _pointCloud?: { _pointSize: number } })._pointCloud!._pointSize = 3;
        return;
      }
      const featuresLength = content?.featuresLength ?? 0;
      for (let k = 0; k < featuresLength; k++) {
        const feature = content?.getFeature(k) as TaggedFeature | undefined;
        if (!feature) continue;

        if (this.isInHighlightedList(feature) && !Color.equals(feature.color, this.highlightColor)) {
          feature.color = this.highlightColor;
        }

        // NOTE: original JS referenced an undefined `objectId` here, which was a latent bug;
        // the intent is clearly to check the current `feature`.
        if (!this.isInHighlightedList(feature) && Color.equals(feature.color, this.highlightColor)) {
          const i = this.prevSelectedFeatures.indexOf(feature);
          if (i >= 0) {
            feature.color = this.prevSelectedColors[i];
            this.prevSelectedFeatures.splice(i, 1);
            this.prevSelectedColors.splice(i, 1);
          }
        }

        feature.show = !this.hiddenObjects.includes(feature);
      }
    });
  }
}
