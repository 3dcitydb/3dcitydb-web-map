import { Viewer, Ion, ShadowMode } from 'cesium';
import { OpenStreetMapNominatimGeocoder } from '../utils/osmGeocoder';

interface ViewerOptions {
  ionToken?: string;
  bingToken?: string;
  shadows?: boolean;
  terrainShadows?: number;
}

// The BaseLayerPicker isn't on Cesium's public Viewer type — declare the shape we read.
type ViewerWithPicker = Viewer & {
  baseLayerPicker?: {
    viewModel?: {
      imageryProviderViewModels: Array<{ name: string }>;
      selectedImagery: { name: string };
    };
  };
};

// Cesium defaults to "Bing Maps Aerial" (no labels). Switch to the labeled variant if it's
// available in the BaseLayerPicker, matching the legacy 3DCityDB-Web-Map default.
function selectImageryWithLabels(viewer: ViewerWithPicker): void {
  const vm = viewer.baseLayerPicker?.viewModel;
  if (!vm) return;
  const labeled = vm.imageryProviderViewModels.find((m) => /with Labels/i.test(m.name));
  if (labeled) vm.selectedImagery = labeled;
}

export function createViewer(container: HTMLElement, options: ViewerOptions = {}): Viewer {
  if (options.ionToken) {
    Ion.defaultAccessToken = options.ionToken;
  }

  const useOsmGeocoder = !options.bingToken && !options.ionToken;

  const viewer = new Viewer(container, {
    timeline: true,
    animation: true,
    fullscreenButton: false,
    shadows: options.shadows ?? false,
    terrainShadows: (options.terrainShadows ?? ShadowMode.DISABLED) as ShadowMode,
    geocoder: useOsmGeocoder ? [new OpenStreetMapNominatimGeocoder()] : undefined,
  });

  selectImageryWithLabels(viewer);

  return viewer;
}
