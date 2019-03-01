# Change Log

### 1.7.2
---------

##### NEW
* It is now possible to display your own information about your web client in a splash window that is loaded upon start. 
By default: 
    * All contents (HTML, CSS, JS) are to be stored in the folder [splash](3dwebclient/splash)
    * The HTML page is named `SplashWindow.html` and all belonging CSS and JS files must be declared/imported in the HTML file.
        
* If the contents of the splash window are however stored somewhere else, 
    the splash window can be declared as a set of string parameters in the web client URL using the following syntax: 
    
    `&splashWindow=url=<path_to_your_html_file>&showOnStart=<true|false>` 
    
    where:
    
    | Parameter        | Description           | Allowed values  | Default Value |
    | ------------- |-------------| -----| ----|
    | `url`      | A valid path to the HTML file | An absolute path if the HTML file is located in another domain or a relative path if the HTML file is located in the same project folder as the web client | `splash/SplashWindow.html` |
    | `showOnStart`     | A boolean that determines whether the splash window should be shown upon start or not      |   `true` or `false` | `true` |
    
* The splash window has two buttons: `Close` and `Ignore` (or `Do not show again`). the former closes the splash window but does not prevent it from appearing again if the page is reloaded. 
Therefore, the latter button can be used to suppress the splash window from appearing again. 
Note that a cookie named `ignoreSplashWindow` will be created locally, which tells the web client whether or not to display the splash window based on the user's choice.

* The configurations of the splash window (`url` and `showOnStart`) can be modified using the main toolbox in the web client. There, you can also overwrite or remove the current splash window.
    * Once the flag `showOnStart` has been modified and saved, it will overwrite the cookie `ignoreSplashWindow`. 
For example, a checked `showOnStart` flag in the toolbox will set the cookie `ignoreSplashWindow` to `false` again, regardless of the cookie's value.
    * On the other hand, the cookie `ignoreSplashWindow` will be priortized against the string parameters in the web client URL. For example, a web client with URL `...&showOnStart=true` will display the splash window on the first load. 
    After the option `Ignore` (or `Do not show again`) is selected, the cookie `ignoreSplashWindow` with value `true` is created. This cookie will prevent the web client from displaying the splash window again on the next load, as expected, even if the web client URL has the parameter `showOnStart=true`.
    To reset or remove the cookie, simply go to the main toolbox and set the flag `showOnStart` accordingly, since the flag has the highest priority and will overwrite the current value of the cookie.
    
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
