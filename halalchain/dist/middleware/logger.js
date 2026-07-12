"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpLogger = void 0;
const pino_http_1 = __importDefault(require("pino-http"));
const logger_1 = require("../lib/logger");
exports.httpLogger = (0, pino_http_1.default)({
    logger: logger_1.logger,
    autoLogging: true,
    customLogLevel: function (res) {
        if (res.statusCode >= 500)
            return 'error';
        if (res.statusCode >= 400)
            return 'warn';
        return 'info';
    },
    customSuccessMessage: function (req, res) {
        return `${req.method} ${req.url} completed with status ${res.statusCode}`;
    },
    customErrorMessage: function (req, res, err) {
        return `${req.method} ${req.url} failed with error: ${err.message}`;
    },
});
