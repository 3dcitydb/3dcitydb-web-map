var DataSourceTypes;
(function (DataSourceTypes) {
    DataSourceTypes["GoogleSheets"] = "GoogleSheets";
    DataSourceTypes["PostgreSQL"] = "PostgreSQL";
    DataSourceTypes["OGCFeatureAPI"] = "OGCFeatureAPI";
    DataSourceTypes["Embedded"] = "Embedded";
})(DataSourceTypes || (DataSourceTypes = {}));
var TableTypes;
(function (TableTypes) {
    TableTypes["Horizontal"] = "Horizontal";
    TableTypes["Vertical"] = "Vertical";
})(TableTypes || (TableTypes = {}));
var ThirdPartyHandler;
(function (ThirdPartyHandler) {
    ThirdPartyHandler["Cesium"] = "Cesium";
})(ThirdPartyHandler || (ThirdPartyHandler = {}));
var DataSourceController = /** @class */ (function () {
    function DataSourceController(selectedDataSource, signInController, options) {
        var scope = this;
        scope._options = options;
        if (selectedDataSource === DataSourceTypes.GoogleSheets) {
            scope._dataSource = new GoogleSheets(signInController, scope._options);
        } else if (selectedDataSource === DataSourceTypes.PostgreSQL) {
            scope._dataSource = new PostgreSQL(signInController, scope._options);
        } else if (selectedDataSource === DataSourceTypes.OGCFeatureAPI) {
            scope._dataSource = new OGCFeatureAPI(signInController, scope._options);
        } else if (selectedDataSource === DataSourceTypes.Embedded && options.layerType === "COLLADA/KML/glTF") {
            scope._dataSource = new KMLDataSource(signInController, scope._options);
        }
    }

    DataSourceController.prototype.fetchData = function (gmlid, callback, limit, clickedObject) {
        var scope = this;
        scope._dataSource.queryUsingId(gmlid, function (result) {
            callback(scope._dataSource.responseToKvp(result), gmlid);
        }, limit, clickedObject);
    };
    Object.defineProperty(DataSourceController.prototype, "dataSource", {
        get: function () {
            return this._dataSource;
        },
        set: function (value) {
            this._dataSource = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataSourceController.prototype, "options", {
        get: function () {
            return this._options;
        },
        set: function (value) {
            this._options = value;
        },
        enumerable: true,
        configurable: true
    });
    return DataSourceController;
}());
