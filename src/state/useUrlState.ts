import { Cartographic, Cartesian3, JulianDate, Math as CesiumMath, type Viewer } from 'cesium';
import type { Viewer as CesiumViewer } from 'cesium';
import type { ImageryConfig } from './useImageriesStore';
import type { TerrainConfig } from './useTerrainsStore';
import type { LayerKind } from './useLayersStore';
import { DataSourceKind, TableType } from '../thematic/types';

const FORWARD: Record<string, string> = {
  title: 't',
  shadows: 's',
  terrainShadows: 'ts',
  latitude: 'la',
  longitude: 'lo',
  height: 'h',
  heading: 'hd',
  pitch: 'p',
  roll: 'r',
  layer_: 'l_',
  imagery_: 'im_',
  terrain_: 'tr_',
  url: 'u',
  name: 'n',
  layerDataType: 'ld',
  layerClampToGround: 'lc',
  active: 'a',
  thematicDataUrl: 'tdu',
  thematicDataSource: 'ds',
  tableType: 'tt',
  maximumScreenSpaceError: 'msse',
  imageryType: 'imageryType',
  iconUrl: 'iu',
  tooltip: 'ht',
  layers: 'ls',
  additionalParameters: 'ap',
  proxyUrl: 'pu',
  tileStyle: 'tst',
  tileMatrixSetId: 'tmsi',
  splashWindow: 'sw',
  showOnStart: 'ss',
  ionToken: 'it',
  bingToken: 'bt',
  googleClientId: 'gid',
  dayTime: 'd',
  debug: 'db',
};

function fwd(name: string): string {
  // Numbered collection keys (layer_N, imagery_N, terrain_N) — FORWARD stores only the prefix.
  for (const prefix of ['layer_', 'imagery_', 'terrain_']) {
    if (name.startsWith(prefix) && name.length > prefix.length) {
      return FORWARD[prefix] + name.substring(prefix.length);
    }
  }
  return FORWARD[name] ?? name;
}

function readParam(params: URLSearchParams, name: string): string | undefined {
  return params.get(fwd(name)) ?? params.get(name) ?? undefined;
}

function objectToQuery(obj: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === '' || v === null) continue;
    parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  }
  return parts.join('&');
}

function queryToObject(query: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const pair of query.split('&')) {
    if (!pair) continue;
    const eq = pair.indexOf('=');
    if (eq < 0) continue;
    out[decodeURIComponent(pair.slice(0, eq))] = decodeURIComponent(pair.slice(eq + 1));
  }
  return out;
}

interface ParsedCamera {
  latitude?: number;
  longitude?: number;
  height?: number;
  heading?: number;
  pitch?: number;
  roll?: number;
}

interface ParsedLayer {
  url: string;
  name: string;
  kind: LayerKind;
  clampToGround?: boolean;
  active?: boolean;
  thematicDataUrl?: string;
  thematicDataSource?: DataSourceKind;
  tableType?: TableType;
  maximumScreenSpaceError?: number;
}

interface ParsedImagery {
  spec: ImageryConfig;
  active: boolean;
}

interface ParsedTerrain {
  spec: TerrainConfig;
  active: boolean;
}

interface ParsedUrlState {
  title?: string;
  ionToken?: string;
  bingToken?: string;
  googleClientId?: string;
  dayTime?: string;
  debug?: boolean;
  shadows?: boolean;
  terrainShadows?: number;
  camera: ParsedCamera;
  layers: ParsedLayer[];
  imageries: ParsedImagery[];
  terrains: ParsedTerrain[];
  splashUrl?: string;
  splashShowOnStart?: boolean;
}

// Scan a URLSearchParams for keys matching any of the given prefixes followed by a
// non-negative integer (e.g. "im_0", "imagery_2"). Returns the raw values in ascending
// index order. Tolerates sparse indices (?im_0=…&im_2=…) and keys arriving out of order.
// First occurrence wins per index, so a URL containing both short and long forms
// (?im_0=A&imagery_0=B) doesn't produce a duplicate entry.
function collectIndexed(params: URLSearchParams, prefixes: string[]): string[] {
  const byIdx = new Map<number, string>();
  for (const [key, value] of params) {
    for (const p of prefixes) {
      if (!key.startsWith(p)) continue;
      const tail = key.substring(p.length);
      if (!/^\d+$/.test(tail)) continue;
      const idx = Number(tail);
      if (!byIdx.has(idx)) byIdx.set(idx, value);
      break;
    }
  }
  return [...byIdx.entries()].sort(([a], [b]) => a - b).map(([, raw]) => raw);
}

