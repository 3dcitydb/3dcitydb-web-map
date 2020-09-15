var DataSourceUtil = (function () {
    function DataSourceUtil() {
    }
    DataSourceUtil.convertFetchResultSetToKVPs = function (fetchResultSet, dataStructureType) {
        var kvpResult = {};
        if (dataStructureType === 0) {
            var row = fetchResultSet.data[0];
            var count = 0;
            for (var k in Object.keys(row)) {
                if (count++ === 0) {
                    continue;
                }
                kvpResult[k] = row[k];
            }
        }
        else {
            for (var i = 0; i < fetchResultSet.data.length; i++) {
                var row = fetchResultSet.data[i];
                var keys = Object.keys(row);
                var attributeName = row[keys[1]];
                var attributeValue = row[keys[2]];
                kvpResult[attributeName] = attributeValue;
            }
        }
        return kvpResult;
    };
    DataSourceUtil.initAttribute = function (object, attributeName, attributeValue, defaultValue) {
        if (attributeValue == null) {
            object[attributeName] = defaultValue;
        }
        else {
            object[attributeName] = attributeValue;
        }
    };
    DataSourceUtil.isArrayOfKVPs = function (object) {
        if (this.isArray(object)) {
            for (var i in object) {
                if (!this.isKVP(i)) {
                    return false;
                }
            }
            return true;
        }
        else {
            return false;
        }
    };
    DataSourceUtil.isKVP = function (object) {
        return Object.keys(object).length > 0;
    };
    DataSourceUtil.isArray = function (object) {
        return Array.isArray(object);
    };
    DataSourceUtil.isString = function (object) {
        return typeof object === "string";
    };
    DataSourceUtil.isNumber = function (object) {
        return typeof object === "number";
    };
    DataSourceUtil.isBoolean = function (object) {
        return typeof object === "boolean";
    };
    return DataSourceUtil;
}());
