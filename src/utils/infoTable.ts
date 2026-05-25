import { GoogleSheets } from '../thematic/GoogleSheets';
import { OGCFeatureAPI } from '../thematic/OGCFeatureAPI';
import { PostgreSQL } from '../thematic/PostgreSQL';
import type { DataSourceController } from '../thematic/DataSourceController';
import type { KvpResult, ObjectId } from '../thematic/types';
import { findObjectIdKey } from './objectId';

function findObjectId(kvp: KvpResult): ObjectId | undefined {
  const idKey = findObjectIdKey(Object.keys(kvp));
  if (!idKey) return undefined;
  const value = kvp[idKey];
  if (value === undefined || value === null) return undefined;
  return { key: idKey, value: String(value) };
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

function renderTable(kvp: KvpResult, objectId: ObjectId | undefined): string {
  let html = '<table class="cesium-infoBox-defaultTable" style="font-size:10.5pt"><tbody>';
  if (objectId?.key && objectId.value) {
    html += `<tr><td>${escapeHtml(objectId.key)}</td><td>${escapeHtml(objectId.value)}</td></tr>`;
  }
  for (const key of Object.keys(kvp)) {
    if (objectId && key === objectId.key) continue;
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

  const initialObjectId = embeddedKvp ? findObjectId(embeddedKvp) : undefined;
  const fallbackObjectId: ObjectId = initialObjectId ?? {
    key: 'OBJECTID',
    value: entity.name ?? '',
  };

  function render(kvp: KvpResult | undefined, objectId: ObjectId): void {
    if (!kvp) {
      entity.description = 'No feature information found';
      return;
    }
    if (objectId.value && entity.name !== objectId.value) {
      entity.name = objectId.value;
    }
    entity.description = renderTable(kvp, objectId);
  }

  const ds = dataSourceController?.dataSource;
  const isExternal =
    ds instanceof GoogleSheets || ds instanceof PostgreSQL || ds instanceof OGCFeatureAPI;

  if (!isExternal) {
    render(embeddedKvp, fallbackObjectId);
    return;
  }

  if (!fallbackObjectId.value) {
    entity.description = 'No object id available to fetch external data';
    return;
  }

  dataSourceController!.fetchData(
    fallbackObjectId,
    (kvp, objectId) => render(kvp, objectId),
    1000,
    entity,
  );
}
