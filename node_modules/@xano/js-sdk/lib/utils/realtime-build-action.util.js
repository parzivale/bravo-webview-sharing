"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.realtimeBuildActionUtil = void 0;
var realtimeBuildActionUtil = function (action, options, payload) {
    if (payload === void 0) { payload = null; }
    return JSON.stringify({
        action: action,
        options: options,
        payload: payload,
    });
};
exports.realtimeBuildActionUtil = realtimeBuildActionUtil;
//# sourceMappingURL=realtime-build-action.util.js.map