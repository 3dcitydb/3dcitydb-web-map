import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

// Mock the whole `cesium` module surface that the production code touches. The
// goal isn't to recreate Cesium's behaviour — only to provide the minimum shape
// so the user-facing flows (load → click → toggle → remove → switch terrain)
// can be exercised end-to-end without a real WebGL context.
vi.mock('cesium', () => {
  class Color {
    constructor(
      public r = 0,
      public g = 0,
      public b = 0,
      public a = 1,
    ) {}
    static clone(c: unknown): unknown {
      return c instanceof Color ? new Color(c.r, c.g, c.b, c.a) : c;
    }
    static AQUAMARINE = new Color(0.5, 1, 0.8);
    static YELLOW = new Color(1, 1, 0);
  }

  class ColorMaterialProperty {}

  class Entity {
    description?: string;
    name?: string;
  }

  class Cesium3DTileFeature {
    color: unknown = undefined;
    show = true;
    constructor(
      private props: Record<string, unknown> = {},
      public tileset?: { layerId?: string },
      public _batchId = 0,
    ) {}
    get primitive() {
      return this.tileset;
    }
    getPropertyIds(): string[] {
      return Object.keys(this.props);
    }
    getProperty(key: string): unknown {
      return this.props[key];
    }
  }

  class Cesium3DTilePointFeature {}

  class Cesium3DTileset {
    static fromUrl = vi.fn();
    layerId?: string;
    show = true;
    boundingSphere = {};
    colorBlendMode: unknown = undefined;
    colorBlendAmount = 0;
    pointCloudShading = {
      attenuation: false,
      maximumAttenuation: 0,
      eyeDomeLighting: false,
      eyeDomeLightingStrength: 0,
      eyeDomeLightingRadius: 0,
    };
    tileVisible = {
      addEventListener: vi.fn(() => () => {}),
    };
  }

  const Cesium3DTileColorBlendMode = { HIGHLIGHT: 'HIGHLIGHT', MIX: 'MIX', REPLACE: 'REPLACE' };

  class CesiumTerrainProvider {
    static fromUrl = vi.fn();
  }
  class EllipsoidTerrainProvider {}

  // Unused by the scenarios but imported transitively through `src/layers/index.ts`.
  class I3SDataProvider {}
  class GeoJsonDataSource {}
  class JulianDate {}
  const defined = (v: unknown) => v !== undefined && v !== null;

  let guidCounter = 0;
  const createGuid = () => `guid-${++guidCounter}`;

  const ScreenSpaceEventType = { LEFT_CLICK: 'LEFT_CLICK', MOUSE_MOVE: 'MOUSE_MOVE' };
  const KeyboardEventModifier = { CTRL: 'CTRL' };

  return {
    Color,
    ColorMaterialProperty,
    Entity,
    Cesium3DTileFeature,
    Cesium3DTilePointFeature,
    Cesium3DTileset,
    Cesium3DTileColorBlendMode,
    CesiumTerrainProvider,
    EllipsoidTerrainProvider,
    I3SDataProvider,
    GeoJsonDataSource,
    JulianDate,
    defined,
    createGuid,
    ScreenSpaceEventType,
    KeyboardEventModifier,
  };
});

// Imports must come AFTER the mock so they pick up the mocked module.
import {
  Cesium3DTileFeature,
  Cesium3DTileset,
  CesiumTerrainProvider,
  EllipsoidTerrainProvider,
  Color,
  type Entity,
} from 'cesium';
import { useLayersStore } from '../../src/state/useLayersStore';
import { useTerrainsStore } from '../../src/state/useTerrainsStore';
import { useWebMap } from '../../src/composables/useWebMap';
import { setViewer } from '../../src/viewer/viewerRef';

