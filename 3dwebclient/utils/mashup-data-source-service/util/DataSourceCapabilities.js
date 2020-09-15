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
