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
    return DataSource;
}());
var SQLDataSource = (function (_super) {
    __extends(SQLDataSource, _super);
    function SQLDataSource(options) {
        var _this = _super.call(this, options) || this;
        DataSourceUtil.initAttribute(_this, "_dataStructureType", options.dataStructureType, "Horizontal");
        return _this;
    }
    Object.defineProperty(SQLDataSource.prototype, "dataStructureType", {
        get: function () {
            return this._dataStructureType;
        },
        set: function (value) {
            this._dataStructureType = value;
        },
        enumerable: false,
        configurable: true
    });
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
    GoogleSheets.prototype.fetchIdsFromQBEs = function (qbes, limit) {
        throw new Error("Method not implemented.");
    };
    GoogleSheets.prototype.aggregateByIds = function (ids, aggregateOperator, attributeName) {
        throw new Error("Method not implemented.");
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
        throw new Error("Method not implemented.");
    };
    GoogleSheets.prototype.deleteAttributesUsingQBE = function (qbe, attributeNames) {
        throw new Error("Method not implemented.");
    };
    GoogleSheets.prototype.deleteObjectOfId = function (id) {
        throw new Error("Method not implemented.");
    };
    GoogleSheets.prototype.deleteObjectsUsingQBE = function (qbe) {
        throw new Error("Method not implemented.");
    };
    GoogleSheets.prototype.insertAttributeOfId = function (id, attributeName, attributeValue) {
        throw new Error("Method not implemented.");
    };
    GoogleSheets.prototype.insertAttributesUsingQBE = function (qbe, newAttributes) {
        throw new Error("Method not implemented.");
    };
    GoogleSheets.prototype.insertNewObject = function (kvp) {
        throw new Error("Method not implemented.");
    };
    GoogleSheets.prototype.login = function (credentials) {
        throw new Error("Method not implemented.");
    };
    GoogleSheets.prototype.logout = function () {
        throw new Error("Method not implemented.");
    };
    GoogleSheets.prototype.updateAttributeValueOfId = function (id, attributeName, newValue) {
        throw new Error("Method not implemented.");
    };
    GoogleSheets.prototype.updateAttributeValuesUsingQBE = function (qbe, newAttributeValues) {
        throw new Error("Method not implemented.");
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
        _this.proxyPrefix = options.proxyPrefix;
        return _this;
    }
    KML.prototype.getMetaData = function () {
        throw new Error("Method not implemented.");
    };
    KML.prototype.aggregateByIds = function (ids, aggregateOperator, attributeName) {
        throw new Error("Method not implemented.");
    };
    KML.prototype.fetchAttributeNamesFromId = function (id) {
        throw new Error("Method not implemented.");
    };
    KML.prototype.fetchAttributeValuesFromId = function (id) {
        var scope = this;
        return new Promise(function (resolve, reject) {
            WebUtil.httpGet((scope._uri.indexOf(scope.proxyPrefix) >= 0 ? "" : scope.proxyPrefix) + scope._uri).then(function (result) {
                var xmlParser = new DOMParser();
                var xmlDoc = xmlParser.parseFromString(result, "text/xml");
                var placemark = xmlDoc.getElementById(id);
                if (placemark == null) {
                    reject("KML Placemark with ID = " + id + " does not exist!");
                    return;
                }
                var extendedData = placemark.getElementsByTagName('ExtendedData')[0];
                var schemaData = extendedData.getElementsByTagName('SchemaData')[0];
                var simpleDataList = schemaData.getElementsByTagName('SimpleData');
                var array = [];
                var kvp = {};
                kvp["id"] = id;
                for (var i = 0; i < simpleDataList.length; i++) {
                    var key = simpleDataList[i].getAttribute("name");
                    var value = simpleDataList[i].textContent;
                    kvp[key] = value;
                }
                array.push(kvp);
                var fetchResultSet = new FetchResultSet(array);
                resolve(fetchResultSet);
            }).catch(function (error) {
                reject(error);
            });
        });
    };
    KML.prototype.fetchAttributeValuesFromName = function (name) {
        var scope = this;
        return new Promise(function (resolve, reject) {
            WebUtil.httpGet((scope._uri.indexOf(scope.proxyPrefix) >= 0 ? "" : scope.proxyPrefix) + scope._uri).then(function (result) {
                var xmlParser = new DOMParser();
                var xmlDoc = xmlParser.parseFromString(result, "text/xml");
                var placemarks = xmlDoc.getElementsByTagName("Placemark");
                for (var i = 0; i < placemarks.length; i++) {
                    var iPlacemark = placemarks[i];
                    var placemarkName = iPlacemark.getElementsByTagName("name")[0];
                    if (placemarkName.textContent === name) {
                        var extendedData = iPlacemark.getElementsByTagName('ExtendedData')[0];
                        var schemaData = extendedData.getElementsByTagName('SchemaData')[0];
                        var simpleDataList = schemaData.getElementsByTagName('SimpleData');
                        var array = [];
                        var kvp = {};
                        kvp["id"] = name;
                        for (var i_1 = 0; i_1 < simpleDataList.length; i_1++) {
                            var key = simpleDataList[i_1].getAttribute("name");
                            var value = simpleDataList[i_1].textContent;
                            kvp[key] = value;
                        }
                        array.push(kvp);
                        var fetchResultSet = new FetchResultSet(array);
                        resolve(fetchResultSet);
                    }
                }
            }).catch(function (error) {
                reject(error);
            });
        });
    };
    KML.prototype.fetchIdsFromQBE = function (qbe, limit) {
        var scope = this;
        if (limit == null) {
            limit = Number.MAX_VALUE;
        }
        return new Promise(function (resolve, reject) {
            WebUtil.httpGet((scope._uri.indexOf(scope.proxyPrefix) >= 0 ? "" : scope.proxyPrefix) + scope._uri).then(function (result) {
                var xmlParser = new DOMParser();
                var xmlDoc = xmlParser.parseFromString(result, "text/xml");
                var array = new Set();
                var count = 0;
                var placemarks = xmlDoc.getElementsByTagName("Placemark");
                switch (qbe.attributeName) {
                    case "id":
                        array = new Set();
                        count = 0;
                        if (++count <= limit) {
                            array.add(qbe.value);
                        }
                        resolve(array);
                        break;
                    case "name":
                        array = new Set();
                        count = 0;
                        for (var i = 0; i < placemarks.length; i++) {
                            var iPlacemark = placemarks[i];
                            var placemarkName = iPlacemark.getElementsByTagName("name")[0];
                            if (placemarkName != null && qbe.assert(placemarkName.textContent)) {
                                if (++count <= limit) {
                                    var tmpId = iPlacemark.getAttribute("id");
                                    if (tmpId == null) {
                                        tmpId = iPlacemark.getElementsByTagName("name")[0].textContent;
                                    }
                                    array.add(tmpId);
                                }
                            }
                        }
                        resolve(array);
                        break;
                    case "visibility":
                        array = new Set();
                        count = 0;
                        for (var i = 0; i < placemarks.length; i++) {
                            var iPlacemark = placemarks[i];
                            var placemarkVisibility = iPlacemark.getElementsByTagName("visibility")[0];
                            if (placemarkVisibility != null && qbe.assert(placemarkVisibility.textContent)) {
                                if (++count <= limit) {
                                    var tmpId = iPlacemark.getAttribute("id");
                                    if (tmpId == null) {
                                        tmpId = iPlacemark.getElementsByTagName("name")[0].textContent;
                                    }
                                    array.add(tmpId);
                                }
                            }
                        }
                        resolve(array);
                        break;
                    case "simpledata_name":
                        array = new Set();
                        count = 0;
                        for (var i = 0; i < placemarks.length; i++) {
                            var iPlacemark = placemarks[i];
                            var extendedData = iPlacemark.getElementsByTagName('ExtendedData')[0];
                            var schemaData = extendedData.getElementsByTagName('SchemaData')[0];
                            var simpleDataList = schemaData.getElementsByTagName('SimpleData');
                            for (var i_2 = 0; i_2 < simpleDataList.length; i_2++) {
                                var key = simpleDataList[i_2].getAttribute("name");
                                if (qbe.assert(key)) {
                                    if (++count <= limit) {
                                        var tmpId = iPlacemark.getAttribute("id");
                                        if (tmpId == null) {
                                            tmpId = iPlacemark.getElementsByTagName("name")[0].textContent;
                                        }
                                        array.add(tmpId);
                                    }
                                    break;
                                }
                            }
                        }
                        resolve(array);
                        break;
                    case "simpledata_value":
                        array = new Set();
                        count = 0;
                        for (var i = 0; i < placemarks.length; i++) {
                            var iPlacemark = placemarks[i];
                            var extendedData = iPlacemark.getElementsByTagName('ExtendedData')[0];
                            var schemaData = extendedData.getElementsByTagName('SchemaData')[0];
                            var simpleDataList = schemaData.getElementsByTagName('SimpleData');
                            for (var i_3 = 0; i_3 < simpleDataList.length; i_3++) {
                                var value = simpleDataList[i_3].textContent;
                                if (qbe.assert(value)) {
                                    if (++count <= limit) {
                                        var tmpId = iPlacemark.getAttribute("id");
                                        if (tmpId == null) {
                                            tmpId = iPlacemark.getElementsByTagName("name")[0].textContent;
                                        }
                                        array.add(tmpId);
                                    }
                                    break;
                                }
                            }
                        }
                        resolve(array);
                        break;
                    default:
                        reject("Could not assert " + qbe.toString() + ".");
                }
                reject("Could not assert " + qbe.toString() + ".");
            }).catch(function (error) {
                reject(error);
            });
        });
    };
    KML.prototype.fetchIdsFromQBEs = function (qbes, limit) {
        var scope = this;
        if (limit == null) {
            limit = Number.MAX_VALUE;
        }
        return new Promise(function (resolve, reject) {
            var array = new Set();
            for (var _i = 0, qbes_1 = qbes; _i < qbes_1.length; _i++) {
                var qbe = qbes_1[_i];
                scope.fetchIdsFromQBE(qbe).then(function (result) {
                    result.forEach(array.add, array);
                }).catch(function (error) {
                    reject(error);
                });
            }
            resolve(new Set(array));
        });
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
        throw new Error("Method not implemented.");
    };
    PostgreSQL.prototype.aggregateByIds = function (ids, aggregateOperator, attributeName) {
        throw new Error("Method not implemented.");
    };
    PostgreSQL.prototype.deleteAttributeOfId = function (id, attributeName) {
        throw new Error("Method not implemented.");
    };
    PostgreSQL.prototype.deleteAttributesUsingQBE = function (qbe, attributeNames) {
        throw new Error("Method not implemented.");
    };
    PostgreSQL.prototype.deleteObjectOfId = function (id) {
        throw new Error("Method not implemented.");
    };
    PostgreSQL.prototype.deleteObjectsUsingQBE = function (qbe) {
        throw new Error("Method not implemented.");
    };
    PostgreSQL.prototype.fetchAttributeNamesFromId = function (id) {
        throw new Error("Method not implemented.");
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
        throw new Error("Method not implemented.");
    };
    PostgreSQL.prototype.fetchIdsFromQBEs = function (qbes, limit) {
        throw new Error("Method not implemented.");
    };
    PostgreSQL.prototype.insertAttributeOfId = function (id, attributeName, attributeValue) {
        throw new Error("Method not implemented.");
    };
    PostgreSQL.prototype.insertAttributesUsingQBE = function (qbe, newAttributes) {
        throw new Error("Method not implemented.");
    };
    PostgreSQL.prototype.insertNewObject = function (kvp) {
        throw new Error("Method not implemented.");
    };
    PostgreSQL.prototype.updateAttributeValueOfId = function (id, attributeName, newValue) {
        throw new Error("Method not implemented.");
    };
    PostgreSQL.prototype.updateAttributeValuesUsingQBE = function (qbe, newAttributeValues) {
        throw new Error("Method not implemented.");
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
        if (dataStructureType == "Horizontal" || this._data.length === 1) {
            var row = this._data[0];
            var count = 0;
            for (var k in row) {
                if (count++ === 0) {
                    continue;
                }
                kvpResult[k] = row[k];
            }
        }
        else {
            for (var i = 0; i < this._data.length; i++) {
                var row = this._data[i];
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
var QBE = (function () {
    function QBE(attributeName, comparisonOperator, value) {
        this._attributeName = attributeName;
        this._comparisonOperator = comparisonOperator;
        this._value = value;
    }
    QBE.prototype.assert = function (value, caseSensitive) {
        var otherNumValue = Number(value);
        var thisNumValue = Number(this._value);
        if (!isNaN(thisNumValue) && !isNaN(otherNumValue)) {
            switch (this._comparisonOperator) {
                case "==":
                    return otherNumValue == thisNumValue;
                case ">":
                    return otherNumValue > thisNumValue;
                case ">=":
                    return otherNumValue >= thisNumValue;
                case "<":
                    return otherNumValue < thisNumValue;
                case "<=":
                    return otherNumValue <= thisNumValue;
                default:
                    return false;
            }
        }
        else {
            var otherTextValue = value;
            var thisTextValue = this._value;
            if (caseSensitive != null && caseSensitive) {
                otherTextValue = value.toLowerCase();
                thisTextValue = this._value.toLowerCase();
            }
            switch (this._comparisonOperator) {
                case "==":
                    return otherTextValue.localeCompare(thisTextValue) === 0;
                case ">":
                    return otherTextValue.localeCompare(thisTextValue) > 0;
                case ">=":
                    return otherTextValue.localeCompare(thisTextValue) >= 0;
                case "<":
                    return otherTextValue.localeCompare(thisTextValue) < 0;
                case "<=":
                    return otherTextValue.localeCompare(thisTextValue) <= 0;
                default:
                    return false;
            }
        }
    };
    QBE.prototype.toJSON = function () {
        var result = {};
        result["attributeName"] = this._attributeName;
        result["comparisonOperator"] = this._comparisonOperator;
        result["value"] = this._value;
        return result;
    };
    QBE.prototype.toString = function () {
        return this.toJSON().toString();
    };
    Object.defineProperty(QBE.prototype, "attributeName", {
        get: function () {
            return this._attributeName;
        },
        set: function (value) {
            this._attributeName = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(QBE.prototype, "comparisonOperator", {
        get: function () {
            return this._comparisonOperator;
        },
        set: function (value) {
            this._comparisonOperator = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(QBE.prototype, "value", {
        get: function () {
            return this._value;
        },
        set: function (value) {
            this._value = value;
        },
        enumerable: false,
        configurable: true
    });
    return QBE;
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
