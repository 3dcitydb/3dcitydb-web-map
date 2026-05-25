import { defineStore } from 'pinia';
import { shallowRef, watch } from 'vue';
import { CesiumTerrainProvider, EllipsoidTerrainProvider, type TerrainProvider } from 'cesium';
import { createEntryRegistry } from './entryRegistry';
import { getErrorMessage } from '../utils/errorMessages';
import { useViewerRef } from '../viewer/viewerRef';

export interface TerrainConfig {
  name: string;
  url: string;
}

export interface ActiveTerrain {
  id: string;
  spec: TerrainConfig;
  active: boolean;
  loading: boolean;
  error?: string;
  // The loaded provider, retained so we can compare against viewer.terrainProvider
  // when external code (e.g. Cesium's BaseLayerPicker) swaps it out from under us.
  provider?: TerrainProvider;
}

export const useTerrainsStore = defineStore('terrains', () => {
  const { viewer } = useViewerRef();
  const { list, genId, findById, append, removeById, updateEntry } =
    createEntryRegistry<ActiveTerrain>('terrain');
  // True when viewer.terrainProvider is set externally (non-ellipsoid and not one
  // of ours). Lets the TerrainPanel explain why the radio appears unselected.
  const external = shallowRef(false);

  // Monotonic token: a slow earlier activate's fromUrl resolution checks this to
  // detect that a later call has superseded it.
  let activationToken = 0;
  // Tracks which entry the latest call is targeting (undefined for deactivate).
  // Lets a superseded resolution decide whether to clear its own loading flag: if
  // a newer call took over the SAME entry (A → A spam-click), that call already
  // re-set loading=true and owns it; otherwise (A → B or A → Ellipsoid) we must
  // clear our flag or the row stays stuck spinning.
  let latestEntryId: string | undefined;
  const isLatest = (token: number) => token === activationToken;
  const stillExists = (id: string) => findById(id) !== undefined;
  const stillOwnsLoading = (id: string) => latestEntryId === id;

  function isExternalProvider(p: TerrainProvider): boolean {
    if (p instanceof EllipsoidTerrainProvider) return false;
    return !list.value.some((t) => t.provider === p);
  }

  // Recompute `active` flags + external flag from viewer.terrainProvider.
  // Entry point for external mutations (BaseLayerPicker etc.). Only reassigns
  // list.value when an entry's active flag actually flipped — Cesium fires
  // terrainProviderChanged for many no-op cases (re-renders, idempotent assigns)
  // and unconditional reassignment would re-render every ResourceRow each time.
  function syncFromViewer(current: TerrainProvider): void {
    let dirty = false;
    const next = list.value.map((t) => {
      const nextActive = !!t.provider && t.provider === current;
      if (t.active !== nextActive) {
        dirty = true;
        return { ...t, active: nextActive };
      }
      return t;
    });
    if (dirty) list.value = next;
    const nextExternal = isExternalProvider(current);
    if (external.value !== nextExternal) external.value = nextExternal;
  }

  watch(
    viewer,
    (v, _prev, onCleanup) => {
      if (!v) return;
      const onChange = () => syncFromViewer(v.terrainProvider);
      v.scene.terrainProviderChanged.addEventListener(onChange);
      onCleanup(() => v.scene.terrainProviderChanged.removeEventListener(onChange));
    },
    // flush: 'sync' so cleanup runs the instant CesiumViewer's onBeforeUnmount
    // calls setViewer(undefined) — the next line in that hook destroys the Viewer
    // (Cesium's destroyObject), after which accessing v.scene throws.
    { immediate: true, flush: 'sync' },
  );

  async function add(cfg: TerrainConfig, autoActivate = true): Promise<ActiveTerrain | undefined> {
    const entry: ActiveTerrain = {
      id: genId(),
      spec: { ...cfg },
      active: false,
      loading: false,
    };
    append(entry);
    if (autoActivate) {
      try {
        await activateEntry(entry);
      } catch (err) {
        // Roll back: a broken row that re-fires the same failure on click is worse
        // than no row at all.
        removeById(entry.id);
        throw err;
      }
    }
    // Immutable updates inside activateEntry replaced `entry` in the list with a
    // new object — return the live one so callers see the post-activation state
    // (active/provider/loading) and can detect silent supersession by checking
    // `.active === false`. Returns undefined when the entry was removed mid-await
    // (e.g. the user clicked remove on the just-added row); callers should treat
    // that as a cancellation, not an "added but inactive" state.
    return findById(entry.id);
  }

  function remove(id: string): void {
    const entry = removeById(id);
    if (!entry) return;
    if (entry.active && viewer.value) {
      viewer.value.terrainProvider = new EllipsoidTerrainProvider();
    }
  }

  function deactivate(): void {
    if (!viewer.value) throw new Error('Viewer is not ready');
    activationToken++;
    latestEntryId = undefined;
    viewer.value.terrainProvider = new EllipsoidTerrainProvider();
    // Don't rely on the change-event listener for `external` — if Cesium ever
    // short-circuits the assignment (e.g. previous provider was already an
    // Ellipsoid instance), the event might not fire and external would stay stuck.
    external.value = false;
    // Clear stale errors — user has explicitly moved on from any failed activations.
    list.value = list.value.map((t) => (t.error === undefined ? t : { ...t, error: undefined }));
  }

  async function activate(id: string | undefined): Promise<void> {
    if (!id) {
      deactivate();
      return;
    }
    if (!viewer.value) throw new Error('Viewer is not ready');
    const entry = findById(id);
    if (entry) await activateEntry(entry);
  }

  async function activateEntry(entry: ActiveTerrain): Promise<void> {
    const token = ++activationToken;
    latestEntryId = entry.id;
    updateEntry(entry.id, { loading: true, error: undefined });
    let provider: TerrainProvider;
    try {
      provider = await CesiumTerrainProvider.fromUrl(entry.spec.url);
    } catch (err) {
      handleFailure(entry.id, token, err);
      return;
    }
    if (!isLatest(token) || !stillExists(entry.id)) {
      // Superseded or removed mid-await. Clear our loading flag unless a newer
      // call took over this same entry — in which case it owns the flag.
      if (!stillOwnsLoading(entry.id)) updateEntry(entry.id, { loading: false });
      return;
    }
    commit(entry.id, provider);
  }

  function commit(entryId: string, provider: TerrainProvider): void {
    if (!viewer.value) {
      // Viewer was torn down during the await (component unmount). Clear our
      // loading flag so the entry isn't stuck spinning if the panel re-mounts.
      updateEntry(entryId, { loading: false });
      return;
    }
    // Optimistically write list+external BEFORE the viewer assignment so the
    // synchronously-fired terrainProviderChanged listener (syncFromViewer) sees
    // the new provider already wired to its entry — avoids the transient where
    // syncFromViewer would briefly set external=true with no matching entry.
    const prevList = list.value;
    const prevExternal = external.value;
    list.value = list.value.map((t) =>
      t.id === entryId ? { ...t, loading: false, provider, active: true } : { ...t, active: false },
    );
    external.value = false;
    try {
      viewer.value.terrainProvider = provider;
    } catch (err) {
      // Cesium rejected the assignment (e.g. scene mid-teardown). Roll back the
      // optimistic state and surface the error on the entry so the row shows it
      // and the caller's catch propagates a real failure.
      list.value = prevList.map((t) =>
        t.id === entryId ? { ...t, loading: false, error: getErrorMessage(err) } : t,
      );
      external.value = prevExternal;
      throw err;
    }
  }

  function handleFailure(entryId: string, token: number, err: unknown): void {
    if (!isLatest(token) || !stillExists(entryId)) {
      // Same supersede/cancel logic as activateEntry's post-await branch: only
      // clear our loading mark if no newer call has taken over this entry.
      if (!stillOwnsLoading(entryId)) updateEntry(entryId, { loading: false });
      return;
    }
    updateEntry(entryId, {
      loading: false,
      error: getErrorMessage(err),
    });
    throw err;
  }

  return { list, external, add, remove, activate };
});
