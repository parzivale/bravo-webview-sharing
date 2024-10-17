"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XanoRealtimeState = void 0;
var realtime_action_1 = require("../enums/realtime-action");
var realtime_connection_status_1 = require("../enums/realtime-connection-status");
var observable_1 = require("./observable");
var XanoRealtimeState = /** @class */ (function () {
    function XanoRealtimeState() {
        var _this = this;
        this.socket = null;
        this.reconnectSettings = {
            defaultReconnectInterval: 1000,
            reconnectInterval: 1000,
            reconnecting: false,
        };
        this.socketObserver = new observable_1.Observable(function (count) {
            if (count) {
                _this.connect();
            }
            else {
                _this.disconnect();
            }
        });
        if (XanoRealtimeState._instance) {
            throw new Error("Instantiation failed: Use XanoRealtimeState.getInstance() instead of new.");
        }
        XanoRealtimeState._instance = this;
    }
    XanoRealtimeState.getInstance = function () {
        return XanoRealtimeState._instance;
    };
    XanoRealtimeState.prototype.triggerReconnect = function () {
        var _this = this;
        setTimeout(function () {
            _this.connect();
        }, this.reconnectSettings.reconnectInterval);
        this.reconnectSettings.reconnectInterval = Math.min(2 * this.reconnectSettings.reconnectInterval, 60000);
    };
    XanoRealtimeState.prototype.connect = function () {
        var _this = this;
        if (this.socket) {
            return this.socket;
        }
        if (!this.config.instanceBaseUrl && !this.config.apiGroupBaseUrl) {
            throw new Error("Please configure instanceBaseUrl or apiGroupBaseUrl setting before connecting to realtime");
        }
        if (!this.config.realtimeConnectionHash) {
            throw new Error("Please configure realtimeConnectionHash setting before connecting to realtime");
        }
        var url = new URL("".concat(this.config.instanceBaseUrl || this.config.apiGroupBaseUrl));
        var protocols;
        // @TODO: Remove and sunset defaulting to authToken, scheduled July 1st, 2024
        if (this.config.realtimeAuthToken) {
            protocols = [this.config.realtimeAuthToken];
        }
        else if (this.config.authToken) {
            protocols = [this.config.authToken];
            console.warn("[XanoClient] The use of authToken to authenticate with realtime will be sunset July 1st, 2024. Please use realtimeAuthToken instead. More info: https://docs.xano.com/building-features/realtime#xano-auth--realtime");
        }
        this.socket = new WebSocket("wss://".concat(url.hostname, "/rt/").concat(this.config.realtimeConnectionHash), protocols);
        this.socket.addEventListener("message", function (event) {
            try {
                var data = JSON.parse(event.data);
                if (data === null || data === void 0 ? void 0 : data.action) {
                    _this.socketObserver.notify({
                        action: data.action,
                        client: (data === null || data === void 0 ? void 0 : data.client) || undefined,
                        options: (data === null || data === void 0 ? void 0 : data.options) || undefined,
                        payload: data.payload,
                    });
                }
            }
            catch (e) {
                // Silent
            }
        });
        this.socket.addEventListener("close", function (e) {
            if (!_this.socket) {
                if (_this.reconnectSettings.reconnecting) {
                    _this.triggerReconnect();
                }
                return;
            }
            _this.socket = null;
            _this.socketObserver.notify({
                action: realtime_action_1.ERealtimeAction.ConnectionStatus,
                options: {},
                payload: {
                    status: realtime_connection_status_1.ERealtimeConnectionStatus.Disconnected,
                },
            });
            var reconnectCodes = [
                1006, // Abnormal Closure
                1011, // Internal Error
                1012, // Service Restart
                1013, // Try Again Later
                1014, // Bad Gateway
                4000, // Internal: Reconnect
            ];
            if (reconnectCodes.includes(e.code)) {
                _this.reconnectSettings.reconnecting = true;
                _this.triggerReconnect();
            }
        });
        this.socket.addEventListener("open", function () {
            _this.reconnectSettings.reconnecting = false;
            _this.reconnectSettings.reconnectInterval =
                _this.reconnectSettings.defaultReconnectInterval;
            _this.socketObserver.notify({
                action: realtime_action_1.ERealtimeAction.ConnectionStatus,
                options: {},
                payload: {
                    status: realtime_connection_status_1.ERealtimeConnectionStatus.Connected,
                },
            });
        });
        return this.socket;
    };
    XanoRealtimeState.prototype.disconnect = function () {
        if (this.socket) {
            this.socket.close(1000);
            this.socket = null;
        }
    };
    XanoRealtimeState.prototype.reconnect = function () {
        var _a;
        (_a = this.socket) === null || _a === void 0 ? void 0 : _a.close(4000);
    };
    XanoRealtimeState.prototype.getSocket = function () {
        return this.socket;
    };
    XanoRealtimeState.prototype.setConfig = function (config) {
        this.config = config;
        return this;
    };
    XanoRealtimeState.prototype.getSocketObserver = function () {
        return this.socketObserver;
    };
    XanoRealtimeState._instance = new XanoRealtimeState();
    return XanoRealtimeState;
}());
exports.XanoRealtimeState = XanoRealtimeState;
//# sourceMappingURL=realtime-state.js.map