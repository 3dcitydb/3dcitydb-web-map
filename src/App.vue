<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import CesiumViewer from './ui/CesiumViewer.vue';
import LayersPanel from './ui/LayersPanel.vue';
import ImageryPanel from './ui/ImageryPanel.vue';
import TerrainPanel from './ui/TerrainPanel.vue';
import ActionsPanel from './ui/ActionsPanel.vue';
import SplashWindow from './ui/SplashWindow.vue';
import GpsButton from './ui/GpsButton.vue';
import SigninButton from './ui/SigninButton.vue';
import { useMobile } from './composables/useMobile';
import { parseUrlState } from './state/useUrlState';
import { useAuthStore } from './state/useAuthStore';

const parsed = parseUrlState();
const auth = useAuthStore();
auth.setClientId(parsed.googleClientId);
const { isMobile, isIOS } = useMobile();
const toolboxVisible = ref(false);

// iOS Safari interprets multitouch on the page as a pinch-to-zoom of the whole document,
// which fights with Cesium's own pinch handling. Block the page-level zoom only.
// `scale` is a non-standard property iOS adds to gesture events.
function preventIOSPageZoom(event: TouchEvent & { scale?: number }) {
  if (event.scale !== undefined && event.scale !== 1) event.preventDefault();
}
onMounted(() => {
  if (isIOS.value) {
    window.addEventListener('touchmove', preventIOSPageZoom, { passive: false });
  }
});
onBeforeUnmount(() => {
  window.removeEventListener('touchmove', preventIOSPageZoom);
});
</script>

<template>
  <div class="app-root" :class="{ mobile: isMobile, ios: isIOS }">
    <CesiumViewer />
    <div class="panels">
      <label class="toolbox-toggle">
        <el-switch v-model="toolboxVisible" size="small" />
        <span>Toolbox</span>
      </label>
      <div v-show="toolboxVisible" class="panels-stack">
        <LayersPanel />
        <ImageryPanel />
        <TerrainPanel />
        <ActionsPanel />
      </div>
    </div>
    <GpsButton />
    <SigninButton />
    <SplashWindow :url="parsed.splashUrl" :show-on-start="parsed.splashShowOnStart" />
  </div>
</template>

<style scoped>
/* Cross-component theme (tokens, root reset, .citydb-panel skin, Cesium/Element-Plus
 * overrides) lives in src/assets/theme.css. This block is App.vue's own layout only. */

.panels {
  position: absolute;
  /* Match Cesium's .cesium-viewer-toolbar offset (top: 5px; right: 5px) so the
     toolbox toggle lines up horizontally with the home / nav / base-layer buttons. */
  top: 5px;
  left: 5px;
  width: 360px;
  z-index: 10;
  max-height: calc(100vh - 10px);
  display: flex;
  flex-direction: column;
}

/* Top-level toolbox toggle uses the Cesium toolbar button look.
   Height matches .cesium-toolbar-button (32px box-sizing: border-box) so the toggle
   sits flush with Cesium's home / nav / base-layer buttons in the opposite corner. */
.toolbox-toggle {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-sizing: border-box;
  height: 32px;
  padding: 0 10px;
  background: var(--citydb-bg-translucent);
  color: var(--citydb-text);
  border: 1px solid var(--citydb-border);
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  user-select: none;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}
.toolbox-toggle:hover {
  border-color: var(--citydb-border-hover);
  box-shadow: var(--citydb-shadow-hover);
}

.panels-stack {
  margin-top: 6px;
  overflow-y: auto;
  padding-right: 4px;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* ---- Mobile drawer: full-width panel stack overlaying the viewer ---- */
.mobile .panels {
  top: 8px;
  left: 8px;
  right: 8px;
  width: auto;
  max-width: none;
  max-height: calc(100vh - 16px);
}
.mobile .panels-stack {
  max-height: calc(100vh - 70px);
  padding-right: 0;
}
</style>
