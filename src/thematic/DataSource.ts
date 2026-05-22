import {
  TableType,
  type DataSourceCapability,
  type DataSourceOptions,
  type KvpResult,
  type ObjectId,
  type SignInController,
  type ThirdPartyHandler,
} from './types';

export type QueryCallback = (kvp: KvpResult, objectId: ObjectId) => void;

export abstract class DataSource {
  name: string;
  provider: string;
  type: string;
  uri: string;
  capabilities?: DataSourceCapability[];
  tableType: TableType;
  thirdPartyHandler?: ThirdPartyHandler;
  proxyPrefix: string;
  idColName: string;

  constructor(
    protected readonly signInController: SignInController | null,
    options: DataSourceOptions,
  ) {
    this.name = options.name ?? 'Data Source';
    this.provider = options.provider ?? 'Data Provider';
    this.type = options.type ?? 'Data Type';
    this.uri = options.uri ?? '';
    this.capabilities = options.capabilities;
    this.tableType = options.tableType ?? TableType.Horizontal;
    this.thirdPartyHandler = options.thirdPartyHandler;
    this.proxyPrefix = options.proxyPrefix ?? '';
    this.idColName = options.idColName ?? 'OBJECTID';
  }

  abstract responseToKvp(response: string): KvpResult;

  abstract queryUsingId(
    objectId: ObjectId,
    callback: (response: string) => void,
    limit?: number,
    clickedObject?: unknown,
  ): void;
}

export abstract class SQLDataSource extends DataSource {}
export abstract class XMLDataSource extends DataSource {}
