import type { DataSource } from './DataSource';
import { GoogleSheets } from './GoogleSheets';
import { PostgreSQL } from './PostgreSQL';
import { OGCFeatureAPI } from './OGCFeatureAPI';
import { DataSourceKind, type DataSourceOptions, type KvpResult, type ObjectId, type SignInController } from './types';
import { useAuthStore } from '../state/useAuthStore';

export type FetchCallback = (kvp: KvpResult, objectId: ObjectId) => void;

export class DataSourceController {
  readonly dataSource: DataSource;

  constructor(
    kind: DataSourceKind,
    signInController: SignInController | null,
    public options: DataSourceOptions,
  ) {
    // Pinia stores are reactive; cast to the structural SignInController interface.
    const auth = signInController ?? (useAuthStore() as unknown as SignInController);
    switch (kind) {
      case DataSourceKind.GoogleSheets:
        this.dataSource = new GoogleSheets(auth, options);
        break;
      case DataSourceKind.PostgreSQL:
        this.dataSource = new PostgreSQL(auth, options);
        break;
      case DataSourceKind.OGCFeatureAPI:
        this.dataSource = new OGCFeatureAPI(auth, options);
        break;
      case DataSourceKind.Embedded:
        throw new Error('Embedded data source is no longer supported (was KML-only).');
      default: {
        const _exhaustive: never = kind;
        throw new Error(`Unknown data source kind: ${String(_exhaustive)}`);
      }
    }
  }

  fetchData(objectId: ObjectId, callback: FetchCallback, limit?: number, clickedObject?: unknown): void {
    this.dataSource.queryUsingId(
      objectId,
      (result) => callback(this.dataSource.responseToKvp(result), objectId),
      limit,
      clickedObject,
    );
  }
}
