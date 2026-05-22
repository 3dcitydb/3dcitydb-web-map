import { SQLDataSource } from './DataSource';
import { TableType, type KvpResult, type ObjectId } from './types';

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

  queryUsingId(objectId: ObjectId, callback: (response: string) => void): void {
    const url = `${this.uri}?${this.idColName}=eq.${objectId.value}`;
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then(callback)
      .catch((err) => console.warn('PostgreSQL:', err.message));
  }

  queryUsingSql(sql: string, callback: (response: string) => void): void {
    fetch(this.uri + sql)
      .then((r) => r.text())
      .then(callback);
  }
}
