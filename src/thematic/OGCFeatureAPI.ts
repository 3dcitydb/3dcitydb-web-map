import { SQLDataSource } from './DataSource';
import type { GmlId, KvpResult } from './types';

export class OGCFeatureAPI extends SQLDataSource {
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

  queryUsingId(gmlid: GmlId, callback: (response: string) => void): void {
    const gmlidValue = gmlid.value;
    let baseUrl = this.uri;
    baseUrl += baseUrl.endsWith('/') ? '' : '/';

    const urls = [`${baseUrl}?id=${gmlidValue}&f=json`];

    if (baseUrl.includes('hamburg.de') && gmlidValue.startsWith('DEHH')) {
      if (baseUrl.includes('GebaeudeBauwerk')) {
        urls.push(`${baseUrl}?oid=${gmlidValue}BL&f=json`);
      } else {
        urls.push(`${baseUrl}?oid=${gmlidValue}&f=json`);
      }
    } else if (baseUrl.includes('nrw.de') && gmlidValue.startsWith('DENW')) {
      if (baseUrl.includes('gebaeudebauwerk')) {
        urls.push(`${baseUrl}${gmlidValue}BL?f=json`);
      } else {
        urls.push(`${baseUrl}${gmlidValue}?f=json`);
      }
    }

    this.tryUrls(urls)
      .then(callback)
      .catch((err) => console.warn('OGCFeatureAPI:', err.message));
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
    throw new Error('GMLID not matched');
  }
}
