"use strict";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.XanoBaseClient = void 0;
var web_1 = require("@server-sent-stream/web");
var axios_1 = require("axios");
var content_type_1 = require("./enums/content-type");
var event_stream_1 = require("./models/event-stream");
var file_1 = require("./models/file");
var object_storage_1 = require("./models/object-storage");
var realtime_channel_1 = require("./models/realtime-channel");
var realtime_state_1 = require("./models/realtime-state");
var request_1 = require("./errors/request");
var request_type_1 = require("./enums/request-type");
var response_1 = require("./models/response");
var storage_keys_1 = require("./enums/storage-keys");
var XanoBaseClient = /** @class */ (function () {
    function XanoBaseClient(config) {
        this.config = {
            apiGroupBaseUrl: null,
            authToken: null,
            customAxiosRequestConfig: {},
            dataSource: null,
            instanceBaseUrl: null,
            realtimeConnectionHash: null,
            responseObjectPrefix: "",
            storage: new object_storage_1.XanoObjectStorage(),
        };
        this.config = __assign(__assign({}, this.config), config);
        if ((config === null || config === void 0 ? void 0 : config.authToken) !== undefined) {
            if (typeof this.config.authToken === "string" &&
                this.config.authToken.length > 0) {
                this.config.storage.setItem(storage_keys_1.XanoStorageKeys.AuthToken, this.config.authToken);
            }
            else {
                this.config.storage.removeItem(storage_keys_1.XanoStorageKeys.AuthToken);
            }
        }
        if ((config === null || config === void 0 ? void 0 : config.realtimeAuthToken) !== undefined) {
            if (typeof this.config.realtimeAuthToken === "string" &&
                this.config.realtimeAuthToken.length > 0) {
                this.config.storage.setItem(storage_keys_1.XanoStorageKeys.RealtimeAuthToken, this.config.realtimeAuthToken);
            }
            else {
                this.config.storage.removeItem(storage_keys_1.XanoStorageKeys.RealtimeAuthToken);
            }
        }
    }
    XanoBaseClient.prototype.buildFormData = function (bodyData) {
        var _this = this;
        var formData = this.getFormDataInstance();
        var hasFile = false;
        var rawFormData = {};
        Object.entries(bodyData).forEach(function (entry) {
            var isFileType = _this.isFileType(entry[1]);
            if (isFileType) {
                hasFile = true;
            }
            rawFormData[entry[0]] = entry[1];
            if (entry[1] instanceof file_1.XanoFile) {
                formData.append(entry[0], entry[1].getBuffer(), entry[1].getName());
            }
            else {
                _this.appendFormData(formData, entry[0], entry[1]);
            }
        });
        return {
            formData: formData,
            hasFile: hasFile,
            rawFormData: rawFormData,
        };
    };
    XanoBaseClient.prototype.hasToken = function (storageKey) {
        var authToken = this.config.storage.getItem(storageKey);
        return typeof authToken === "string" && authToken.length > 0;
    };
    XanoBaseClient.prototype.isFileType = function (instance) {
        if (typeof File !== "undefined") {
            if (instance instanceof File) {
                return true;
            }
        }
        return instance instanceof file_1.XanoFile;
    };
    XanoBaseClient.prototype.request = function (params) {
        var _this = this;
        if (!this.config.apiGroupBaseUrl && !this.config.instanceBaseUrl) {
            throw new Error("Please configure apiGroupBaseUrl or instanceBaseUrl setting before making an API request");
        }
        var axiosConfig = __assign(__assign({}, this.config.customAxiosRequestConfig), { baseURL: this.config.apiGroupBaseUrl || this.config.instanceBaseUrl, method: params.method, params: params.urlParams, url: params.endpoint, validateStatus: function () { return true; } });
        if (params.streamingCallback) {
            axiosConfig.responseType = "stream";
            axiosConfig.adapter = "fetch";
        }
        if (!axiosConfig.headers) {
            axiosConfig.headers = {};
        }
        if (params.headerParams) {
            axiosConfig.headers = __assign(__assign({}, axiosConfig.headers), params.headerParams);
        }
        if (this.hasAuthToken()) {
            var authToken = this.config.storage.getItem(storage_keys_1.XanoStorageKeys.AuthToken);
            axiosConfig.headers["Authorization"] = "Bearer ".concat(authToken);
        }
        if (this.hasDataSource()) {
            axiosConfig.headers["X-Data-Source"] = this.config.dataSource;
        }
        if (params.bodyParams) {
            var ret = this.buildFormData(params.bodyParams);
            if (ret.hasFile) {
                axiosConfig.headers["Content-Type"] = content_type_1.XanoContentType.Multipart;
                axiosConfig.data = ret.formData;
            }
            else {
                axiosConfig.headers["Content-Type"] = content_type_1.XanoContentType.JSON;
                axiosConfig.data = JSON.stringify(ret.rawFormData);
            }
        }
        return axios_1.default.request(axiosConfig).then(function (response) { return __awaiter(_this, void 0, void 0, function () {
            var stream, reader, _a, value, done, resp;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!params.streamingCallback) return [3 /*break*/, 3];
                        stream = response.data;
                        reader = stream.pipeThrough(new web_1.default()).getReader();
                        _c.label = 1;
                    case 1:
                        if (!true) return [3 /*break*/, 3];
                        return [4 /*yield*/, reader.read()];
                    case 2:
                        _a = _c.sent(), value = _a.value, done = _a.done;
                        if (done) {
                            return [3 /*break*/, 3];
                        }
                        params.streamingCallback(new event_stream_1.XanoEventStream({
                            data: value.data,
                            id: value.lastEventId,
                            type: value.type,
                        }));
                        return [3 /*break*/, 1];
                    case 3:
                        resp = new response_1.XanoResponse(response, (_b = this.config.responseObjectPrefix) !== null && _b !== void 0 ? _b : "");
                        if (response.status < 200 || response.status >= 300) {
                            throw new request_1.XanoRequestError("There was an error with your request", resp);
                        }
                        return [2 /*return*/, resp];
                }
            });
        }); });
    };
    XanoBaseClient.prototype.storeToken = function (authToken, storageKey) {
        if (authToken === null) {
            this.config.storage.removeItem(storageKey);
        }
        else {
            this.config.storage.setItem(storageKey, authToken);
        }
    };
    XanoBaseClient.prototype.hasAuthToken = function () {
        return this.hasToken(storage_keys_1.XanoStorageKeys.AuthToken);
    };
    XanoBaseClient.prototype.setAuthToken = function (authToken) {
        this.storeToken(authToken, storage_keys_1.XanoStorageKeys.AuthToken);
        this.config.authToken = authToken;
        return this;
    };
    XanoBaseClient.prototype.hasRealtimeAuthToken = function () {
        return this.hasToken(storage_keys_1.XanoStorageKeys.RealtimeAuthToken);
    };
    XanoBaseClient.prototype.setRealtimeAuthToken = function (authToken) {
        this.storeToken(authToken, storage_keys_1.XanoStorageKeys.RealtimeAuthToken);
        this.config.realtimeAuthToken = authToken;
        return this;
    };
    XanoBaseClient.prototype.hasDataSource = function () {
        return (typeof this.config.dataSource === "string" &&
            this.config.dataSource.length > 0);
    };
    XanoBaseClient.prototype.setDataSource = function (dataSource) {
        this.config.dataSource = dataSource;
        return this;
    };
    XanoBaseClient.prototype.delete = function (endpoint, params, headers) {
        return this.request({
            bodyParams: params,
            endpoint: endpoint,
            headerParams: headers,
            method: request_type_1.XanoRequestType.DELETE,
        });
    };
    XanoBaseClient.prototype.get = function (endpoint, params, headers, streamingCallback) {
        return this.request({
            endpoint: endpoint,
            headerParams: headers,
            method: request_type_1.XanoRequestType.GET,
            streamingCallback: streamingCallback,
            urlParams: params,
        });
    };
    XanoBaseClient.prototype.head = function (endpoint, params, headers) {
        return this.request({
            endpoint: endpoint,
            headerParams: headers,
            method: request_type_1.XanoRequestType.HEAD,
            urlParams: params,
        });
    };
    XanoBaseClient.prototype.patch = function (endpoint, params, headers, streamingCallback) {
        return this.request({
            bodyParams: params,
            endpoint: endpoint,
            headerParams: headers,
            method: request_type_1.XanoRequestType.PATCH,
            streamingCallback: streamingCallback,
        });
    };
    XanoBaseClient.prototype.post = function (endpoint, params, headers, streamingCallback) {
        return this.request({
            bodyParams: params,
            endpoint: endpoint,
            headerParams: headers,
            method: request_type_1.XanoRequestType.POST,
            streamingCallback: streamingCallback,
        });
    };
    XanoBaseClient.prototype.put = function (endpoint, params, headers, streamingCallback) {
        return this.request({
            bodyParams: params,
            endpoint: endpoint,
            headerParams: headers,
            method: request_type_1.XanoRequestType.PUT,
            streamingCallback: streamingCallback,
        });
    };
    XanoBaseClient.prototype.channel = function (channel, options) {
        if (options === void 0) { options = {}; }
        if (!this.config.instanceBaseUrl && !this.config.apiGroupBaseUrl) {
            throw new Error("Please configure instanceBaseUrl or apiGroupBaseUrl setting before connecting to realtime");
        }
        if (!this.config.realtimeConnectionHash) {
            throw new Error("Please configure realtimeConnectionHash setting before connecting to realtime");
        }
        return new realtime_channel_1.XanoRealtimeChannel(channel, options, this.config);
    };
    XanoBaseClient.prototype.realtimeReconnect = function () {
        realtime_state_1.XanoRealtimeState.getInstance().reconnect();
        return this;
    };
    return XanoBaseClient;
}());
exports.XanoBaseClient = XanoBaseClient;
//# sourceMappingURL=base-client.js.map