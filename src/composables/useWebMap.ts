import { ref, shallowRef } from 'vue';
import {
  type Cartesian2,
  Color,
  KeyboardEventModifier,
  ScreenSpaceEventType,
  type Viewer,
} from 'cesium';
import type { LayerBase } from '../layers';
import { useLayersStore } from '../state/useLayersStore';
import { useViewerRef } from '../viewer/viewerRef';
import { fillInfoTable } from '../utils/infoTable';

// The picked-feature shape varies across layer kinds (3DTileFeature vs. Entity pick wrapper).
// Each layer's own type guards know how to interpret it, so we treat it as opaque here.
type PickedFeature = unknown;

interface InfoTableEntry {
  key: string;
  object: unknown;
  properties: Record<string, unknown>;
}

// Track which viewer instances we've installed handlers on, so HMR / unmount-then-remount
// re-installs correctly on the new viewer instead of being short-circuited by a stale flag.
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
  const { viewer: viewerRef } = useViewerRef();

  function getLayerByObject(object: PickedFeature | undefined): LayerBase | undefined {
    if (!object) return undefined;
    for (const entry of layers.layers) {
      if (entry.instance.contains(object)) return entry.instance;
    }
    return undefined;
  }

  // The setColor catches throughout this module are intentionally silent: failures here are
  // race conditions where the picked feature's tile was unloaded between pick and recolor.
  // Surfacing them as toasts would spam on every mouse move. Real user-facing failures
  // (thematic data fetches, layer load) are reported by their owners.

  // Restore colors for all previously selected features without touching the hover state.
  // Used internally when a fresh click should replace the selection.
  function restoreSelected(): void {
    const selected = prevSelected.value;
    const colors = prevSelectedColors.value;
    for (let i = 0; i < selected.length; i++) {
      const layer = getLayerByObject(selected[i]);
      if (layer) {
        try {
          layer.setColor(selected[i], colors[i]);
        } catch (err) {
          console.error(err);
        }
      }
    }
    prevSelected.value = [];
    prevSelectedColors.value = [];
  }

  // Public reset: restore selection colors AND drop the hover state.
  // Bound to the "Clear highlight" button.
  function clearSelected(): void {
    restoreSelected();
    if (prevHovered) {
      const layer = getLayerByObject(prevHovered);
      if (layer) {
        try {
          layer.setColor(prevHovered, prevHoveredColor);
        } catch (err) {
          console.error(err);
        }
      }
    }
    prevHovered = undefined;
    prevHoveredColor = undefined;
    // Also drop the InfoBox: setSelected populated viewer.selectedEntity (a synthetic
    // Entity for 3DTiles/I3S, the real entity for GeoJSON); clearing it hides the panel.
    if (viewerRef.value) viewerRef.value.selectedEntity = undefined;
  }

  function hideSelectedObjects(): void {
    const nextHidden = [...hiddenFeatures.value];
    for (const feature of prevSelected.value) {
      const layer = getLayerByObject(feature);
      if (!layer) continue;
      if (!layer.inArray(nextHidden, feature)) nextHidden.push(feature);
      layer.hideSelected(feature);
    }
    hiddenFeatures.value = nextHidden;
  }

  function showHiddenObjects(): void {
    for (const feature of hiddenFeatures.value) {
      const layer = getLayerByObject(feature);
      if (layer) layer.show(feature);
    }
    hiddenFeatures.value = [];
  }

  function getAllHighlightedObjects(): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const feature of prevSelected.value) {
      const layer = getLayerByObject(feature);
      const res = layer ? layer.getIdObject(feature) : undefined;
      if (res) out[String(res.key)] = res.object;
    }
    return out;
  }

  function getAllHiddenObjects(): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const feature of hiddenFeatures.value) {
      const layer = getLayerByObject(feature);
      const res = layer ? layer.getIdObject(feature) : undefined;
      if (res) out[String(res.key)] = res.object;
    }
    return out;
  }

  function installMouseHandlers(viewer: Viewer): void {
    if (installedViewers.has(viewer)) return;
    installedViewers.add(viewer);

    const defaultClick = viewer.screenSpaceEventHandler.getInputAction(
      ScreenSpaceEventType.LEFT_CLICK,
    );

    // Helper: unhighlight the currently hovered feature if it's not also selected.
    function unhighlightHover(): void {
      if (!prevHovered) return;
      const layer = getLayerByObject(prevHovered);
      if (layer && !layer.inArray(prevSelected.value, prevHovered)) {
        try {
          layer.setColor(prevHovered, prevHoveredColor);
        } catch (err) {
          console.error(err);
        }
      }
      prevHovered = undefined;
      prevHoveredColor = undefined;
    }

    viewer.screenSpaceEventHandler.setInputAction((movement: { endPosition: Cartesian2 }) => {
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

      // Still hovering the same feature: nothing to do.
      if (prevHovered && layer.isEqual(prevHovered, picked)) return;

      // Switching to a different feature: restore the old hover first.
      unhighlightHover();

      // Skip if the new feature is already selected (it stays in highlight color).
      if (layer.inArray(prevSelected.value, picked)) return;

      prevHovered = picked;
      prevHoveredColor = layer.getColor(picked);

      try {
        layer.setColor(picked, mouseOverColor);
      } catch (err) {
        console.error(err);
        clearSelected();
      }
    }, ScreenSpaceEventType.MOUSE_MOVE);

    // ctrlKey=false → replace selection. ctrlKey=true → append (multi-select).
    function handleClick(position: Cartesian2, ctrlKey: boolean): void {
      // Snapshot hover state before restoreSelected() / state resets clobber it.
      const hoveredBeforeClick = prevHovered;
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

      // Already selected? Don't re-add.
      if (layer.inArray(prevSelected.value, picked)) return;

      // If the click hit the hovered feature, its current color is mouseOverColor — not the original.
      const wasHovered = hoveredBeforeClick != null && layer.isEqual(hoveredBeforeClick, picked);
      const restoreColor = wasHovered ? originalColorBeforeHover : layer.getColor(picked);

      prevSelected.value = [...prevSelected.value, picked];
      prevSelectedColors.value = [...prevSelectedColors.value, restoreColor];

      // We've absorbed the hover into the selection; clear hover state so a later move-off
      // doesn't try to restore the now-selected feature back to mouseOverColor.
      prevHovered = undefined;
      prevHoveredColor = undefined;

      layer.setSelected(picked);
      try {
        layer.setColor(picked, highlightColor);
      } catch (err) {
        console.error(err);
        clearSelected();
      }

      // InfoBox content: only on plain click, matching the original. CTRL+click is silent.
      if (!ctrlKey) {
        const props = layer.getProperties(picked);
        if (props) {
          const idObj = layer.getIdObject(picked);
          if (idObj) {
            lastInfo.value = { key: String(idObj.key), object: idObj.object, properties: props };
          }
          // fillInfoTable does its own object id extraction from props with a fallback to
          // entity.name, so we don't need idObj to render embedded data.
          const selectedEntity = (viewer.selectedEntity ?? idObj?.object) as {
            description?: string;
            name?: string;
          };
          if (selectedEntity) fillInfoTable(selectedEntity, props, layer.dataSourceController);
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
