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
var DataSource = (function () {
    function DataSource(options) {
        DataSourceUtil.initAttribute(this, "_name", options.name, "My data source name");
        DataSourceUtil.initAttribute(this, "_provider", options.provider, "My data source provider");
        DataSourceUtil.initAttribute(this, "_dataSourceType", options.provider, DataSourceType.PostgreSQL);
        DataSourceUtil.initAttribute(this, "_uri", options.uri, "");
        DataSourceUtil.initAttribute(this, "_capabilities", options.capabilities, undefined);
        DataSourceUtil.initAttribute(this, "_dataStructureType", options.dataStructureType, "Horizontal");
    }
    Object.defineProperty(DataSource.prototype, "name", {
        get: function () {
            return this._name;
        },
        set: function (value) {
            this._name = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DataSource.prototype, "provider", {
        get: function () {
            return this._provider;
        },
        set: function (value) {
            this._provider = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DataSource.prototype, "dataSourceType", {
        get: function () {
            return this._dataSourceType;
        },
        set: function (value) {
            this._dataSourceType = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DataSource.prototype, "uri", {
        get: function () {
            return this._uri;
        },
        set: function (value) {
            this._uri = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DataSource.prototype, "capabilities", {
        get: function () {
            return this._capabilities;
        },
        set: function (value) {
            this._capabilities = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DataSource.prototype, "dataStructureType", {
        get: function () {
            return this._dataStructureType;
        },
        set: function (value) {
            this._dataStructureType = value;
        },
        enumerable: false,
        configurable: true
    });
    return DataSource;
}());
var SQLDataSource = (function (_super) {
    __extends(SQLDataSource, _super);
    function SQLDataSource(options) {
        return _super.call(this, options) || this;
    }
    return SQLDataSource;
}(DataSource));
var GoogleSheets = (function (_super) {
    __extends(GoogleSheets, _super);
    function GoogleSheets(options) {
        var _this = _super.call(this, options) || this;
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
        _this._dataSourceType = DataSourceType.GoogleSheets;
        _this._spreadsheetId = options.uri.replace(/.+?(spreadsheets\/d\/)/, "").replace(/(?=\/edit).+/, "");
        DataSourceUtil.initAttribute(_this, "_a1Notation", options.a1Notation, "A");
        return _this;
    }
    GoogleSheets.prototype.getMetaData = function () {
        var scope = this;
        return new Promise(function (resolve, reject) {
            WebUtil.httpGet(GoogleSheets.apiUrlPrefix + scope._spreadsheetId + "?&fields=sheets.properties").then(function (result) {
                resolve(result);
            }).catch(function (error) {
                reject(error);
            });
        });
    };
    GoogleSheets.prototype.fetchAttributeValuesFromId = function (id) {
        var scope = this;
        return new Promise(function (resolve, reject) {
            var baseUrl = "https://docs.google.com/spreadsheets/d/";
            var sql = "SELECT * WHERE A='" + id + "'";
            WebUtil.httpGet(baseUrl + scope._spreadsheetId + "/gviz/tq?tq=" + encodeURI(sql)).then(function (result) {
                var jsonResult = JSON.parse(result.replace("/*O_o*/", "").replace(/(google\.visualization\.Query\.setResponse\(|\);$)/g, ""));
                var cols = jsonResult.table.cols;
                var rows = jsonResult.table.rows;
                var fetchResultSet = new FetchResultSet([]);
                var keys = [];
                for (var i = 0; i < cols.length; i++) {
                    keys[i] = cols[i].label.split(" ")[0];
                }
                for (var i = 0; i < rows.length; i++) {
                    var kvp = {};
                    for (var j = 0; j < rows[i].c.length; j++) {
                        kvp[keys[j]] = rows[i].c[j] == null ? "" : rows[i].c[j]["v"];
                    }
                    fetchResultSet.push(kvp);
                }
                resolve(fetchResultSet);
            }).catch(function (error) {
                reject(error);
            });
        });
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
    GoogleSheets.apiUrlPrefix = "https://sheets.googleapis.com/v4/spreadsheets/";
    return GoogleSheets;
}(SQLDataSource));
var XMLDataSource = (function (_super) {
    __extends(XMLDataSource, _super);
    function XMLDataSource(options) {
        return _super.call(this, options) || this;
    }
    return XMLDataSource;
}(DataSource));
var KML = (function (_super) {
    __extends(KML, _super);
    function KML(options) {
        var _this = _super.call(this, options) || this;
        var capabilitiesOptions = new DataSourceCapabilities({
            webCapabilities: {
                restAPI: false
            },
            dbTransactionCapabilities: {
                read: true,
                insert: false,
                delete: false,
                update: false
            },
            securityCapabilities: {
                oauth: false
            }
        });
        _this._capabilities = capabilitiesOptions;
        _this._useOwnKmlParser = false;
        return _this;
    }
    KML.prototype.getMetaData = function () {
        return Promise.resolve(undefined);
    };
    Object.defineProperty(KML.prototype, "proxyPrefix", {
        get: function () {
            return this._proxyPrefix;
        },
        set: function (value) {
            this._proxyPrefix = value;
        },
        enumerable: false,
        configurable: true
    });
    KML.prototype.responseToKvp = function (response) {
        if (this._useOwnKmlParser) {
            return this.responseOwnToKvp(response);
        }
        if (this._thirdPartyHandler) {
            switch (this._thirdPartyHandler.type) {
                case "Cesium": {
                    return this.responseCesiumToKvp(response);
                    break;
                }
                default: {
                    return this.responseOwnToKvp(response);
                    break;
                }
            }
        }
    };
    KML.prototype.responseCesiumToKvp = function (response) {
        var result = new Map();
        for (var key in response) {
            if (response[key] && response[key].displayName) {
                result[response[key].displayName] = response[key].value;
            }
            else {
                result[key] = response[key].value;
            }
        }
        return result;
    };
    KML.prototype.responseOwnToKvp = function (response) {
        var result = new Map();
        for (var i = 0; i < response.length; i++) {
            var simpleData = response[i];
            result[simpleData.getAttribute('name')] = simpleData.textContent;
        }
        return result;
    };
    KML.prototype.queryUsingId = function (id, callback, limit, clickedObject) {
        if (this._thirdPartyHandler) {
            switch (this._thirdPartyHandler.type) {
                case "Cesium": {
                    var entities = this._thirdPartyHandler.handler.entities;
                    var entity = entities.getById(id);
                    var extendedData = entity.kml.extendedData;
                    if (typeof extendedData === "undefined"
                        || (Object.keys(extendedData).length === 0 && extendedData.constructor === Object)) {
                        this.queryUsingIdCustom(id, callback, limit, clickedObject);
                    }
                    else {
                        callback(extendedData);
                    }
                    break;
                }
                default: {
                    callback(null);
                    break;
                }
            }
        }
        else {
            this.queryUsingIdCustom(id, callback);
        }
    };
    KML.prototype.queryUsingIdCustom = function (id, callback, limit, clickedObject) {
        this._useOwnKmlParser = true;
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var xmlParser = new DOMParser();
                var xmlDoc = xmlParser.parseFromString(xhttp.responseText, "text/xml");
                var placemark = xmlDoc.getElementById(id);
                if (placemark == null) {
                    var placemarkNameSearch = clickedObject._name;
                    var placemarks = xmlDoc.getElementsByTagName("Placemark");
                    for (var i = 0; i < placemarks.length; i++) {
                        var iPlacemark = placemarks[i];
                        var placemarkName = iPlacemark.getElementsByTagName("name")[0];
                        if (placemarkName != null && placemarkName.textContent === placemarkNameSearch) {
                            placemark = iPlacemark;
                            break;
                        }
                    }
                }
                var extendedData = placemark.getElementsByTagName('ExtendedData')[0];
                var schemaData = extendedData.getElementsByTagName('SchemaData')[0];
                var simpleDataList = schemaData.getElementsByTagName('SimpleData');
                callback(simpleDataList);
            }
        };
        xhttp.open("GET", (this._uri.indexOf(this._proxyPrefix) >= 0 ? "" : this._proxyPrefix) + this._uri, true);
        xhttp.send();
    };
    Object.defineProperty(KML.prototype, "useOwnKmlParser", {
        get: function () {
            return this._useOwnKmlParser;
        },
        set: function (value) {
            this._useOwnKmlParser = value;
        },
        enumerable: false,
        configurable: true
    });
    KML.prototype.aggregateByIds = function (ids, aggregateOperator, attributeName) {
        return Promise.resolve(undefined);
    };
    KML.prototype.deleteAttributeOfId = function (id, attributeName) {
        return Promise.resolve(false);
    };
    KML.prototype.deleteAttributesUsingQBE = function (qbe, attributeNames) {
        return Promise.resolve(false);
    };
    KML.prototype.deleteObjectOfId = function (id) {
        return Promise.resolve(false);
    };
    KML.prototype.deleteObjectsUsingQBE = function (qbe) {
        return Promise.resolve(false);
    };
    KML.prototype.fetchAttributeNamesFromId = function (id) {
        return Promise.resolve([]);
    };
    KML.prototype.fetchAttributeValuesFromId = function (id) {
        return Promise.resolve(undefined);
    };
    KML.prototype.fetchIdsFromQBE = function (qbe, limit) {
        return Promise.resolve([]);
    };
    KML.prototype.insertAttributeOfId = function (id, attributeName, attributeValue) {
        return Promise.resolve(false);
    };
    KML.prototype.insertAttributesUsingQBE = function (qbe, newAttributes) {
        return Promise.resolve(false);
    };
    KML.prototype.insertNewObject = function (kvp) {
        return Promise.resolve(false);
    };
    KML.prototype.updateAttributeValueOfId = function (id, attributeName, newValue) {
        return Promise.resolve(false);
    };
    KML.prototype.updateAttributeValuesUsingQBE = function (qbe, newAttributeValues) {
        return Promise.resolve(false);
    };
    return KML;
}(XMLDataSource));
var PostgreSQL = (function (_super) {
    __extends(PostgreSQL, _super);
    function PostgreSQL(options) {
        var _this = _super.call(this, options) || this;
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
        _this._dataSourceType = DataSourceType.PostgreSQL;
        DataSourceUtil.initAttribute(_this, "_idColName", options.idColName, "gmlid");
        return _this;
    }
    PostgreSQL.prototype.getMetaData = function () {
        return Promise.resolve(undefined);
    };
    PostgreSQL.prototype.aggregateByIds = function (ids, aggregateOperator, attributeName) {
        return Promise.resolve(0);
    };
    PostgreSQL.prototype.deleteAttributeOfId = function (id, attributeName) {
        return Promise.resolve(false);
    };
    PostgreSQL.prototype.deleteAttributesUsingQBE = function (qbe, attributeNames) {
        return Promise.resolve(false);
    };
    PostgreSQL.prototype.deleteObjectOfId = function (id) {
        return Promise.resolve(false);
    };
    PostgreSQL.prototype.deleteObjectsUsingQBE = function (qbe) {
        return Promise.resolve(false);
    };
    PostgreSQL.prototype.fetchAttributeNamesFromId = function (id) {
        return Promise.resolve([]);
    };
    PostgreSQL.prototype.fetchAttributeValuesFromId = function (id) {
        var scope = this;
        return new Promise(function (resolve, reject) {
            WebUtil.httpGet(scope._uri + "?" + scope._idColName + "=eq." + id).then(function (result) {
                var fetchResultSet = new FetchResultSet(result);
                resolve(fetchResultSet);
            }).catch(function (error) {
                reject(error);
            });
        });
    };
    PostgreSQL.prototype.fetchIdsFromQBE = function (qbe, limit) {
        return Promise.resolve([]);
    };
    PostgreSQL.prototype.insertAttributeOfId = function (id, attributeName, attributeValue) {
        return Promise.resolve(false);
    };
    PostgreSQL.prototype.insertAttributesUsingQBE = function (qbe, newAttributes) {
        return Promise.resolve(false);
    };
    PostgreSQL.prototype.insertNewObject = function (kvp) {
        return Promise.resolve(false);
    };
    PostgreSQL.prototype.updateAttributeValueOfId = function (id, attributeName, newValue) {
        return Promise.resolve(false);
    };
    PostgreSQL.prototype.updateAttributeValuesUsingQBE = function (qbe, newAttributeValues) {
        return Promise.resolve(false);
    };
    return PostgreSQL;
}(SQLDataSource));
var DataSourceType;
(function (DataSourceType) {
    DataSourceType["GoogleSheets"] = "GoogleSheets";
    DataSourceType["PostgreSQL"] = "PostgreSQL";
    DataSourceType["KML"] = "KML";
})(DataSourceType || (DataSourceType = {}));
var DataGaga = (function () {
    function DataGaga() {
    }
    DataGaga.createDataSource = function (dataSourceType, options) {
        if (dataSourceType != null) {
            var newInstance = Object.create(window[dataSourceType].prototype);
            newInstance.constructor.apply(newInstance, [options]);
            return newInstance;
        }
        return undefined;
    };
    return DataGaga;
}());
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
    FetchResultSet.prototype.push = function (kvp) {
        this._data.push(kvp);
    };
    FetchResultSet.prototype.remove = function (index) {
        this._data.splice(index, 1);
    };
    FetchResultSet.prototype.toKVP = function (dataStructureType) {
        var kvpResult = {};
        if (dataStructureType == "Horizontal") {
            var row = this.data[0];
            var count = 0;
            for (var k in row) {
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
var MashupDataSource = (function (_super) {
    __extends(MashupDataSource, _super);
    function MashupDataSource() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(MashupDataSource.prototype, "mashupDataSources", {
        get: function () {
            return this._mashupDataSources;
        },
        set: function (value) {
            this._mashupDataSources = value;
        },
        enumerable: false,
        configurable: true
    });
    return MashupDataSource;
}(DataSource));
var DataSourceCapabilities = (function () {
    function DataSourceCapabilities(options) {
        this._webCapabilities = options.webCapabilities;
        this._dbTransactionCapabilities = options.dbTransactionCapabilities;
        this._securityCapabilities = options.securityCapabilities;
    }
    Object.defineProperty(DataSourceCapabilities.prototype, "webCapabilities", {
        get: function () {
            return this._webCapabilities;
        },
        set: function (value) {
            this._webCapabilities = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DataSourceCapabilities.prototype, "dbTransactionCapabilities", {
        get: function () {
            return this._dbTransactionCapabilities;
        },
        set: function (value) {
            this._dbTransactionCapabilities = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DataSourceCapabilities.prototype, "securityCapabilities", {
        get: function () {
            return this._securityCapabilities;
        },
        set: function (value) {
            this._securityCapabilities = value;
        },
        enumerable: false,
        configurable: true
    });
    return DataSourceCapabilities;
}());
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
var WebUtil = (function () {
    function WebUtil() {
    }
    WebUtil.httpGet = function (url) {
        return new Promise(function (resolve, reject) {
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.open("GET", url, true);
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
                    resolve(xmlHttp.responseText);
                }
            };
            xmlHttp.onerror = function () {
                reject({
                    status: xmlHttp.status,
                    statusText: xmlHttp.statusText
                });
            };
            xmlHttp.send(null);
        });
    };
    return WebUtil;
}());
