import {
  Cartesian2,
  Cartesian3,
  Ellipsoid,
  HeadingPitchRange,
  Math as CesiumMath,
  Matrix4,
  type Viewer,
} from 'cesium';
import { useLayersStore } from '../state/useLayersStore';
import type { DataSourceController } from '../thematic/DataSourceController';

interface GeocoderViewModel {
  searchText: string;
  search: { call(thisArg: unknown, callGeocodingService: boolean): void };
  _searchCommand: {
    beforeExecute: {
      addEventListener(cb: (info: { args: unknown[]; cancel: boolean }) => void): void;
    };
  };
}

function flyToMapLocation(viewer: Viewer, lat: number, lon: number): void {
  const { scene } = viewer;
  const { camera, canvas, globe } = scene;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  camera.flyTo({
    destination: Cartesian3.fromDegrees(lon, lat, 2000),
    complete: () => {
      const ray = camera.getPickRay(new Cartesian2(w / 2, h / 2));
      if (!ray) return;
      const intersect = globe.pick(ray, scene);
      if (!intersect) return;
      const terrainHeight = Ellipsoid.WGS84.cartesianToCartographic(intersect).height;
      camera.lookAt(
        Cartesian3.fromDegrees(lon, lat, terrainHeight),
        new HeadingPitchRange(CesiumMath.toRadians(0), CesiumMath.toRadians(-50), 100),
      );
      camera.lookAtTransform(Matrix4.IDENTITY);
    },
  });
}

function parseCentroid(value: unknown): { lat: number; lon: number } | undefined {
  if (typeof value !== 'string') return undefined;
  const match = value.match(/\(([^)]+)\)/);
  if (!match) return undefined;
  const [lonStr, latStr] = match[1].split(',');
  const lon = parseFloat(lonStr);
  const lat = parseFloat(latStr);
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) return undefined;
  return { lat, lon };
}

/**
 * Hook into Cesium's geocoder so typing an object id in the search box triggers a thematic-data
 * CENTROID lookup. Falls back to the normal geocoder if no layer can resolve the id.
 */
export function installObjectIdGeocoder(viewer: Viewer): void {
  const vm = (viewer as unknown as { geocoder?: { viewModel?: GeocoderViewModel } }).geocoder
    ?.viewModel;
  if (!vm) return;

  const layers = useLayersStore();

  vm._searchCommand.beforeExecute.addEventListener((info) => {
    const callGeocodingService = info.args[0] === true;
    if (callGeocodingService) return; // normal geocoder pass — let it through

    const objectId = vm.searchText.trim();
    if (!objectId) return;

    info.cancel = true;
    const originalText = vm.searchText;
    vm.searchText = 'Searching…';

    const controllers: DataSourceController[] = layers.layers
      .map(
        (l) =>
          (l.instance as unknown as { dataSourceController?: DataSourceController })
            .dataSourceController,
      )
      .filter((c): c is DataSourceController => c !== undefined);

    if (controllers.length === 0) {
      vm.searchText = originalText;
      vm.search.call(vm, true);
      return;
    }

    let remaining = controllers.length;
    let resolved = false;

    const tryNormalGeocoder = () => {
      if (resolved) return;
      vm.searchText = originalText;
      vm.search.call(vm, true);
    };

    for (const dsc of controllers) {
      dsc.fetchData(
        { key: 'OBJECTID', value: objectId },
        (kvp) => {
          remaining--;
          if (resolved) return;
          const centroid = parseCentroid(
            (kvp as Record<string, unknown>).CENTROID ?? (kvp as Record<string, unknown>).centroid,
          );
          if (centroid) {
            resolved = true;
            vm.searchText = objectId;
            flyToMapLocation(viewer, centroid.lat, centroid.lon);
          } else if (remaining === 0) {
            tryNormalGeocoder();
          }
        },
        1000,
      );
    }
  });
}
