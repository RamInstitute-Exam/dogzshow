"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
exports.Logger = {
    info: (message, meta) => {
        console.log(`[INFO] ${message}`, meta ? meta : '');
    },
    error: (message, meta) => {
        console.error(`[ERROR] ${message}`, meta ? meta : '');
    },
    warn: (message, meta) => {
        console.warn(`[WARN] ${message}`, meta ? meta : '');
    },
    debug: (message, meta) => {
        console.debug(`[DEBUG] ${message}`, meta ? meta : '');
    }
};
