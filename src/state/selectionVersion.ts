import { ref, type Ref } from 'vue';

/** Module-level reactive trigger bumped by LayerBase whenever its hidden/highlight state
 *  mutates (including async wrapper-discovery during tile streaming). Vue computeds that
 *  read it via `void selectionVersion.value` re-evaluate on the next tick.
 *
 *  Shared in its own module so both `useWebMap` (which reads) and `useLayersStore` (which
 *  wires LayerBase.onStateChange to bumpSelectionVersion) can import without forming a
 *  circular dependency. */
export const selectionVersion: Ref<number> = ref(0);

export function bumpSelectionVersion(): void {
  selectionVersion.value++;
}
