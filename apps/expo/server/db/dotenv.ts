import { config } from 'dotenv';
import { resolve } from 'path';

// Get current environment (development is default)
const env = process.env.NODE_ENV || 'development';
console.log(`🌍 Loading database configuration for environment: ${env}`);

// Step 1: Load base environment variables from root and app directory
config({ path: resolve(process.cwd(), '../../.env') });
config({ path: resolve(process.cwd(), '.env') });

// Step 2: Load environment-specific variables (these will override base settings)
config({ path: resolve(process.cwd(), `../../.env.${env}`) });
config({ path: resolve(process.cwd(), `.env.${env}`) });

// Export the process.env object
export default process.env;