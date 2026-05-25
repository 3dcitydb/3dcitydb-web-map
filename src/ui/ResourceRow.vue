<script setup lang="ts">
defineProps<{ kind?: string }>();
</script>

<template>
  <div class="entry-row">
    <span class="entry-name">
      <span v-if="kind" class="kind-tag">{{ kind }}</span>
      <slot name="label" />
    </span>
    <span v-if="$slots.actions" class="entry-actions">
      <slot name="actions" />
    </span>
  </div>
</template>

<style scoped>
.entry-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 12px;
  gap: 8px;
}
.entry-name {
  flex: 1;
  min-width: 0;
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
.entry-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}
:slotted(.status) {
  color: var(--citydb-text-muted);
  margin-left: 6px;
}
:slotted(.status.error) {
  color: #ff7875;
}
</style>
