class UrlController {
    private _urlDictionary: any;

    public constructor() {
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
            "tileStyle": "tst",
            "tileMatrixSetId": "tmsi",

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
    private getUrlParaForward(parameter: string): string {
        let value = "";
        if (parameter.indexOf("layer_") >= 0) {
            // layer_N, with N as a number
            value = this._urlDictionary["layer_"] + parameter.substring("layer_".length);
        } else {
            value = this._urlDictionary[parameter];
        }
        if (typeof value !== "undefined" && value !== "") {
            return value;
        }
        return null;
    }

    // return only the full name of the URL parameters
    private getUrlParaAuxReverse(parameter: string): string {
        for (let key in this._urlDictionary) {
            if (this._urlDictionary[key] === parameter) {
                return key;
            }
        }
        return null;
    }

    // return the value defined by the URL parameter
    public getUrlParaValue(parameter: string, url: string, CitydbUtil: any): string {
        let result: any = CitydbUtil.parse_query_string(this.getUrlParaForward(parameter), url);
        if (result == null || result === "") {
            // reverse mapping
            // result = CitydbUtil.parse_query_string(this.getUrlParaAuxReverse(parameter), url);
            result = CitydbUtil.parse_query_string(parameter, url);
        }
        return result;
    }

    public generateLink(
        webMap: any,
        addWmsViewModel: any,
        addTerrainViewModel: any,
        addSplashWindowModel: any,
        tokens: any,
        signInController: any,
        googleClientId: any,
        splashController: SplashController,
        cesiumViewer: any,
        Cesium: any
    ): string {
        let cameraPosition = this.getCurrentCameraPostion(cesiumViewer, Cesium);
        let projectLink = location.protocol + '//' + location.host + location.pathname + '?';

        let clock = cesiumViewer.cesiumWidget.clock;
        if (!clock.shouldAnimate) {
            let currentJulianDate = clock.currentTime;
            let daytimeObject = {};
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
        let basemap = this.basemapToQuery(addWmsViewModel, cesiumViewer, Cesium);
        if (basemap != null && basemap !== "") {
            projectLink = projectLink + '&' + basemap;
        }

        let terrain = this.terrainToQuery(addTerrainViewModel, cesiumViewer, Cesium);
        if (terrain != null && terrain !== "") {
            projectLink = projectLink + '&' + terrain;
        }

        let splashWindow = this.splashWindowToQuery(addSplashWindowModel, splashController, Cesium);
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
    }

    private getCurrentCameraPostion(cesiumViewer: any, Cesium: any): any {
        let cesiumCamera = cesiumViewer.scene.camera;
        let position = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cesiumCamera.position);
        let latitude = Cesium.Math.toDegrees(position.latitude);
        let longitude = Cesium.Math.toDegrees(position.longitude);
        let height = position.height;
        let heading = Cesium.Math.toDegrees(cesiumCamera.heading);
        let pitch = Cesium.Math.toDegrees(cesiumCamera.pitch);
        let roll = Cesium.Math.toDegrees(cesiumCamera.roll);

        let result = {
            latitude: latitude,
            longitude: longitude,
            height: height,
            heading: heading,
            pitch: pitch,
            roll: roll
        };

        return result;
    }

    private layersToQuery(webMap: any, Cesium: any): string {
        let layerGroupObject = new Object();
        let layers = webMap._layers;
        for (let i = 0; i < layers.length; i++) {
            let layer = layers[i];
            let layerConfig = {};
            layerConfig[this.getUrlParaForward('url')] = Cesium.defaultValue(layer.url, "");
            layerConfig[this.getUrlParaForward('name')] = Cesium.defaultValue(layer.name, "");
            layerConfig[this.getUrlParaForward('layerDataType')] = Cesium.defaultValue(layer.layerDataType, "");
            layerConfig[this.getUrlParaForward('layerProxy')] = Cesium.defaultValue(layer.layerProxy, "");
            layerConfig[this.getUrlParaForward('layerClampToGround')] = Cesium.defaultValue(layer.layerClampToGround, "");
            layerConfig[this.getUrlParaForward('gltfVersion')] = Cesium.defaultValue(layer.gltfVersion, "");
            layerConfig[this.getUrlParaForward('active')] = Cesium.defaultValue(layer.active, "");
            layerConfig[this.getUrlParaForward('thematicDataUrl')] = Cesium.defaultValue(layer.thematicDataUrl, "");
            layerConfig[this.getUrlParaForward('thematicDataSource')] = Cesium.defaultValue(layer.thematicDataSource, "");
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

        return Cesium.objectToQuery(layerGroupObject)
    }

    private basemapToQuery(addWmsViewModel: any, cesiumViewer: any, Cesium: any): string {
        let baseLayerPickerViewModel = cesiumViewer.baseLayerPicker.viewModel;
        let baseLayerProviderFunc = baseLayerPickerViewModel.selectedImagery.creationCommand();
        if (baseLayerProviderFunc instanceof Cesium.WebMapServiceImageryProvider
            || baseLayerProviderFunc instanceof Cesium.WebMapTileServiceImageryProvider) {
            let basemapObject = {};
            basemapObject[this.getUrlParaForward('basemap')] = Cesium.objectToQuery(addWmsViewModel);
            return Cesium.objectToQuery(basemapObject);
        } else {
            return null;
        }
    }

    private terrainToQuery(addTerrainViewModel: any, cesiumViewer: any, Cesium: any): string {
        let baseLayerPickerViewModel = cesiumViewer.baseLayerPicker.viewModel;
        let baseLayerProviderFunc = baseLayerPickerViewModel.selectedTerrain.creationCommand();
        if (baseLayerProviderFunc instanceof Cesium.CesiumTerrainProvider) {
            if (baseLayerPickerViewModel.selectedTerrain.name.indexOf('Cesium World Terrain') !== -1) {
                return this.getUrlParaForward('cesiumWorldTerrain') + '=true';
            }
            let terrainObject = {};
            terrainObject[this.getUrlParaForward('terrain')] = Cesium.objectToQuery(addTerrainViewModel);
            return Cesium.objectToQuery(terrainObject);
        } else {
            return null;
        }
    }

    private splashWindowToQuery(addSplashWindowModel: any, splashController: SplashController, Cesium: any): string {
        if (addSplashWindowModel.url) {
            let splashObjectTmp: any = {}
            let default_obj = splashController.getDefaultAddSplashWindowModel();
            // only export info that are not the same as default
            if (addSplashWindowModel.url !== default_obj.url) {
                splashObjectTmp.url = addSplashWindowModel.url;
            }
            if (addSplashWindowModel.showOnStart !== default_obj.showOnStart) {
                splashObjectTmp.showOnStart = addSplashWindowModel.showOnStart;
            }
            let splashObject = {};
            splashObject[this.getUrlParaForward('splashWindow')] = Cesium.objectToQuery(splashObjectTmp);
            return Cesium.objectToQuery(splashObject);
        }
        return null;
    }

    private getValueFromObject(name: string, customObject: any, defaultValue?: any, Cesium?: any) {
        let result = customObject[this.getUrlParaForward(name)];
        if (typeof result === "undefined" || result === "") {
            result = customObject[name];
        }
        if (typeof Cesium === "undefined") {
            return result;
        }
        return Cesium.defaultValue(result, defaultValue);
    }

    public getLayersFromUrl(
        url: any,
        CitydbUtil: any,
        CitydbKmlLayer: any,
        Cesium3DTilesDataLayer: any,
        CitydbI3SLayer: any,
        CitydbGeoJSONLayer: any,
        Cesium: any
    ): any {
        let index = 0;
        let nLayers = [];
        let layerConfigString = this.getUrlParaValue('layer_' + index, url, CitydbUtil);
        while (layerConfigString) {
            let layerConfig = Cesium.queryToObject(Object.keys(Cesium.queryToObject(layerConfigString))[0]);
            let options = {
                url: this.getValueFromObject('url', layerConfig),
                name: this.getValueFromObject('name', layerConfig),
                layerDataType: this.getValueFromObject('layerDataType', layerConfig, 'COLLADA/KML/glTF', Cesium),
                layerProxy: this.getValueFromObject('layerProxy', layerConfig, false, Cesium) === "true",
                layerClampToGround: this.getValueFromObject('layerClampToGround', layerConfig, true, Cesium) === "true",
                gltfVersion: this.getValueFromObject('gltfVersion', layerConfig, '2.0', Cesium),
                thematicDataUrl: layerConfig['spreadsheetUrl']
                    ? this.getValueFromObject('spreadsheetUrl', layerConfig, '', Cesium)
                    : this.getValueFromObject('thematicDataUrl', layerConfig, '', Cesium),
                thematicDataSource: this.getValueFromObject('thematicDataSource', layerConfig, 'GoogleSheets', Cesium),
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
            }

            if (options.layerDataType === "geojson") {
                nLayers.push(new CitydbGeoJSONLayer(options));
            } else if (['kml', 'kmz', 'json', 'czml'].indexOf(CitydbUtil.get_suffix_from_filename(options.url)) > -1
                && options.layerDataType === "COLLADA/KML/glTF") {
                nLayers.push(new CitydbKmlLayer(options));
            } else if (options.layerDataType === "i3s") {
                nLayers.push(new CitydbI3SLayer(options));
            } else {
                nLayers.push(new Cesium3DTilesDataLayer(options));
            }

            index++;
            layerConfigString = this.getUrlParaValue('layer_' + index, url, CitydbUtil);
        }
        return nLayers;
    }

    get urlDictionary(): any {
        return this._urlDictionary;
    }

    set urlDictionary(value: any) {
        this._urlDictionary = value;
    }
}
