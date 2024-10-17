"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.XanoObjectStorage = void 0;
var base_storage_1 = require("./base-storage");
var XanoObjectStorage = /** @class */ (function (_super) {
    __extends(XanoObjectStorage, _super);
    function XanoObjectStorage() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.storage = {};
        return _this;
    }
    XanoObjectStorage.prototype.clear = function () {
        this.storage = {};
    };
    XanoObjectStorage.prototype.getAll = function () {
        return this.storage;
    };
    XanoObjectStorage.prototype.getItem = function (key) {
        var _a;
        return (_a = this.storage[key]) !== null && _a !== void 0 ? _a : null;
    };
    XanoObjectStorage.prototype.removeItem = function (key) {
        delete this.storage[key];
    };
    XanoObjectStorage.prototype.setItem = function (key, value) {
        this.storage[key] = value;
    };
    return XanoObjectStorage;
}(base_storage_1.XanoBaseStorage));
exports.XanoObjectStorage = XanoObjectStorage;
//# sourceMappingURL=object-storage.js.map