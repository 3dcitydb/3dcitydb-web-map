<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import CollapsiblePanel from './CollapsiblePanel.vue';
import ResourceRow from './ResourceRow.vue';
import { useImageriesStore, type ImageryConfig } from '../state/useImageriesStore';
import { useViewerRef } from '../viewer/viewerRef';
import { getErrorMessage } from '../utils/errorMessages';

const imageries = useImageriesStore();
const { ready: viewerReady } = useViewerRef();

const draft = ref<ImageryConfig>({
  kind: 'wms',
  name: 'Bavaria DOP 20',
  url: 'https://geoservices.bayern.de/od/wms/dop/v1/dop20',
  layers: 'by_dop20c',
  tileStyle: '',
  tileMatrixSetId: '',
  additionalParameters: '',
});

function onAdd() {
  if (!draft.value.url || !draft.value.name) {
    ElMessage.warning('Name and URL required');
    return;
  }
  try {
    imageries.add({ ...draft.value });
    ElMessage.success(`Imagery "${draft.value.name}" added`);
  } catch (err) {
    ElMessage.error(getErrorMessage(err));
  }
}
</script>

<template>
  <CollapsiblePanel title="Imagery">
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
        <el-button type="primary" size="small" :disabled="!viewerReady" @click="onAdd">
          {{ viewerReady ? 'Add imagery' : 'Waiting for viewer…' }}
        </el-button>
      </div>
    </el-form>

    <div v-if="imageries.list.length" class="entry-list">
      <ResourceRow v-for="i in imageries.list" :key="i.id" :kind="i.spec.kind">
        <template #label>{{ i.spec.name }}</template>
        <template #actions>
          <el-switch
            :model-value="i.active"
            size="small"
            @update:model-value="(v: boolean) => imageries.toggle(i.id, v)"
          />
          <el-button size="small" link type="danger" @click="imageries.remove(i.id)"
            >remove</el-button
          >
        </template>
      </ResourceRow>
    </div>
  </CollapsiblePanel>
</template>

<style scoped>
.actions {
  margin-top: 14px;
}
.entry-list {
  margin-top: 8px;
}
</style>
