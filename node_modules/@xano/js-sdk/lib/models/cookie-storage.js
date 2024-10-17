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
exports.XanoCookieStorage = void 0;
var base_storage_1 = require("./base-storage");
var XanoCookieStorage = /** @class */ (function (_super) {
    __extends(XanoCookieStorage, _super);
    function XanoCookieStorage(cookiePath, expirationDays) {
        if (cookiePath === void 0) { cookiePath = "/"; }
        if (expirationDays === void 0) { expirationDays = 30; }
        var _this = _super.call(this) || this;
        _this.cookiePath = cookiePath;
        _this.expirationDays = expirationDays;
        return _this;
    }
    XanoCookieStorage.prototype.getExpirationUTC = function (dayOffset) {
        var date = new Date();
        date.setTime(date.getTime() + dayOffset * 24 * 60 * 60 * 1000);
        return date.toUTCString();
    };
    XanoCookieStorage.prototype.clear = function () {
        var _this = this;
        Object.keys(this.getAll()).forEach(function (key) {
            _this.removeItem(key);
        });
    };
    XanoCookieStorage.prototype.getAll = function () {
        return Object.fromEntries(document.cookie.split("; ").map(function (c) {
            return c.split("=");
        }));
    };
    XanoCookieStorage.prototype.getItem = function (key) {
        var _a, _b, _c;
        var value = "; ".concat(document.cookie);
        var parts = value.split("; ".concat(key, "="));
        var ret = (_c = (_b = (_a = parts.pop()) === null || _a === void 0 ? void 0 : _a.split(";")) === null || _b === void 0 ? void 0 : _b.shift()) !== null && _c !== void 0 ? _c : null;
        if (ret === undefined) {
            return null;
        }
        return ret;
    };
    XanoCookieStorage.prototype.removeItem = function (key) {
        document.cookie = "".concat(key, "=; expires=").concat(this.getExpirationUTC(-1), "; path=").concat(this.cookiePath);
    };
    XanoCookieStorage.prototype.setItem = function (key, value) {
        document.cookie = "".concat(key, "=").concat(value, "; expires=").concat(this.getExpirationUTC(this.expirationDays), "; path=").concat(this.cookiePath);
    };
    return XanoCookieStorage;
}(base_storage_1.XanoBaseStorage));
exports.XanoCookieStorage = XanoCookieStorage;
//# sourceMappingURL=cookie-storage.js.map