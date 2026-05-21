import { type Viewer } from 'cesium';
import type { DataSourceController } from '../thematic';

export interface LayerOptions {
  url: string;
  name: string;
  active?: boolean;
  region?: unknown;
  thematicDataUrl?: string;
  thematicDataSource?: string;
  thematicDataProvider?: string;
  tableType?: string;
  maximumScreenSpaceError?: number;
  layerDataType?: string;
}

export interface LayerConfigParameters {
  layerId: string;
  name: string;
  url: string;
  layerDataType?: string;
  thematicDataUrl: string;
  thematicDataProvider: string;
  maximumScreenSpaceError: number | '';
}

export abstract class LayerBase {
  abstract readonly layerId: string;
  abstract name: string;
  abstract url: string;
  abstract active: boolean;
  abstract readonly configParameters: LayerConfigParameters;
  abstract dataSourceController?: DataSourceController;

  abstract addToCesium(viewer: Viewer): Promise<this>;
  abstract removeFromCesium(viewer: Viewer): void;
  abstract activate(active: boolean): void;
  abstract zoomToStartPosition(): void;
}
