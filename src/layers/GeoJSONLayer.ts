import {
  Color,
  ColorMaterialProperty,
  Entity,
  GeoJsonDataSource,
  JulianDate,
  defined,
  type GeoJsonDataSource as GeoJsonDataSourceType,
  type Viewer,
} from 'cesium';
import { LayerBase, type LayerOptions } from './LayerBase';

interface TaggedEntity extends Entity {
  layerId?: string;
}

interface PickedGeoJsonObject {
  id: TaggedEntity;
}

export interface GeoJSONLayerOptions extends LayerOptions {
  clampToGround?: boolean;
}

const ID_PREFIXES = ['COLLADA_', 'KMLGeom_'] as const;

export class GeoJSONLayer extends LayerBase {
  clampToGround: boolean;

  constructor(options: GeoJSONLayerOptions) {
    super(options);
    this.clampToGround = options.clampToGround ?? false;
  }

  protected async loadPrimitive(_viewer: Viewer): Promise<GeoJsonDataSourceType> {
    const dataSource = await GeoJsonDataSource.load(this.url, {
      clampToGround: this.clampToGround,
    });
    this.tagEntities(dataSource);
    return dataSource;
  }

  protected async attachPrimitive(viewer: Viewer, primitive: GeoJsonDataSourceType): Promise<void> {
    await viewer.dataSources.add(primitive);
  }

  protected detachPrimitive(viewer: Viewer, primitive: GeoJsonDataSourceType): void {
    // destroy=true: we won't reuse this dataSource (either removed for good or about to reload).
    viewer.dataSources.remove(primitive, true);
  }

  protected setPrimitiveVisible(primitive: GeoJsonDataSourceType, visible: boolean): void {
    // `DataSource.show` toggles visualizer + picking without removing from the collection.
    // Synchronous + idempotent → no race against pending add/remove promises.
    primitive.show = visible;
  }

  protected zoomToPrimitive(viewer: Viewer, primitive: GeoJsonDataSourceType): void {
    viewer.flyTo(primitive);
  }

  protected setFeatureVisible(feature: PickedGeoJsonObject, visible: boolean): void {
    feature.id.show = visible;
  }

  /** GeoJSON pick wrappers (`{ id: Entity }`) are freshly allocated per pick, so
   *  reference equality on the wrapper fails. Cesium reuses the underlying Entity instance,
   *  so use that as the stable hidden-set identity. */
  protected identityOf(feature: unknown): unknown {
    return this.contains(feature) ? feature.id : feature;
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

  getProperties(feature: PickedGeoJsonObject): Record<string, unknown> | undefined {
    if (!this.contains(feature)) return undefined;
    const entity = feature.id;
    let objectId = entity.id;
    for (const prefix of ID_PREFIXES) {
      if (objectId.startsWith(prefix)) {
        objectId = objectId.slice(prefix.length);
        break;
      }
    }
    const result: Record<string, unknown> = { OBJECTID: objectId };
    if (entity.properties) {
      const now = JulianDate.now();
      Object.assign(result, entity.properties.getValue(now));
    }
    return result;
  }

  getIdObject(feature: PickedGeoJsonObject): { key: string; object: TaggedEntity } | undefined {
    if (!this.contains(feature)) return undefined;
    return { key: feature.id.id, object: feature.id };
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
