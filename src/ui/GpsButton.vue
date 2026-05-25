<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { Cartesian3, Math as CesiumMath } from 'cesium';
import { ElMessage } from 'element-plus';
import { useViewerRef } from '../viewer/viewerRef';
import { getErrorMessage } from '../utils/errorMessages';
import gpsMain from '../assets/gps/GPS_main.png';
import gpsSingle from '../assets/gps/GPS_single.png';
import gpsOnOri from '../assets/gps/GPS_on_ori.png';
import gpsOnPosOri from '../assets/gps/GPS_on_pos_ori.png';
import gpsOff from '../assets/gps/GPS_off.png';

type Mode = 'main' | 'single' | 'live-ori' | 'live-pos-ori' | 'off';

const ICONS: Record<Mode, string> = {
  main: gpsMain,
  single: gpsSingle,
  'live-ori': gpsOnOri,
  'live-pos-ori': gpsOnPosOri,
  off: gpsOff,
};

const TOOLBAR_SELECTOR = '.cesium-viewer-toolbar';

const { ready, viewer } = useViewerRef();
const mode = ref<Mode>('main');
const expanded = ref(false);
const toolbarEl = ref<Element | null>(null);
let timer: number | undefined;

const mainIcon = computed(() => ICONS[mode.value]);
const isActive = computed(() => mode.value === 'live-ori' || mode.value === 'live-pos-ori');

// The .cesium-viewer-toolbar element is created by the Cesium Viewer constructor — we have to
// wait for the viewerRef to flip to ready before we can Teleport into it.
watch(
  ready,
  (r) => {
    if (r) {
      toolbarEl.value = document.querySelector(TOOLBAR_SELECTOR);
    } else {
      toolbarEl.value = null;
    }
  },
  { immediate: true },
);

async function requestOrientationPermission(): Promise<void> {
  const api = window.DeviceOrientationEvent as
    | (typeof DeviceOrientationEvent & {
        requestPermission?: () => Promise<'granted' | 'denied'>;
      })
    | undefined;
  if (api?.requestPermission) {
    const state = await api.requestPermission();
    if (state !== 'granted') throw new Error('Orientation access denied');
  }
}

function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true });
  });
}

function getOrientation(): Promise<DeviceOrientationEvent> {
  return new Promise((resolve) => {
    window.addEventListener('deviceorientation', resolve as EventListener, { once: true });
  });
}

function flyTo(position: GeolocationPosition, orientation?: DeviceOrientationEvent | null) {
  if (!viewer.value) return;
  const lon = position.coords.longitude;
  const lat = position.coords.latitude;
  const h = (position.coords.altitude ?? 2) + 50;
  viewer.value.scene.camera.flyTo({
    destination: Cartesian3.fromDegrees(lon, lat, h),
    orientation: {
      heading: CesiumMath.toRadians(orientation?.alpha ?? 0),
      pitch: CesiumMath.toRadians((orientation?.beta ?? 90) - 90),
      roll: CesiumMath.toRadians(orientation?.gamma ?? 0),
    },
  });
}

function clearTimer() {
  if (timer !== undefined) {
    window.clearInterval(timer);
    timer = undefined;
  }
}

async function activate(target: Mode) {
  expanded.value = false;
  clearTimer();
  if (target === 'off') {
    mode.value = 'main';
    return;
  }
  try {
    if (target !== 'single') await requestOrientationPermission();
    const pos = await getPosition();
    const ori = target === 'single' ? null : await getOrientation();
    flyTo(pos, ori);
    mode.value = target;
    // Tick errors abort tracking instead of escalating to unhandledRejection — GPS / orientation
    // can fail mid-stream (permission revoked, sensor unavailable) and silent retries would mask it.
    const onTickError = (err: unknown): void => {
      clearTimer();
      mode.value = 'main';
      ElMessage.error(getErrorMessage(err));
    };
    if (target === 'live-ori') {
      timer = window.setInterval(() => {
        getOrientation()
          .then((ori) => flyTo(pos, ori))
          .catch(onTickError);
      }, 1000);
    } else if (target === 'live-pos-ori') {
      timer = window.setInterval(() => {
        Promise.all([getPosition(), getOrientation()])
          .then(([p, ori]) => flyTo(p, ori))
          .catch(onTickError);
      }, 1000);
    }
  } catch (err) {
    ElMessage.error(getErrorMessage(err));
    mode.value = 'main';
  }
}

function onBlur(event: FocusEvent) {
  // Close dropdown when focus leaves the whole GPS span (matches Cesium SceneModePicker behavior).
  const next = event.relatedTarget as Node | null;
  if (!next || !(event.currentTarget as Element).contains(next)) {
    expanded.value = false;
  }
}

onBeforeUnmount(clearTimer);
</script>

<template>
  <Teleport v-if="toolbarEl" :to="toolbarEl">
    <span
      class="cesium-sceneModePicker-wrapper cesium-toolbar-button"
      tabindex="-1"
      @focusout="onBlur"
    >
      <button
        type="button"
        class="cesium-button cesium-toolbar-button citydb-gps-button"
        :class="{ 'citydb-gps-active': isActive }"
        :style="{ backgroundImage: `url(${mainIcon})` }"
        title="Geolocation"
        @click="expanded = !expanded"
      ></button>

      <button
        v-show="expanded"
        type="button"
        class="cesium-button cesium-toolbar-button cesium-sceneModePicker-dropDown-icon citydb-gps-button"
        :style="{ backgroundImage: `url(${ICONS.single})` }"
        title="Current geolocation snapshot"
        @click="activate('single')"
      ></button>

      <button
        v-show="expanded"
        type="button"
        class="cesium-button cesium-toolbar-button cesium-sceneModePicker-dropDown-icon citydb-gps-button"
        :style="{ backgroundImage: `url(${ICONS['live-ori']})` }"
        title="Track orientation (fixed position)"
        @click="activate('live-ori')"
      ></button>

      <button
        v-show="expanded"
        type="button"
        class="cesium-button cesium-toolbar-button cesium-sceneModePicker-dropDown-icon citydb-gps-button"
        :style="{ backgroundImage: `url(${ICONS['live-pos-ori']})` }"
        title="Track position and orientation"
        @click="activate('live-pos-ori')"
      ></button>

      <button
        v-show="expanded"
        type="button"
        class="cesium-button cesium-toolbar-button cesium-sceneModePicker-dropDown-icon citydb-gps-button"
        :style="{ backgroundImage: `url(${ICONS.off})` }"
        title="Disable geolocation"
        @click="activate('off')"
      ></button>
    </span>
  </Teleport>
</template>

<style scoped>
.citydb-gps-button {
  background-size: cover !important;
  background-position: center center !important;
  background-repeat: no-repeat !important;
}
.citydb-gps-button.citydb-gps-active {
  background-color: #0074d9 !important;
}
</style>
