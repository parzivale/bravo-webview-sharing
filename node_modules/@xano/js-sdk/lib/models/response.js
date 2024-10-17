"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XanoResponse = void 0;
var XanoResponse = /** @class */ (function () {
    function XanoResponse(response, objectPrefix) {
        if (objectPrefix === void 0) { objectPrefix = ""; }
        var _a, _b;
        this.body = response.data;
        this.headers = (_a = response.headers) !== null && _a !== void 0 ? _a : {};
        this.objectPrefix = objectPrefix;
        this.status = response.status;
        if (typeof this.body === "string" && this.body.length > 0) {
            var contentType = (_b = this.headers["content-type"]) !== null && _b !== void 0 ? _b : "";
            if (contentType.indexOf("application/json") === 0) {
                try {
                    this.body = JSON.parse(this.body);
                }
                catch (e) { }
            }
        }
    }
    XanoResponse.prototype.prefixArray = function (arr, objectPrefix) {
        var _this = this;
        var prefixedArray = [];
        arr.forEach(function (item) {
            var type = _this.typeOf(item);
            if (type === "array") {
                prefixedArray.push(_this.prefixArray(item, objectPrefix));
            }
            else if (type === "object") {
                prefixedArray.push(_this.prefixObject(item, objectPrefix));
            }
            else {
                prefixedArray.push(item);
            }
        });
        return prefixedArray;
    };
    XanoResponse.prototype.prefixObject = function (obj, objectPrefix) {
        var _this = this;
        var prefixedObject = {};
        Object.keys(obj).forEach(function (key) {
            var prefixedKey = "".concat(objectPrefix).concat(key);
            var type = _this.typeOf(obj[key]);
            if (type === "array") {
                prefixedObject[prefixedKey] = _this.prefixArray(obj[key], objectPrefix);
            }
            else if (type === "object") {
                prefixedObject[prefixedKey] = _this.prefixObject(obj[key], objectPrefix);
            }
            else {
                prefixedObject[prefixedKey] = obj[key];
            }
        });
        return prefixedObject;
    };
    XanoResponse.prototype.typeOf = function (data) {
        if (data === null) {
            return "null";
        }
        var type = typeof data;
        if (type === "object" && Array.isArray(data)) {
            return "array";
        }
        return type;
    };
    XanoResponse.prototype.getBody = function (objectPrefix) {
        if (objectPrefix === void 0) { objectPrefix = ""; }
        objectPrefix = objectPrefix || this.objectPrefix;
        if (objectPrefix) {
            var type = this.typeOf(this.body);
            if (type === "array") {
                return this.prefixArray(this.body, objectPrefix);
            }
            else if (type === "object") {
                return this.prefixObject(this.body, objectPrefix);
            }
        }
        return this.body;
    };
    XanoResponse.prototype.getHeaders = function () {
        return this.headers;
    };
    XanoResponse.prototype.getStatusCode = function () {
        return this.status;
    };
    return XanoResponse;
}());
exports.XanoResponse = XanoResponse;
//# sourceMappingURL=response.js.map