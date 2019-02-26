# Change Log

### 1.7.2
---------

##### UPDATES
* Added splashscreen while opening the web client
    
### 1.7.1
---------

##### UPDATES
* Cesium version 1.53 is now installed (updated from 1.44).
* Default imagery layer is now changed from Bing Maps to ESRI World Imagery.
* Default geocoder is now changed from Bing Maps Geocoder to OpenStreetMap Nominatim
(without the autofill function).
* If you wish to use Bing Maps features or Cesium World Terrain,
add your own token as a string paramter in the client's URL, such as
`&bingToken=<your_bing_token>` or `&ionToken=<your_ion_token`.
Note that the given token(s) must be valid.
* If a valid ion token is available,
you can force the client to use the Cesium World Terrain on loading
using the string paramater `&cesiumWorldTerrain=<true|false>`
in the client's URL.
* Each 3D model layer can now have its own glTF version (`0.8`, `1.0` or `2.0`).
The glTF version is also included in the shared URL created by the `generateLink()` function
(the parameter is `gltfVersion`).
Saving the glTF version of the active layer will update the visualization of the affected glTF layer immediately.
* Each 3D model layer must have a type (either `COLLADA/KML/glTF`, `Cesium 3D Tiles` or `Others`).
This can be specified directly in the GUI in the same way as editing the layer's name, etc.
The layer type is also included in the shared URL created by the `generateLink()` function
(the parameter is `layerDataType`).
* The URL of input Cesium 3D Tiles can be given with or without the configuration JSON file (e.g. `tileset.json`).
If the configuration JSON file is not `tileset.json`, then its URL (incl. the JSON file name) must be provided.
For example, all of the following URLs are aquivalent:
    * `http://example.com/cesium3DTiles`
    * `http://example.com/cesium3DTiles/`
    * `http://example.com/cesium3DTiles/tileset.json`
