import { defineStore } from 'pinia';
import { shallowRef, triggerRef } from 'vue';
import { Cesium3DTilesLayer, GeoJSONLayer, I3SLayer, type LayerBase } from '../layers';
import { useViewerRef } from '../viewer/viewerRef';

export type LayerKind = '3dtiles' | 'i3s' | 'geojson';

export interface LayerSpec {
  name: string;
  kind: LayerKind;
  url: string;
  maximumScreenSpaceError?: number;
  clampToGround?: boolean;
  thematicDataUrl?: string;
  thematicDataSource?: string;
  thematicDataProvider?: string;
  tableType?: string;
}

export interface ActiveLayer {
  id: string;
  spec: LayerSpec;
  instance: LayerBase;
  loading: boolean;
  error?: string;
}

export const useLayersStore = defineStore('layers', () => {
  // shallowRef keeps Cesium class instances un-proxied (preserves class identity + perf)
  const layers = shallowRef<ActiveLayer[]>([]);
  const { viewer } = useViewerRef();

  async function addLayer(spec: LayerSpec): Promise<void> {
    if (!viewer.value) {
      throw new Error('Cesium viewer is not ready yet');
    }
    const thematic = {
      thematicDataUrl: spec.thematicDataUrl,
      thematicDataSource: spec.thematicDataSource,
      thematicDataProvider: spec.thematicDataProvider,
      tableType: spec.tableType,
    };
    let instance: LayerBase;
    switch (spec.kind) {
      case '3dtiles':
        instance = new Cesium3DTilesLayer({
          url: spec.url,
          name: spec.name,
          maximumScreenSpaceError: spec.maximumScreenSpaceError,
          layerDataType: 'Cesium 3D Tiles',
          ...thematic,
        });
        break;
      case 'i3s':
        instance = new I3SLayer({
          url: spec.url,
          name: spec.name,
          maximumScreenSpaceError: spec.maximumScreenSpaceError,
          layerDataType: 'i3s',
          ...thematic,
        });
        break;
      case 'geojson':
        instance = new GeoJSONLayer({
          url: spec.url,
          name: spec.name,
          clampToGround: spec.clampToGround,
          layerDataType: 'geojson',
          ...thematic,
        });
        break;
      default: {
        const _exhaustive: never = spec.kind;
        throw new Error(`Unknown layer kind: ${String(_exhaustive)}`);
      }
    }

    const entry: ActiveLayer = {
      id: instance.layerId,
      spec,
      instance,
      loading: true,
    };
    layers.value = [...layers.value, entry];

    try {
      await instance.addToCesium(viewer.value);
      instance.zoomToStartPosition();
      entry.loading = false;
      triggerRef(layers);
    } catch (err) {
      entry.loading = false;
      entry.error = err instanceof Error ? err.message : String(err);
      triggerRef(layers);
      throw err;
    }
  }

  function removeLayer(id: string): void {
    const idx = layers.value.findIndex((l) => l.id === id);
    if (idx < 0) return;
    const entry = layers.value[idx];
    if (viewer.value) {
      entry.instance.removeFromCesium(viewer.value);
    }
    layers.value = layers.value.filter((l) => l.id !== id);
  }

  function toggleLayer(id: string, active: boolean): void {
    const entry = layers.value.find((l) => l.id === id);
    if (!entry) return;
    entry.instance.activate(active);
    triggerRef(layers);
  }

  return { layers, addLayer, removeLayer, toggleLayer };
});
