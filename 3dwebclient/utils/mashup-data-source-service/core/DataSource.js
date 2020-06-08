// In TypeScript if abstract class B implements interface A,
// it must either implement functions from A or declare them as abstract.
// https://github.com/Microsoft/TypeScript/issues/4670
// Alternatively we can do this:
// interface DataSource extends ReadableDataSource, WritableDataSource {}
var DataSource = /** @class */ (function () {
    function DataSource(signInController, options) {
        this._name = !options.name ? "Data Source" : options.name;
        this._provider = !options.provider ? "Data Provider" : options.provider;
        this._type = !options.type ? "Data Type" : options.type;
        this._layerUrl = !options.layerUrl ? "" : options.layerUrl;
        this._uri = !options.uri ? options.layerUrl : options.uri;
        this._capabilities = !options.capabilities ? undefined : options.capabilities;
        this._tableType = !options.tableType ? TableTypes.Horizontal : options.tableType;
        this._thirdPartyHandler = !options.thirdPartyHandler ? undefined : options.thirdPartyHandler;
        this._signInController = signInController;
    }
    Object.defineProperty(DataSource.prototype, "name", {
        get: function () {
            return this._name;
        },
        set: function (value) {
            this._name = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataSource.prototype, "provider", {
        get: function () {
            return this._provider;
        },
        set: function (value) {
            this._provider = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataSource.prototype, "type", {
        get: function () {
            return this._type;
        },
        set: function (value) {
            this._type = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataSource.prototype, "layerUrl", {
        get: function () {
            return this._layerUrl;
        },
        set: function (value) {
            this._layerUrl = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataSource.prototype, "uri", {
        get: function () {
            return this._uri;
        },
        set: function (value) {
            this._uri = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataSource.prototype, "capabilities", {
        get: function () {
            return this._capabilities;
        },
        set: function (value) {
            this._capabilities = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataSource.prototype, "tableType", {
        get: function () {
            return this._tableType;
        },
        set: function (value) {
            this._tableType = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataSource.prototype, "idColName", {
        get: function () {
            return this._idColName;
        },
        set: function (value) {
            this._idColName = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataSource.prototype, "thirdPartyHandler", {
        get: function () {
            return this._thirdPartyHandler;
        },
        set: function (value) {
            this._thirdPartyHandler = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataSource.prototype, "signInController", {
        get: function () {
            return this._signInController;
        },
        set: function (value) {
            this._signInController = value;
        },
        enumerable: true,
        configurable: true
    });
    return DataSource;
}());
