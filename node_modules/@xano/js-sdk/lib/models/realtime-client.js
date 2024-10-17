"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XanoRealtimeClient = void 0;
var realtime_action_1 = require("../enums/realtime-action");
var realtime_state_1 = require("./realtime-state");
var realtime_build_action_util_1 = require("../utils/realtime-build-action.util");
var XanoRealtimeClient = /** @class */ (function () {
    function XanoRealtimeClient(client, channel) {
        Object.assign(this, client);
        this.channel = channel;
    }
    XanoRealtimeClient.prototype.message = function (payload) {
        var socket = realtime_state_1.XanoRealtimeState.getInstance().getSocket();
        if (socket === null) {
            return;
        }
        var message = (0, realtime_build_action_util_1.realtimeBuildActionUtil)(realtime_action_1.ERealtimeAction.Message, {
            channel: this.channel.channel,
            socketId: this.socketId,
        }, payload);
        socket.send(message);
    };
    XanoRealtimeClient.prototype.history = function () {
        var socket = realtime_state_1.XanoRealtimeState.getInstance().getSocket();
        if (socket === null) {
            return;
        }
        var message = (0, realtime_build_action_util_1.realtimeBuildActionUtil)(realtime_action_1.ERealtimeAction.History, {
            channel: this.channel.channel,
            socketId: this.socketId,
        });
        socket.send(message);
    };
    return XanoRealtimeClient;
}());
exports.XanoRealtimeClient = XanoRealtimeClient;
//# sourceMappingURL=realtime-client.js.map