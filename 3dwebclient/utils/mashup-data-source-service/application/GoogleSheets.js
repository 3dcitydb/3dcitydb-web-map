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
var GoogleSheets = (function (_super) {
    __extends(GoogleSheets, _super);
    function GoogleSheets(signInController, options, gapi) {
        var _this = _super.call(this, options) || this;
        _this._signInController = signInController;
        var capabilitiesOptions = new DataSourceCapabilities({
            webCapabilities: {
                restAPI: true
            },
            dbTransactionCapabilities: {
                read: true,
                insert: true,
                delete: true,
                update: true
            },
            securityCapabilities: {
                oauth: true
            }
        });
        _this._capabilities = capabilitiesOptions;
        _this._spreadsheetId = options.uri.replace(/.+?(spreadsheets\/d\/)/, "").replace(/(?=\/edit).+/, "");
        _this._ranges = !options.ranges ? (["'Sheet1'"]) : options.ranges;
        _this._apiKey = options.apiKey;
        _this._clientId = !options.clientId ? '' : options.clientId;
        _this._scope = !options.scope ? 'https://www.googleapis.com/auth/spreadsheets' : options.scope;
        _this._gapi = gapi;
        _this._idColName = !options.idColName ? "A" : options.idColName;
        _this._signInController = signInController;
        return _this;
    }
    GoogleSheets.prototype.fetchAttributeValuesFromId = function (id) {
        throw new Error("Method not implemented.");
    };
    GoogleSheets.prototype.fetchAttributeNamesFromId = function (id) {
        throw new Error("Method not implemented.");
    };
    GoogleSheets.prototype.fetchIdsFromQBE = function (qbe, limit) {
        throw new Error("Method not implemented.");
    };
    GoogleSheets.prototype.aggregateByIds = function (ids, aggregateOperator, attributeName) {
        return Promise.resolve(0);
    };
    GoogleSheets.prototype.responseToKvp = function (response) {
        var result = new Map();
        var rows = response.table.rows;
        var cols = response.table.cols;
        if (rows[0] && rows[0].c) {
            if (this.dataStructureType == 0) {
                for (var i = 1; i < rows[0].c.length; i++) {
                    var key = cols[i].label;
                    var value = rows[0].c[i] ? rows[0].c[i].v : undefined;
                    result[key] = value;
                }
            }
            else {
                for (var i = 1; i < rows.length; i++) {
                    var key = rows[i].c[1].v;
                    var value = rows[i].c[2].v;
                    result[key] = value;
                }
            }
        }
        return result;
    };
    GoogleSheets.prototype.responseToKvp_OLD = function (response) {
        var result = new Map();
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
    GoogleSheets.prototype.queryUsingId = function (id, callback, limit, clickedObject) {
        this.queryUsingSql("SELECT * WHERE A='" + id + "'", callback, !limit ? Number.MAX_VALUE : limit, clickedObject);
    };
    GoogleSheets.prototype.queryUsingSql = function (sql, callback, limit, clickedObject) {
        var baseUrl = "https://docs.google.com/spreadsheets/d/";
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                var queryResult = xmlHttp.responseText;
                callback(JSON.parse(queryResult.replace("/*O_o*/", "").replace(/(google\.visualization\.Query\.setResponse\(|\);$)/g, "")));
            }
        };
        xmlHttp.open("GET", baseUrl + this._spreadsheetId + "/gviz/tq?tq=" + encodeURI(sql), true);
        if (this._signInController != null) {
            xmlHttp.setRequestHeader('Authorization', 'Bearer ' + this._signInController.accessToken);
        }
        xmlHttp.send(null);
    };
    GoogleSheets.prototype.queryUsingSql_OLD = function (sql, limit, callback) {
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
                        scope._gapi.auth2.getAuthInstance().isSignedIn.listen(updateSignInStatus);
                        updateSignInStatus(scope._gapi.auth2.getAuthInstance().isSignedIn.get());
                    }
                    else {
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
                        "spreadsheetId": scope._spreadsheetId,
                        "requests": [
                            {
                                "addFilterView": {
                                    "filter": {
                                        "title": "A Filter",
                                        "range": {
                                            "sheetId": 0,
                                            "startRowIndex": 0,
                                            "startColumnIndex": 0,
                                        },
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
                        "responseIncludeGridData": true
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
    Object.defineProperty(GoogleSheets.prototype, "spreadsheetId", {
        get: function () {
            return this._spreadsheetId;
        },
        set: function (value) {
            this._spreadsheetId = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GoogleSheets.prototype, "ranges", {
        get: function () {
            return this._ranges;
        },
        set: function (value) {
            this._ranges = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GoogleSheets.prototype, "apiKey", {
        get: function () {
            return this._apiKey;
        },
        set: function (value) {
            this._apiKey = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GoogleSheets.prototype, "clientId", {
        get: function () {
            return this._clientId;
        },
        set: function (value) {
            this._clientId = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GoogleSheets.prototype, "scope", {
        get: function () {
            return this._scope;
        },
        set: function (value) {
            this._scope = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GoogleSheets.prototype, "gapi", {
        get: function () {
            return this._gapi;
        },
        set: function (value) {
            this._gapi = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GoogleSheets.prototype, "signInController", {
        get: function () {
            return this._signInController;
        },
        set: function (value) {
            this._signInController = value;
        },
        enumerable: false,
        configurable: true
    });
    GoogleSheets.prototype.deleteAttributeOfId = function (id, attributeName) {
        return Promise.resolve(false);
    };
    GoogleSheets.prototype.deleteAttributesUsingQBE = function (qbe, attributeNames) {
        return Promise.resolve(false);
    };
    GoogleSheets.prototype.deleteObjectOfId = function (id) {
        return Promise.resolve(false);
    };
    GoogleSheets.prototype.deleteObjectsUsingQBE = function (qbe) {
        return Promise.resolve(false);
    };
    GoogleSheets.prototype.insertAttributeOfId = function (id, attributeName, attributeValue) {
        return Promise.resolve(false);
    };
    GoogleSheets.prototype.insertAttributesUsingQBE = function (qbe, newAttributes) {
        return Promise.resolve(false);
    };
    GoogleSheets.prototype.insertNewObject = function (kvp) {
        return Promise.resolve(false);
    };
    GoogleSheets.prototype.login = function (credentials) {
        return Promise.resolve(false);
    };
    GoogleSheets.prototype.logout = function () {
        return Promise.resolve(false);
    };
    GoogleSheets.prototype.updateAttributeValueOfId = function (id, attributeName, newValue) {
        return Promise.resolve(false);
    };
    GoogleSheets.prototype.updateAttributeValuesUsingQBE = function (qbe, newAttributeValues) {
        return Promise.resolve(false);
    };
    return GoogleSheets;
}(SQLDataSource));
