/**
 * Load .env BEFORE any other server modules.
 * ESM hoists imports, so this file must be imported first in index.js.
 */
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const envPath = path.join(projectRoot, '.env');
const loaded = dotenv.config({ path: envPath });
if (loaded.error) {
  dotenv.config({ path: path.join(process.cwd(), '.env') });
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('\n*** SUPABASE_SERVICE_ROLE_KEY missing in .env ***');
  console.error('Add it from: Supabase Dashboard → Settings → API → service_role\n');
}
