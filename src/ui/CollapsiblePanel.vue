<script setup lang="ts">
import { ref } from 'vue';

defineProps<{ title: string }>();

const expanded = ref(false);
</script>

<template>
  <el-card class="citydb-panel" :class="{ collapsed: !expanded }" shadow="hover">
    <template #header>
      <div class="citydb-panel-header" @click="expanded = !expanded">
        <span>{{ title }}</span>
        <el-button size="small" link>{{ expanded ? '−' : '+' }}</el-button>
      </div>
    </template>
    <div v-show="expanded">
      <slot />
    </div>
  </el-card>
</template>
