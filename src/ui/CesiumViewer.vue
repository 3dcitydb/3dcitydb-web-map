<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import {
  Credit,
  JulianDate,
  viewerCesiumInspectorMixin,
  type Viewer,
} from 'cesium';
import CesiumNavigation from 'cesium-navigation-es6';
import { createViewer } from '../viewer/useViewer';
import { setViewer } from '../viewer/viewerRef';
import { useWebMap } from '../composables/useWebMap';
import { installGmlIdGeocoder } from '../composables/useGmlGeocoder';
import { parseUrlState, flyToCamera } from '../state/useUrlState';
import { useLayersStore } from '../state/useLayersStore';
import { useBasemapStore } from '../state/useBasemapStore';
import { ElMessage } from 'element-plus';

const container = ref<HTMLDivElement>();
let viewer: Viewer | undefined;
const webMap = useWebMap();
const layers = useLayersStore();
const basemap = useBasemapStore();

const parsed = parseUrlState();

function addStaticCredits(v: Viewer): void {
  const display = v.creditDisplay;
  display.addStaticCredit(
    new Credit(
      '<a href="https://www.3dcitydb.org/" target="_blank"><img src="https://3dcitydb.org/3dcitydb/fileadmin/public/logos/3dcitydb_logo.png" title="3DCityDB"></a>',
      true,
    ),
  );
  display.addStaticCredit(
    new Credit(
      '<a href="https://www.asg.ed.tum.de/en/gis/" target="_blank">© Chair of Geoinformatics, TU Munich</a>',
      true,
    ),
  );
}

function adjustIonFeatures(v: Viewer): void {
  // Without an ion token, Cesium World Terrain entries in the BaseLayerPicker fail silently.
  // Strip them so the picker only shows working providers.
  const picker = (v as unknown as {
    baseLayerPicker?: { viewModel?: { terrainProviderViewModels?: Array<{ name: string }> } };
  }).baseLayerPicker;
  const tpvms = picker?.viewModel?.terrainProviderViewModels;
  if (!tpvms) return;
  for (let i = tpvms.length - 1; i >= 0; i--) {
    if (tpvms[i].name.includes('Cesium World Terrain')) tpvms.splice(i, 1);
  }
  // Without a Bing token, Bing imagery also fails — Cesium 1.122 already routes Bing through ion,
  // so when ionToken is empty Cesium hides those entries on its own. No further pruning needed.
}

onMounted(async () => {
  if (!container.value) return;
  viewer = createViewer(container.value, {
    ionToken: parsed.ionToken,
    bingToken: parsed.bingToken,
    shadows: parsed.shadows,
    terrainShadows: parsed.terrainShadows,
  });
  setViewer(viewer);
  if (parsed.title) document.title = parsed.title;

  // dayTime: if URL has ?d=ISO8601, pause clock and jump to that time (used for shadow demos).
  if (parsed.dayTime) {
    const clock = viewer.cesiumWidget.clock;
    try {
      clock.currentTime = JulianDate.fromIso8601(parsed.dayTime);
      clock.shouldAnimate = false;
    } catch {
      // ignore malformed timestamps
    }
  }

  if (parsed.debug) {
    viewer.extend(viewerCesiumInspectorMixin);
  }

  if (!parsed.ionToken) adjustIonFeatures(viewer);
  addStaticCredits(viewer);

  // Compass + zoom + distance legend (replaces the legacy viewerCesiumNavigationMixin.min.js IIFE)
  new CesiumNavigation(viewer, {
    enableCompass: true,
    enableZoomControls: true,
    enableDistanceLegend: true,
    enableCompassOuterRing: true,
  });

  webMap.installMouseHandlers(viewer);
  installGmlIdGeocoder(viewer);

  if (parsed.imagery) {
    try {
      basemap.setImagery(parsed.imagery);
    } catch (err) {
      ElMessage.error(`Imagery: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  if (parsed.terrain) {
    try {
      await basemap.setTerrain(parsed.terrain);
    } catch (err) {
      ElMessage.error(`Terrain: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  for (const layer of parsed.layers) {
    try {
      await layers.addLayer({
        name: layer.name,
        kind: layer.kind,
        url: layer.url,
        clampToGround: layer.clampToGround,
        maximumScreenSpaceError: layer.maximumScreenSpaceError,
        thematicDataUrl: layer.thematicDataUrl,
        thematicDataSource: layer.thematicDataSource,
        tableType: layer.tableType,
      });
    } catch (err) {
      ElMessage.error(`Layer "${layer.name}": ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  flyToCamera(viewer, parsed.camera);
});

onBeforeUnmount(() => {
  setViewer(undefined);
  viewer?.destroy();
  viewer = undefined;
});
</script>

<template>
  <div ref="container" class="cesium-container"></div>
</template>

<style scoped>
.cesium-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
