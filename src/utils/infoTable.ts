import { GoogleSheets } from '../thematic/GoogleSheets';
import { OGCFeatureAPI } from '../thematic/OGCFeatureAPI';
import { PostgreSQL } from '../thematic/PostgreSQL';
import type { DataSourceController } from '../thematic/DataSourceController';
import type { GmlId, KvpResult } from '../thematic/types';

const GMLID_KEYS = [
  'gmlid',
  'gml_id',
  'gml:id',
  'gml-id',
  'objectid',
  'object_id',
  'object-id',
  'id',
];

function findGmlId(kvp: KvpResult): GmlId | undefined {
  for (const key of Object.keys(kvp)) {
    if (!GMLID_KEYS.includes(key.toLowerCase())) continue;
    const value = kvp[key];
    if (value === undefined || value === null) continue;
    return { key, value: String(value) };
  }
  return undefined;
}

function isValidUrl(str: unknown): boolean {
  if (typeof str !== 'string') return false;
  try {
    const u = new URL(str);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function escapeHtml(input: unknown): string {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderTable(kvp: KvpResult, gmlid: GmlId | undefined): string {
  let html = '<table class="cesium-infoBox-defaultTable" style="font-size:10.5pt"><tbody>';
  if (gmlid?.key && gmlid.value) {
    html += `<tr><td>${escapeHtml(gmlid.key)}</td><td>${escapeHtml(gmlid.value)}</td></tr>`;
  }
  for (const key of Object.keys(kvp)) {
    if (gmlid && key === gmlid.key) continue;
    if (!key || key.trim() === '') continue;
    const raw = kvp[key];
    const rendered = isValidUrl(raw)
      ? `<a href="${escapeHtml(raw)}" target="_blank">${escapeHtml(raw)}</a>`
      : escapeHtml(raw);
    html += `<tr><td>${escapeHtml(key)}</td><td>${rendered}</td></tr>`;
  }
  html += '</tbody></table>';
  return html;
}

interface InfoEntity {
  description?: string;
  name?: string;
}

/**
 * Populate the Cesium InfoBox description for the clicked entity. Embedded data is rendered
 * immediately; external sources (GoogleSheets, PostgreSQL, OGCFeatureAPI) fetch then render.
 */
export function fillInfoTable(
  entity: InfoEntity,
  embeddedKvp: KvpResult | undefined,
  dataSourceController: DataSourceController | undefined,
): void {
  entity.description = 'Loading feature information…';

  const initialGmlid = embeddedKvp ? findGmlId(embeddedKvp) : undefined;
  const fallbackGmlid: GmlId = initialGmlid ?? { key: 'gml_id', value: entity.name ?? '' };

  function render(kvp: KvpResult | undefined, gmlid: GmlId): void {
    if (!kvp) {
      entity.description = 'No feature information found';
      return;
    }
    if (gmlid.value && entity.name !== gmlid.value) {
      entity.name = gmlid.value;
    }
    entity.description = renderTable(kvp, gmlid);
  }

  const ds = dataSourceController?.dataSource;
  const isExternal =
    ds instanceof GoogleSheets || ds instanceof PostgreSQL || ds instanceof OGCFeatureAPI;

  if (!isExternal) {
    render(embeddedKvp, fallbackGmlid);
    return;
  }

  if (!fallbackGmlid.value) {
    entity.description = 'No GML id available to fetch external data';
    return;
  }

  dataSourceController!.fetchData(
    fallbackGmlid,
    (kvp, gmlid) => render(kvp, gmlid),
    1000,
    entity,
  );
}
