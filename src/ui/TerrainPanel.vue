<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import CollapsiblePanel from './CollapsiblePanel.vue';
import ResourceRow from './ResourceRow.vue';
import { useTerrainsStore, type TerrainConfig } from '../state/useTerrainsStore';
import { useViewerRef } from '../viewer/viewerRef';
import { getErrorMessage } from '../utils/errorMessages';

const terrains = useTerrainsStore();
const { ready: viewerReady } = useViewerRef();

const draft = ref<TerrainConfig>({
  name: 'Bavaria DTM',
  url: 'https://bvv3d21.bayernwolke.de/3d-data/latest/terrain/',
});

const submitting = ref(false);

async function onAdd() {
  if (!draft.value.url || !draft.value.name) {
    ElMessage.warning('Name and URL required');
    return;
  }
  submitting.value = true;
  try {
    const entry = await terrains.add({ ...draft.value });
    if (!entry) {
      // Entry was removed during the add (user clicked remove on the appearing
      // row). They moved on; no toast.
    } else if (entry.active) {
      ElMessage.success(`Terrain "${draft.value.name}" added`);
    } else {
      // Silently superseded — entry sits in the list but isn't active. Surface
      // that so the user isn't misled by a success toast.
      ElMessage.info(`Terrain "${draft.value.name}" added but not activated`);
    }
  } catch (err) {
    ElMessage.error(getErrorMessage(err));
  } finally {
    submitting.value = false;
  }
}

// Radio v-model: '' = Ellipsoid, entry.id = that entry, undefined = no radio matches
// (used when viewer.terrainProvider was set externally, so the radio doesn't
// pretend "Ellipsoid (none)" is selected).
const activeId = computed<string | undefined>({
  get: () => {
    if (terrains.external) return undefined;
    return terrains.list.find((t) => t.active)?.id ?? '';
  },
  set: async (id) => {
    if (id === undefined) return;
    try {
      await terrains.activate(id || undefined);
    } catch (err) {
      ElMessage.error(getErrorMessage(err));
    }
  },
});
</script>

<template>
  <CollapsiblePanel title="Terrain">
    <el-form :model="draft" label-position="top" size="small">
      <el-form-item label="Name">
        <el-input v-model="draft.name" />
      </el-form-item>
      <el-form-item label="URL">
        <el-input v-model="draft.url" />
      </el-form-item>

      <div class="actions">
        <el-button
          type="primary"
          size="small"
          :loading="submitting"
          :disabled="!viewerReady"
          @click="onAdd"
        >
          {{ viewerReady ? 'Add terrain' : 'Waiting for viewer…' }}
        </el-button>
      </div>
    </el-form>

    <div v-if="terrains.list.length || terrains.external" class="entry-list">
      <div v-if="terrains.external" class="hint external">
        Terrain is currently set externally (e.g. via Cesium's base layer picker). Pick any entry
        below to override.
      </div>
      <div v-else class="hint">Only one terrain can be active at a time.</div>
      <el-radio-group v-model="activeId" class="radio-col">
        <ResourceRow>
          <template #label>
            <el-radio value="">Ellipsoid (none)</el-radio>
          </template>
        </ResourceRow>
        <ResourceRow v-for="t in terrains.list" :key="t.id">
          <template #label>
            <el-radio :value="t.id">
              {{ t.spec.name }}
              <span v-if="t.loading" class="status">(loading…)</span>
              <span v-if="t.error" class="status error">{{ t.error }}</span>
            </el-radio>
          </template>
          <template #actions>
            <el-button size="small" link type="danger" @click="terrains.remove(t.id)"
              >remove</el-button
            >
          </template>
        </ResourceRow>
      </el-radio-group>
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
.hint {
  font-size: 11px;
  color: var(--citydb-text-muted);
  margin-bottom: 6px;
}
.hint.external {
  color: var(--citydb-border-focus);
}
.radio-col {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
}
</style>
