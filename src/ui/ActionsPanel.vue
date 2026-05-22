<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ShadowMode } from 'cesium';
import {
  ElButton,
  ElCard,
  ElMessage,
  ElOption,
  ElSelect,
  ElSwitch,
} from 'element-plus';
import { useWebMap } from '../composables/useWebMap';
import { useViewerRef } from '../viewer/viewerRef';
import { useLayersStore } from '../state/useLayersStore';
import { useBasemapStore } from '../state/useBasemapStore';
import { useAuthStore } from '../state/useAuthStore';
import { generateShareLink } from '../state/useUrlState';
import { takeScreenshot, printCurrentView, openInExternalMap, type ExternalMap } from '../utils/screenshot';

const expanded = ref(false);
const { viewer } = useViewerRef();
const layers = useLayersStore();
const basemap = useBasemapStore();
const auth = useAuthStore();
const webMap = useWebMap();

const highlighted = computed(() => webMap.getAllHighlightedObjects());
const hidden = computed(() => webMap.getAllHiddenObjects());

const selectedHighlight = ref<string>('');
const selectedHidden = ref<string>('');
const externalMap = ref<ExternalMap | ''>('');

// Mirror viewer's shadow state for two-way switches. Cesium doesn't expose change events
// on these properties, so we initialize when the viewer becomes available and write through
// on user toggle. External mutations during runtime aren't expected.
const shadowsEnabled = ref(false);
const terrainShadowsEnabled = ref(false);
watch(
  viewer,
  (v) => {
    if (!v) return;
    shadowsEnabled.value = v.shadows;
    terrainShadowsEnabled.value = v.terrainShadows === ShadowMode.ENABLED;
  },
  { immediate: true },
);

function flyToEntity(o: unknown) {
  if (!viewer.value || !o) return;
  viewer.value.flyTo(o as never);
}

function onPickHighlight(key: string) {
  flyToEntity(highlighted.value[key]);
}

function onPickHidden(key: string) {
  flyToEntity(hidden.value[key]);
}

function onClearHighlight() {
  webMap.clearSelected();
  selectedHighlight.value = '';
}

function onHideSelected() {
  webMap.hideSelectedObjects();
}

function onShowHidden() {
  webMap.showHiddenObjects();
  selectedHidden.value = '';
}

function onScreenshot() {
  if (viewer.value) takeScreenshot(viewer.value);
}

function onPrint() {
  if (viewer.value) printCurrentView(viewer.value);
}

function onToggleShadows(v: string | number | boolean) {
  if (!viewer.value) return;
  viewer.value.shadows = Boolean(v);
}

function onToggleTerrainShadows(v: string | number | boolean) {
  if (!viewer.value) return;
  const enabled = Boolean(v);
  viewer.value.terrainShadows = enabled ? ShadowMode.ENABLED : ShadowMode.DISABLED;
  // terrainShadows is gated by the global shadow map — auto-enable it.
  if (enabled && !viewer.value.shadows) {
    viewer.value.shadows = true;
    shadowsEnabled.value = true;
  }
}

function onExternalMap(svc: ExternalMap) {
  if (viewer.value) openInExternalMap(viewer.value, svc);
  externalMap.value = '';
}

async function onShareLink() {
  if (!viewer.value) return;
  const link = generateShareLink({
    viewer: viewer.value,
    layers: layers.layers,
    imagery: basemap.imagery,
    terrain: basemap.terrain,
    tokens: auth.isSignedIn ? { googleClientId: auth.clientId } : undefined,
  });
  try {
    await navigator.clipboard.writeText(link);
    ElMessage.success('Scene link copied to clipboard');
  } catch {
    ElMessage.info(link);
  }
}
</script>

<template>
  <el-card class="citydb-panel" :class="{ collapsed: !expanded }" shadow="hover">
    <template #header>
      <div class="citydb-panel-header" @click="expanded = !expanded">
        <span>Scene</span>
        <el-button size="small" link>{{ expanded ? '−' : '+' }}</el-button>
      </div>
    </template>
    <div v-show="expanded">
      <el-select
        v-model="selectedHighlight"
        placeholder="Highlighted objects…"
        size="small"
        class="full"
        @change="onPickHighlight"
      >
        <el-option
          v-for="(_obj, key) in highlighted"
          :key="key"
          :label="String(key)"
          :value="String(key)"
        />
      </el-select>

      <el-select
        v-model="selectedHidden"
        placeholder="Hidden objects…"
        size="small"
        class="full"
        @change="onPickHidden"
      >
        <el-option
          v-for="(_obj, key) in hidden"
          :key="key"
          :label="String(key)"
          :value="String(key)"
        />
      </el-select>

      <div class="grid">
        <el-button size="small" @click="onHideSelected">Hide selected</el-button>
        <el-button size="small" @click="onShowHidden">Show hidden</el-button>
        <el-button size="small" @click="onClearHighlight">Clear highlight</el-button>
        <el-button size="small" @click="onShareLink">Scene link</el-button>
        <el-button size="small" @click="onScreenshot">Screenshot</el-button>
        <el-button size="small" @click="onPrint">Print</el-button>
      </div>

      <div class="switch-row">
        <label>
          <el-switch v-model="shadowsEnabled" size="small" @change="onToggleShadows" />
          <span>Shadows</span>
        </label>
        <label>
          <el-switch v-model="terrainShadowsEnabled" size="small" @change="onToggleTerrainShadows" />
          <span>Terrain shadows</span>
        </label>
      </div>

      <el-select
        v-model="externalMap"
        placeholder="Show in external map…"
        size="small"
        class="full"
        @change="onExternalMap"
      >
        <el-option label="Google StreetView" value="google" />
        <el-option label="OpenStreetMap" value="osm" />
        <el-option label="BingMaps ObliqueView" value="bing" />
        <el-option label="DualMaps" value="dual" />
      </el-select>
    </div>
  </el-card>
</template>

<style scoped>
.full { width: 100%; margin-bottom: 8px; }
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-bottom: 8px;
}
.grid :deep(.el-button) { width: 100%; margin-left: 0; }

.switch-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-bottom: 8px;
}
.switch-row label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  font-size: 12px;
}
</style>
