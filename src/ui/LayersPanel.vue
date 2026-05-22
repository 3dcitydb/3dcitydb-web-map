<script setup lang="ts">
import { ref } from 'vue';
import { ElButton, ElCard, ElCheckbox, ElForm, ElFormItem, ElInput, ElInputNumber, ElSelect, ElOption, ElMessage, ElSwitch } from 'element-plus';
import { useLayersStore, type ActiveLayer, type LayerKind } from '../state/useLayersStore';
import { useViewerRef } from '../viewer/viewerRef';

const layers = useLayersStore();
const { ready: viewerReady } = useViewerRef();
const expanded = ref(false);

type ThematicSource = '' | 'GoogleSheets' | 'PostgreSQL' | 'OGCFeatureAPI';
type TableType = 'Horizontal' | 'Vertical';

interface Draft {
  name: string;
  url: string;
  kind: LayerKind;
  maximumScreenSpaceError: number;
  clampToGround: boolean;
  thematicDataSource: ThematicSource;
  thematicDataUrl: string;
  tableType: TableType;
}

const PRESETS: Record<LayerKind, { name: string; url: string }> = {
  '3dtiles': {
    name: 'Bavaria LOD2 Buildings',
    url: 'https://bvv3d21.bayernwolke.de/3d-data/latest/lod23d/tileset.json',
  },
  i3s: {
    name: 'San Francisco 3D Objects',
    url: 'https://tiles.arcgis.com/tiles/z2tnIkrLQ2BRzr6P/arcgis/rest/services/SanFrancisco_3DObjects_1_7/SceneServer/layers/0',
  },
  geojson: {
    name: 'NRW Districts',
    url: 'https://www.ldproxy.nrw.de/kataster/collections/flurstueck/items?f=json&bbox=6.4,50.35,6.45,50.4&limit=2000',
  },
};

const draft = ref<Draft>({
  ...PRESETS['3dtiles'],
  kind: '3dtiles',
  maximumScreenSpaceError: 16,
  clampToGround: false,
  thematicDataSource: '',
  thematicDataUrl: '',
  tableType: 'Horizontal',
});

function onKindChange(kind: LayerKind) {
  const preset = PRESETS[kind];
  draft.value = { ...draft.value, name: preset.name, url: preset.url };
}

const submitting = ref(false);

async function onAdd() {
  if (!draft.value.name || !draft.value.url) {
    ElMessage.warning('Name and URL are required');
    return;
  }
  submitting.value = true;
  try {
    await layers.addLayer({
      name: draft.value.name,
      url: draft.value.url,
      kind: draft.value.kind,
      maximumScreenSpaceError: draft.value.maximumScreenSpaceError,
      clampToGround: draft.value.clampToGround,
      thematicDataSource: draft.value.thematicDataSource || undefined,
      thematicDataUrl: draft.value.thematicDataUrl || undefined,
      tableType: draft.value.thematicDataSource ? draft.value.tableType : undefined,
    });
    ElMessage.success(`Layer "${draft.value.name}" loaded`);
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : String(err));
  } finally {
    submitting.value = false;
  }
}

function canZoom(l: ActiveLayer): boolean {
  return !l.loading && !l.error;
}
</script>

<template>
  <el-card class="citydb-panel" :class="{ collapsed: !expanded }" shadow="hover">
    <template #header>
      <div class="citydb-panel-header" @click="expanded = !expanded">
        <span>Layers</span>
        <el-button size="small" link>{{ expanded ? '−' : '+' }}</el-button>
      </div>
    </template>

    <div v-show="expanded">
      <el-form :model="draft" label-position="top" size="small">
        <el-form-item label="Type">
          <el-select v-model="draft.kind" @change="onKindChange">
            <el-option label="Cesium 3D Tiles" value="3dtiles" />
            <el-option label="I3S" value="i3s" />
            <el-option label="GeoJSON" value="geojson" />
          </el-select>
        </el-form-item>
        <el-form-item label="Name">
          <el-input v-model="draft.name" />
        </el-form-item>
        <el-form-item label="URL">
          <el-input v-model="draft.url" />
        </el-form-item>
        <el-form-item v-if="draft.kind !== 'geojson'" label="maximumScreenSpaceError">
          <el-input-number v-model="draft.maximumScreenSpaceError" :min="1" :max="64" />
        </el-form-item>
        <el-form-item v-if="draft.kind === 'geojson'">
          <el-checkbox v-model="draft.clampToGround">Clamp to ground</el-checkbox>
        </el-form-item>

        <div class="section-title">Thematic data</div>
        <el-form-item label="Source">
          <el-select v-model="draft.thematicDataSource" clearable placeholder="None (embedded only)">
            <el-option label="Google Sheets" value="GoogleSheets" />
            <el-option label="PostgreSQL / PostgREST" value="PostgreSQL" />
            <el-option label="OGC Feature API" value="OGCFeatureAPI" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="draft.thematicDataSource" label="Thematic URL">
          <el-input v-model="draft.thematicDataUrl" placeholder="https://…" />
        </el-form-item>
        <el-form-item v-if="draft.thematicDataSource" label="Table structure">
          <el-select v-model="draft.tableType">
            <el-option label="One row per object (Horizontal)" value="Horizontal" />
            <el-option label="One row per attribute (Vertical)" value="Vertical" />
          </el-select>
        </el-form-item>

        <div class="actions">
          <el-button type="primary" size="small" :loading="submitting" :disabled="!viewerReady" @click="onAdd">
            {{ viewerReady ? 'Add layer' : 'Waiting for viewer…' }}
          </el-button>
        </div>
      </el-form>

      <ul v-if="layers.layers.length" class="layer-list">
        <li v-for="l in layers.layers" :key="l.id">
          <span
            class="layer-name"
            :class="{ clickable: canZoom(l) }"
            title="Click to zoom to layer"
            @click="layers.zoomToLayer(l.id)"
          >
            <span class="kind-tag">{{ l.spec.kind }}</span>
            {{ l.spec.name }}
            <span v-if="l.loading" class="status">(loading…)</span>
            <span v-if="l.error" class="status error">{{ l.error }}</span>
          </span>
          <span class="layer-actions">
            <el-switch
              :model-value="l.instance.active"
              size="small"
              @update:model-value="(v: string | number | boolean) => layers.toggleLayer(l.id, Boolean(v))"
            />
            <el-button size="small" link type="danger" @click="layers.removeLayer(l.id)">remove</el-button>
          </span>
        </li>
      </ul>
    </div>
  </el-card>
</template>

<style scoped>
.layer-list {
  list-style: none;
  padding: 0;
  margin: 8px 0 0;
}
.layer-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 12px;
  gap: 8px;
}
.layer-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}
.layer-name.clickable {
  cursor: pointer;
}
.layer-name.clickable:hover {
  color: var(--citydb-border-focus);
}
.kind-tag {
  display: inline-block;
  padding: 0 4px;
  margin-right: 6px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
  font-size: 10px;
  text-transform: uppercase;
}
.status {
  color: var(--citydb-text-muted);
  margin-left: 6px;
}
.status.error {
  color: #ff7875;
}
.layer-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}
.actions { margin-top: 14px; }
.section-title {
  margin: 8px 0 4px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--citydb-border);
  color: var(--citydb-border-focus);
  font-size: 11px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>
