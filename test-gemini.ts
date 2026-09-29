import * as fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config();

const dbUrl = process.env.DATABASE_URL || '';
const hasPlaceholder = dbUrl.includes('[YOUR-PASSWORD]');
console.log('DB URL has placeholder:', hasPlaceholder);
console.log('DB URL (sanitized):', dbUrl.replace(/:[^:@]+@/, ':***@').substring(0, 60) + '...');
console.log('GEMINI_API_KEY set:', !!process.env.GEMINI_API_KEY);