// A test double for Cesium's Viewer that exposes the surface our production code
// reaches into: scene.primitives (add/remove), scene.pick (clicked feature),
// scene.camera.flyToBoundingSphere (zoom), scene.terrainProviderChanged (event),
// screenSpaceEventHandler (mouse handlers), terrainProvider (settable, fires the
// event), selectedEntity (InfoBox target).
function makeFakeViewer() {
  const primitives = new Set<unknown>();
  const handlers = new Map<string, (e: unknown) => void>();
  const terrainListeners = new Set<(p: unknown) => void>();
  let nextPick: unknown = undefined;
  let terrain: unknown = new EllipsoidTerrainProvider();

  const viewer = {
    scene: {
      primitives: {
        add: (p: unknown) => primitives.add(p),
        remove: (p: unknown) => primitives.delete(p),
      },
      camera: { flyToBoundingSphere: vi.fn() },
      pick: () => nextPick,
      terrainProviderChanged: {
        addEventListener: (cb: (p: unknown) => void) => terrainListeners.add(cb),
        removeEventListener: (cb: (p: unknown) => void) => terrainListeners.delete(cb),
      },
    },
    screenSpaceEventHandler: {
      setInputAction: (cb: (e: unknown) => void, type: string, modifier?: string) => {
        handlers.set(modifier ? `${type}+${modifier}` : type, cb);
      },
      getInputAction: (type: string) => handlers.get(type),
    },
    selectedEntity: undefined as Entity | undefined,
    get terrainProvider() {
      return terrain;
    },
    set terrainProvider(p: unknown) {
      terrain = p;
      terrainListeners.forEach((cb) => cb(p));
    },
    // Test-only helpers below — prefixed `_` and not part of the real Viewer surface.
    _hasPrimitive: (p: unknown) => primitives.has(p),
    _setNextPick: (p: unknown) => {
      nextPick = p;
    },
    _click: (position = { x: 100, y: 100 }, ctrl = false) => {
      const key = ctrl ? 'LEFT_CLICK+CTRL' : 'LEFT_CLICK';
      handlers.get(key)?.({ position });
    },
  };
  return viewer;
}

// Cesium's real constructors require options we don't care about in tests; the
// mocks ignore arguments entirely. These typed casts let us instantiate without
// fighting the production type signatures, and widen the result to expose the
// `layerId` tag that production code attaches.
const mkTileset = () =>
  new (Cesium3DTileset as unknown as new () => Cesium3DTileset)() as Cesium3DTileset & {
    layerId?: string;
    show: boolean;
  };
const mkTerrain = () => new (CesiumTerrainProvider as unknown as new () => CesiumTerrainProvider)();

