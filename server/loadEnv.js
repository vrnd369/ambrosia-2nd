/**
 * Load .env BEFORE any other server modules.
 * ESM hoists imports, so we need this file imported first so dotenv runs
 * before orders.js (which reads process.env at load time).
 */
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(projectRoot, '.env') });
