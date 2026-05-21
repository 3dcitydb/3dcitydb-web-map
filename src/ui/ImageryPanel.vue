<script setup lang="ts">
import { ref } from 'vue';
import { ElButton, ElCard, ElForm, ElFormItem, ElInput, ElMessage, ElOption, ElSelect } from 'element-plus';
import { useBasemapStore, type ImageryConfig } from '../state/useBasemapStore';

const basemap = useBasemapStore();
const expanded = ref(false);

const draft = ref<ImageryConfig>({
  kind: 'wms',
  name: 'Bavaria DOP 20',
  url: 'https://geoservices.bayern.de/od/wms/dop/v1/dop20',
  layers: 'by_dop20c',
  tileStyle: '',
  tileMatrixSetId: '',
  additionalParameters: '',
});

function onApply() {
  if (!draft.value.url || !draft.value.name) {
    ElMessage.warning('Name and URL required');
    return;
  }
  try {
    basemap.setImagery({ ...draft.value });
    ElMessage.success('Imagery layer set');
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : String(err));
  }
}

function onRemove() {
  basemap.removeImagery();
}
</script>

<template>
  <el-card class="citydb-panel" :class="{ collapsed: !expanded }" shadow="hover">
    <template #header>
      <div class="citydb-panel-header" @click="expanded = !expanded">
        <span>Imagery</span>
        <el-button size="small" link>{{ expanded ? '−' : '+' }}</el-button>
      </div>
    </template>
    <div v-show="expanded">
      <el-form :model="draft" label-position="top" size="small">
        <el-form-item label="Type">
          <el-select v-model="draft.kind">
            <el-option label="WMS" value="wms" />
            <el-option label="WMTS" value="wmts" />
          </el-select>
        </el-form-item>
        <el-form-item label="Name">
          <el-input v-model="draft.name" />
        </el-form-item>
        <el-form-item label="URL">
          <el-input v-model="draft.url" />
        </el-form-item>
        <el-form-item label="Sub-layers">
          <el-input v-model="draft.layers" />
        </el-form-item>
        <el-form-item v-if="draft.kind === 'wmts'" label="Style">
          <el-input v-model="draft.tileStyle" />
        </el-form-item>
        <el-form-item v-if="draft.kind === 'wmts'" label="tileMatrixSetID">
          <el-input v-model="draft.tileMatrixSetId" />
        </el-form-item>
        <el-form-item label="Additional params">
          <el-input v-model="draft.additionalParameters" placeholder="key=value&key=value" />
        </el-form-item>
        <div class="actions">
          <el-button type="primary" size="small" @click="onApply">Add / Update</el-button>
          <el-button size="small" @click="onRemove" :disabled="!basemap.imagery">Remove</el-button>
        </div>
      </el-form>
      <div v-if="basemap.imagery" class="current">Current: {{ basemap.imagery.name }}</div>
    </div>
  </el-card>
</template>

<style scoped>
.actions { display: flex; gap: 8px; margin-top: 14px; }
.current { margin-top: 8px; font-size: 11px; color: var(--citydb-text-muted); }
</style>
