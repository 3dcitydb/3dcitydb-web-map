import { shallowRef } from 'vue';

export interface HasId {
  id: string;
}

// Shared list-of-entries registry used by the basemap stores (imagery, terrain).
// Encapsulates the immutable-update convention: every mutation produces a new
// array via map/filter/spread; reactivity is driven solely by .value reassignment.
// The bespoke multi-entry batch updates (see useTerrainsStore.commit) bypass this
// and reassign list.value directly — that's intentional, not all updates fit a
// single-entry patch shape.
export function createEntryRegistry<T extends HasId>(prefix: string) {
  const list = shallowRef<T[]>([]);
  let counter = 0;

  return {
    list,
    genId: () => `${prefix}-${++counter}`,
    findById: (id: string): T | undefined => list.value.find((e) => e.id === id),
    append: (entry: T): void => {
      list.value = [...list.value, entry];
    },
    removeById: (id: string): T | undefined => {
      const entry = list.value.find((e) => e.id === id);
      if (!entry) return undefined;
      list.value = list.value.filter((e) => e.id !== id);
      return entry;
    },
    updateEntry: (id: string, patch: Partial<T>): void => {
      list.value = list.value.map((e) => (e.id === id ? { ...e, ...patch } : e));
    },
  };
}
