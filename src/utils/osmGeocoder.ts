import { Rectangle, Resource, type GeocoderService } from 'cesium';

interface NominatimResult {
  display_name: string;
  boundingbox: [string, string, string, string];
}

export class OpenStreetMapNominatimGeocoder implements GeocoderService {
  readonly credit = undefined;

  async geocode(input: string): Promise<GeocoderService.Result[]> {
    const resource = new Resource({
      url: 'https://nominatim.openstreetmap.org/search',
      queryParameters: { format: 'json', q: input },
    });

    const results = (await resource.fetchJson()) as NominatimResult[];
    return results.map((r) => ({
      displayName: r.display_name,
      destination: Rectangle.fromDegrees(
        Number(r.boundingbox[2]),
        Number(r.boundingbox[0]),
        Number(r.boundingbox[3]),
        Number(r.boundingbox[1]),
      ),
    }));
  }
}
