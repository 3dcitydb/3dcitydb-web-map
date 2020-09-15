var FetchResultSet = (function () {
    function FetchResultSet(data) {
        var tmpData = data;
        if (DataSourceUtil.isString(data)) {
            data = JSON.parse(data);
        }
        if (DataSourceUtil.isArrayOfKVPs(data)) {
            this._data = data;
        }
        else {
            this._data = undefined;
        }
    }
    FetchResultSet.prototype.toKVP = function (dataStructureType) {
        var kvpResult = {};
        if (dataStructureType === 0) {
            var row = this.data[0];
            var count = 0;
            for (var k in Object.keys(row)) {
                if (count++ === 0) {
                    continue;
                }
                kvpResult[k] = row[k];
            }
        }
        else {
            for (var i = 0; i < this.data.length; i++) {
                var row = this.data[i];
                var keys = Object.keys(row);
                var attributeName = row[keys[1]];
                var attributeValue = row[keys[2]];
                kvpResult[attributeName] = attributeValue;
            }
        }
        return kvpResult;
    };
    FetchResultSet.prototype.getNrOfRows = function () {
        return this._data.length;
    };
    FetchResultSet.prototype.getNrOfEntries = function () {
        var result = 0;
        for (var row in this._data) {
            result += Object.keys(row).length;
        }
        return result;
    };
    FetchResultSet.prototype.isRectangular = function () {
        if (this.getNrOfRows() === 0) {
            return true;
        }
        var nrOfCols = Object.keys(this._data[0]).length;
        for (var i = 1; i < this.getNrOfRows(); i++) {
            if (Object.keys(this._data[i]).length !== nrOfCols) {
                return false;
            }
        }
        return true;
    };
    FetchResultSet.prototype.getColumnNames = function () {
        if (!this.isRectangular()) {
            return [];
        }
        if (this.getNrOfRows() === 0) {
            return [];
        }
        return Object.keys(this._data[0]);
    };
    Object.defineProperty(FetchResultSet.prototype, "data", {
        get: function () {
            return this._data;
        },
        set: function (value) {
            this._data = value;
        },
        enumerable: false,
        configurable: true
    });
    return FetchResultSet;
}());
