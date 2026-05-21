import {
  BoundingSphere,
  Cartographic,
  Color,
  ColorMaterialProperty,
  Entity,
  GeoJsonDataSource,
  JulianDate,
  createGuid,
  defined,
  type GeoJsonDataSource as GeoJsonDataSourceType,
  type Viewer,
} from 'cesium';
import { LayerBase, type LayerConfigParameters, type LayerOptions } from './LayerBase';
import { DataSourceController } from '../thematic/DataSourceController';
import { DataSourceKind, type DataSourceOptions } from '../thematic/types';

interface TaggedEntity extends Entity {
  layerId?: string;
  _storedBoundingSphere?: BoundingSphere;
  _storedOrientation?: { heading: number; pitch: number; roll: number };
}

interface PickedGeoJsonObject {
  id: TaggedEntity;
}

export interface GeoJSONLayerOptions extends LayerOptions {
  clampToGround?: boolean;
}

const ID_PREFIXES = ['COLLADA_', 'KMLGeom_'] as const;

export class GeoJSONLayer extends LayerBase {
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
  clampToGround: boolean;

  dataSourceController?: DataSourceController;

  highlightColor: Color = Color.AQUAMARINE;
  mouseOverHighlightColor: Color = Color.YELLOW;

  private viewer?: Viewer;
  private dataSource?: GeoJsonDataSourceType;
  private prevSelectedFeatures: PickedGeoJsonObject[] = [];
  private prevSelectedMaterials: (ColorMaterialProperty | undefined)[] = [];
  private hiddenObjects: PickedGeoJsonObject[] = [];

