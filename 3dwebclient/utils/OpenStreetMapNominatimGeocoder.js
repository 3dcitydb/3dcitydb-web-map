// Source: https://cesiumjs.org/Cesium/Build/Apps/Sandcastle/?src=Custom%20Geocoder.html

/**
 * This class is an example of a custom geocoder. It provides geocoding through the OpenStreetMap Nominatim service.
 * @alias OpenStreetMapNominatimGeocoder
 * @constructor
 */
function OpenStreetMapNominatimGeocoder() {
}

/**
 * The function called to geocode using this geocoder service.
 *
 * @param {String} input The query to be sent to the geocoder service
 * @returns {Promise<GeocoderService~Result[]>}
 */
OpenStreetMapNominatimGeocoder.prototype.geocode = function (input) {
    var endpoint = 'https://nominatim.openstreetmap.org/search';
    var resource = new Cesium.Resource({
        url: endpoint,
        queryParameters: {
            format: 'json',
            q: input
        }
    });

    return resource.fetchJson()
            .then(function (results) {
                var bboxDegrees;
                return results.map(function (resultObject) {
                    bboxDegrees = resultObject.boundingbox;
                    return {
                        displayName: resultObject.display_name,
                        destination: Cesium.Rectangle.fromDegrees(
                                bboxDegrees[2],
                                bboxDegrees[0],
                                bboxDegrees[3],
                                bboxDegrees[1]
                                )
                    };
                });
            });
};

