import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  CesiumTerrainProvider,
  EllipsoidTerrainProvider,
  WebMapServiceImageryProvider,
  WebMapTileServiceImageryProvider,
  type ImageryLayer,
} from 'cesium';
import { useViewerRef } from '../viewer/viewerRef';

export interface ImageryConfig {
  kind: 'wms' | 'wmts';
  name: string;
  url: string;
  layers: string;
  tileStyle?: string;
  tileMatrixSetId?: string;
  additionalParameters?: string;
}

export interface TerrainConfig {
  name: string;
  url: string;
}

function parseAdditionalParameters(input?: string): Record<string, string> {
  if (!input) return {};
  const out: Record<string, string> = {};
  for (const pair of input.split('&')) {
    if (!pair) continue;
    const eq = pair.indexOf('=');
    if (eq < 0) continue;
    out[decodeURIComponent(pair.slice(0, eq))] = decodeURIComponent(pair.slice(eq + 1));
  }
  return out;
}

export const useBasemapStore = defineStore('basemap', () => {
  const { viewer } = useViewerRef();
  const imagery = ref<ImageryConfig | undefined>(undefined);
  const terrain = ref<TerrainConfig | undefined>(undefined);
  let imageryLayer: ImageryLayer | undefined;

  function setImagery(cfg: ImageryConfig): void {
    if (!viewer.value) throw new Error('Viewer is not ready');
    if (imageryLayer) {
      viewer.value.imageryLayers.remove(imageryLayer, true);
      imageryLayer = undefined;
    }
    const extra = parseAdditionalParameters(cfg.additionalParameters);
    let provider;
    if (cfg.kind === 'wms') {
      provider = new WebMapServiceImageryProvider({
        url: cfg.url,
        layers: cfg.layers,
        parameters: { transparent: true, format: 'image/png', ...extra },
      });
    } else {
      provider = new WebMapTileServiceImageryProvider({
        url: cfg.url,
        layer: cfg.layers,
        style: cfg.tileStyle ?? 'default',
        tileMatrixSetID: cfg.tileMatrixSetId ?? 'default',
        format: 'image/png',
      });
    }
    imageryLayer = viewer.value.imageryLayers.addImageryProvider(provider);
    imagery.value = cfg;
  }

  function removeImagery(): void {
    if (!viewer.value || !imageryLayer) return;
    viewer.value.imageryLayers.remove(imageryLayer, true);
    imageryLayer = undefined;
    imagery.value = undefined;
  }

  async function setTerrain(cfg: TerrainConfig): Promise<void> {
    if (!viewer.value) throw new Error('Viewer is not ready');
    viewer.value.terrainProvider = await CesiumTerrainProvider.fromUrl(cfg.url);
    terrain.value = cfg;
  }

  function removeTerrain(): void {
    if (!viewer.value) return;
    viewer.value.terrainProvider = new EllipsoidTerrainProvider();
    terrain.value = undefined;
  }

  return { imagery, terrain, setImagery, removeImagery, setTerrain, removeTerrain };
});
