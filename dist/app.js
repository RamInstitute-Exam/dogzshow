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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
// Import central router
const index_1 = __importStar(require("./routes/index"));
const prisma_1 = __importDefault(require("./prisma"));
const app = (0, express_1.default)();
// Security and Rate Limiting
app.use((0, helmet_1.default)());
// const apiLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: process.env.NODE_ENV === 'development' ? 5000 : 100, // relax limit in dev
//   message: 'Too many requests from this IP, please try again later.'
// });
// app.use('/api/', apiLimiter);
// Middleware
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://juztdog.web.app",
];
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
}));
app.use((0, compression_1.default)());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('dev'));
// Static Uploads Folder
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
app.get('/', (req, res) => {
    res.send('Welcome to Juztdog Backend!');
});
// Detailed health check route
app.get('/api/health', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let dbStatus = 'disconnected';
    try {
        yield prisma_1.default.$queryRaw `SELECT 1`;
        dbStatus = 'connected';
    }
    catch (error) {
        dbStatus = 'error';
    }
    res.status(dbStatus === 'connected' ? 200 : 503).json({
        success: dbStatus === 'connected',
        status: dbStatus === 'connected' ? 'healthy' : 'unhealthy',
        environment: process.env.NODE_ENV || 'development',
        database: dbStatus,
        server: 'running',
        version: '1.0.0',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
}));
// API Routes
app.use('/api/v1', index_1.default);
app.use('/api/public', index_1.publicRouter);
// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
    });
});
// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Global Error Handler:', err);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json(Object.assign({ success: false, message }, (process.env.NODE_ENV === 'development' && { stack: err.stack })));
});
exports.default = app;
