"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("./client");
var base_storage_1 = require("./models/base-storage");
var cookie_storage_1 = require("./models/cookie-storage");
var local_storage_1 = require("./models/local-storage");
var object_storage_1 = require("./models/object-storage");
var session_storage_1 = require("./models/session-storage");
global.XanoBaseStorage = base_storage_1.XanoBaseStorage;
global.XanoClient = client_1.XanoClient;
global.XanoCookieStorage = cookie_storage_1.XanoCookieStorage;
global.XanoLocalStorage = local_storage_1.XanoLocalStorage;
global.XanoObjectStorage = object_storage_1.XanoObjectStorage;
global.XanoSessionStorage = session_storage_1.XanoSessionStorage;
//# sourceMappingURL=index.web.js.map