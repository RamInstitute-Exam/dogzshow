require('dotenv').config();
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3Config = {
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
};

const s3Client = new S3Client(s3Config);
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'namma-orru-foods';

async function testUpload() {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: 'test-upload.txt',
      Body: 'Hello World',
      ContentType: 'text/plain',
    });
    await s3Client.send(command);
    console.log('Upload successful');
  } catch (error) {
    console.error('Upload failed:', error.$metadata?.httpStatusCode, error.message);
  }
}

testUpload();
