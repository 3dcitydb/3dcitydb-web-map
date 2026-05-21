import { ref, shallowRef } from 'vue';
import {
  Cartesian2,
  Color,
  ColorBlendMode,
  KeyboardEventModifier,
  ScreenSpaceEventType,
  type Viewer,
} from 'cesium';
import type { LayerBase } from '../layers';
import { useLayersStore } from '../state/useLayersStore';
import { fillInfoTable } from '../utils/infoTable';
import type { DataSourceController } from '../thematic/DataSourceController';

// The picked-feature shape varies across layer kinds (3DTileFeature vs Entity pick wrapper).
// Each layer's own type guards know how to interpret it, so we treat it as opaque here.
type PickedFeature = unknown;

interface LayerOps {
  contains(o: PickedFeature): boolean;
  isEqual(a: PickedFeature, b: PickedFeature): boolean;
  inArray(arr: PickedFeature[], o: PickedFeature): boolean;
  getColor(f: PickedFeature): unknown;
  setColor(f: PickedFeature, c: unknown, opts?: unknown): void;
  setSelected(f: PickedFeature): void;
  storeCameraPosition(v: Viewer, m: { position: Cartesian2 }, f: PickedFeature): void;
  getProperties(f: PickedFeature): Record<string, unknown> | undefined;
  getIdObject(f: PickedFeature): { key: string | number; object: unknown } | undefined;
  hideSelected(f: PickedFeature): void;
  show(f: PickedFeature): void;
}

function ops(layer: LayerBase): LayerOps {
  return layer as unknown as LayerOps;
}

export interface InfoTableEntry {
  key: string;
  object: unknown;
  properties: Record<string, unknown>;
}

// Track which viewer instances we've installed handlers on, so HMR / unmount-then-remount
// reinstalls correctly on the new viewer instead of being short-circuited by a stale flag.
const installedViewers = new WeakSet<Viewer>();
const highlightColor = Color.AQUAMARINE;
const mouseOverColor = Color.YELLOW;

const prevSelected = shallowRef<PickedFeature[]>([]);
const prevSelectedColors = shallowRef<unknown[]>([]);
const hiddenFeatures = shallowRef<PickedFeature[]>([]);
const lastInfo = ref<InfoTableEntry | undefined>(undefined);

let prevHovered: PickedFeature | undefined;
let prevHoveredColor: unknown | undefined;

