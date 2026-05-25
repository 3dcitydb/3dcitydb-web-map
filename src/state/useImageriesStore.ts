import { defineStore } from 'pinia';
import {
  WebMapServiceImageryProvider,
  WebMapTileServiceImageryProvider,
  type ImageryLayer,
} from 'cesium';
import { createEntryRegistry } from './entryRegistry';
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

export interface ActiveImagery {
  id: string;
  spec: ImageryConfig;
  layer: ImageryLayer;
  active: boolean;
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

function buildProvider(cfg: ImageryConfig) {
  const extra = parseAdditionalParameters(cfg.additionalParameters);
  if (cfg.kind === 'wms') {
    return new WebMapServiceImageryProvider({
      url: cfg.url,
      layers: cfg.layers,
      parameters: { transparent: true, format: 'image/png', ...extra },
    });
  }
  return new WebMapTileServiceImageryProvider({
    url: cfg.url,
    layer: cfg.layers,
    style: cfg.tileStyle ?? 'default',
    tileMatrixSetID: cfg.tileMatrixSetId ?? 'default',
    format: 'image/png',
  });
}

export const useImageriesStore = defineStore('imageries', () => {
  const { viewer } = useViewerRef();
  const { list, genId, findById, append, removeById, updateEntry } =
    createEntryRegistry<ActiveImagery>('imagery');

  function add(cfg: ImageryConfig, active = true): ActiveImagery {
    if (!viewer.value) throw new Error('Viewer is not ready');
    const layer = viewer.value.imageryLayers.addImageryProvider(buildProvider(cfg));
    layer.show = active;
    const entry: ActiveImagery = { id: genId(), spec: { ...cfg }, layer, active };
    append(entry);
    return entry;
  }

  function remove(id: string): void {
    const entry = removeById(id);
    if (!entry) return;
    viewer.value?.imageryLayers.remove(entry.layer, true);
  }

  function toggle(id: string, active: boolean): void {
    const entry = findById(id);
    if (!entry) return;
    entry.layer.show = active; // Cesium side effect on the layer object itself.
    updateEntry(id, { active });
  }

  return { list, add, remove, toggle };
});
