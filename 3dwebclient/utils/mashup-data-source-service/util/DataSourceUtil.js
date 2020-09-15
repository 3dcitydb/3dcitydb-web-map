var DataSourceUtil = (function () {
    function DataSourceUtil() {
    }
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
