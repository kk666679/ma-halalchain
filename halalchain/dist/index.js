"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = exports.logger = exports.prisma = exports.createContext = exports.appRouter = exports.createHalalClient = void 0;
var client_1 = require("./client");
Object.defineProperty(exports, "createHalalClient", { enumerable: true, get: function () { return client_1.createHalalClient; } });
var router_1 = require("./trpc/router");
Object.defineProperty(exports, "appRouter", { enumerable: true, get: function () { return router_1.appRouter; } });
var context_1 = require("./trpc/context");
Object.defineProperty(exports, "createContext", { enumerable: true, get: function () { return context_1.createContext; } });
var prisma_1 = require("./lib/prisma");
Object.defineProperty(exports, "prisma", { enumerable: true, get: function () { return prisma_1.prisma; } });
var logger_1 = require("./lib/logger");
Object.defineProperty(exports, "logger", { enumerable: true, get: function () { return logger_1.logger; } });
__exportStar(require("./queues"), exports);
__exportStar(require("./ml/embedder"), exports);
__exportStar(require("./ml/classifier"), exports);
__exportStar(require("./ml/llm"), exports);
var server_1 = require("./server");
Object.defineProperty(exports, "startServer", { enumerable: true, get: function () { return __importDefault(server_1).default; } });
