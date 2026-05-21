import { SQLDataSource } from './DataSource';
import { TableType, type GmlId, type KvpResult } from './types';

interface PostgrestRow extends Record<string, unknown> {
  attribute?: string;
  value?: unknown;
}

export class PostgreSQL extends SQLDataSource {
  responseToKvp(response: string): KvpResult {
    const responseJson = JSON.parse(response) as PostgrestRow[];
    const result: KvpResult = {};

    if (this.tableType === TableType.Horizontal) {
      for (const row of responseJson) {
        for (const key of Object.keys(row)) {
          result[key] = row[key];
        }
      }
    } else {
      for (const row of responseJson) {
        if (row.attribute !== undefined) {
          result[row.attribute] = row.value;
        }
      }
    }
    return result;
  }

  queryUsingId(gmlid: GmlId, callback: (response: string) => void): void {
    const baseUrl = this.uri;
    const gmlidValue = gmlid.value;
    const urls = [
      `${baseUrl}?gmlid=eq.${gmlidValue}`,
      `${baseUrl}?gml_id=eq.${gmlidValue}`,
      `${baseUrl}?gml-id=eq.${gmlidValue}`,
      `${baseUrl}?id=eq.${gmlidValue}`,
    ];

    this.tryUrls(urls)
      .then(callback)
      .catch((err) => console.warn('PostgreSQL:', err.message));
  }

  queryUsingSql(sql: string, callback: (response: string) => void): void {
    fetch(this.uri + sql)
      .then((r) => r.text())
      .then(callback);
  }

  private async tryUrls(urls: string[]): Promise<string> {
    for (const url of urls) {
      try {
        const res = await fetch(url);
        if (res.ok) return await res.text();
      } catch {
        // try next
      }
    }
    throw new Error('GMLID not matched');
  }
}
