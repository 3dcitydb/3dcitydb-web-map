import { Cartographic, Cartesian3, JulianDate, Math as CesiumMath, type Viewer } from 'cesium';
import type { Viewer as CesiumViewer } from 'cesium';
import type { ImageryConfig, TerrainConfig } from './useBasemapStore';
import type { LayerKind } from './useLayersStore';

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
  url: 'u',
  name: 'n',
  layerDataType: 'ld',
  layerClampToGround: 'lc',
  active: 'a',
  thematicDataUrl: 'tdu',
  thematicDataSource: 'ds',
  tableType: 'tt',
  maximumScreenSpaceError: 'msse',
  basemap: 'bm',
  imageryType: 'imageryType',
  iconUrl: 'iu',
  tooltip: 'ht',
  layers: 'ls',
  additionalParameters: 'ap',
  proxyUrl: 'pu',
  tileStyle: 'tst',
  tileMatrixSetId: 'tmsi',
  terrain: 'tr',
  splashWindow: 'sw',
  showOnStart: 'ss',
  ionToken: 'it',
  bingToken: 'bt',
  googleClientId: 'gid',
  dayTime: 'd',
  debug: 'db',
};

function fwd(name: string): string {
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

export interface ParsedCamera {
  latitude?: number;
  longitude?: number;
  height?: number;
  heading?: number;
  pitch?: number;
  roll?: number;
}

export interface ParsedLayer {
  url: string;
  name: string;
  kind: LayerKind;
  clampToGround?: boolean;
  active?: boolean;
  thematicDataUrl?: string;
  thematicDataSource?: string;
  tableType?: string;
  maximumScreenSpaceError?: number;
}

export interface ParsedUrlState {
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
  imagery?: ImageryConfig;
  terrain?: TerrainConfig;
  splashUrl?: string;
  splashShowOnStart?: boolean;
}

function asNumber(v: string | undefined): number | undefined {
  if (v === undefined || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function asBool(v: string | undefined): boolean | undefined {
  if (v === 'true') return true;
  if (v === 'false') return false;
  return undefined;
}

function mapLayerDataType(v: string | undefined): LayerKind {
  if (v === 'i3s') return 'i3s';
  if (v === 'geojson') return 'geojson';
  return '3dtiles';
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
    // The original code stores layer config as a nested query string in the value.
    // It first encodes the layer config as `key=value&key=value`, then encodes the
    // whole string as the parameter value (which gets URI-encoded once more).
    const decoded = decodeURIComponent(raw);
    const cfg = queryToObject(decoded);
    layers.push({
      url: cfg[fwd('url')] ?? cfg.url ?? '',
      name: cfg[fwd('name')] ?? cfg.name ?? '',
      kind: mapLayerDataType(cfg[fwd('layerDataType')] ?? cfg.layerDataType),
      clampToGround:
        asBool(cfg[fwd('layerClampToGround')] ?? cfg.layerClampToGround) ?? false,
      active: asBool(cfg[fwd('active')] ?? cfg.active) ?? true,
      thematicDataUrl: cfg[fwd('thematicDataUrl')] ?? cfg.thematicDataUrl,
      thematicDataSource: cfg[fwd('thematicDataSource')] ?? cfg.thematicDataSource,
      tableType: cfg[fwd('tableType')] ?? cfg.tableType,
      maximumScreenSpaceError: asNumber(
        cfg[fwd('maximumScreenSpaceError')] ?? cfg.maximumScreenSpaceError,
      ),
    });
    i++;
  }

  const basemapRaw = readParam(params, 'basemap');
  let imagery: ImageryConfig | undefined;
  if (basemapRaw) {
    const cfg = queryToObject(decodeURIComponent(basemapRaw));
    imagery = {
      kind: (cfg.imageryType === 'wmts' ? 'wmts' : 'wms') as 'wms' | 'wmts',
      url: cfg[fwd('url')] ?? cfg.url ?? '',
      name: cfg[fwd('name')] ?? cfg.name ?? 'Imagery',
      layers: cfg[fwd('layers')] ?? cfg.layers ?? '',
      tileStyle: cfg[fwd('tileStyle')] ?? cfg.tileStyle,
      tileMatrixSetId: cfg[fwd('tileMatrixSetId')] ?? cfg.tileMatrixSetId,
      additionalParameters: cfg[fwd('additionalParameters')] ?? cfg.additionalParameters,
    };
  }

  const terrainRaw = readParam(params, 'terrain');
  let terrain: TerrainConfig | undefined;
  if (terrainRaw) {
    const cfg = queryToObject(decodeURIComponent(terrainRaw));
    terrain = {
      url: cfg[fwd('url')] ?? cfg.url ?? '',
      name: cfg[fwd('name')] ?? cfg.name ?? 'Terrain',
    };
  }

  const splashRaw = readParam(params, 'splashWindow');
  let splashUrl: string | undefined;
  let splashShowOnStart: boolean | undefined;
  if (splashRaw) {
    const cfg = queryToObject(decodeURIComponent(splashRaw));
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
    imagery,
    terrain,
    splashUrl,
    splashShowOnStart,
  };
}

export interface SerializeInput {
  viewer: CesiumViewer;
  layers: Array<{
    spec: {
      name: string;
      url: string;
      kind: LayerKind;
      clampToGround?: boolean;
      maximumScreenSpaceError?: number;
      thematicDataUrl?: string;
      thematicDataSource?: string;
      tableType?: string;
    };
    instance: { active: boolean };
  }>;
  imagery?: ImageryConfig;
  terrain?: TerrainConfig;
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
  const { viewer, layers, imagery, terrain, splash, tokens } = input;
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
    [fwd('terrainShadows')]: Number.isNaN(viewer.terrainShadows as number) ? 0 : viewer.terrainShadows,
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
      [fwd('active')]: entry.instance.active,
      [fwd('maximumScreenSpaceError')]: entry.spec.maximumScreenSpaceError ?? 16,
      [fwd('thematicDataUrl')]: entry.spec.thematicDataUrl ?? '',
      [fwd('thematicDataSource')]: entry.spec.thematicDataSource ?? '',
      [fwd('tableType')]: entry.spec.tableType ?? '',
    };
    top[`${fwd('layer_')}${idx}`] = objectToQuery(lc);
  });

  if (imagery) {
    top[fwd('basemap')] = objectToQuery({
      imageryType: imagery.kind,
      [fwd('url')]: imagery.url,
      [fwd('name')]: imagery.name,
      [fwd('layers')]: imagery.layers,
      [fwd('tileStyle')]: imagery.tileStyle ?? '',
      [fwd('tileMatrixSetId')]: imagery.tileMatrixSetId ?? '',
      [fwd('additionalParameters')]: imagery.additionalParameters ?? '',
    });
  }

  if (terrain) {
    top[fwd('terrain')] = objectToQuery({
      [fwd('url')]: terrain.url,
      [fwd('name')]: terrain.name,
    });
  }

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
  if (
    cam.latitude === undefined ||
    cam.longitude === undefined ||
    cam.height === undefined
  ) {
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
