<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useMobile } from '../composables/useMobile';

const props = defineProps<{
  url?: string;
  showOnStart?: boolean;
}>();

const { isMobile, isIOS } = useMobile();
const visible = ref(false);
const STORAGE_KEY = 'citydb_splash_ignore';

// When no URL is provided via the ?sw= param, fall back to the bundled instructions HTML.
// On mobile, pick the mobile-friendly variant.
// Resolve relative to the document so the bundle works under any deployment path:
// Vite dev (/), IntelliJ static server (/<project>/dist/), CDN subfolders, etc.
function bundled(name: string): string {
  return new URL(`splash/${name}`, document.baseURI).toString();
}
const effectiveUrl = computed(() => {
  if (props.url) return props.url;
  return bundled(isMobile.value ? 'SplashWindow_Mobile.html' : 'SplashWindow.html');
});

function open() {
  visible.value = true;
}

function close() {
  visible.value = false;
}

function ignore() {
  localStorage.setItem(STORAGE_KEY, effectiveUrl.value);
  visible.value = false;
}

watch(
  effectiveUrl,
  (url) => {
    // Default behaviour: show on start. Only an explicit `false` suppresses it —
    // do NOT collapse to `!props.showOnStart`, that would also treat `undefined` as "don't show".
    // noinspection PointlessBooleanExpressionJS
    if (!url || props.showOnStart === false) return;
    if (localStorage.getItem(STORAGE_KEY) === url) return;
    open();
  },
  { immediate: true },
);

defineExpose({ open, close });
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="splash-overlay" :class="{ mobile: isMobile, ios: isIOS }">
      <div class="splash-content">
        <iframe :src="effectiveUrl" class="splash-frame" />
        <div class="splash-buttons">
          <el-button @click="ignore">Don't show again</el-button>
          <el-button type="primary" @click="close">Close</el-button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.splash-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.splash-content {
  width: min(85vw, 1000px);
  height: min(85vh, 700px);
  background: #fff;
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}
.splash-frame {
  flex: 1;
  width: 100%;
  border: 0;
}
.splash-buttons {
  padding: 8px 12px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  background: #f5f5f5;
  border-top: 1px solid #e0e0e0;
}

/* ---- Mobile: near-fullscreen splash, matching legacy 96% × 96% layout ---- */
.splash-overlay.mobile .splash-content {
  width: 96vw;
  height: 96vh;
  border-radius: 4px;
}
.splash-overlay.mobile.ios .splash-frame {
  -webkit-overflow-scrolling: touch;
  overflow: auto;
}
</style>
