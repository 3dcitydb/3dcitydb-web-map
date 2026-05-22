export enum DataSourceCapability {
  READ = 'READ',
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export enum TableType {
  Horizontal = 'Horizontal',
  Vertical = 'Vertical',
}

export enum ThirdPartyHandler {
  Cesium = 'Cesium',
}

export enum DataSourceKind {
  GoogleSheets = 'GoogleSheets',
  PostgreSQL = 'PostgreSQL',
  OGCFeatureAPI = 'OGCFeatureAPI',
  Embedded = 'Embedded',
}

export interface ObjectId {
  key: string;
  value: string;
}

export type KvpResult = Record<string, unknown>;

export interface DataSourceOptions {
  name?: string;
  provider?: string;
  type?: string;
  uri: string;
  capabilities?: DataSourceCapability[];
  tableType?: TableType;
  thirdPartyHandler?: ThirdPartyHandler;
  proxyPrefix?: string;
  idColName?: string;
}

export interface SignInController {
  accessToken: string | null;
}
