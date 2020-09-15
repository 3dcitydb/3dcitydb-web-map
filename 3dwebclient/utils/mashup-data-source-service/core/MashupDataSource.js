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