  constructor(options: GeoJSONLayerOptions) {
    super();
    this.url = options.url;
    this.name = options.name;
    this.region = options.region;
    this.active = options.active ?? true;
    this.thematicDataUrl = options.thematicDataUrl ?? '';
    this.thematicDataSource = options.thematicDataSource ?? '';
    this.thematicDataProvider = options.thematicDataProvider ?? '';
    this.tableType = options.tableType ?? '';
    this.layerDataType = options.layerDataType;
    this.clampToGround = options.clampToGround ?? false;

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
      maximumScreenSpaceError: '',
    };
  }

  async addToCesium(viewer: Viewer): Promise<this> {
    this.viewer = viewer;

    const dataSource = await GeoJsonDataSource.load(this.url, {
      clampToGround: this.clampToGround,
    });
    this.tagEntities(dataSource);
    this.dataSource = dataSource;
    await viewer.dataSources.add(dataSource);
    return this;
  }

  removeFromCesium(_viewer: Viewer): void {
    if (this.dataSource && this.viewer) {
      this.viewer.dataSources.remove(this.dataSource, true);
      this.dataSource = undefined;
    }
    this.active = false;
  }

  activate(active: boolean): void {
    if (!this.viewer || !this.dataSource) {
      this.active = active;
      return;
    }
    if (active) {
      if (!this.viewer.dataSources.contains(this.dataSource)) {
        this.viewer.dataSources.add(this.dataSource);
      }
    } else {
      this.viewer.dataSources.remove(this.dataSource, false);
    }
    this.active = active;
  }

  async reActivate(): Promise<this> {
    if (!this.viewer) throw new Error('Layer has not been added to a viewer yet');
    this.prevSelectedFeatures = [];
    this.prevSelectedMaterials = [];
    this.hiddenObjects = [];

    if (this.dataSource && this.active) {
      this.viewer.dataSources.remove(this.dataSource, false);
    }

    const dataSource = await GeoJsonDataSource.load(this.url, {
      clampToGround: this.clampToGround,
    });
    this.tagEntities(dataSource);
    this.dataSource = dataSource;
    await this.viewer.dataSources.add(dataSource);
    return this;
  }

  zoomToStartPosition(): void {
    if (this.viewer && this.dataSource) {
      this.viewer.flyTo(this.dataSource);
    }
  }

  contains(object: unknown): object is PickedGeoJsonObject {
    if (object == null || typeof object !== 'object') return false;
    const candidate = object as { id?: TaggedEntity };
    return candidate.id instanceof Entity && candidate.id.layerId === this.layerId;
  }

  isEqual(a: PickedGeoJsonObject, b: PickedGeoJsonObject): boolean {
    if (!this.contains(a) || !this.contains(b)) return false;
    return a.id.id === b.id.id;
  }

  inArray(array: PickedGeoJsonObject[] | undefined, object: PickedGeoJsonObject): boolean {
    if (!array) return false;
    return array.some((i) => this.isEqual(i, object));
  }

  getColor(colorOrFeature: unknown): Color | ColorMaterialProperty | undefined {
    if (colorOrFeature == null) return undefined;
    if (this.contains(colorOrFeature)) {
      return colorOrFeature.id.polygon?.material as ColorMaterialProperty | undefined;
    }
    if (colorOrFeature instanceof Color) return Color.clone(colorOrFeature);
    if (colorOrFeature instanceof ColorMaterialProperty) return colorOrFeature;
    return undefined;
  }

  setColor(feature: PickedGeoJsonObject, colorOrFeature: unknown): void {
    if (!this.contains(feature) || !feature.id.polygon) return;
    if (colorOrFeature == null) {
      feature.id.polygon.material = undefined as unknown as ColorMaterialProperty;
    } else if (colorOrFeature instanceof Color) {
      feature.id.polygon.material = new ColorMaterialProperty(colorOrFeature);
    } else if (colorOrFeature instanceof ColorMaterialProperty) {
      feature.id.polygon.material = colorOrFeature;
    } else {
      const material = this.getColor(colorOrFeature);
      if (material instanceof ColorMaterialProperty) {
        feature.id.polygon.material = material;
      }
    }
  }

  setSelected(feature: PickedGeoJsonObject): void {
    if (!this.viewer || !this.contains(feature)) return;
    this.viewer.selectedEntity = feature.id;
  }

  storeCameraPosition(
    viewer: Viewer,
    movement: { position: { x: number; y: number } },
    feature: PickedGeoJsonObject,
  ): void {
    if (!this.contains(feature)) return;
    const cartesian = viewer.scene.pickPosition(movement.position as never);
    if (!cartesian) return;
    const destination = Cartographic.fromCartesian(cartesian);
    feature.id._storedBoundingSphere = new BoundingSphere(Cartographic.toCartesian(destination), 40);
    feature.id._storedOrientation = {
      heading: viewer.camera.heading,
      pitch: viewer.camera.pitch,
      roll: viewer.camera.roll,
    };
  }

  getProperties(feature: PickedGeoJsonObject): Record<string, unknown> | undefined {
    if (!this.contains(feature)) return undefined;
    const entity = feature.id;
    let gmlid = entity.id;
    for (const prefix of ID_PREFIXES) {
      if (gmlid.startsWith(prefix)) {
        gmlid = gmlid.slice(prefix.length);
        break;
      }
    }
    const result: Record<string, unknown> = { gmlid };
    if (entity.properties) {
      const now = JulianDate.now();
      Object.assign(result, entity.properties.getValue(now));
    }
    return result;
  }

  hideSelected(feature: PickedGeoJsonObject): void {
    if (!this.contains(feature)) return;
    feature.id.show = false;
    this.hiddenObjects.push(feature);
  }

  show(feature: PickedGeoJsonObject): void {
    if (!this.contains(feature)) return;
    feature.id.show = true;
    const idx = this.hiddenObjects.findIndex((h) => this.isEqual(h, feature));
    if (idx >= 0) this.hiddenObjects.splice(idx, 1);
  }

  getIdObject(feature: PickedGeoJsonObject): { key: string; object: TaggedEntity } | undefined {
    if (!this.contains(feature)) return undefined;
    return { key: feature.id.id, object: feature.id };
  }

  highlight(features: Iterable<PickedGeoJsonObject>): void {
    for (const feature of features) {
      if (!this.contains(feature) || !feature.id.polygon) continue;
      this.prevSelectedFeatures.push(feature);
      this.prevSelectedMaterials.push(
        feature.id.polygon.material as ColorMaterialProperty | undefined,
      );
      feature.id.polygon.material = new ColorMaterialProperty(this.highlightColor);
    }
  }

  unHighlightAllObjects(): void {
    for (let i = 0; i < this.prevSelectedFeatures.length; i++) {
      const feature = this.prevSelectedFeatures[i];
      if (!feature.id.polygon) continue;
      feature.id.polygon.material = this.prevSelectedMaterials[i] as ColorMaterialProperty;
    }
    this.prevSelectedFeatures = [];
    this.prevSelectedMaterials = [];
  }

  isInHighlightedList(feature: PickedGeoJsonObject): boolean {
    return this.prevSelectedFeatures.some((f) => this.isEqual(f, feature));
  }

  showAllObjects(): void {
    for (const feature of this.hiddenObjects) {
      feature.id.show = true;
    }
    this.hiddenObjects = [];
  }

  getAllHighlightedObjects(): Record<string, TaggedEntity> {
    const result: Record<string, TaggedEntity> = {};
    for (const feature of this.prevSelectedFeatures) {
      result[feature.id.id] = feature.id;
    }
    return result;
  }

  getAllHiddenObjects(): Record<string, TaggedEntity> {
    const result: Record<string, TaggedEntity> = {};
    for (const feature of this.hiddenObjects) {
      result[feature.id.id] = feature.id;
    }
    return result;
  }

  private tagEntities(dataSource: GeoJsonDataSourceType): void {
    for (const entity of dataSource.entities.values) {
      const tagged = entity as TaggedEntity;
      if (!defined(tagged.layerId)) {
        tagged.layerId = this.layerId;
      }
    }
  }
}
