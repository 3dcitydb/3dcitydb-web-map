<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { Credit, JulianDate, viewerCesiumInspectorMixin, type Viewer } from 'cesium';
import CesiumNavigation from 'cesium-navigation-es6';
import { createViewer } from '../viewer/useViewer';
import { setViewer } from '../viewer/viewerRef';
import { useWebMap } from '../composables/useWebMap';
import { installObjectIdGeocoder } from '../composables/useObjectIdGeocoder';
import { useMobile } from '../composables/useMobile';
import { parseUrlState, flyToCamera } from '../state/useUrlState';
import { useLayersStore } from '../state/useLayersStore';
import { useImageriesStore } from '../state/useImageriesStore';
import { useTerrainsStore } from '../state/useTerrainsStore';
import { getErrorMessage } from '../utils/errorMessages';
import { ElMessage } from 'element-plus';

const container = ref<HTMLDivElement>();
let viewer: Viewer | undefined;
let disposeGeocoder: (() => void) | undefined;
// Set in onBeforeUnmount; the onMounted init loop checks this between awaits so
// it doesn't keep pumping store entries against a destroyed viewer.
let unmounted = false;
const webMap = useWebMap();
const layers = useLayersStore();
const imageries = useImageriesStore();
const terrains = useTerrainsStore();
const { isMobile } = useMobile();

const parsed = parseUrlState();

function addStaticCredits(v: Viewer): void {
  const display = v.creditDisplay;
  display.addStaticCredit(
    new Credit(
      '<a href="https://www.3dcitydb.org/" target="_blank"><img src="https://3dcitydb.org/3dcitydb/fileadmin/public/logos/3dcitydb_logo.png" alt="3DCityDB" title="3DCityDB"></a>',
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

// The BaseLayerPicker isn't on Cesium's public Viewer type — declare the shape we read.
type ViewerWithPicker = Viewer & {
  baseLayerPicker?: { viewModel?: { terrainProviderViewModels?: Array<{ name: string }> } };
};

function adjustIonFeatures(v: ViewerWithPicker): void {
  // Without an ion token, Cesium World Terrain entries in the BaseLayerPicker fail silently.
  // Strip them so the picker only shows working providers.
  const tpvms = v.baseLayerPicker?.viewModel?.terrainProviderViewModels;
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

  // Compass + zoom + distance legend (replaces the legacy viewerCesiumNavigationMixin.min.js IIFE).
  // On mobile, drop the compass/zoom controls — touch gestures already cover them — and keep only
  // the distance legend so users still have a scale reference.
  new CesiumNavigation(viewer, {
    enableCompass: !isMobile.value,
    enableZoomControls: !isMobile.value,
    enableDistanceLegend: true,
    enableCompassOuterRing: !isMobile.value,
  });

  webMap.installMouseHandlers(viewer);
  disposeGeocoder = installObjectIdGeocoder(viewer);

  for (const im of parsed.imageries) {
    if (unmounted) return;
    try {
      imageries.add(im.spec, im.active);
    } catch (err) {
      ElMessage.error(`Imagery "${im.spec.name}": ${getErrorMessage(err)}`);
    }
  }
  for (const t of parsed.terrains) {
    if (unmounted) return;
    try {
      await terrains.add(t.spec, t.active);
    } catch (err) {
      ElMessage.error(`Terrain "${t.spec.name}": ${getErrorMessage(err)}`);
    }
  }
  for (const layer of parsed.layers) {
    if (unmounted) return;
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
      ElMessage.error(`Layer "${layer.name}": ${getErrorMessage(err)}`);
    }
  }
  if (unmounted) return;
  flyToCamera(viewer, parsed.camera);
});

onBeforeUnmount(() => {
  unmounted = true;
  setViewer(undefined);
  disposeGeocoder?.();
  disposeGeocoder = undefined;
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
