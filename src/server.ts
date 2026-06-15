import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();
// Global Exception/Rejection Loggers for Render debugging
process.on('uncaughtException', (err) => {
  console.error('🔥 UNCAUGHT EXCEPTION CRASH DETECTED:');
  console.error(err.stack || err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 UNHANDLED REJECTION DETECTED at:', promise, 'reason:', reason);
});


// STEP 1 & 10: Load dotenv based on NODE_ENV
const nodeEnv = process.env.NODE_ENV || 'development';
const envPaths = [
  path.join(__dirname, `../.env.${nodeEnv}`),
  path.join(__dirname, '../.env')
];

let envLoaded = false;
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    envLoaded = true;
    break;
  }
}

// STEP 9: Check if .env was found
if (!envLoaded) {
  console.warn('⚠️ .env file not found, using system environment variables.');
}

// STEP 5: Default NODE_ENV
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// STEP 6: Default FRONTEND_URL and optional envs
if (!process.env.FRONTEND_URL) {
  process.env.FRONTEND_URL = 'https://juztdog.web.app';
}
if (!process.env.JWT_REFRESH_SECRET) {
  process.env.JWT_REFRESH_SECRET = process.env.JWT_SECRET || 'juztdog_refresh_secret_fallback_key';
}

// STEP 3 & 4: Validate every required variable before importing app
const requiredEnvs = [
  'NODE_ENV',
  'PORT',
  'DATABASE_URL',
  'JWT_SECRET',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET'
];

let hasMissing = false;
const missingEnvs: string[] = [];

console.log('\n=====================================');
console.log('Environment Validation');
console.log('=====================================');

for (const env of requiredEnvs) {
  if (process.env[env]) {
    console.log(`✓ ${env}`);
  } else {
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
import app from './app';
import prisma from './prisma';

const PORT = process.env.PORT || 5001;

async function bootstrap() {
  // STEP 8: Start HTTP server immediately and log output
  app.listen(PORT, () => {
    console.log('=====================================');
    console.log('🚀 JuzDog Backend');
    console.log('=====================================');
    console.log('✓ Environment Loaded');
    console.log('✓ Environment Validated');
    console.log('✓ Express Server Initialized');
    console.log('=====================================');
    console.log(`Server running on:\nhttp://localhost:${PORT}\n`);
    console.log(`Environment:\n${process.env.NODE_ENV}`);
    console.log('=====================================\n');
  });

  // STEP 3 (Initialization): Connect database in background
  try {
    console.log('Database: Connecting to database...');
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    console.log('✓ Database: Connected successfully');
  } catch (error) {
    console.error('❌ Database: Connection failed.');
    console.error(error);
    // Do not crash the process; keeping it running allows diagnostic health checks to load
  }
}

bootstrap();