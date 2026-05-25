import {
  Cesium3DTileColorBlendMode,
  Cesium3DTileFeature,
  Cesium3DTileset,
  Cesium3DTilePointFeature,
  type Viewer,
} from 'cesium';
import { LayerBase, type LayerOptions } from './LayerBase';
import { findObjectIdKey } from '../utils/objectId';

interface TaggedTileset extends Cesium3DTileset {
  layerId?: string;
}

interface TaggedFeature extends Cesium3DTileFeature {
  _batchId?: number;
}

export class Cesium3DTilesLayer extends LayerBase {
  constructor(options: LayerOptions) {
    super(options);
    this.url = this.autofillUrl(this.url);
  }

  autofillUrl(strUrl: string): string {
    const suffix = strUrl.split('.').pop()?.toLowerCase();
    if (suffix === 'json') return strUrl;
    const sep = strUrl.endsWith('/') || strUrl.endsWith('\\') ? '' : '/';
    return `${strUrl}${sep}tileset.json`;
  }

  protected async loadPrimitive(_viewer: Viewer): Promise<TaggedTileset> {
    const options: Record<string, unknown> = {};
    if (typeof this.maximumScreenSpaceError === 'number') {
      options.maximumScreenSpaceError = this.maximumScreenSpaceError;
    }
    const tileset = (await Cesium3DTileset.fromUrl(
      this.autofillUrl(this.url),
      options,
    )) as TaggedTileset;
    tileset.layerId = this.layerId;
    return tileset;
  }

  protected attachPrimitive(viewer: Viewer, primitive: TaggedTileset): void {
    viewer.scene.primitives.add(primitive);
  }

  protected detachPrimitive(viewer: Viewer, primitive: TaggedTileset): void {
    viewer.scene.primitives.remove(primitive);
  }

  protected setPrimitiveVisible(primitive: TaggedTileset, visible: boolean): void {
    primitive.show = visible;
  }

  protected zoomToPrimitive(viewer: Viewer, primitive: TaggedTileset): void {
    viewer.scene.camera.flyToBoundingSphere(primitive.boundingSphere);
  }

  protected setFeatureVisible(feature: TaggedFeature, visible: boolean): void {
    feature.show = visible;
  }

  protected onAfterAttach(_viewer: Viewer, primitive: TaggedTileset): void {
    this.configPointCloudShading(primitive);
    this.configHighlightTint(primitive);
    this.registerTilesLoadedEventHandler(primitive);
  }

  contains(object: unknown): object is TaggedFeature {
    return (
      object instanceof Cesium3DTileFeature &&
      (object.primitive as TaggedTileset | undefined)?.layerId === this.layerId
    );
  }

  getIdObject(feature: TaggedFeature): { key: string | number; object: TaggedFeature } | undefined {
    if (!this.contains(feature)) return undefined;
    const idKey = findObjectIdKey(feature.getPropertyIds());
    if (!idKey) return { key: feature._batchId as number, object: feature };
    const value = feature.getProperty(idKey);
    return { key: (value ?? feature._batchId) as string | number, object: feature };
  }

  // MIX blends `feature.color` with the existing texture so highlight/selection don't replace
  // the building skin outright. 0.5 keeps roughly equal contributions from tint and texture.
  private configHighlightTint(tileset: Cesium3DTileset): void {
    tileset.colorBlendMode = Cesium3DTileColorBlendMode.MIX;
    tileset.colorBlendAmount = 0.5;
  }

  private configPointCloudShading(tileset: Cesium3DTileset): void {
    tileset.pointCloudShading.attenuation = true;
    tileset.pointCloudShading.maximumAttenuation = 3;
    tileset.pointCloudShading.eyeDomeLighting = true;
    tileset.pointCloudShading.eyeDomeLightingStrength = 0.5;
    tileset.pointCloudShading.eyeDomeLightingRadius = 0.5;
  }

  private registerTilesLoadedEventHandler(tileset: TaggedTileset): void {
    const remove = tileset.tileVisible.addEventListener((tile) => {
      const content = tile.content;
      if (content instanceof Cesium3DTilePointFeature) {
        (
          content as Cesium3DTilePointFeature & { _pointCloud?: { _pointSize: number } }
        )._pointCloud!._pointSize = 3;
        return;
      }
      const featuresLength = content?.featuresLength ?? 0;
      for (let k = 0; k < featuresLength; k++) {
        const feature = content?.getFeature(k) as TaggedFeature | undefined;
        if (!feature) continue;
        const shouldShow = !this.isHidden(feature);
        if (feature.show !== shouldShow) feature.show = shouldShow;
      }
    });
    this.addDisposer(remove);
  }
}
