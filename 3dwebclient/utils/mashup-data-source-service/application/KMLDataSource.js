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
var KMLDataSource = /** @class */ (function (_super) {
    __extends(KMLDataSource, _super);
    function KMLDataSource(signInController, options) {
        var _this = _super.call(this, signInController, options) || this;
        _this._useOwnKmlParser = false;
        return _this;
    }
    KMLDataSource.prototype.responseToKvp = function (response) {
        if (this._useOwnKmlParser) {
            return this.responseOwnToKvp(response);
        }
        if (this._thirdPartyHandler) {
            switch (this._thirdPartyHandler.type) {
                case ThirdPartyHandler.Cesium: {
                    // the handler is Cesium.KMLDataSource
                    return this.responseCesiumToKvp(response);
                    break;
                }
                default: {
                    // no valid handler found
                    return this.responseOwnToKvp(response);
                    break;
                }
            }
        }
    };
    KMLDataSource.prototype.responseCesiumToKvp = function (response) {
        // response is a list of JSON elements
        // only support Data https://cesium.com/docs/cesiumjs-ref-doc/KmlFeatureData.html
        var result = new Map();
        /*  <Data name="">
                <displayName></displayName>
                <value></value>
            </Data
         */
        for (var key in response) {
            // if no displayName is available -> use attribute name instead
            if (response[key] && response[key].displayName) {
                result[response[key].displayName] = response[key].value;
            }
            else {
                result[key] = response[key].value;
            }
        }
        return result;
    };
    KMLDataSource.prototype.responseOwnToKvp = function (response) {
        // response is a list of XML DOM element
        var result = new Map();
        /* read extended data, only works for the following structure
        <ExtendedData>
            <SchemaData schemaUrl="#some_schema">
                <SimpleData name="A">Text</SimpleData>
                <SimpleData name="B">Text</SimpleData>
            </SchemaData>
        </ExtendedData>
        TODO more general implementation?
         */
        for (var i = 0; i < response.length; i++) {
            var simpleData = response[i];
            result[simpleData.getAttribute('name')] = simpleData.textContent;
        }
        return result;
    };
    KMLDataSource.prototype.countFromResult = function (res) {
        return res.getSize();
    };
    KMLDataSource.prototype.deleteDataRecordUsingId = function (id) {
        // TODO
        return null;
    };
    KMLDataSource.prototype.fetchIdsFromResult = function (res) {
        // TODO
        return null;
    };
    KMLDataSource.prototype.insertDataRecord = function (record) {
        // TODO
        return null;
    };
    KMLDataSource.prototype.queryUsingIds = function (ids) {
        // TODO
        return null;
    };
    KMLDataSource.prototype.queryUsingNames = function (names, limit) {
        // TODO
        return null;
    };
    KMLDataSource.prototype.queryUsingId = function (id, callback, limit) {
        if (this._thirdPartyHandler) {
            // prioritize the implementation of the provided 3rd-party handler
            switch (this._thirdPartyHandler.type) {
                case ThirdPartyHandler.Cesium: {
                    // the handler is Cesium.KMLDataSource
                    var entities = this._thirdPartyHandler.handler.entities;
                    var entity = entities.getById(id);
                    // entity is Cesium.KMLFeatureData
                    var extendedData = entity.kml.extendedData;
                    if (typeof extendedData === "undefined"
                        || (Object.keys(extendedData).length === 0 && extendedData.constructor === Object)) {
                        // empty response -> use custom implementation
                        this.queryUsingIdCustom(id, callback);
                    }
                    else {
                        callback(extendedData);
                    }
                    break;
                }
                default: {
                    // no valid handler found
                    callback(null);
                    break;
                }
            }
        }
        else {
            // using own implementation
            this.queryUsingIdCustom(id, callback);
        }
    };
    KMLDataSource.prototype.queryUsingIdCustom = function (id, callback, limit) {
        this._useOwnKmlParser = true;
        // read KML file
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var xmlParser = new DOMParser();
                var xmlDoc = xmlParser.parseFromString(xhttp.responseText, "text/xml");
                var placemark = xmlDoc.getElementById(id);
                var extendedData = placemark.getElementsByTagName('ExtendedData')[0];
                var schemaData = extendedData.getElementsByTagName('SchemaData')[0];
                var simpleDataList = schemaData.getElementsByTagName('SimpleData');
                // return XML DOM element
                callback(simpleDataList);
            }
        };
        xhttp.open("GET", this._uri, true);
        xhttp.send();
    };
    KMLDataSource.prototype.queryUsingSql = function (sql, callback, limit) {
        // TODO
        return;
    };
    KMLDataSource.prototype.queryUsingTypes = function (types, limit) {
        // TODO
        return null;
    };
    KMLDataSource.prototype.sumFromResultByColIndex = function (res, colIndex) {
        // TODO
        return null;
    };
    KMLDataSource.prototype.sumFromResultByName = function (res, name) {
        // TODO
        return null;
    };
    KMLDataSource.prototype.updateDataRecordUsingId = function (id, newRecord) {
        // TODO
        return null;
    };
    Object.defineProperty(KMLDataSource.prototype, "useOwnKmlParser", {
        get: function () {
            return this._useOwnKmlParser;
        },
        set: function (value) {
            this._useOwnKmlParser = value;
        },
        enumerable: true,
        configurable: true
    });
    return KMLDataSource;
}(XMLDataSource));
