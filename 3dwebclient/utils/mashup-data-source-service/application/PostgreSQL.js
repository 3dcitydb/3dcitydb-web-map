// import * as request from "request-promise-native";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var PostgreSQL = /** @class */ (function (_super) {
    __extends(PostgreSQL, _super);
    function PostgreSQL(options) {
        var _this = _super.call(this, options) || this;
        _this._idColName = !options.idColName ? "gmlid" : options.idColName;
        return _this;
    }
    PostgreSQL.prototype.responseToKvp = function (response) {
        // TODO test with PostgREST
        // response is just a text -> parse to JSON
        var responseJson = JSON.parse(response);
        var result = new Map();
        if (this.tableType == TableTypes.Horizontal) {
            // all attributes per object are stored in one row
            for (var i = 0; i < responseJson.length; i++) {
                var ele = responseJson[i];
                for (var key in ele) {
                    result[key] = ele[key];
                }
            }
        }
        else {
            // one attribute per row
            // only store id once
            // (because the vertical table has multiple lines of the same id)
            // result[this.idColName] = responseJson[0][this.idColName];
            for (var i = 0; i < responseJson.length; i++) {
                var ele = responseJson[i];
                // TODO generic implementation for attribute and value
                result[ele.attribute] = ele.value;
            }
        }
        return result;
    };
    PostgreSQL.prototype.countFromResult = function (res) {
        return res.getSize();
    };
    PostgreSQL.prototype.deleteDataRecordUsingId = function (id) {
        // TODO
        return null;
    };
    PostgreSQL.prototype.fetchIdsFromResult = function (res) {
        // TODO
        return null;
    };
    PostgreSQL.prototype.insertDataRecord = function (record) {
        // TODO
        return null;
    };
    PostgreSQL.prototype.queryUsingIds = function (ids) {
        // TODO
        return null;
    };
    PostgreSQL.prototype.queryUsingNames = function (names, limit) {
        // TODO
        return null;
    };
    PostgreSQL.prototype.queryUsingId = function (id, callback, limit) {
        // TODO use column number instead of column name (such as gmlid here)
        this.queryUsingSql("?" + this.idColName + "=eq." + id, callback, !limit ? Number.MAX_VALUE : limit);
    };
    PostgreSQL.prototype.queryUsingSql = function (sql, callback, limit) {
        // TODO handle limit
        var baseUrl = this._uri;
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                var queryResult = xmlHttp.responseText;
                callback(queryResult);
            }
        };
        xmlHttp.open("GET", baseUrl + sql, true); // true for asynchronous
        xmlHttp.send(null);
    };
    PostgreSQL.prototype.queryUsingTypes = function (types, limit) {
        // TODO
        return null;
    };
    PostgreSQL.prototype.sumFromResultByColIndex = function (res, colIndex) {
        // TODO
        return null;
    };
    PostgreSQL.prototype.sumFromResultByName = function (res, name) {
        // TODO
        return null;
    };
    PostgreSQL.prototype.updateDataRecordUsingId = function (id, newRecord) {
        // TODO
        return null;
    };
    return PostgreSQL;
}(SQLDataSource));