function asNumber(v: string | undefined): number | undefined {
  if (v === undefined || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export function asBool(v: string | undefined): boolean | undefined {
  if (v === 'true') return true;
  if (v === 'false') return false;
  return undefined;
}

function mapLayerDataType(v: string | undefined): LayerKind {
  if (v === 'i3s') return 'i3s';
  if (v === 'geojson') return 'geojson';
  return '3dtiles';
}

// Embedded is in the enum for legacy reasons but DataSourceController throws for it
// (KML-only path was removed); accepting it from URLs would surface as an opaque ctor error.
const ACCEPTED_DATA_SOURCE_KINDS = new Set<string>([
  DataSourceKind.GoogleSheets,
  DataSourceKind.PostgreSQL,
  DataSourceKind.OGCFeatureAPI,
]);

function asDataSourceKind(v: string | undefined): DataSourceKind | undefined {
  if (!v) return undefined;
  if (!ACCEPTED_DATA_SOURCE_KINDS.has(v)) {
    console.warn(`[useUrlState] Ignoring unknown thematicDataSource value: ${JSON.stringify(v)}`);
    return undefined;
  }
  return v as DataSourceKind;
}

function asTableType(v: string | undefined): TableType | undefined {
  if (!v) return undefined;
  if (!(Object.values(TableType) as string[]).includes(v)) {
    console.warn(`[useUrlState] Ignoring unknown tableType value: ${JSON.stringify(v)}`);
    return undefined;
  }
  return v as TableType;
}

export function parseUrlState(href: string = window.location.href): ParsedUrlState {
  const url = new URL(href);
  const params = url.searchParams;

  const camera: ParsedCamera = {
    latitude: asNumber(readParam(params, 'latitude')),
    longitude: asNumber(readParam(params, 'longitude')),
    height: asNumber(readParam(params, 'height')),
    heading: asNumber(readParam(params, 'heading')),
    pitch: asNumber(readParam(params, 'pitch')),
    roll: asNumber(readParam(params, 'roll')),
  };

  const layers: ParsedLayer[] = [];
  let i = 0;
  while (true) {
    const raw = readParam(params, `layer_${i}`);
    if (!raw) break;
    // raw is already outer-decoded by URLSearchParams; decoding again would collapse the
    // inner '%26' (from layer URLs containing '&') and truncate the URL on the next split.
    const cfg = queryToObject(raw);
    layers.push({
      url: cfg[fwd('url')] ?? cfg.url ?? '',
      name: cfg[fwd('name')] ?? cfg.name ?? '',
      kind: mapLayerDataType(cfg[fwd('layerDataType')] ?? cfg.layerDataType),
      clampToGround: asBool(cfg[fwd('layerClampToGround')] ?? cfg.layerClampToGround) ?? false,
      active: asBool(cfg[fwd('active')] ?? cfg.active) ?? true,
      thematicDataUrl: cfg[fwd('thematicDataUrl')] ?? cfg.thematicDataUrl,
      thematicDataSource: asDataSourceKind(
        cfg[fwd('thematicDataSource')] ?? cfg.thematicDataSource,
      ),
      tableType: asTableType(cfg[fwd('tableType')] ?? cfg.tableType),
      maximumScreenSpaceError: asNumber(
        cfg[fwd('maximumScreenSpaceError')] ?? cfg.maximumScreenSpaceError,
      ),
    });
    i++;
  }

  function parseImageryEntry(raw: string): ParsedImagery {
    const cfg = queryToObject(raw);
    return {
      spec: {
        kind: (cfg.imageryType === 'wmts' ? 'wmts' : 'wms') as 'wms' | 'wmts',
        url: cfg[fwd('url')] ?? cfg.url ?? '',
        name: cfg[fwd('name')] ?? cfg.name ?? 'Imagery',
        layers: cfg[fwd('layers')] ?? cfg.layers ?? '',
        tileStyle: cfg[fwd('tileStyle')] ?? cfg.tileStyle,
        tileMatrixSetId: cfg[fwd('tileMatrixSetId')] ?? cfg.tileMatrixSetId,
        additionalParameters: cfg[fwd('additionalParameters')] ?? cfg.additionalParameters,
      },
      active: asBool(cfg[fwd('active')] ?? cfg.active) ?? true,
    };
  }

  function parseTerrainEntry(raw: string): ParsedTerrain {
    const cfg = queryToObject(raw);
    return {
      spec: {
        url: cfg[fwd('url')] ?? cfg.url ?? '',
        name: cfg[fwd('name')] ?? cfg.name ?? 'Terrain',
      },
      active: asBool(cfg[fwd('active')] ?? cfg.active) ?? true,
    };
  }

  const imageryRaws = collectIndexed(params, [FORWARD['imagery_'], 'imagery_']);
  const imageries: ParsedImagery[] = imageryRaws.map(parseImageryEntry);

  const terrainRaws = collectIndexed(params, [FORWARD['terrain_'], 'terrain_']);
  const terrains: ParsedTerrain[] = terrainRaws.map(parseTerrainEntry);
  // Cesium only supports one terrain at a time — keep at most one active flag set.
  const activeIdx = terrains.findIndex((t) => t.active);
  const activeCount = terrains.reduce((n, t) => n + (t.active ? 1 : 0), 0);
  if (activeCount > 1) {
    console.warn(
      `[useUrlState] ${activeCount} terrains marked active=true in the URL; only ` +
        `terrain_${activeIdx} ("${terrains[activeIdx].spec.name}") will be activated.`,
    );
  }
  for (let k = 0; k < terrains.length; k++) {
    if (k !== activeIdx) terrains[k].active = false;
  }

  const splashRaw = readParam(params, 'splashWindow');
  let splashUrl: string | undefined;
  let splashShowOnStart: boolean | undefined;
  if (splashRaw) {
    const cfg = queryToObject(splashRaw);
    splashUrl = cfg[fwd('url')] ?? cfg.url;
    splashShowOnStart = asBool(cfg[fwd('showOnStart')] ?? cfg.showOnStart);
  }

  return {
    title: readParam(params, 'title'),
    ionToken: readParam(params, 'ionToken'),
    bingToken: readParam(params, 'bingToken'),
    googleClientId: readParam(params, 'googleClientId'),
    dayTime: readParam(params, 'dayTime'),
    debug: asBool(readParam(params, 'debug')),
    shadows: asBool(readParam(params, 'shadows')),
    terrainShadows: asNumber(readParam(params, 'terrainShadows')),
    camera,
    layers,
    imageries,
    terrains,
    splashUrl,
    splashShowOnStart,
  };
}

interface SerializeInput {
  viewer: CesiumViewer;
  layers: Array<{
    spec: {
      name: string;
      url: string;
      kind: LayerKind;
      clampToGround?: boolean;
      maximumScreenSpaceError?: number;
      thematicDataUrl?: string;
      thematicDataSource?: DataSourceKind;
      tableType?: TableType;
    };
    active: boolean;
  }>;
  imageries?: Array<{ spec: ImageryConfig; active: boolean }>;
  terrains?: Array<{ spec: TerrainConfig; active: boolean }>;
  splash?: { url?: string; showOnStart?: boolean };
  tokens?: { ionToken?: string; bingToken?: string; googleClientId?: string };
}

function getCurrentCamera(viewer: Viewer): Required<ParsedCamera> {
  const carto = Cartographic.fromCartesian(viewer.scene.camera.position);
  return {
    latitude: CesiumMath.toDegrees(carto.latitude),
    longitude: CesiumMath.toDegrees(carto.longitude),
    height: carto.height,
    heading: CesiumMath.toDegrees(viewer.scene.camera.heading),
    pitch: CesiumMath.toDegrees(viewer.scene.camera.pitch),
    roll: CesiumMath.toDegrees(viewer.scene.camera.roll),
  };
}

export function generateShareLink(input: SerializeInput): string {
  const { viewer, layers, imageries = [], terrains = [], splash, tokens } = input;
  const cam = getCurrentCamera(viewer);
  const base = `${location.protocol}//${location.host}${location.pathname}?`;

  const top: Record<string, unknown> = {};
  const clock = viewer.cesiumWidget.clock;
  if (!clock.shouldAnimate) {
    top[fwd('dayTime')] = JulianDate.toIso8601(clock.currentTime, 0);
  }
  Object.assign(top, {
    [fwd('title')]: document.title,
    [fwd('shadows')]: viewer.shadows,
    [fwd('terrainShadows')]: Number.isNaN(viewer.terrainShadows as number)
      ? 0
      : viewer.terrainShadows,
    [fwd('latitude')]: Math.round(cam.latitude * 1e6) / 1e6,
    [fwd('longitude')]: Math.round(cam.longitude * 1e6) / 1e6,
    [fwd('height')]: Math.round(cam.height * 1e3) / 1e3,
    [fwd('heading')]: Math.round(cam.heading * 1e2) / 1e2,
    [fwd('pitch')]: Math.round(cam.pitch * 1e2) / 1e2,
    [fwd('roll')]: Math.round(cam.roll * 1e2) / 1e2,
  });

  layers.forEach((entry, idx) => {
    const lc: Record<string, unknown> = {
      [fwd('url')]: entry.spec.url,
      [fwd('name')]: entry.spec.name,
      [fwd('layerDataType')]: entry.spec.kind === '3dtiles' ? 'Cesium 3D Tiles' : entry.spec.kind,
      [fwd('layerClampToGround')]: entry.spec.clampToGround ?? '',
      [fwd('active')]: entry.active,
      [fwd('maximumScreenSpaceError')]: entry.spec.maximumScreenSpaceError ?? 16,
      [fwd('thematicDataUrl')]: entry.spec.thematicDataUrl ?? '',
      [fwd('thematicDataSource')]: entry.spec.thematicDataSource ?? '',
      [fwd('tableType')]: entry.spec.tableType ?? '',
    };
    top[`${fwd('layer_')}${idx}`] = objectToQuery(lc);
  });

  imageries.forEach((entry, idx) => {
    top[`${fwd('imagery_')}${idx}`] = objectToQuery({
      imageryType: entry.spec.kind,
      [fwd('url')]: entry.spec.url,
      [fwd('name')]: entry.spec.name,
      [fwd('layers')]: entry.spec.layers,
      [fwd('tileStyle')]: entry.spec.tileStyle ?? '',
      [fwd('tileMatrixSetId')]: entry.spec.tileMatrixSetId ?? '',
      [fwd('additionalParameters')]: entry.spec.additionalParameters ?? '',
      [fwd('active')]: entry.active,
    });
  });

  terrains.forEach((entry, idx) => {
    top[`${fwd('terrain_')}${idx}`] = objectToQuery({
      [fwd('url')]: entry.spec.url,
      [fwd('name')]: entry.spec.name,
      [fwd('active')]: entry.active,
    });
  });

  if (splash?.url) {
    top[fwd('splashWindow')] = objectToQuery({
      [fwd('url')]: splash.url,
      [fwd('showOnStart')]: splash.showOnStart ?? false,
    });
  }

  if (tokens?.ionToken) top[fwd('ionToken')] = tokens.ionToken;
  if (tokens?.bingToken) top[fwd('bingToken')] = tokens.bingToken;
  if (tokens?.googleClientId) top[fwd('googleClientId')] = tokens.googleClientId;

  return base + objectToQuery(top);
}

export function flyToCamera(viewer: Viewer, cam: ParsedCamera): void {
  if (cam.latitude === undefined || cam.longitude === undefined || cam.height === undefined) {
    return;
  }
  viewer.scene.camera.setView({
    destination: Cartesian3.fromDegrees(cam.longitude, cam.latitude, cam.height),
    orientation: {
      heading: CesiumMath.toRadians(cam.heading ?? 0),
      pitch: CesiumMath.toRadians(cam.pitch ?? -45),
      roll: CesiumMath.toRadians(cam.roll ?? 0),
    },
  });
}
