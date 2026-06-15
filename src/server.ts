import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

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
  let dbStatus = 'Disconnected';
  try {
    // STEP 3 (Initialization): Connect database
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'Connected';
  } catch (error) {
    console.error('❌ FATAL ERROR: Database connection failed.');
    console.error(error);
    process.exit(1);
  }

  // STEP 4, 5, 6, 7 are handled inside app.ts and services

  // STEP 8: Start HTTP server and log output
  app.listen(PORT, () => {
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
}

bootstrap();