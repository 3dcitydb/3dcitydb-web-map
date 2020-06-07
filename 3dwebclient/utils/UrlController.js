var UrlController = /** @class */ (function () {
    function UrlController() {
        this._urlDictionary = {
            "dayTime": "d",
            "title": "t",
            "shadows": "s",
            "terrainShadows": "ts",
            "latitude": "la",
            "longitude": "lo",
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
            "spreadsheetUrl": "tu",
            "thematicDataSource": "ds",
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
            "debug": "db",
            "googleClientId": "gid"
        };
    }
    UrlController.prototype.getUrlPara = function (parameter) {
        var value = this._urlDictionary[parameter];
        return value ? value : parameter;
    };
    UrlController.prototype.generateLink = function (webMap, addWmsViewModel, addTerrainViewModel, addSplashWindowModel, signInController, googleClientId, splashController, cesiumViewer, Cesium) {
        var cameraPosition = this.getCurrentCameraPostion(cesiumViewer, Cesium);
        var projectLink = location.protocol + '//' + location.host + location.pathname + '?';
        var clock = cesiumViewer.cesiumWidget.clock;
        if (!clock.shouldAnimate) {
            var currentJulianDate = clock.currentTime;
            var daytimeObject = {};
            daytimeObject[this.getUrlPara('dayTime')] = Cesium.JulianDate.toIso8601(currentJulianDate, 0);
            projectLink = projectLink + Cesium.objectToQuery(daytimeObject) + '&';
        }
        projectLink = projectLink +
            this.getUrlPara('title') + '=' + document.title +
            '&' + this.getUrlPara('shadows') + '=' + cesiumViewer.shadows +
            '&' + this.getUrlPara('terrainShadows') + '=' + (isNaN(cesiumViewer.terrainShadows) ? 0 : cesiumViewer.terrainShadows) +
            '&' + this.getUrlPara('latitude') + '=' + Math.round(cameraPosition.latitude * 1e6) / 1e6 +
            '&' + this.getUrlPara('longitude') + '=' + Math.round(cameraPosition.longitude * 1e6) / 1e6 +
            '&' + this.getUrlPara('height') + '=' + Math.round(cameraPosition.height * 1e3) / 1e3 +
            '&' + this.getUrlPara('heading') + '=' + Math.round(cameraPosition.heading * 1e2) / 1e2 +
            '&' + this.getUrlPara('pitch') + '=' + Math.round(cameraPosition.pitch * 1e2) / 1e2 +
            '&' + this.getUrlPara('roll') + '=' + Math.round(cameraPosition.roll * 1e2) / 1e2 +
            '&' + this.layersToQuery(webMap, Cesium);
        var basemap = this.basemapToQuery(addWmsViewModel, cesiumViewer, Cesium);
        if (basemap != null) {
            projectLink = projectLink + '&' + basemap;
        }
        var terrain = this.terrainToQuery(addTerrainViewModel, cesiumViewer, Cesium);
        if (terrain != null) {
            projectLink = projectLink + '&' + terrain;
        }
        var splashWindow = this.splashWindowToQuery(addSplashWindowModel, splashController, Cesium);
        if (splashWindow != null) {
            projectLink = projectLink + '&' + splashWindow;
        }
        // only export client ID if user is logged in
        if ((signInController && signInController.clientID && signInController.isSignIn())) {
            projectLink = projectLink + '&' + this.getUrlPara('googleClientId') + '=' + (signInController.clientID ? signInController.clientID : googleClientId);
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
            layerConfig[this.getUrlPara('url')] = Cesium.defaultValue(layer.url, "");
            layerConfig[this.getUrlPara('name')] = Cesium.defaultValue(layer.name, "");
            layerConfig[this.getUrlPara('layerDataType')] = Cesium.defaultValue(layer.layerDataType, "");
            layerConfig[this.getUrlPara('layerProxy')] = Cesium.defaultValue(layer.layerProxy, "");
            layerConfig[this.getUrlPara('layerClampToGround')] = Cesium.defaultValue(layer.layerClampToGround, "");
            layerConfig[this.getUrlPara('gltfVersion')] = Cesium.defaultValue(layer.gltfVersion, "");
            layerConfig[this.getUrlPara('active')] = Cesium.defaultValue(layer.active, "");
            layerConfig[this.getUrlPara('spreadsheetUrl')] = Cesium.defaultValue(layer.spreadsheetUrl, "");
            layerConfig[this.getUrlPara('thematicDataSource')] = Cesium.defaultValue(layer.thematicDataSource, "");
            layerConfig[this.getUrlPara('tableType')] = Cesium.defaultValue(layer.tableType, "");
            // layerConfig[this.getUrlPara('googleSheetsApiKey')] = Cesium.defaultValue(layer.googleSheetsApiKey, "");
            // layerConfig[this.getUrlPara('googleSheetsRanges')] = Cesium.defaultValue(layer.googleSheetsRanges, "");
            // layerConfig[this.getUrlPara('googleSheetsClientId')] = Cesium.defaultValue(layer.googleSheetsClientId, "")layer.;
            layerConfig[this.getUrlPara('cityobjectsJsonUrl')] = Cesium.defaultValue(layer.cityobjectsJsonUrl, "");
            layerConfig[this.getUrlPara('minLodPixels')] = Cesium.defaultValue(layer.minLodPixels, "");
            layerConfig[this.getUrlPara('maxLodPixels')] = Cesium.defaultValue(layer.maxLodPixels, "");
            layerConfig[this.getUrlPara('maxSizeOfCachedTiles')] = Cesium.defaultValue(layer.maxSizeOfCachedTiles, "");
            layerConfig[this.getUrlPara('maxCountOfVisibleTiles')] = Cesium.defaultValue(layer.maxCountOfVisibleTiles, "");
            layerGroupObject[this.getUrlPara('layer_') + i] = Cesium.objectToQuery(layerConfig);
        }
        return Cesium.objectToQuery(layerGroupObject);
    };
    UrlController.prototype.basemapToQuery = function (addWmsViewModel, cesiumViewer, Cesium) {
        var baseLayerPickerViewModel = cesiumViewer.baseLayerPicker.viewModel;
        var baseLayerProviderFunc = baseLayerPickerViewModel.selectedImagery.creationCommand();
        if (baseLayerProviderFunc instanceof Cesium.WebMapServiceImageryProvider) {
            var basemapObject = {};
            basemapObject[this.getUrlPara('basemap')] = Cesium.objectToQuery(addWmsViewModel);
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
                return this.getUrlPara('cesiumWorldTerrain') + '=true';
            }
            var terrainObject = {};
            terrainObject[this.getUrlPara('terrain')] = Cesium.objectToQuery(addTerrainViewModel);
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
            splashObject[this.getUrlPara('splashWindow')] = Cesium.objectToQuery(splashObjectTmp);
            return Cesium.objectToQuery(splashObject);
        }
        return null;
    };
    UrlController.prototype.getLayersFromUrl = function (CitydbUtil, CitydbKmlLayer, Cesium3DTilesDataLayer, Cesium) {
        var index = 0;
        var nLayers = [];
        var layerConfigString = CitydbUtil.parse_query_string(this.getUrlPara('layer_') + index, window.location.href);
        while (layerConfigString) {
            var layerConfig = Cesium.queryToObject(Object.keys(Cesium.queryToObject(layerConfigString))[0]);
            var options = {
                url: layerConfig[this.getUrlPara('url')],
                name: layerConfig[this.getUrlPara('name')],
                layerDataType: Cesium.defaultValue(layerConfig[this.getUrlPara('layerDataType')], "COLLADA/KML/glTF"),
                layerProxy: Cesium.defined(layerConfig[this.getUrlPara('layerProxy')]) ? layerConfig[this.getUrlPara('layerProxy')] === "true" : false,
                layerClampToGround: Cesium.defined(layerConfig[this.getUrlPara('layerClampToGround')]) ? layerConfig[this.getUrlPara('layerClampToGround')] === "true" : true,
                gltfVersion: Cesium.defaultValue(layerConfig[this.getUrlPara('gltfVersion')], "2.0"),
                thematicDataUrl: Cesium.defaultValue(layerConfig[this.getUrlPara('spreadsheetUrl')], ""),
                thematicDataSource: Cesium.defaultValue(layerConfig[this.getUrlPara('thematicDataSource')], "GoogleSheets"),
                tableType: Cesium.defaultValue(layerConfig[this.getUrlPara('tableType')], "Horizontal"),
                // googleSheetsApiKey: this._Cesium.defaultValue(layerConfig[urlController.getUrlPara('googleSheetsApiKey')], ""),
                // googleSheetsRanges: this._Cesium.defaultValue(layerConfig[urlController.getUrlPara('googleSheetsRanges')], ""),
                // googleSheetsClientId: this._Cesium.defaultValue(layerConfig[urlController.getUrlPara('googleSheetsClientId')], ""),
                cityobjectsJsonUrl: Cesium.defaultValue(layerConfig[this.getUrlPara('cityobjectsJsonUrl')], ""),
                active: (layerConfig[this.getUrlPara('active')] == "true"),
                minLodPixels: Cesium.defaultValue(layerConfig[this.getUrlPara('minLodPixels')], 140),
                maxLodPixels: Cesium.defaultValue(layerConfig[this.getUrlPara('maxLodPixels')] == -1 ? Number.MAX_VALUE : layerConfig[this.getUrlPara('maxLodPixels')], Number.MAX_VALUE),
                maxSizeOfCachedTiles: layerConfig[this.getUrlPara('maxSizeOfCachedTiles')],
                maxCountOfVisibleTiles: layerConfig[this.getUrlPara('maxCountOfVisibleTiles')]
            };
            if (['kml', 'kmz', 'json', 'czml'].indexOf(CitydbUtil.get_suffix_from_filename(options.url)) > -1
                && options.layerDataType === "COLLADA/KML/glTF") {
                nLayers.push(new CitydbKmlLayer(options));
            }
            else {
                nLayers.push(new Cesium3DTilesDataLayer(options));
            }
            index++;
            layerConfigString = CitydbUtil.parse_query_string(this.getUrlPara('layer_') + index, window.location.href);
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
        enumerable: true,
        configurable: true
    });
    return UrlController;
}());
