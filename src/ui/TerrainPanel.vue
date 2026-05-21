<script setup lang="ts">
import { ref } from 'vue';
import { ElButton, ElCard, ElForm, ElFormItem, ElInput, ElMessage } from 'element-plus';
import { useBasemapStore, type TerrainConfig } from '../state/useBasemapStore';

const basemap = useBasemapStore();
const expanded = ref(false);

const draft = ref<TerrainConfig>({
  name: 'Bavaria DTM',
  url: 'https://bvv3d21.bayernwolke.de/3d-data/latest/terrain/',
});

async function onApply() {
  if (!draft.value.url || !draft.value.name) {
    ElMessage.warning('Name and URL required');
    return;
  }
  try {
    await basemap.setTerrain({ ...draft.value });
    ElMessage.success('Terrain layer set');
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : String(err));
  }
}

function onRemove() {
  basemap.removeTerrain();
}
</script>

<template>
  <el-card class="citydb-panel" :class="{ collapsed: !expanded }" shadow="hover">
    <template #header>
      <div class="citydb-panel-header" @click="expanded = !expanded">
        <span>Terrain</span>
        <el-button size="small" link>{{ expanded ? '−' : '+' }}</el-button>
      </div>
    </template>
    <div v-show="expanded">
      <el-form :model="draft" label-position="top" size="small">
        <el-form-item label="Name">
          <el-input v-model="draft.name" />
        </el-form-item>
        <el-form-item label="URL">
          <el-input v-model="draft.url" />
        </el-form-item>
        <div class="actions">
          <el-button type="primary" size="small" @click="onApply">Add / Update</el-button>
          <el-button size="small" @click="onRemove" :disabled="!basemap.terrain">Remove</el-button>
        </div>
      </el-form>
      <div v-if="basemap.terrain" class="current">Current: {{ basemap.terrain.name }}</div>
    </div>
  </el-card>
</template>

<style scoped>
.actions { display: flex; gap: 8px; margin-top: 14px; }
.current { margin-top: 8px; font-size: 11px; color: var(--citydb-text-muted); }
</style>
