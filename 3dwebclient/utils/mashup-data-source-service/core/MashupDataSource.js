var MashupDataSource = /** @class */ (function () {
    function MashupDataSource() {
    }
    Object.defineProperty(MashupDataSource.prototype, "mashupDataSources", {
        get: function () {
            return this._mashupDataSources;
        },
        set: function (value) {
            this._mashupDataSources = value;
        },
        enumerable: true,
        configurable: true
    });
    MashupDataSource.prototype.getCapabilities = function () {
        // TODO
        return null;
    };
    MashupDataSource.prototype.getMostCommonCapabilities = function () {
        // TOTO
        return null;
    };
    MashupDataSource.prototype.getNames = function () {
        // TODO
        return null;
    };
    MashupDataSource.prototype.getProviders = function () {
        // TODO
        return null;
    };
    MashupDataSource.prototype.getTypes = function () {
        // TODO
        return null;
    };
    MashupDataSource.prototype.getUris = function () {
        // TODO
        return null;
    };
    MashupDataSource.prototype.countFromResult = function (res) {
        // TODO
        return null;
    };
    MashupDataSource.prototype.deleteDataRecordUsingId = function (id) {
        // TODO
        return null;
    };
    MashupDataSource.prototype.fetchIdsFromResult = function (res) {
        // TODO
        return null;
    };
    MashupDataSource.prototype.insertDataRecord = function (record) {
        // TODO
        return null;
    };
    MashupDataSource.prototype.queryUsingId = function (id, callback, limit) {
        // TODO
    };
    MashupDataSource.prototype.queryUsingIds = function (ids) {
        // TODO
        return null;
    };
    MashupDataSource.prototype.queryUsingNames = function (names, limit) {
        // TODO
        return null;
    };
    MashupDataSource.prototype.queryUsingSql = function (sql, callback, limit) {
        // TODO
    };
    MashupDataSource.prototype.queryUsingTypes = function (types, limit) {
        // TODO
        return null;
    };
    MashupDataSource.prototype.sumFromResultByColIndex = function (res, colIndex) {
        // TODO
        return null;
    };
    MashupDataSource.prototype.sumFromResultByName = function (res, name) {
        // TODO
        return null;
    };
    MashupDataSource.prototype.updateDataRecordUsingId = function (id, newRecord) {
        // TODO
        return null;
    };
    return MashupDataSource;
}());
