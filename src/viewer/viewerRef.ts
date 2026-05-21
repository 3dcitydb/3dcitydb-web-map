import { ref, shallowRef } from 'vue';
import type { Viewer } from 'cesium';

const viewer = shallowRef<Viewer | undefined>(undefined);
const ready = ref(false);

export function setViewer(v: Viewer | undefined): void {
  viewer.value = v;
  ready.value = v !== undefined;
}

export function useViewerRef() {
  return { viewer, ready };
}
