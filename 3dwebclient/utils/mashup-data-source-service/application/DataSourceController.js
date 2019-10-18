var DataSourceTypes;
(function (DataSourceTypes) {
    DataSourceTypes["GoogleSheets"] = "GoogleSheets";
    DataSourceTypes["PostgreSQL"] = "PostgreSQL";
})(DataSourceTypes || (DataSourceTypes = {}));
var DataSourceController = /** @class */ (function () {
    function DataSourceController(selectedDataSource, options) {
        var scope = this;
        scope._options = options;
        if (selectedDataSource == DataSourceTypes.GoogleSheets) {
            scope._datasource = new GoogleSheets(scope._options);
        }
        else if (selectedDataSource == DataSourceTypes.PostgreSQL) {
            scope._datasource = new PostgreSQL(scope._options);
        }
    }
    DataSourceController.prototype.fetchData = function (id, callback, limit) {
        var scope = this;
        scope._datasource.queryUsingId(id, function (result) {
            callback(scope._datasource.responseToKvp(result));
        }, limit);
    };
    Object.defineProperty(DataSourceController.prototype, "datasource", {
        get: function () {
            return this._datasource;
        },
        set: function (value) {
            this._datasource = value;
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
