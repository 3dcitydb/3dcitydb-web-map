import { ElMessage } from 'element-plus';
import { DataSource } from './DataSource';
import {
  type DataSourceOptions,
  type KvpResult,
  type ObjectId,
  type SignInController,
  TableType,
} from './types';

interface GVizCell {
  v?: unknown;
}
interface GVizRow {
  c: Array<GVizCell | null>;
}
interface GVizCol {
  label: string;
}
interface GVizResponse {
  table: { rows: GVizRow[]; cols: GVizCol[] };
}

export class GoogleSheets extends DataSource {
  private readonly spreadsheetId: string;

  constructor(signInController: SignInController | null, options: DataSourceOptions) {
    super(signInController, { ...options, idColName: options.idColName ?? 'A' });
    this.spreadsheetId = options.uri
      .replace(/.+?(spreadsheets\/d\/)/, '')
      .replace(/(?=\/edit).+/, '');
  }

  responseToKvp(response: string | GVizResponse): KvpResult {
    const parsed: GVizResponse =
      typeof response === 'string' ? (JSON.parse(response) as GVizResponse) : response;
    const result: KvpResult = {};
    const rows = parsed.table.rows;
    const cols = parsed.table.cols;
    if (!rows[0]?.c) return result;

    if (this.tableType === TableType.Horizontal) {
      for (let i = 1; i < rows[0].c.length; i++) {
        const key = cols[i].label;
        result[key] = rows[0].c[i]?.v;
      }
    } else {
      for (let i = 1; i < rows.length; i++) {
        const key = rows[i].c[1]?.v as string;
        const value = rows[i].c[2]?.v;
        if (key) result[key] = value;
      }
    }
    return result;
  }

  queryUsingId(objectId: ObjectId, callback: (response: string) => void): void {
    this.queryUsingSql(`SELECT * WHERE A='${objectId.value}'`, callback);
  }

  queryUsingSql(sql: string, callback: (response: string) => void): void {
    const baseUrl = 'https://docs.google.com/spreadsheets/d/';
    const url = `${baseUrl}${this.spreadsheetId}/gviz/tq?tq=${encodeURI(sql)}`;
    const headers: HeadersInit = {};
    if (this.signInController?.accessToken) {
      headers.Authorization = `Bearer ${this.signInController.accessToken}`;
    }
    fetch(url, { headers })
      .then((r) => r.text())
      .then((text) => {
        // The response is wrapped: /*O_o*/google.visualization.Query.setResponse({...});
        const cleaned = text
          .replace('/*O_o*/', '')
          .replace(/(google\.visualization\.Query\.setResponse\(|\);$)/g, '');
        callback(cleaned);
      })
      .catch((err) => {
        console.warn('GoogleSheets:', err.message);
        ElMessage.warning({
          message: `Attribute query failed (Google Sheets): ${err.message}`,
          grouping: true,
        });
      });
  }
}
