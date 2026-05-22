<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { ElSwitch } from 'element-plus';
import CesiumViewer from './ui/CesiumViewer.vue';
import Toolbox from './ui/Toolbox.vue';
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
const layoutClass = computed(() => {
  const classes = ['app-root'];
  if (isMobile.value) classes.push('mobile');
  if (isIOS.value) classes.push('ios');
  return classes.join(' ');
});

// iOS Safari interprets multi-touch on the page as a pinch-to-zoom of the whole document,
// which fights with Cesium's own pinch handling. Block the page-level zoom only.
function preventIOSPageZoom(event: TouchEvent) {
  const e = event as TouchEvent & { scale?: number };
  if (e.scale !== undefined && e.scale !== 1) event.preventDefault();
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
  <div :class="layoutClass">
    <CesiumViewer />
    <div class="panels">
      <label class="toolbox-toggle">
        <el-switch v-model="toolboxVisible" size="small" />
        <span>Toolbox</span>
      </label>
      <div v-show="toolboxVisible" class="panels-stack">
        <Toolbox />
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

<style>
/* Cesium-aligned palette (sourced from Cesium widgets.css). */
:root {
  --citydb-bg: rgb(48, 51, 54);
  --citydb-bg-translucent: rgba(48, 51, 54, 0.88);
  --citydb-bg-elevated: rgba(60, 64, 68, 0.95);
  --citydb-border: #444;
  --citydb-border-hover: #aef;
  --citydb-border-focus: #ea4;
  --citydb-text: #edffff;
  --citydb-text-muted: #99a5ab;
  --citydb-text-strong: #fff;
  --citydb-accent: #48b;
  --citydb-accent-active: #adf;
  --citydb-shadow-hover: 0 0 8px rgba(255, 255, 255, 0.35);
  --citydb-font: 'Helvetica', Arial, sans-serif;
}

html,
body,
#app,
.app-root {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: var(--citydb-font);
}

.panels {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 360px;
  z-index: 10;
  max-height: calc(100vh - 24px);
  display: flex;
  flex-direction: column;
}

/* Top-level toolbox toggle uses the Cesium toolbar button look. */
.toolbox-toggle {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: var(--citydb-bg-translucent);
  color: var(--citydb-text);
  border: 1px solid var(--citydb-border);
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  user-select: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.toolbox-toggle:hover {
  border-color: var(--citydb-border-hover);
  box-shadow: var(--citydb-shadow-hover);
}

.panels-stack {
  margin-top: 8px;
  overflow-y: auto;
  padding-right: 4px;
  flex: 1;
  min-height: 0;
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
.mobile .citydb-panel {
  font-size: 13px;
}
.mobile .citydb-panel .el-card__body {
  padding: 8px 10px;
}
.mobile .citydb-panel .el-form-item {
  margin-bottom: 6px;
}

/* ---- Cesium widget tweaks on mobile ---- */
/* Credits text is noisy on small screens; logo/image credits stay. */
.mobile .cesium-widget-credits {
  display: none !important;
}
/* InfoBox: Cesium's default popup is tiny on phones — expand to near-fullscreen. */
.mobile .cesium-infoBox {
  top: 44px !important;
  right: 0 !important;
  left: 0 !important;
  width: auto !important;
  max-width: none !important;
  max-height: calc(100vh - 50px) !important;
  border-radius: 0 !important;
}
.mobile .cesium-infoBox-iframe {
  height: 100% !important;
  max-height: none !important;
}
.ios .cesium-infoBox {
  overflow: auto !important;
  -webkit-overflow-scrolling: touch !important;
}
/* Error dialog: keep it readable on narrow screens. */
.mobile .cesium-widget-errorPanel-content {
  max-width: 90vw !important;
  max-height: 70vh !important;
}

/* ----- Shared panel skin (consumed by Toolbox/Imagery/Terrain/Actions) ----- */
.citydb-panel {
  background: var(--citydb-bg-translucent);
  color: var(--citydb-text);
  margin-top: 8px;
  border: 1px solid var(--citydb-border);
  border-radius: 4px;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.citydb-panel:hover {
  border-color: var(--citydb-border-hover);
}
.citydb-panel .el-card__header {
  padding: 8px 12px;
  border-bottom: 1px solid var(--citydb-border);
  color: var(--citydb-text);
}
.citydb-panel .el-card__body {
  padding: 10px 12px;
}
.citydb-panel.collapsed .el-card__body,
.citydb-panel.collapsed .el-card__header {
  border-bottom-color: transparent;
}
.citydb-panel.collapsed .el-card__body {
  display: none;
}
.citydb-panel .el-form-item {
  margin-bottom: 8px;
}
.citydb-panel .el-form-item__label {
  color: var(--citydb-text-muted);
  padding-bottom: 0;
  line-height: 1.2;
  font-size: 12px;
}

.citydb-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  color: var(--citydb-text);
  user-select: none;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.3px;
}

/* Tighten Element Plus's default link-button look for the +/- toggle chevron. */
.citydb-panel-header .el-button.is-link {
  color: var(--citydb-text-muted);
  font-size: 14px;
}
.citydb-panel-header .el-button.is-link:hover {
  color: var(--citydb-text-strong);
}

/* ----- Element Plus dark-input overrides (only inside our panels) ----- */
.citydb-panel .el-input__wrapper,
.citydb-panel .el-select .el-select__wrapper {
  background: rgba(0, 0, 0, 0.35);
  box-shadow: 0 0 0 1px var(--citydb-border) inset;
  transition: box-shadow 0.15s;
}
.citydb-panel .el-input__wrapper:hover,
.citydb-panel .el-select .el-select__wrapper:hover {
  box-shadow: 0 0 0 1px var(--citydb-border-hover) inset;
}
.citydb-panel .el-input__wrapper.is-focus,
.citydb-panel .el-select .el-select__wrapper.is-focused {
  box-shadow: 0 0 0 1px var(--citydb-border-focus) inset;
}
.citydb-panel .el-input__inner {
  color: var(--citydb-text);
}
.citydb-panel .el-input-number .el-input-number__decrease,
.citydb-panel .el-input-number .el-input-number__increase {
  background: transparent;
  color: var(--citydb-text-muted);
  border-color: var(--citydb-border);
}
.citydb-panel .el-checkbox__label {
  color: var(--citydb-text);
}

/* ----- Action buttons in panels: Cesium-toolbar hover treatment ----- */
.citydb-panel .el-button {
  color: var(--citydb-text);
  background: var(--citydb-bg);
  border: 1px solid var(--citydb-border);
  transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
}
.citydb-panel .el-button:hover {
  color: var(--citydb-text-strong);
  background: var(--citydb-accent);
  border-color: var(--citydb-border-hover);
  box-shadow: var(--citydb-shadow-hover);
}
.citydb-panel .el-button:active {
  color: #000;
  background: var(--citydb-accent-active);
  border-color: var(--citydb-text-strong);
}
.citydb-panel .el-button.is-disabled,
.citydb-panel .el-button.is-disabled:hover {
  color: #646464;
  background: var(--citydb-bg);
  border-color: var(--citydb-border);
  box-shadow: none;
}
.citydb-panel .el-button--primary {
  background: #1c5d8c;
  border-color: #2a82b8;
}
.citydb-panel .el-button--primary:hover {
  background: var(--citydb-accent);
  border-color: var(--citydb-border-hover);
}

/* Select dropdown popper (rendered outside panel via teleport) */
.el-select__popper.el-popper {
  background: var(--citydb-bg) !important;
  border-color: var(--citydb-border) !important;
}
.el-select__popper.el-popper .el-select-dropdown__item {
  color: var(--citydb-text);
}
.el-select__popper.el-popper .el-select-dropdown__item.is-hovering {
  background: rgba(68, 136, 187, 0.25);
}
.el-select__popper.el-popper .el-select-dropdown__item.is-selected {
  color: var(--citydb-text-strong);
  background: var(--citydb-accent);
}
</style>
