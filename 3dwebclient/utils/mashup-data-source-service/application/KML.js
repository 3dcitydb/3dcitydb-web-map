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
