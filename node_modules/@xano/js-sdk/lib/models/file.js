"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XanoFile = void 0;
var XanoFile = /** @class */ (function () {
    function XanoFile(name, buffer) {
        this.name = name;
        this.buffer = buffer;
    }
    XanoFile.prototype.getBuffer = function () {
        return this.buffer;
    };
    XanoFile.prototype.getName = function () {
        return this.name;
    };
    return XanoFile;
}());
exports.XanoFile = XanoFile;
//# sourceMappingURL=file.js.map