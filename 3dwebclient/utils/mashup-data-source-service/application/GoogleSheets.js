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
var GoogleSheets = /** @class */ (function (_super) {
    __extends(GoogleSheets, _super);
    function GoogleSheets(signInController, options, gapi) {
        var _this = _super.call(this, signInController, options) || this;
        _this._spreadsheetId = options.uri.replace(/.+?(spreadsheets\/d\/)/, "").replace(/(?=\/edit).+/, "");
        // take the entire first sheet using default name 'Sheet1' if no range is provided
        // more information on the A1 notation:
        // https://developers.google.com/sheets/api/guides/concepts#a1_notation
        _this._ranges = !options.ranges ? (["'Sheet1'"]) : options.ranges;
        _this._apiKey = options.apiKey;
        _this._clientId = !options.clientId ? '' : options.clientId;
        _this._scope = !options.scope ? 'https://www.googleapis.com/auth/spreadsheets' : options.scope;
        _this._gapi = gapi;
        _this._idColName = !options.idColName ? "A" : options.idColName;
        _this._signInController = signInController;
        return _this;
    }
    GoogleSheets.prototype.responseToKvp = function (response) {
        var result = new Map();
        var rows = response.table.rows;
        var cols = response.table.cols;
        if (rows[0] && rows[0].c) {
            // Structure of the JSON response from Google Visualization API
            // https://developers.google.com/chart/interactive/docs/reference#dataparam
            // Ignore the first column (containing ID) --> start i with 1 instead of 0
            if (this.tableType == TableTypes.Horizontal) {
                for (var i = 1; i < rows[0].c.length; i++) {
                    var key = cols[i].label;
                    var value = rows[0].c[i] ? rows[0].c[i].v : undefined;
                    result[key] = value;
                }
            }
            else {
                // one attribute per row
                // only store id once
                // (because the vertical table has multiple lines of the same id)
                // assuming id is in the first column
                // result[this.idColName] = rows[0].c[0].v;
                for (var i = 1; i < rows.length; i++) {
                    // TODO generic implemetation for fields id (c[0]) attribute (c[1]) and value (c[2])
                    var key = rows[i].c[1].v;
                    var value = rows[i].c[2].v;
                    result[key] = value;
                }
            }
        }
        return result;
    };
    // This function is implemented for handling response from Google Sheets API
    GoogleSheets.prototype.responseToKvp_OLD = function (response) {
        // TODO refactor
        var result = new Map();
        // momentarily consider all sheets of this spreadsheet
        // TODO look at this._ranges and find the declared sheets and ranges
        for (var i = 0; i < response.sheets.length; i++) {
            var sheetData = response.sheets[i].data;
            for (var j = 0; j < sheetData.length; j++) {
                var row = sheetData[j].rowData;
                for (var k = 0; k < row.length; k++) {
                    var rowValues = row[k].values;
                    var key = rowValues[0].effectiveValue.stringValue;
                    var value = rowValues[1].effectiveValue.stringValue;
                    result[key] = value;
                }
            }
        }
        return result;
    };
    GoogleSheets.prototype.countFromResult = function (res) {
        return res.getSize();
    };
    GoogleSheets.prototype.deleteDataRecordUsingId = function (id) {
        // TODO
        return null;
    };
    GoogleSheets.prototype.fetchIdsFromResult = function (res) {
        // TODO
        return null;
    };
    GoogleSheets.prototype.insertDataRecord = function (record) {
        // TODO
        return null;
    };
    GoogleSheets.prototype.queryUsingIds = function (ids) {
        // TODO
        return null;
    };
    GoogleSheets.prototype.queryUsingNames = function (names, limit) {
        // TODO
        return null;
    };
    GoogleSheets.prototype.queryUsingId = function (id, callback, limit) {
        this.queryUsingSql("SELECT * WHERE A='" + id + "'", callback, !limit ? Number.MAX_VALUE : limit);
    };
    GoogleSheets.prototype.queryUsingSql = function (sql, callback, limit) {
        // TODO handle limit
        var baseUrl = "https://docs.google.com/spreadsheets/d/";
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                var queryResult = xmlHttp.responseText;
                // The response is in JSON but contains the following string:
                // "/*O_o*/google.visualization.Query.setResponse({status:ok, ...})"
                // https://developers.google.com/chart/interactive/docs/dev/implementing_data_source#jsondatatable
                // The Google Visualization API is used here for querying data from Google Spreadsheets
                // https://developers.google.com/chart/interactive/docs/querylanguage#setting-the-query-in-the-data-source-url
                callback(JSON.parse(queryResult.replace("/*O_o*/", "").replace(/(google\.visualization\.Query\.setResponse\(|\);$)/g, "")));
            }
        };
        xmlHttp.open("GET", baseUrl + this._spreadsheetId + "/gviz/tq?tq=" + encodeURI(sql), true); // true for asynchronous
        xmlHttp.setRequestHeader('Authorization', 'Bearer ' + this._signInController.accessToken);
        xmlHttp.send(null);
    };
    // This function is implemented using gapi
    GoogleSheets.prototype.queryUsingSql_OLD = function (sql, limit, callback) {
        // TODO refactor
        // TODO handle sql query and limit
        var scope = this;
        handleClientLoad(callback);
        function handleClientLoad(callback) {
            scope._gapi.load('client:auth2', initClient);
            function initClient() {
                scope._gapi.client.init({
                    'apiKey': scope._apiKey,
                    'clientId': scope._clientId,
                    'scope': scope._scope,
                    'discoveryDocs': [scope._uri],
                }).then(function () {
                    if (scope._gapi.auth2.getAuthInstance() && scope._gapi.auth2.getAuthInstance().isSignedIn) {
                        // OAuth credentials available
                        scope._gapi.auth2.getAuthInstance().isSignedIn.listen(updateSignInStatus);
                        updateSignInStatus(scope._gapi.auth2.getAuthInstance().isSignedIn.get());
                    }
                    else {
                        // no sign-in required?
                        makeApiCall();
                    }
                });
                function updateSignInStatus(isSignedIn) {
                    if (isSignedIn) {
                        makeApiCall();
                    }
                }
                function makeApiCall() {
                    var params = {
                        // The spreadsheet to request.
                        "spreadsheetId": scope._spreadsheetId,
                        "requests": [
                            {
                                "addFilterView": {
                                    "filter": {
                                        // "filterViewId": 1234567890,
                                        "title": "A Filter",
                                        "range": {
                                            "sheetId": 0,
                                            "startRowIndex": 0,
                                            //"endRowIndex": 5,
                                            "startColumnIndex": 0,
                                        },
                                        // "namedRangeId": string,
                                        // 'sortSpecs': [{
                                        //     'dimensionIndex': 3,
                                        //     'sortOrder': 'ASCENDING'
                                        // }],
                                        "criteria": {
                                            0: {
                                                "condition": {
                                                    "type": "TEXT_EQ",
                                                    "values": [
                                                        {
                                                            "userEnteredValue": "A"
                                                        }
                                                    ]
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        ],
                        "includeSpreadsheetInResponse": true,
                        // "responseRanges": ["'Sheet1'!A1:C5"],
                        "responseIncludeGridData": true
                        // The ranges to retrieve from the spreadsheet.
                        // "ranges": scope._ranges,
                        // True if grid data should be returned.
                        // This parameter is ignored if a field mask was set in the request.
                        // includeGridData: true
                    };
                    var request = scope._gapi.client.sheets.spreadsheets.batchUpdate(params);
                    request.then(function (response) {
                        callback(response.result);
                    }, function (reason) {
                        console.error('error: ' + reason.result.error.message);
                    });
                }
            }
        }
    };
    GoogleSheets.prototype.handleSignInClick = function (event) {
        // TODO consider for OAuth
        this._gapi.auth2.getAuthInstance().signIn();
    };
    GoogleSheets.prototype.handleSignOutClick = function (event) {
        // TODO consider for OAuth
        this._gapi.auth2.getAuthInstance().signOut();
    };
    GoogleSheets.prototype.queryUsingTypes = function (types, limit) {
        // TODO
        return null;
    };
    GoogleSheets.prototype.sumFromResultByColIndex = function (res, colIndex) {
        // TODO
        return null;
    };
    GoogleSheets.prototype.sumFromResultByName = function (res, name) {
        // TODO
        return null;
    };
    GoogleSheets.prototype.updateDataRecordUsingId = function (id, newRecord) {
        // TODO
        return null;
    };
    Object.defineProperty(GoogleSheets.prototype, "spreadsheetId", {
        get: function () {
            return this._spreadsheetId;
        },
        set: function (value) {
            this._spreadsheetId = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GoogleSheets.prototype, "ranges", {
        get: function () {
            return this._ranges;
        },
        set: function (value) {
            this._ranges = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GoogleSheets.prototype, "apiKey", {
        get: function () {
            return this._apiKey;
        },
        set: function (value) {
            this._apiKey = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GoogleSheets.prototype, "clientId", {
        get: function () {
            return this._clientId;
        },
        set: function (value) {
            this._clientId = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GoogleSheets.prototype, "scope", {
        get: function () {
            return this._scope;
        },
        set: function (value) {
            this._scope = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GoogleSheets.prototype, "gapi", {
        get: function () {
            return this._gapi;
        },
        set: function (value) {
            this._gapi = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GoogleSheets.prototype, "signInController", {
        get: function () {
            return this._signInController;
        },
        set: function (value) {
            this._signInController = value;
        },
        enumerable: true,
        configurable: true
    });
    return GoogleSheets;
}(SQLDataSource));
