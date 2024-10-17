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
exports.XanoNodeClient = void 0;
var base_client_1 = require("./base-client");
var XanoNodeClient = /** @class */ (function (_super) {
    __extends(XanoNodeClient, _super);
    function XanoNodeClient() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    XanoNodeClient.prototype.getFormDataInstance = function () {
        return new (require("form-data"))();
    };
    XanoNodeClient.prototype.appendFormData = function (formData, key, value) {
        if (typeof value === "object") {
            value = JSON.stringify(value);
        }
        formData.append(key, value);
    };
    return XanoNodeClient;
}(base_client_1.XanoBaseClient));
exports.XanoNodeClient = XanoNodeClient;
//# sourceMappingURL=node-client.js.map