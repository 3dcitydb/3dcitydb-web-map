import {
  Cesium3DTileColorBlendMode,
  Cesium3DTileFeature,
  type Cesium3DTileset,
  I3SDataProvider,
  type Viewer,
} from 'cesium';
import { LayerBase } from './LayerBase';
import { findObjectIdKey } from '../utils/objectId';

interface TaggedTileset {
  layerId?: string;
}

interface I3SFeature extends Cesium3DTileFeature {
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

export class I3SLayer extends LayerBase {
  protected async loadPrimitive(_viewer: Viewer): Promise<I3SDataProvider> {
    // Source: https://sandcastle.cesium.com/?src=I3S%203D%20Object%20Layer.html
    // Keep options minimal — applySymbology / calculateNormals / adjustMaterialAlphaMode can
    // regress endpoints whose drawingInfo is partial or that ship pre-baked normals.
    const provider = await I3SDataProvider.fromUrl(this.url, {
      cesium3dTilesetOptions: this.buildTilesetOptions(),
      showFeatures: true,
    });
    this.tagLayers(provider);
    this.configHighlightTint(provider);
    return provider;
  }

  // Mirror Cesium3DTilesLayer's tinted highlight (MIX @ 0.5) — applied per underlying tileset
  // because I3SDataProvider itself has no colorBlend properties.
  private configHighlightTint(provider: I3SDataProvider): void {
    for (const layer of provider.layers) {
      const tileset = (layer as unknown as { tileset?: Cesium3DTileset }).tileset;
      if (!tileset) continue;
      tileset.colorBlendMode = Cesium3DTileColorBlendMode.MIX;
      tileset.colorBlendAmount = 0.5;
    }
  }

  protected attachPrimitive(viewer: Viewer, primitive: I3SDataProvider): void {
    viewer.scene.primitives.add(primitive);
  }

  protected detachPrimitive(viewer: Viewer, primitive: I3SDataProvider): void {
    viewer.scene.primitives.remove(primitive);
  }

  protected setPrimitiveVisible(primitive: I3SDataProvider, visible: boolean): void {
    primitive.show = visible;
  }

  protected zoomToPrimitive(viewer: Viewer, primitive: I3SDataProvider): void {
    viewer.scene.camera.flyTo({ destination: primitive.extent });
  }

  protected setFeatureVisible(feature: I3SFeature, visible: boolean): void {
    feature.show = visible;
  }

  contains(object: unknown): object is I3SFeature {
    return (
      object instanceof Cesium3DTileFeature &&
      (object.primitive as unknown as TaggedTileset | undefined)?.layerId === this.layerId
    );
  }

  getIdObject(feature: I3SFeature): { key: string | number; object: I3SFeature } | undefined {
    if (!this.contains(feature)) return undefined;
    const fields = feature.content.tile.i3sNode.getFieldsForFeature(feature.featureId);
    const idKey = findObjectIdKey(Object.keys(fields));
    if (!idKey) return { key: feature._batchId as number, object: feature };
    const value = fields[idKey];
    return { key: (value ?? feature._batchId) as string | number, object: feature };
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
