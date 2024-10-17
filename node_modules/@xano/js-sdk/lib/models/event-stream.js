"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XanoEventStream = void 0;
var XanoEventStream = /** @class */ (function () {
    function XanoEventStream(args) {
        Object.assign(this, args);
    }
    XanoEventStream.prototype.dataAsJSON = function () {
        try {
            return JSON.parse(this.data);
        }
        catch (e) {
            return null;
        }
    };
    return XanoEventStream;
}());
exports.XanoEventStream = XanoEventStream;
//# sourceMappingURL=event-stream.js.map