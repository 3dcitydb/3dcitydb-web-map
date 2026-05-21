import type { Viewer } from 'cesium';

export function takeScreenshot(viewer: Viewer): void {
  viewer.render();
  const dataUrl = viewer.scene.canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `screenshot-${Date.now()}.png`;
  link.href = dataUrl;
  link.click();
}

export function printCurrentView(viewer: Viewer): void {
  viewer.render();
  const dataUrl = viewer.scene.canvas.toDataURL('image/png');
  const win = window.open('about:blank', 'print');
  if (!win) return;
  win.document.write(`<html><head><title>Print</title></head><body style="margin:0">
    <img src="${dataUrl}" style="width:100%" onload="window.print()" />
  </body></html>`);
  win.document.close();
}

export type ExternalMap = 'google' | 'osm' | 'bing' | 'dual';

export function openInExternalMap(
  viewer: Viewer,
  service: ExternalMap,
): void {
  const carto = viewer.scene.camera.positionCartographic;
  const lat = (carto.latitude * 180) / Math.PI;
  const lon = (carto.longitude * 180) / Math.PI;

  let url: string;
  switch (service) {
    case 'google':
      url = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lon}`;
      break;
    case 'osm':
      url = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=18/${lat}/${lon}`;
      break;
    case 'bing':
      url = `https://www.bing.com/maps?cp=${lat}~${lon}&style=o&lvl=18`;
      break;
    case 'dual':
      url = `https://data.mashedworld.com/dualmaps/map.htm?lat=${lat}&lng=${lon}&z=18`;
      break;
  }
  window.open(url, '_blank', 'noopener');
}
