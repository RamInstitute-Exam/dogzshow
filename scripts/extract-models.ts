import fs from 'fs';
import path from 'path';

const schemaPath = 'd:/Our Projects/DogProfileApp/backend/prisma/schema.prisma';
const content = fs.readFileSync(schemaPath, 'utf-8');

function extractModel(modelName: string) {
  const regex = new RegExp(`model\\s+${modelName}\\s+\\{([^\\}]+)\\}`, 'i');
  const match = content.match(regex);
  if (match) {
    console.log(`=== Model ${modelName} ===`);
    console.log(match[0]);
  } else {
    console.log(`Model ${modelName} not found`);
  }
}

extractModel('User');
extractModel('Judge');
extractModel('Club');
