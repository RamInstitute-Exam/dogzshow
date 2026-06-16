import fs from 'fs';

const schemaPath = 'd:/Our Projects/DogProfileApp/backend/prisma/schema.prisma';
const content = fs.readFileSync(schemaPath, 'utf-8');

const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('User') || line.includes('Judge') || line.includes('Club')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
