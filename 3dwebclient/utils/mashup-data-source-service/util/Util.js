var Util = (function () {
    function Util() {
    }
    Util.prototype.convertFetchResultSetToKVPs = function (fetchResultSet, dataStructureType) {
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
            for (var row in fetchResultSet.data) {
                var keys = Object.keys(row);
                var attributeName = row[keys[1]];
                var attributeValue = row[keys[2]];
                kvpResult[attributeName] = attributeValue;
            }
        }
        return kvpResult;
    };
    Util.initAttribute = function (object, attributeName, attributeValue, defaultValue) {
        if (attributeValue == null) {
            object[attributeName] = defaultValue;
        }
        else {
            object[attributeName] = attributeValue;
        }
    };
    Util.isArrayOfKVPs = function (object) {
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
    Util.isKVP = function (object) {
        return Object.keys(object).length > 0;
    };
    Util.isArray = function (object) {
        return Array.isArray(object);
    };
    Util.isString = function (object) {
        return typeof object === "string";
    };
    Util.isNumber = function (object) {
        return typeof object === "number";
    };
    Util.isBoolean = function (object) {
        return typeof object === "boolean";
    };
    return Util;
}());
