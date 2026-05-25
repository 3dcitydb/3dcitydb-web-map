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
  const win = window.open('', 'print');
  if (!win) return;
  const doc = win.document;
  doc.title = 'Print';
  doc.body.style.margin = '0';
  const img = doc.createElement('img');
  img.style.width = '100%';
  img.onload = () => win.print();
  img.src = dataUrl;
  doc.body.appendChild(img);
}

export type ExternalMap = 'google' | 'osm' | 'bing' | 'dual';

export function openInExternalMap(viewer: Viewer, service: ExternalMap): void {
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
