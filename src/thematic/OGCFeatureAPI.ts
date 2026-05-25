import { ElMessage } from 'element-plus';
import { DataSource } from './DataSource';
import type { KvpResult, ObjectId } from './types';

export class OGCFeatureAPI extends DataSource {
  responseToKvp(response: string): KvpResult {
    if (!response) return {};
    const responseJson = JSON.parse(response);
    const result: KvpResult = {};

    let properties: Record<string, unknown> | undefined;
    if (this.uri.includes('hamburg.de')) {
      const features = responseJson.features;
      if (!features || features.length !== 1) return {};
      properties = features[0].properties;
    } else if (this.uri.includes('nrw.de')) {
      properties = responseJson.properties;
    } else {
      properties = responseJson.properties;
    }

    if (!properties) return {};
    for (const key of Object.keys(properties)) {
      result[key] = properties[key];
    }
    return result;
  }

  queryUsingId(objectId: ObjectId, callback: (response: string) => void): void {
    const objectIdValue = objectId.value;
    let baseUrl = this.uri;
    baseUrl += baseUrl.endsWith('/') ? '' : '/';

    const urls = [`${baseUrl}?id=${objectIdValue}&f=json`];

    if (baseUrl.includes('hamburg.de') && objectIdValue.startsWith('DEHH')) {
      if (baseUrl.includes('GebaeudeBauwerk')) {
        urls.push(`${baseUrl}?oid=${objectIdValue}BL&f=json`);
      } else {
        urls.push(`${baseUrl}?oid=${objectIdValue}&f=json`);
      }
    } else if (baseUrl.includes('nrw.de') && objectIdValue.startsWith('DENW')) {
      if (baseUrl.includes('gebaeudebauwerk')) {
        urls.push(`${baseUrl}${objectIdValue}BL?f=json`);
      } else {
        urls.push(`${baseUrl}${objectIdValue}?f=json`);
      }
    }

    this.tryUrls(urls)
      .then(callback)
      .catch((err) => {
        console.warn('OGCFeatureAPI:', err.message);
        ElMessage.warning({
          message: `Attribute lookup failed (OGC API): ${err.message}`,
          grouping: true,
        });
      });
  }

  private async tryUrls(urls: string[]): Promise<string> {
    for (const url of urls) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const body = await res.text();
        if (Object.keys(this.responseToKvp(body)).length === 0) continue;
        return body;
      } catch {
        // try next
      }
    }
    throw new Error('ObjectId not matched');
  }
}
