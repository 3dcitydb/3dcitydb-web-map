<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { useViewerRef } from '../viewer/viewerRef';
import { useAuthStore } from '../state/useAuthStore';
import { getErrorMessage } from '../utils/errorMessages';

const { ready } = useViewerRef();
const auth = useAuthStore();
const toolbarEl = ref<Element | null>(null);

watch(
  ready,
  (r) => {
    toolbarEl.value = r ? document.querySelector('.cesium-viewer-toolbar') : null;
  },
  { immediate: true },
);

const label = computed(() => {
  if (!auth.isSignedIn) return '🔑';
  if (auth.userName) {
    return auth.userName
      .split(/[.,; -]/)
      .map((s) => s.charAt(0).toUpperCase())
      .join('');
  }
  return '🔓';
});

const title = computed(() =>
  auth.isSignedIn
    ? `Click to log out${auth.userName ? ` (${auth.userName})` : ''}`
    : 'Click to log in',
);

async function onClick() {
  if (auth.isSignedIn) {
    auth.signOut();
    return;
  }
  try {
    await auth.signIn();
    ElMessage.success(`Welcome${auth.userName ? `, ${auth.userName}` : ''}!`);
  } catch (err) {
    ElMessage.error(getErrorMessage(err));
  }
}
</script>

<template>
  <Teleport v-if="toolbarEl && auth.clientId" :to="toolbarEl">
    <button
      type="button"
      class="cesium-button cesium-toolbar-button citydb-signin"
      :class="{ 'citydb-signin-active': auth.isSignedIn }"
      :title="title"
      @click="onClick"
    >
      {{ label }}
    </button>
  </Teleport>
</template>

<style scoped>
.citydb-signin {
  color: #edffff !important;
  font-weight: bold !important;
  font-size: medium !important;
  text-align: center !important;
}
.citydb-signin.citydb-signin-active {
  color: yellow !important;
  font-size: small !important;
}
</style>
