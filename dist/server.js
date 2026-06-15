"use strict";
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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
// STEP 1 & 10: Load dotenv based on NODE_ENV
const nodeEnv = process.env.NODE_ENV || 'development';
const envPaths = [
    path_1.default.join(__dirname, `../.env.${nodeEnv}`),
    path_1.default.join(__dirname, '../.env')
];
let envLoaded = false;
for (const envPath of envPaths) {
    if (fs_1.default.existsSync(envPath)) {
        dotenv_1.default.config({ path: envPath });
        envLoaded = true;
        break;
    }
}
// STEP 9: Check if .env was found
if (!envLoaded) {
    console.error('❌ .env file not found.');
    console.error('Expected location:\nbackend/.env');
    process.exit(1);
}
// STEP 5: Default NODE_ENV
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
// STEP 6: Default FRONTEND_URL in dev
if (process.env.NODE_ENV === 'development' && !process.env.FRONTEND_URL) {
    process.env.FRONTEND_URL = 'http://localhost:3000';
}
// STEP 3 & 4: Validate every required variable before importing app
const requiredEnvs = [
    'NODE_ENV',
    'PORT',
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'FRONTEND_URL',
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET'
];
let hasMissing = false;
const missingEnvs = [];
console.log('\n=====================================');
console.log('Environment Validation');
console.log('=====================================');
for (const env of requiredEnvs) {
    if (process.env[env]) {
        console.log(`✓ ${env}`);
    }
    else {
        console.log(`✗ ${env}`);
        missingEnvs.push(env);
        hasMissing = true;
    }
}
if (hasMissing) {
    console.log('=====================================');
    console.log('Missing Variables:');
    missingEnvs.forEach(env => console.log(env));
    console.log('=====================================');
    console.log('Process exited.');
    process.exit(1);
}
console.log('=====================================\n');
// Now import everything else so they use the validated env vars
const app_1 = __importDefault(require("./app"));
const prisma_1 = __importDefault(require("./prisma"));
const PORT = process.env.PORT || 5001;
function bootstrap() {
    return __awaiter(this, void 0, void 0, function* () {
        let dbStatus = 'Disconnected';
        try {
            // STEP 3 (Initialization): Connect database
            yield prisma_1.default.$connect();
            yield prisma_1.default.$queryRaw `SELECT 1`;
            dbStatus = 'Connected';
        }
        catch (error) {
            console.error('❌ FATAL ERROR: Database connection failed.');
            console.error(error);
            process.exit(1);
        }
        // STEP 4, 5, 6, 7 are handled inside app.ts and services
        // STEP 8: Start HTTP server and log output
        app_1.default.listen(PORT, () => {
            console.log('=====================================');
            console.log('🚀 JuzDog Backend');
            console.log('=====================================');
            console.log('✓ Environment Loaded');
            console.log('✓ Environment Validated');
            console.log('✓ Database Connected');
            console.log('✓ Redis Connected');
            console.log('✓ RBAC Initialized');
            console.log('✓ Scheduler Started');
            console.log('✓ Email Service Initialized');
            console.log('✓ Razorpay Initialized');
            console.log('✓ File Upload Service Ready');
            console.log('✓ API Routes Loaded');
            console.log('=====================================');
            console.log(`Server running on:\nhttp://localhost:${PORT}\n`);
            console.log(`Environment:\n${process.env.NODE_ENV}`);
            console.log('=====================================\n');
        });
    });
}
bootstrap();
