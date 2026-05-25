import { defineStore } from 'pinia';
import { Cesium3DTilesLayer, GeoJSONLayer, I3SLayer, type LayerBase } from '../layers';
import type { DataSourceKind, TableType } from '../thematic/types';
import { getErrorMessage } from '../utils/errorMessages';
import { useViewerRef } from '../viewer/viewerRef';
import { createEntryRegistry } from './entryRegistry';

export type LayerKind = '3dtiles' | 'i3s' | 'geojson';

export interface LayerSpec {
  name: string;
  kind: LayerKind;
  url: string;
  maximumScreenSpaceError?: number;
  clampToGround?: boolean;
  thematicDataUrl?: string;
  thematicDataSource?: DataSourceKind;
  tableType?: TableType;
}

export interface ActiveLayer {
  id: string;
  spec: LayerSpec;
  instance: LayerBase;
  // Mirrors instance.active so the reactive list carries the toggle state.
  // Maintained by toggleLayer alongside the Cesium-side mutation.
  active: boolean;
  loading: boolean;
  error?: string;
}

// entry.instance is a LayerBase wrapping Cesium internals; mutating it is a
// Cesium-side effect, and we mirror the relevant flags (active) on the entry
// itself so consumers can rely on the reactive list as the source of truth.
// IDs come from instance.layerId (not the registry's genId) so the LayerBase
// and store entry share one identity.

export const useLayersStore = defineStore('layers', () => {
  const {
    list: layers,
    findById,
    append,
    removeById,
    updateEntry,
  } = createEntryRegistry<ActiveLayer>('layer');
  const { viewer } = useViewerRef();

  async function addLayer(spec: LayerSpec): Promise<void> {
    if (!viewer.value) {
      throw new Error('Cesium viewer is not ready yet');
    }
    const thematic = {
      thematicDataUrl: spec.thematicDataUrl,
      thematicDataSource: spec.thematicDataSource,
      tableType: spec.tableType,
    };
    let instance: LayerBase;
    switch (spec.kind) {
      case '3dtiles':
        instance = new Cesium3DTilesLayer({
          url: spec.url,
          name: spec.name,
          maximumScreenSpaceError: spec.maximumScreenSpaceError,
          ...thematic,
        });
        break;
      case 'i3s':
        instance = new I3SLayer({
          url: spec.url,
          name: spec.name,
          maximumScreenSpaceError: spec.maximumScreenSpaceError,
          ...thematic,
        });
        break;
      case 'geojson':
        instance = new GeoJSONLayer({
          url: spec.url,
          name: spec.name,
          clampToGround: spec.clampToGround,
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
      active: true,
      loading: true,
    };
    append(entry);

    try {
      await instance.addToCesium(viewer.value);
      instance.zoomToStartPosition();
      updateEntry(entry.id, { loading: false });
    } catch (err) {
      updateEntry(entry.id, {
        loading: false,
        error: getErrorMessage(err),
      });
      throw err;
    }
  }

  function removeLayer(id: string): void {
    const entry = removeById(id);
    if (!entry) return;
    if (viewer.value) {
      entry.instance.removeFromCesium(viewer.value);
    }
  }

  function toggleLayer(id: string, active: boolean): void {
    const entry = findById(id);
    if (!entry) return;
    entry.instance.activate(active); // Cesium side effect on the LayerBase.
    updateEntry(id, { active });
  }

  function zoomToLayer(id: string): void {
    const entry = findById(id);
    if (!entry || entry.loading || entry.error) return;
    entry.instance.zoomToStartPosition();
  }

  return { layers, addLayer, removeLayer, toggleLayer, zoomToLayer };
});