export function useWebMap() {
  const layers = useLayersStore();

  function getLayerByObject(object: PickedFeature | undefined): LayerBase | undefined {
    if (!object) return undefined;
    for (const entry of layers.layers) {
      if (ops(entry.instance).contains(object)) return entry.instance;
    }
    return undefined;
  }

  // Restore colors for all previously-selected features without touching hover state.
  // Used internally when a fresh click should replace the selection.
  function restoreSelected(): void {
    const selected = prevSelected.value;
    const colors = prevSelectedColors.value;
    for (let i = 0; i < selected.length; i++) {
      const layer = getLayerByObject(selected[i]);
      if (layer) {
        try {
          ops(layer).setColor(selected[i], colors[i]);
        } catch (err) {
          console.error(err);
        }
      }
    }
    prevSelected.value = [];
    prevSelectedColors.value = [];
  }

  // Public reset: restore selection colors AND drop hover state.
  // Bound to the "Clear highlight" button.
  function clearSelected(): void {
    restoreSelected();
    if (prevHovered) {
      const layer = getLayerByObject(prevHovered);
      if (layer) {
        try {
          ops(layer).setColor(prevHovered, prevHoveredColor);
        } catch (err) {
          console.error(err);
        }
      }
    }
    prevHovered = undefined;
    prevHoveredColor = undefined;
  }

  function hideSelectedObjects(): void {
    const nextHidden = [...hiddenFeatures.value];
    for (const feature of prevSelected.value) {
      const layer = getLayerByObject(feature);
      if (!layer) continue;
      const o = ops(layer);
      if (!o.inArray(nextHidden, feature)) nextHidden.push(feature);
      o.hideSelected(feature);
    }
    hiddenFeatures.value = nextHidden;
  }

  function showHiddenObjects(): void {
    for (const feature of hiddenFeatures.value) {
      const layer = getLayerByObject(feature);
      if (layer) ops(layer).show(feature);
    }
    hiddenFeatures.value = [];
  }

  function getAllHighlightedObjects(): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const feature of prevSelected.value) {
      const layer = getLayerByObject(feature);
      const res = layer ? ops(layer).getIdObject(feature) : undefined;
      if (res) out[String(res.key)] = res.object;
    }
    return out;
  }

  function getAllHiddenObjects(): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const feature of hiddenFeatures.value) {
      const layer = getLayerByObject(feature);
      const res = layer ? ops(layer).getIdObject(feature) : undefined;
      if (res) out[String(res.key)] = res.object;
    }
    return out;
  }

  function installMouseHandlers(viewer: Viewer): void {
    if (installedViewers.has(viewer)) return;
    installedViewers.add(viewer);
    const colorBlend = { colorBlendAmount: 0.7, colorBlendMode: ColorBlendMode.MIX };

    const defaultClick = viewer.screenSpaceEventHandler.getInputAction(
      ScreenSpaceEventType.LEFT_CLICK,
    );

    // Helper: unhighlight the currently hovered feature if it's not also selected.
    function unhighlightHover(): void {
      if (!prevHovered) return;
      const layer = getLayerByObject(prevHovered);
      if (layer && !ops(layer).inArray(prevSelected.value, prevHovered)) {
        try {
          ops(layer).setColor(prevHovered, prevHoveredColor);
        } catch (err) {
          console.error(err);
        }
      }
      prevHovered = undefined;
      prevHoveredColor = undefined;
    }

    viewer.screenSpaceEventHandler.setInputAction(
      (movement: { endPosition: Cartesian2 }) => {
        const picked = viewer.scene.pick(movement.endPosition);

        // Mouse moved off any feature (sky / globe): restore the previous hover.
        if (!picked) {
          unhighlightHover();
          return;
        }

        const layer = getLayerByObject(picked);

        // Picked something that isn't ours (Cesium globe label, base entity, etc.):
        // treat the same as moving off — clear our hover.
        if (!layer) {
          unhighlightHover();
          return;
        }

        const o = ops(layer);

        // Still hovering the same feature: nothing to do.
        if (prevHovered && o.isEqual(prevHovered, picked)) return;

        // Switching to a different feature: restore the old hover first.
        unhighlightHover();

        // Skip if the new feature is already selected (it stays in highlight color).
        if (o.inArray(prevSelected.value, picked)) return;

        prevHovered = picked;
        prevHoveredColor = o.getColor(picked);

        try {
          o.setColor(picked, mouseOverColor, colorBlend);
        } catch (err) {
          console.error(err);
          clearSelected();
        }
      },
      ScreenSpaceEventType.MOUSE_MOVE,
    );

    // ctrlKey=false → replace selection. ctrlKey=true → append (multi-select).
    function handleClick(position: Cartesian2, ctrlKey: boolean): void {
      // Snapshot the hover color BEFORE any state mutation: mouse-move fired before this
      // click handler put prevHoveredColor to the picked feature's original color.
      const originalColorBeforeHover = prevHoveredColor;

      if (!ctrlKey) restoreSelected();

      const picked = viewer.scene.pick(position);
      if (!picked) {
        // Fall through to Cesium's default click handler (e.g. entity selection on globe labels).
        defaultClick?.({ position } as never);
        return;
      }
      const layer = getLayerByObject(picked);
      if (!layer) {
        defaultClick?.({ position } as never);
        return;
      }
      const o = ops(layer);

      o.storeCameraPosition(viewer, { position }, picked);

      // Already selected? Don't re-add.
      if (o.inArray(prevSelected.value, picked)) return;

      // Use the snapshot we took before any state was reset. If the user clicked without
      // a preceding hover (e.g., touchscreen tap), it's undefined → restore-to-default is fine.
      const restoreColor = ctrlKey
        ? o.getColor(picked) // CTRL+click on a fresh feature: remember its current color.
        : originalColorBeforeHover;

      prevSelected.value = [...prevSelected.value, picked];
      prevSelectedColors.value = [...prevSelectedColors.value, o.getColor(restoreColor as PickedFeature)];

      // We've absorbed the hover into the selection; clear hover state so a later move-off
      // doesn't try to restore the now-selected feature back to mouseOverColor.
      prevHovered = undefined;
      prevHoveredColor = undefined;

      o.setSelected(picked);
      try {
        o.setColor(picked, highlightColor, colorBlend);
      } catch (err) {
        console.error(err);
        clearSelected();
      }

      // InfoBox content: only on plain click, matching the original. CTRL+click is silent.
      if (!ctrlKey) {
        const props = o.getProperties(picked);
        const idObj = o.getIdObject(picked);
        if (props && idObj) {
          lastInfo.value = { key: String(idObj.key), object: idObj.object, properties: props };
          const dsc = (layer as unknown as { dataSourceController?: DataSourceController })
            .dataSourceController;
          const selectedEntity = (viewer.selectedEntity ?? idObj.object) as {
            description?: string;
            name?: string;
          };
          if (selectedEntity) fillInfoTable(selectedEntity, props, dsc);
        }
      }
    }

    viewer.screenSpaceEventHandler.setInputAction(
      (m: { position: Cartesian2 }) => handleClick(m.position, false),
      ScreenSpaceEventType.LEFT_CLICK,
    );

    viewer.screenSpaceEventHandler.setInputAction(
      (m: { position: Cartesian2 }) => handleClick(m.position, true),
      ScreenSpaceEventType.LEFT_CLICK,
      KeyboardEventModifier.CTRL,
    );
  }

  return {
    prevSelected,
    hiddenFeatures,
    lastInfo,
    getLayerByObject,
    clearSelected,
    hideSelectedObjects,
    showHiddenObjects,
    getAllHighlightedObjects,
    getAllHiddenObjects,
    installMouseHandlers,
  };
}
