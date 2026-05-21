import { ElMessageBox } from 'element-plus';

export function generateUUID(): string {
  return `UUID_${crypto.randomUUID()}`;
}

export function polygonArea(polygon: { x: number; y: number }[]): number {
  let area = 0;
  let j = polygon.length - 1;
  for (let i = 0; i < polygon.length; i++) {
    area += (polygon[j].x + polygon[i].x) * (polygon[j].y - polygon[i].y);
    j = i;
  }
  return area / 2;
}

export function getHostAndPathFromUrl(url: string): string | null {
  const lastSlash = url.lastIndexOf('/');
  if (lastSlash === url.length - 1 || lastSlash === -1) return null;
  return url.substring(0, lastSlash + 1);
}

export function getSuffixFromFilename(name: string): string {
  const idx = name.lastIndexOf('.');
  return idx === -1 ? name : name.substring(idx + 1);
}

export function showConfirm(title: string, message: string): Promise<boolean> {
  return ElMessageBox.confirm(message, title, {
    confirmButtonText: 'Yes',
    cancelButtonText: 'No',
    type: 'warning',
  })
    .then(() => true)
    .catch(() => false);
}

export function showAlert(title: string, message: string): Promise<void> {
  return ElMessageBox.alert(message, title, { confirmButtonText: 'OK' }).then(() => undefined);
}
