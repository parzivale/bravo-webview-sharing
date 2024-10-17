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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.XanoRealtimeChannel = void 0;
var realtime_action_1 = require("../enums/realtime-action");
var realtime_connection_status_1 = require("../enums/realtime-connection-status");
var realtime_presence_action_enum_1 = require("../enums/realtime-presence-action.enum");
var observer_1 = require("./observer");
var realtime_client_1 = require("./realtime-client");
var realtime_state_1 = require("./realtime-state");
var realtime_build_action_util_1 = require("../utils/realtime-build-action.util");
var XanoRealtimeChannel = /** @class */ (function () {
    function XanoRealtimeChannel(channel, options, config) {
        this.channel = channel;
        this.options = options;
        this.config = config;
        this.observed = false;
        this.offlineMessageQueue = [];
        this.presenceCache = [];
        this.socketObserver = realtime_state_1.XanoRealtimeState.getInstance().setConfig(this.config).getSocketObserver();
        this.onFuncs = [];
        this.realtimeObserver = new (/** @class */ (function (_super) {
            __extends(XanoRealtimeObserver, _super);
            function XanoRealtimeObserver(realtimeChannel) {
                var _this = _super.call(this) || this;
                _this.realtimeChannel = realtimeChannel;
                return _this;
            }
            XanoRealtimeObserver.prototype.update = function (action) {
                var _a;
                var channel = (_a = action === null || action === void 0 ? void 0 : action.options) === null || _a === void 0 ? void 0 : _a.channel;
                if (channel && channel !== this.realtimeChannel.channel) {
                    return;
                }
                switch (action.action) {
                    case realtime_action_1.ERealtimeAction.ConnectionStatus:
                        this.realtimeChannel.handleConnectionUpdate(action);
                        this.realtimeChannel.processOfflineMessageQueue();
                        break;
                    case realtime_action_1.ERealtimeAction.PresenceFull:
                    case realtime_action_1.ERealtimeAction.PresenceUpdate:
                        this.realtimeChannel.handlePresenceUpdate(action);
                        break;
                }
                for (var _i = 0, _b = this.realtimeChannel.onFuncs; _i < _b.length; _i++) {
                    var onFunc = _b[_i];
                    if (onFunc.action && onFunc.action !== action.action) {
                        continue;
                    }
                    if (action.action === realtime_action_1.ERealtimeAction.Error) {
                        if (onFunc.onError) {
                            onFunc.onError(action);
                        }
                    }
                    else {
                        onFunc.onFunc(action);
                    }
                }
            };
            return XanoRealtimeObserver;
        }(observer_1.Observer)))(this);
        var socket = realtime_state_1.XanoRealtimeState.getInstance().getSocket();
        if (socket === null) {
            return;
        }
        var action = {
            action: realtime_action_1.ERealtimeAction.ConnectionStatus,
            options: {},
            payload: {
                status: realtime_connection_status_1.ERealtimeConnectionStatus.Connected,
            },
        };
        for (var _i = 0, _a = this.onFuncs; _i < _a.length; _i++) {
            var onFunc = _a[_i];
            if (onFunc.action && onFunc.action !== action.action) {
                continue;
            }
            onFunc.onFunc(action);
        }
        this.handleConnectionUpdate(action);
    }
    XanoRealtimeChannel.prototype.handleConnectionUpdate = function (action) {
        if (action.payload.status !== realtime_connection_status_1.ERealtimeConnectionStatus.Connected) {
            return;
        }
        var socket = realtime_state_1.XanoRealtimeState.getInstance().getSocket();
        if (socket === null) {
            return;
        }
        var message = (0, realtime_build_action_util_1.realtimeBuildActionUtil)(realtime_action_1.ERealtimeAction.Join, {
            channel: this.channel,
        }, {
            history: this.options.history || false,
            presence: this.options.presence || false,
        });
        socket.send(message);
    };
    XanoRealtimeChannel.prototype.handlePresenceUpdate = function (action) {
        var _this = this;
        if (action.action === realtime_action_1.ERealtimeAction.PresenceFull) {
            this.presenceCache = action.payload.presence.map(function (client) { return new realtime_client_1.XanoRealtimeClient(client, _this); });
        }
        else if (action.action === realtime_action_1.ERealtimeAction.PresenceUpdate) {
            if (action.payload.action === realtime_presence_action_enum_1.ERealtimePresenceAction.Join) {
                this.presenceCache.push(new realtime_client_1.XanoRealtimeClient(action.payload.presence, this));
            }
            else if (action.payload.action === realtime_presence_action_enum_1.ERealtimePresenceAction.Leave) {
                this.presenceCache = this.presenceCache.filter(function (item) { return item.socketId !== action.payload.presence.socketId; });
            }
        }
    };
    XanoRealtimeChannel.prototype.on = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!this.observed) {
            this.socketObserver.addObserver(this.realtimeObserver, true);
            this.observed = true;
        }
        if (typeof args[0] === "string") {
            this.onFuncs.push({
                action: args[0],
                onError: args[2],
                onFunc: args[1],
            });
        }
        else {
            this.onFuncs.push({ onFunc: args[0], onError: args[1] });
        }
        return this;
    };
    XanoRealtimeChannel.prototype.destroy = function () {
        var socket = realtime_state_1.XanoRealtimeState.getInstance().getSocket();
        if (socket !== null) {
            var message = (0, realtime_build_action_util_1.realtimeBuildActionUtil)(realtime_action_1.ERealtimeAction.Leave, {
                channel: this.channel,
            });
            socket.send(message);
        }
        this.socketObserver.removeObserver(this.realtimeObserver);
    };
    XanoRealtimeChannel.prototype.message = function (payload, actionOptions) {
        if (actionOptions === void 0) { actionOptions = {}; }
        var socket = realtime_state_1.XanoRealtimeState.getInstance().getSocket();
        if (socket === null) {
            return;
        }
        var message = (0, realtime_build_action_util_1.realtimeBuildActionUtil)(realtime_action_1.ERealtimeAction.Message, __assign(__assign({}, actionOptions), { channel: this.channel }), payload);
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(message);
        }
        else if (this.options.queueOfflineActions) {
            this.offlineMessageQueue.push(message);
        }
    };
    XanoRealtimeChannel.prototype.processOfflineMessageQueue = function () {
        if (!this.options.queueOfflineActions) {
            return;
        }
        var socket = realtime_state_1.XanoRealtimeState.getInstance().getSocket();
        if (socket === null) {
            return;
        }
        while (this.offlineMessageQueue.length) {
            var message = this.offlineMessageQueue.shift();
            if (message) {
                socket.send(message);
            }
        }
    };
    XanoRealtimeChannel.prototype.getPresence = function () {
        return this.presenceCache;
    };
    XanoRealtimeChannel.prototype.history = function () {
        var socket = realtime_state_1.XanoRealtimeState.getInstance().getSocket();
        if (socket === null) {
            return;
        }
        var message = (0, realtime_build_action_util_1.realtimeBuildActionUtil)(realtime_action_1.ERealtimeAction.History, {
            channel: this.channel,
        });
        socket.send(message);
    };
    return XanoRealtimeChannel;
}());
exports.XanoRealtimeChannel = XanoRealtimeChannel;
//# sourceMappingURL=realtime-channel.js.map