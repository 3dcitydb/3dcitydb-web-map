var UrlController = /** @class */ (function () {
    function UrlController() {
        this._urlDictionary = {
            "dayTime": "d",
            "title": "t",
            "shadows": "s",
            "terrainShadows": "ts",
            "latitude": "la",
            "lat": "la_",
            "longitude": "lo",
            "lon": "lo_",
            "height": "h",
            "heading": "hd",
            "pitch": "p",
            "roll": "r",
            // layer infos
            "layer_": "l_",
            "url": "u",
            "name": "n",
            "layerDataType": "ld",
            "layerProxy": "lp",
            "layerClampToGround": "lc",
            "gltfVersion": "gv",
            "active": "a",
            "thematicDataUrl": "tdu",
            "thematicDataSourceType": "ds",
            "tableType": "tt",
            // "googleSheetsApiKey": "gk",
            // "googleSheetsRanges": "gr",
            // "googleSheetsClientId": "tid",
            "cityobjectsJsonUrl": "gc",
            "minLodPixels": "il",
            "maxLodPixels": "al",
            "maxSizeOfCachedTiles": "ac",
            "maxCountOfVisibleTiles": "av",
            // basemap infos
            "basemap": "bm",
            // "name" : "n",
            "iconUrl": "iu",
            "tooltip": "ht",
            // "url" : "u",
            "layers": "ls",
            "additionalParameters": "ap",
            "proxyUrl": "pu",
            // terrain infos
            "cesiumWorldTerrain": "ct",
            "terrain": "tr",
            // "name" : "n,
            // "iconUrl" : "iu",
            // "tooltip" : "ht",
            // "url" : "u"
            // splash window infos
            "splashWindow": "sw",
            // "url": "u",
            "showOnStart": "ss",
            "ionToken": "it",
            "bingToken": "bt",
            "debug": "db",
            "googleClientId": "gid"
        };
    }
    // return only the shortened name of the URL parameters
    UrlController.prototype.getUrlParaForward = function (parameter) {
        var value = "";
        if (parameter.indexOf("layer_") >= 0) {
            // layer_N, with N as a number
            value = this._urlDictionary["layer_"] + parameter.substring("layer_".length);
        }
        else {
            value = this._urlDictionary[parameter];
        }
        if (typeof value !== "undefined" && value !== "") {
            return value;
        }
        return null;
    };
    // return only the full name of the URL parameters
    UrlController.prototype.getUrlParaAuxReverse = function (parameter) {
        for (var key in this._urlDictionary) {
            if (this._urlDictionary[key] === parameter) {
                return key;
            }
        }
        return null;
    };
    // return the value defined by the URL parameter
    UrlController.prototype.getUrlParaValue = function (parameter, url, CitydbUtil) {
        var result = CitydbUtil.parse_query_string(this.getUrlParaForward(parameter), url);
        if (result == null || result === "") {
            // reverse mapping
            // result = CitydbUtil.parse_query_string(this.getUrlParaAuxReverse(parameter), url);
            result = CitydbUtil.parse_query_string(parameter, url);
        }
        return result;
    };
    UrlController.prototype.generateLink = function (webMap, addWmsViewModel, addTerrainViewModel, addSplashWindowModel, tokens, signInController, googleClientId, splashController, cesiumViewer, Cesium) {
        var cameraPosition = this.getCurrentCameraPostion(cesiumViewer, Cesium);
        var projectLink = location.protocol + '//' + location.host + location.pathname + '?';
        var clock = cesiumViewer.cesiumWidget.clock;
        if (!clock.shouldAnimate) {
            var currentJulianDate = clock.currentTime;
            var daytimeObject = {};
            daytimeObject[this.getUrlParaForward('dayTime')] = Cesium.JulianDate.toIso8601(currentJulianDate, 0);
            projectLink = projectLink + Cesium.objectToQuery(daytimeObject) + '&';
        }
        projectLink = projectLink +
            this.getUrlParaForward('title') + '=' + document.title +
            '&' + this.getUrlParaForward('shadows') + '=' + cesiumViewer.shadows +
            '&' + this.getUrlParaForward('terrainShadows') + '=' + (isNaN(cesiumViewer.terrainShadows) ? 0 : cesiumViewer.terrainShadows) +
            '&' + this.getUrlParaForward('latitude') + '=' + Math.round(cameraPosition.latitude * 1e6) / 1e6 +
            '&' + this.getUrlParaForward('longitude') + '=' + Math.round(cameraPosition.longitude * 1e6) / 1e6 +
            '&' + this.getUrlParaForward('height') + '=' + Math.round(cameraPosition.height * 1e3) / 1e3 +
            '&' + this.getUrlParaForward('heading') + '=' + Math.round(cameraPosition.heading * 1e2) / 1e2 +
            '&' + this.getUrlParaForward('pitch') + '=' + Math.round(cameraPosition.pitch * 1e2) / 1e2 +
            '&' + this.getUrlParaForward('roll') + '=' + Math.round(cameraPosition.roll * 1e2) / 1e2 +
            '&' + this.layersToQuery(webMap, Cesium);
        var basemap = this.basemapToQuery(addWmsViewModel, cesiumViewer, Cesium);
        if (basemap != null && basemap !== "") {
            projectLink = projectLink + '&' + basemap;
        }
        var terrain = this.terrainToQuery(addTerrainViewModel, cesiumViewer, Cesium);
        if (terrain != null && terrain !== "") {
            projectLink = projectLink + '&' + terrain;
        }
        var splashWindow = this.splashWindowToQuery(addSplashWindowModel, splashController, Cesium);
        if (splashWindow != null && splashWindow !== "") {
            projectLink = projectLink + '&' + splashWindow;
        }
        // export ion and Bing token if available
        if (tokens.ionToken != null && tokens.ionToken !== "") {
            projectLink = projectLink + '&' + this.getUrlParaForward('ionToken') + '=' + tokens.ionToken;
        }
        if (tokens.bingToken != null && tokens.bingToken !== "") {
            projectLink = projectLink + '&' + this.getUrlParaForward('bingToken') + '=' + tokens.bingToken;
        }
        // only export client ID if user is logged in
        if ((signInController && signInController.clientID && signInController.isSignIn())) {
            projectLink = projectLink + '&' + this.getUrlParaForward('googleClientId') + '=' + (signInController.clientID ? signInController.clientID : googleClientId);
        }
        return projectLink;
    };
    UrlController.prototype.getCurrentCameraPostion = function (cesiumViewer, Cesium) {
        var cesiumCamera = cesiumViewer.scene.camera;
        var position = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cesiumCamera.position);
        var latitude = Cesium.Math.toDegrees(position.latitude);
        var longitude = Cesium.Math.toDegrees(position.longitude);
        var height = position.height;
        var heading = Cesium.Math.toDegrees(cesiumCamera.heading);
        var pitch = Cesium.Math.toDegrees(cesiumCamera.pitch);
        var roll = Cesium.Math.toDegrees(cesiumCamera.roll);
        var result = {
            latitude: latitude,
            longitude: longitude,
            height: height,
            heading: heading,
            pitch: pitch,
            roll: roll
        };
        return result;
    };
    UrlController.prototype.layersToQuery = function (webMap, Cesium) {
        var layerGroupObject = new Object();
        var layers = webMap._layers;
        for (var i = 0; i < layers.length; i++) {
            var layer = layers[i];
            var layerConfig = {};
            layerConfig[this.getUrlParaForward('url')] = Cesium.defaultValue(layer.url, "");
            layerConfig[this.getUrlParaForward('name')] = Cesium.defaultValue(layer.name, "");
            layerConfig[this.getUrlParaForward('layerDataType')] = Cesium.defaultValue(layer.layerDataType, "");
            layerConfig[this.getUrlParaForward('layerProxy')] = Cesium.defaultValue(layer.layerProxy, "");
            layerConfig[this.getUrlParaForward('layerClampToGround')] = Cesium.defaultValue(layer.layerClampToGround, "");
            layerConfig[this.getUrlParaForward('gltfVersion')] = Cesium.defaultValue(layer.gltfVersion, "");
            layerConfig[this.getUrlParaForward('active')] = Cesium.defaultValue(layer.active, "");
            layerConfig[this.getUrlParaForward('thematicDataUrl')] = Cesium.defaultValue(layer.thematicDataUrl, "");
            layerConfig[this.getUrlParaForward('thematicDataSourceType')] = Cesium.defaultValue(layer.thematicDataSourceType, "");
            layerConfig[this.getUrlParaForward('tableType')] = Cesium.defaultValue(layer.tableType, "");
            // layerConfig[this.getUrlParaForward('googleSheetsApiKey')] = Cesium.defaultValue(layer.googleSheetsApiKey, "");
            // layerConfig[this.getUrlParaForward('googleSheetsRanges')] = Cesium.defaultValue(layer.googleSheetsRanges, "");
            // layerConfig[this.getUrlParaForward('googleSheetsClientId')] = Cesium.defaultValue(layer.googleSheetsClientId, "")layer.;
            layerConfig[this.getUrlParaForward('cityobjectsJsonUrl')] = Cesium.defaultValue(layer.cityobjectsJsonUrl, "");
            layerConfig[this.getUrlParaForward('minLodPixels')] = Cesium.defaultValue(layer.minLodPixels, "");
            layerConfig[this.getUrlParaForward('maxLodPixels')] = Cesium.defaultValue(layer.maxLodPixels, "");
            layerConfig[this.getUrlParaForward('maxSizeOfCachedTiles')] = Cesium.defaultValue(layer.maxSizeOfCachedTiles, "");
            layerConfig[this.getUrlParaForward('maxCountOfVisibleTiles')] = Cesium.defaultValue(layer.maxCountOfVisibleTiles, "");
            layerGroupObject[this.getUrlParaForward('layer_') + i] = Cesium.objectToQuery(layerConfig);
        }
        return Cesium.objectToQuery(layerGroupObject);
    };
    UrlController.prototype.basemapToQuery = function (addWmsViewModel, cesiumViewer, Cesium) {
        var baseLayerPickerViewModel = cesiumViewer.baseLayerPicker.viewModel;
        var baseLayerProviderFunc = baseLayerPickerViewModel.selectedImagery.creationCommand();
        if (baseLayerProviderFunc instanceof Cesium.WebMapServiceImageryProvider) {
            var basemapObject = {};
            basemapObject[this.getUrlParaForward('basemap')] = Cesium.objectToQuery(addWmsViewModel);
            return Cesium.objectToQuery(basemapObject);
        }
        else {
            return null;
        }
    };
    UrlController.prototype.terrainToQuery = function (addTerrainViewModel, cesiumViewer, Cesium) {
        var baseLayerPickerViewModel = cesiumViewer.baseLayerPicker.viewModel;
        var baseLayerProviderFunc = baseLayerPickerViewModel.selectedTerrain.creationCommand();
        if (baseLayerProviderFunc instanceof Cesium.CesiumTerrainProvider) {
            if (baseLayerPickerViewModel.selectedTerrain.name.indexOf('Cesium World Terrain') !== -1) {
                return this.getUrlParaForward('cesiumWorldTerrain') + '=true';
            }
            var terrainObject = {};
            terrainObject[this.getUrlParaForward('terrain')] = Cesium.objectToQuery(addTerrainViewModel);
            return Cesium.objectToQuery(terrainObject);
        }
        else {
            return null;
        }
    };
    UrlController.prototype.splashWindowToQuery = function (addSplashWindowModel, splashController, Cesium) {
        if (addSplashWindowModel.url) {
            var splashObjectTmp = {};
            var default_obj = splashController.getDefaultAddSplashWindowModel();
            // only export info that are not the same as default
            if (addSplashWindowModel.url !== default_obj.url) {
                splashObjectTmp.url = addSplashWindowModel.url;
            }
            if (addSplashWindowModel.showOnStart !== default_obj.showOnStart) {
                splashObjectTmp.showOnStart = addSplashWindowModel.showOnStart;
            }
            var splashObject = {};
            splashObject[this.getUrlParaForward('splashWindow')] = Cesium.objectToQuery(splashObjectTmp);
            return Cesium.objectToQuery(splashObject);
        }
        return null;
    };
    UrlController.prototype.getValueFromObject = function (name, customObject, defaultValue, Cesium) {
        var result = customObject[this.getUrlParaForward(name)];
        if (typeof result === "undefined" || result === "") {
            result = customObject[name];
        }
        if (typeof Cesium === "undefined") {
            return result;
        }
        return Cesium.defaultValue(result, defaultValue);
    };
    UrlController.prototype.getLayersFromUrl = function (url, CitydbUtil, CitydbKmlLayer, Cesium3DTilesDataLayer, Cesium) {
        var index = 0;
        var nLayers = [];
        var layerConfigString = this.getUrlParaValue('layer_' + index, url, CitydbUtil);
        while (layerConfigString) {
            var layerConfig = Cesium.queryToObject(Object.keys(Cesium.queryToObject(layerConfigString))[0]);
            var options = {
                url: this.getValueFromObject('url', layerConfig),
                name: this.getValueFromObject('name', layerConfig),
                layerDataType: this.getValueFromObject('layerDataType', layerConfig, 'COLLADA/KML/glTF', Cesium),
                layerProxy: this.getValueFromObject('layerProxy', layerConfig, false, Cesium) === "true",
                layerClampToGround: this.getValueFromObject('layerClampToGround', layerConfig, true, Cesium) === "true",
                gltfVersion: this.getValueFromObject('gltfVersion', layerConfig, '2.0', Cesium),
                thematicDataUrl: layerConfig['spreadsheetUrl']
                    ? this.getValueFromObject('spreadsheetUrl', layerConfig, '', Cesium)
                    : this.getValueFromObject('thematicDataUrl', layerConfig, '', Cesium),
                thematicDataSourceType: layerConfig['thematicDataSource']
                    ? this.getValueFromObject('thematicDataSource', layerConfig, 'GoogleSheets', Cesium)
                    : this.getValueFromObject('thematicDataSourceType', layerConfig, 'GoogleSheets', Cesium),
                tableType: this.getValueFromObject('tableType', layerConfig, 'Horizontal', Cesium),
                // googleSheetsApiKey: this.getValueFromObject('googleSheetsApiKey', layerConfig, '', Cesium),
                // googleSheetsRanges: this.getValueFromObject('googleSheetsRanges', layerConfig, '', Cesium),
                // googleSheetsClientId: this.getValueFromObject('googleSheetsClientId', layerConfig, '', Cesium),
                cityobjectsJsonUrl: this.getValueFromObject('cityobjectsJsonUrl', layerConfig, '', Cesium),
                active: this.getValueFromObject('active', layerConfig, false, Cesium) === "true",
                minLodPixels: this.getValueFromObject('minLodPixels', layerConfig, 140, Cesium),
                maxLodPixels: this.getValueFromObject('maxLodPixels', layerConfig, Number.MAX_VALUE, Cesium) === -1 ? Number.MAX_VALUE : this.getValueFromObject('maxLodPixels', layerConfig, Number.MAX_VALUE, Cesium),
                maxSizeOfCachedTiles: this.getValueFromObject('maxSizeOfCachedTiles', layerConfig, 140, Cesium),
                maxCountOfVisibleTiles: this.getValueFromObject('maxCountOfVisibleTiles', layerConfig, 140, Cesium),
            };
            if (['kml', 'kmz', 'json', 'czml'].indexOf(CitydbUtil.get_suffix_from_filename(options.url)) > -1
                && options.layerDataType === "COLLADA/KML/glTF") {
                nLayers.push(new CitydbKmlLayer(options));
            }
            else {
                nLayers.push(new Cesium3DTilesDataLayer(options));
            }
            index++;
            layerConfigString = this.getUrlParaValue('layer_' + index, url, CitydbUtil);
        }
        return nLayers;
    };
    Object.defineProperty(UrlController.prototype, "urlDictionary", {
        get: function () {
            return this._urlDictionary;
        },
        set: function (value) {
            this._urlDictionary = value;
        },
        enumerable: false,
        configurable: true
    });
    return UrlController;
}());
