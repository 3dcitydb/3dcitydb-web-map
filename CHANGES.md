# Change Log

### 1.8.3 - Active [[Demo Link]](https://www.3dcitydb.org/3dcitydb-web-map/1.8.3/3dwebclient/index.html)

##### NEW
* Added support for loading KML/COLLADA/glTF layers via proxy (see [`c736ba7`](https://github.com/3dcitydb/3dcitydb-web-map/commit/c736ba7dc56c251f46e055a4d924cd71fe35c268) and [`4894ca4`](https://github.com/3dcitydb/3dcitydb-web-map/commit/4894ca4075a447874bc1003c785f47db661a6b56)):
  + This can be toggled in the main toolbox while adding new layer;
  + This shall be stored in the shared URLs as parameter `layerProxy=<true|false>`;
  + For backward compatibility, shared URLs without this parameter shall receive the default value `false`.
  + It is not recommended to load large datasets via proxy, e.g. Cesium 3D Tiles;
  + Proxy only works for web client hosted in one of the following domains: `http(s)://(www.)3dcitydb.[org|net|de]`;
  + Users have to ensure the resource URL and the web client's URL have the same protocol HTTP/HTTPS.

* Added support for clamping KML models to ground (see [`c736ba7`](https://github.com/3dcitydb/3dcitydb-web-map/commit/c736ba7dc56c251f46e055a4d924cd71fe35c268) and [`f64372c`](https://github.com/3dcitydb/3dcitydb-web-map/commit/f64372c02408e734d07c01ee93c55c12c1117bcf)):
  + This can be toggled in the main toolbox while adding new layer;
  + This shall be stored in the shared URLs as parameter `layerClampToGround=<true|false>`;
  + For backward compatibility, shared URLs without this parameter shall receive the default value `true`.

* It is now possible to access own private/non-public Google Spreadsheets using OAuth, see [`082145c`](https://github.com/3dcitydb/3dcitydb-web-map/commit/082145c73bf68c6f29614581b4f09f703d627bde).
The following steps explain how to enable OAuth for your project and use it in the Web Client 
(this is not the requirement of the web client, but rather a standard procedure when using OAuth):
  1. Make sure you really have read/write access to the table;
  1. Register your project using [Google Developer Console](https://console.developers.google.com/);
  2. Search and activate [Google Sheets API](https://console.developers.google.com/apis/library) for your project;
  3. Create and copy your client ID from the [credentials page](https://console.developers.google.com/apis/credentials);
  4. Insert the trusted [redirect URIs](https://console.developers.google.com/apis/credentials/oauthclient), 
  or the URIs in which the web client is running. For example if you are using the latest web client from our 3DCityDB server,
  then you should insert the following URI: 
  ``https://www.3dcitydb.org/3dcitydb-web-map/latest/3dwebclient/index.html``
  5. Paste your client ID in the web client's URL using the parameter `googleClientId`, such as
  ``https://www.3dcitydb.org/3dcitydb-web-map/latest/3dwebclient/index.html?googleClientId=<YOUR_CLIENT_ID>``
     + You can then log into Google by clicking the button marked with a key symbol, 
     which can be found in the top right area of the screen;
     + When logged in, you can click the button again to log out;
     + If the parameter `googleClientId` does not exist in the client URL, then this button shall not be displayed 
     (backward compatible to earlier versions of the web client).
  6. (Optional) You can share your project as usual by clicking the button `Generate Scene Link`.
  You need to stay logged in to attach your client ID in the project share link. 
  If you wish to not include your client ID in the project share link, then simply log out beforehand,
  see [`bd99b17`](https://github.com/3dcitydb/3dcitydb-web-map/commit/bd99b176894618f1b8623c2de1f95e6555711b5c).

* The web client now supports both `.gltf` and binary `.glb` files. 
It automatically detects for each individual object whether a `.gltf` or a `.glb` is present and visualize accordingly,
i.e. the web client can visualize a list of files mixed with `.gltf` and `.glb`, 
see[`737b4a0`](https://github.com/3dcitydb/3dcitydb-web-map/commit/737b4a017af5a0433c08df4d2e593a1e61152446). 

### 1.8.2 - Released [[Demo Link]](https://www.3dcitydb.org/3dcitydb-web-map/1.8.2/3dwebclient/index.html)

##### FIXES
* Fixed a bug that prevented calendar `flatpickr` from displaying correctly, see [`942d9f1`](https://github.com/3dcitydb/3dcitydb-web-map/commit/942d9f1e28646bed6c0fba04e62cf4e6efdbdbf8).
* Fixed querying data sources from multiple layers, see [`69fce7b`](https://github.com/3dcitydb/3dcitydb-web-map/commit/69fce7b2a6c0568ad9fbf183ccc87599aa5d6147).
* Fixed loading of thematic data sources in Cesium 3D Tiles, see [`08bc00d`](https://github.com/3dcitydb/3dcitydb-web-map/commit/08bc00da66510939ac7811a8b8c750f961eeeb8e).

### 1.8.1 - Released [[Demo Link]](https://www.3dcitydb.org/3dcitydb-web-map/1.8.1/3dwebclient/index.html)
---------

##### IMPORTANT CHANGES
* [Google Fusion Tables](https://support.google.com/fusiontables/answer/2571232) will be unavailable after Dec 3, 2019. 
It is recommended to backup thematic data stored in such tables locally/offline 
or using alternative cloud services. Please refer to Google announcements for more information. 

* In this context, besides Google Fusion Tables, the Web Client is now additionally capable of fetching data using [Google Sheets API v4](https://developers.google.com/sheets/api) and a PostgreSQL database with a RESTful API enabled ([PostgREST](http://postgrest.org/en/v6.0/)). 
Like with Google Fusion Tables, data fetched from Google Sheets API and PostgREST can also be displayed on the infobox as thematic data when a city object is clicked.
Simply enter the URL to corresponding tables in the `thematicDataUrl` field 
as well as the type of thematic data source in `> Thematic Data Source` field in 
`Show / Hide Toolbox` -> `Add / Configure Layer`. This could be:
    + The spreadsheet URL using `Google Sheets API`, e.g. with the following structure `https://docs.google.com/spreadsheets/d/<spreadsheet_id>` 
    + The table URL published by the `PostgreSQL REST API`, e.g. `https://example.com:3000/<table_name>` 

* In addition to the two new supported data sources, 
it is now also possible to choose their `tableType` between `All object attributes in one row` (horizontal) 
and `One row per object attribute` (vertical).
The selected table type are encoded in URLs generated by `Generate Scene Link` as well as 
parsing project URLs, see [`05e692d`](https://github.com/3dcitydb/3dcitydb-web-map/commit/05e692d49076068e19631c30afaa617faf9ddc76), where:
    + **Horizontal**: all object attributes are stored in columns of one single row, which means each ID occurs only once in the table.
    
      ***Note***: The thematic data must be stored in the **first** sheet of the spreadsheet. The first column of this sheet must be called `gmlid` or `GMLID`.
       
      *Example*:
     
        | gmlid  | attribute1 | attribute2 | attribute3 | attribute4 |
        | ------------- | ------------- | ------------- | ------------- | ------------- |
        | gmlid1  | value1  | value2  | value3  | value4  |
        | gmlid2  | value1  | value2  | value3  | value4  |
      
    + **Vertical**: each object attribute is stored in one row consisting of three columns `ID`, 
    `Attribute` and `Value`, which means an ID may occur in multiple rows in the table.
    
      **Note**: A vertical table must contain exactly 3 columns in this exact order: `gmlid`, `attribute` and `value`.
      
      *Example*:
     
        | gmlid  | attribute | value |
        | ------------- | ------------- | ------------- |
        | gmlid1  | attribute1  | value1  |
        | gmlid1  | attribute2  | value2  |
        | gmlid1  | attribute3  | value3  |
        | gmlid1  | attribute4  | value4  |
        | gmlid2  | attribute1  | value1  |
        | gmlid2  | attribute2  | value2  |
        | gmlid2  | attribute3  | value3  |
        | gmlid2  | attribute4  | value4  |
        
    + The response from PostgREST service is encoded in JSON with the following structure:
    Both the horizontal and vertical mode consist of an array of records marked by the `[ ... ]`. 
    Each record represents a line in the table, where:
    
        + Each record in vertical mode only has exactly 3 elements: `gmlid`, attribute name and attribute value. The `gmlids` here can be duplicated in other records, but the combination of these 3 elements must be unique.
           ```
           [
              { gmlid : "id1", value_name : "value_name", value : "value" },
              { gmlid : "id2", value_name : "value_name", value : "value" },
              ...
           ]
           ```

        + On the other hand, each record in the horizontal mode can have more than 2 elements, but the first one must always be `gmlid` and this must be unique for each record.

##### UPDATES
* Added support for `thematicDataSource` in URLs generated by `Generate Scene Link` as well as parsing project URLs, see[`85afb36`](https://github.com/3dcitydb/3dcitydb-web-map/commit/85afb36a840e044e03b95ade41ee6776840387a4).

##### FIXES
* Fixed a bug that prevented Geocoder to function properly on defined active layers, see [`0e60059`](https://github.com/3dcitydb/3dcitydb-web-map/commit/0e60059f29a53b1cb413c9ab0e36721559ce22f8).

### 1.8.0 - Released [[Demo Link]](https://www.3dcitydb.org/3dcitydb-web-map/1.8.0/3dwebclient/index.html)
---------

##### NEW
* It is now possible to display your own information about your web client in a splash window that is loaded upon start. 
By default: 
    * All contents (HTML, CSS, JS) are to be stored in the folder [splash](3dwebclient/splash).
    * The HTML page is named `SplashWindow.html` and all belonging CSS and JS files must be declared/imported in the HTML file.
    * On mobile devices, the web client will search for the HTML page named `SplashWindow_Mobile.html` and display it instead.
    If such file does not exist, the default `SplashWindow.html` shall be used. 
    Thus, if you wish to display your own contents modified for mobile devices, 
    make sure to save them in the additional `SplashWindow_Mobile.html` file.
        
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

* The splash window as well as other information about the web client are displayed in an additional tab in the Cesium's default navigation help popup triggered by the "question mark" button in the top right corner of the screen.

##### FIXES
* Fixed rotation/heading of glTF v0.8, see [`e049ffd`](https://github.com/3dcitydb/3dcitydb-web-map/commit/e049ffd241a514e2a1422de8571081113ce91a51).
* Fixed a bug that prevented highlighting of `Cesium3DTileFeatures`, see [`01b0241`](https://github.com/3dcitydb/3dcitydb-web-map/commit/01b0241aaae818b2a6c28185b3330a5ffb30bac0).
* Fixed a bug that caused selected geometries to stay highlighted even after deselecting, see [`a161234`](https://github.com/3dcitydb/3dcitydb-web-map/commit/a161234647bea4a527afab0e708a99a5b7d06efe). 
* Fixed a bug that prevented retrieving properties of `Cesium3DTileFeatures`, see [`20e0a8e`](https://github.com/3dcitydb/3dcitydb-web-map/commit/20e0a8e32a06784ca4ab50a59beb9d425a41d0f8).
* Fixed a bug that prevented selection of 3D tiles objects, see [`ce18aab`](https://github.com/3dcitydb/3dcitydb-web-map/commit/ce18aab826e8ef10bd099b340ac5298f2e3c50e4).
* Fixed (un)highlight of 3D tiles objects, see [`6be754c`](https://github.com/3dcitydb/3dcitydb-web-map/commit/6be754cd59df1031f58159157166fdaf8fc3eb70).
* Fixed a bug when multiple alert windows appeared at the same time, see [`d5c5f4e`](https://github.com/3dcitydb/3dcitydb-web-map/commit/d5c5f4eb6b1227346eb367cf17f4edbd4f124046).
* Fixed the size of Cesium's error dialog that could not be displayed correctly on mobile devices, see [`763df04`](https://github.com/3dcitydb/3dcitydb-web-map/commit/763df044428a6a1b3cb554637e8c727d1f9fd045) and [`f0705bc`](https://github.com/3dcitydb/3dcitydb-web-map/commit/f0705bc18e53612305c096b51d0e4c68cf935cec).
* Fixed a bug that prevented the web client from reading user's ion token correctly, see [`59a62f6`](https://github.com/3dcitydb/3dcitydb-web-map/commit/59a62f60ae87e4c91f8fcfb862a50f2473bebc20).
* Fixed point size of point cloud datasets, see [`73c7c84`](https://github.com/3dcitydb/3dcitydb-web-map/commit/73c7c84b27f1f92ef8dae35d62f159737d89cb74).

##### UPDATES
* It is now possible to fly the camera directly to a recently highlighted/clicked entity, even if no `cityobjectsJsonUrl` is present. 
The `cityobjectsJsonUrl` is a JSON file containing information about location and coordinates linked to object IDs and thus was used prior to v1.7.1 to enable flying to such entities.
Starting with v1.7.2, the web client shall store recently highlighted/clicked entities in a dictionary with `{id, target entity}` tuples as its key-value-pairs. 
This way, a direct fly to hightlighted/clicked entites is possible without having to rely on the `cityobjectsJsonUrl`.
However, this will not work if the stored entities are not yet loaded or have been unloaded (e.g. typically when the camera has been moved to a different location).
In this case, the web client will fall back to using the `cityobjectsJsonUrl`. See [`4c7bcfd`](https://github.com/3dcitydb/3dcitydb-web-map/commit/4c7bcfd535e4bc5197260511b3e4ee6ac3b09e59). 
* Selected as well as highlighted objects from different layers can now be listed together in the 
`Choose highlighted object` as well as `Choose hidden object` dropdown list (prior to v1.7.1 this was not possible since only objects from the same active layer were allowed). See [`4c7bcfd`](https://github.com/3dcitydb/3dcitydb-web-map/commit/4c7bcfd535e4bc5197260511b3e4ee6ac3b09e59).
* Clicking the home button will fly the camera to the position and orientation defined in the URL.
If no corresponding parameters exist or are found in the URL, the camera shall fly to the default location and orientation defined in Cesium. See, [`4f23407`](https://github.com/3dcitydb/3dcitydb-web-map/commit/4f23407bcd8d9f8fd1d7608e16c5b6345ea560d3).
* Updated JQuery to v3.3.1, see [`a60b900`](https://github.com/3dcitydb/3dcitydb-web-map/commit/a60b900b9c14ac40ab6c0e5736a40c8ea060a627).
* Updated Flatpickr v4.5.1 to v4.6.2, see [`6d9d570`](https://github.com/3dcitydb/3dcitydb-web-map/commit/6d9d570cd0c5b26a63bd103c1b095b83b43910d4) and [`a56076e`](https://github.com/3dcitydb/3dcitydb-web-map/commit/a56076e48aeef895cdb5d0a373019cdd31ee7959).


### 1.7.1 - Released [[Demo Link]](https://www.3dcitydb.org/3dcitydb-web-map/1.7.1/3dwebclient/index.html)
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