function defer<T>() {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

describe('user scenarios', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    setViewer(undefined);
    vi.mocked(Cesium3DTileset.fromUrl).mockReset();
    vi.mocked(CesiumTerrainProvider.fromUrl).mockReset();
  });

  it('adds a 3D Tiles layer, clicks a building, sees its info, then removes the layer', async () => {
    const viewer = makeFakeViewer();
    setViewer(viewer as never);
    const tileset = mkTileset();
    vi.mocked(Cesium3DTileset.fromUrl).mockResolvedValue(tileset as never);

    // --- Add layer ---
    const layers = useLayersStore();
    await layers.addLayer({ kind: '3dtiles', url: 'https://city/tileset', name: 'Berlin LOD2' });

    expect(layers.layers).toHaveLength(1);
    const entry = layers.layers[0];
    expect(entry.loading).toBe(false);
    expect(entry.error).toBeUndefined();
    expect(entry.active).toBe(true);
    expect(tileset.layerId).toBe(entry.id);
    expect(viewer._hasPrimitive(tileset)).toBe(true);

    // --- Click a building ---
    const webMap = useWebMap();
    webMap.clearSelected(); // reset any leaked module-level state from prior tests
    webMap.installMouseHandlers(viewer as never);

    const building = new Cesium3DTileFeature(
      { OBJECTID: 'BLDG-42', height: 23.5, address: 'Friedrichstr. 1' } as never,
      tileset as never,
    );
    viewer._setNextPick(building);
    viewer._click();

    // InfoBox is populated with the feature's properties.
    expect(viewer.selectedEntity).toBeDefined();
    expect(viewer.selectedEntity!.description).toContain('BLDG-42');
    expect(viewer.selectedEntity!.description).toContain('Friedrichstr. 1');
    expect(viewer.selectedEntity!.description).toContain('23.5');
    expect(viewer.selectedEntity!.name).toBe('BLDG-42');

    // Building is highlighted and tracked in selection state.
    expect(building.color).toBe(Color.AQUAMARINE);
    expect(webMap.prevSelected.value).toContain(building);

    // --- Remove layer ---
    layers.removeLayer(entry.id);
    expect(layers.layers).toHaveLength(0);
    expect(viewer._hasPrimitive(tileset)).toBe(false);
  });

  it('toggles a layer off and on without unloading it', async () => {
    const viewer = makeFakeViewer();
    setViewer(viewer as never);
    const tileset = mkTileset();
    vi.mocked(Cesium3DTileset.fromUrl).mockResolvedValue(tileset as never);

    const layers = useLayersStore();
    await layers.addLayer({ kind: '3dtiles', url: 'https://city/', name: 'Munich' });
    const entry = layers.layers[0];
    expect(tileset.show).toBe(true);

    layers.toggleLayer(entry.id, false);
    expect(tileset.show).toBe(false);
    expect(layers.layers[0].active).toBe(false);
    // Still attached — toggling visibility doesn't unload.
    expect(viewer._hasPrimitive(tileset)).toBe(true);

    layers.toggleLayer(entry.id, true);
    expect(tileset.show).toBe(true);
    expect(layers.layers[0].active).toBe(true);
  });

  it('a failing layer load surfaces the error and leaves other layers untouched', async () => {
    const viewer = makeFakeViewer();
    setViewer(viewer as never);

    const goodTileset = mkTileset();
    vi.mocked(Cesium3DTileset.fromUrl)
      .mockResolvedValueOnce(goodTileset as never)
      .mockRejectedValueOnce(new Error('HTTP 404: tileset not found'));

    const layers = useLayersStore();
    await layers.addLayer({ kind: '3dtiles', url: 'https://ok/', name: 'Good' });
    await expect(
      layers.addLayer({ kind: '3dtiles', url: 'https://broken/', name: 'Bad' }),
    ).rejects.toThrow('HTTP 404');

    expect(layers.layers).toHaveLength(2);
    const good = layers.layers.find((l) => l.spec.name === 'Good');
    const bad = layers.layers.find((l) => l.spec.name === 'Bad');
    expect(good?.error).toBeUndefined();
    expect(good?.loading).toBe(false);
    expect(bad?.error).toContain('HTTP 404');
    expect(bad?.loading).toBe(false);
    // The good layer's tileset is still in the scene.
    expect(viewer._hasPrimitive(goodTileset)).toBe(true);
  });

  it('ctrl+click adds to the selection instead of replacing it', async () => {
    const viewer = makeFakeViewer();
    setViewer(viewer as never);
    const tileset = mkTileset();
    vi.mocked(Cesium3DTileset.fromUrl).mockResolvedValue(tileset as never);

    const layers = useLayersStore();
    await layers.addLayer({ kind: '3dtiles', url: 'https://city/', name: 'Cologne' });

    const webMap = useWebMap();
    webMap.clearSelected();
    webMap.installMouseHandlers(viewer as never);

    const a = new Cesium3DTileFeature({ OBJECTID: 'A' } as never, tileset as never);
    const b = new Cesium3DTileFeature({ OBJECTID: 'B' } as never, tileset as never);

    viewer._setNextPick(a);
    viewer._click();
    viewer._setNextPick(b);
    viewer._click({ x: 200, y: 200 }, true); // ctrl+click

    expect(webMap.prevSelected.value).toEqual([a, b]);
    expect(a.color).toBe(Color.AQUAMARINE);
    expect(b.color).toBe(Color.AQUAMARINE);

    // Plain click on a third feature replaces the selection.
    const c = new Cesium3DTileFeature({ OBJECTID: 'C' } as never, tileset as never);
    viewer._setNextPick(c);
    viewer._click({ x: 300, y: 300 });

    expect(webMap.prevSelected.value).toEqual([c]);
  });

  it('switches between two terrains; the latest activation wins even if it resolves first', async () => {
    const viewer = makeFakeViewer();
    setViewer(viewer as never);

    const deferA = defer<unknown>();
    const deferB = defer<unknown>();
    vi.mocked(CesiumTerrainProvider.fromUrl)
      .mockImplementationOnce(() => deferA.promise as Promise<never>)
      .mockImplementationOnce(() => deferB.promise as Promise<never>);

    const terrains = useTerrainsStore();
    const pA = terrains.add({ name: 'A', url: 'https://terrain-a/' });
    const pB = terrains.add({ name: 'B', url: 'https://terrain-b/' });

    const providerA = mkTerrain();
    const providerB = mkTerrain();

    // B resolves first → B wins.
    deferB.resolve(providerB);
    await pB;
    // Then the slow A request comes back, but it has been superseded.
    deferA.resolve(providerA);
    await pA;

    const a = terrains.list.find((t) => t.spec.name === 'A');
    const b = terrains.list.find((t) => t.spec.name === 'B');
    expect(b?.active).toBe(true);
    expect(a?.active).toBe(false);
    expect(a?.loading).toBe(false); // critical: superseded row must not stay spinning
    expect(viewer.terrainProvider).toBe(providerB);
    expect(terrains.external).toBe(false);
  });

  it('external terrain swap (e.g. BaseLayerPicker) clears our active flags', async () => {
    const viewer = makeFakeViewer();
    setViewer(viewer as never);
    const ours = mkTerrain();
    vi.mocked(CesiumTerrainProvider.fromUrl).mockResolvedValue(ours as never);

    const terrains = useTerrainsStore();
    await terrains.add({ name: 'Ours', url: 'https://ours/' });
    expect(terrains.list[0].active).toBe(true);
    expect(terrains.external).toBe(false);

    // Simulate Cesium-side code swapping the provider out from under us.
    viewer.terrainProvider = mkTerrain();

    expect(terrains.list[0].active).toBe(false);
    expect(terrains.external).toBe(true);
  });
});
