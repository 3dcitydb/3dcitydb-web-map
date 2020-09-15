var DataSourceType;
(function (DataSourceType) {
    DataSourceType["GoogleSheets"] = "GoogleSheets";
    DataSourceType["PostgreSQL"] = "PostgreSQL";
    DataSourceType["KML"] = "KML";
})(DataSourceType || (DataSourceType = {}));
var DataSourceController = (function () {
    function DataSourceController() {
    }
    DataSourceController.createDataSource = function (dataSourceType, options) {
        if (dataSourceType != null) {
            var newInstance = Object.create(window[dataSourceType].prototype);
            newInstance.constructor.apply(newInstance, [options]);
            return newInstance;
        }
        return undefined;
    };
    return DataSourceController;
}());
