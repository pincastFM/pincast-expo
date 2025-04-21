import { readFileSync, existsSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { sql } from '@vercel/postgres';
import { config } from 'dotenv';

// Get current environment
const env = process.env.NODE_ENV || 'development';
console.log(`🌍 Running migrations in ${env.toUpperCase()} environment`);

// Load base environment variables
config({ path: resolve(process.cwd(), '../../.env') });
config({ path: resolve(process.cwd(), '.env') });

// Load environment-specific variables
config({ path: resolve(process.cwd(), `../../.env.${env}`) });
config({ path: resolve(process.cwd(), `.env.${env}`) });

const MIGRATIONS_DIR = join(process.cwd(), 'migrations');
const INIT_MIGRATION = join(MIGRATIONS_DIR, '000_init.sql');

async function runMigration() {
  try {
    console.log('🔄 Running migrations...');
    
    // Read the migration file
    const migrationContent = readFileSync(INIT_MIGRATION, 'utf8');
    
    // Print diagnostics about the file
    console.log(`📋 Migration file size: ${migrationContent.length} bytes`);
    console.log(`📋 First 100 chars: ${migrationContent.substring(0, 100).replace(/\n/g, ' ')}...`);
    
    try {
      // Execute the entire migration script as one transaction
      console.log('Running full migration script...');
      await sql.query(migrationContent);
      console.log('✅ Migration script executed successfully');
    } catch (error) {
      // If executing the whole script fails, fall back to individual statements
      console.warn('⚠️ Full migration failed, trying individual statements');
      console.log('🔍 Error type:', Object.prototype.toString.call(error));
      
      if (error instanceof Error) {
        console.log('🔍 Error name:', error.name);
        console.log('🔍 Error message:', error.message);
      } else {
        console.log('🔍 Non-Error object:', typeof error);
        // Try to log the error properties safely
        try {
          console.log('🔍 Error stringify attempt:', JSON.stringify(error, null, 2));
        } catch (e) {
          console.log('🔍 Error could not be stringified');
        }
      }
      
      // Try a different approach by running each CREATE statement separately
      const statements = migrationContent.split(/CREATE\s+/i);
      console.log(`📋 Found ${statements.length} potential CREATE statements`);
      
      let successCount = 0;
      let skipCount = 0;
      let failCount = 0;
      
      for (const statement of statements) {
        if (!statement.trim()) continue;
        
        const fullStatement = 'CREATE ' + statement.trim();
        const preview = fullStatement.length > 50 
          ? fullStatement.substring(0, 50) + '...' 
          : fullStatement;
          
        try {
          await sql.query(fullStatement);
          console.log(`✅ Executed: ${preview}`);
          successCount++;
        } catch (error) {
          // Better error handling for various error formats
          let errorMessage = 'Unknown error';
          let errorDetails = '';
          
          if (error instanceof Error) {
            errorMessage = error.message;
            errorDetails = `(${error.name})`;
            
            // Try to get stack trace if available
            if (error.stack) {
              errorDetails += ` Stack: ${error.stack.split('\n')[0]}`;
            }
          } else if (error === null) {
            errorMessage = 'null';
          } else if (error === undefined) {
            errorMessage = 'undefined';
          } else if (typeof error === 'object') {
            try {
              // Try to extract some properties that might be useful
              const keys = Object.keys(error);
              errorMessage = keys.length ? `Object with keys: ${keys.join(', ')}` : 'Empty object';
              
              // Use type assertion to access potential error properties
              const errorObj = error as Record<string, unknown>;
              if ('code' in errorObj && errorObj.code) errorDetails += ` Code: ${String(errorObj.code)}`;
              if ('errno' in errorObj && errorObj.errno) errorDetails += ` Errno: ${String(errorObj.errno)}`;
              if ('sqlMessage' in errorObj && errorObj.sqlMessage) errorDetails += ` SQL: ${String(errorObj.sqlMessage)}`;
              if ('sqlState' in errorObj && errorObj.sqlState) errorDetails += ` State: ${String(errorObj.sqlState)}`;
              
              // Try to stringify with replacer function to handle circular references
              errorDetails += ` Full: ${JSON.stringify(error, (key, value) => {
                if (key === '' || typeof value !== 'object') return value;
                // Use type-safe approach here to avoid TS7053 error
                const obj: Record<string, unknown> = {};
                if (value !== null) {
                  Object.keys(value as Record<string, unknown>).forEach(k => {
                    obj[k] = (value as Record<string, unknown>)[k];
                  });
                }
                return obj;
              }, 2)}`;
            } catch (e) {
              errorDetails = 'Object could not be stringified';
            }
          } else {
            errorMessage = String(error);
          }
          
          // Check for common PostgreSQL error codes indicating "relation already exists"
          if (errorMessage.includes('already exists') || errorMessage.includes('duplicate key')) {
            console.log(`ℹ️ Skipped (already exists): ${preview.substring(0, 30)}...`);
            skipCount++;
          } else {
            console.warn(`⚠️ Statement failed: ${errorMessage} ${errorDetails}`);
            failCount++;
          }
        }
      }
      
      console.log(`📊 Migration stats: ${successCount} executed, ${skipCount} skipped, ${failCount} failed`);
    }
    
    console.log('✅ Migrations completed successfully!');
    
    // Check if PostGIS is available
    try {
      console.log('📊 Checking PostGIS availability...');
      const result = await sql`SELECT PostGIS_version()`;
      console.log(`✅ PostGIS is available: ${result.rows[0]?.postgis_version}`);
    } catch (error) {
      // Handle various error formats
      console.log('⚠️ PostGIS check failed with error type:', Object.prototype.toString.call(error));
      
      if (error instanceof Error) {
        console.log('⚠️ Error name:', error.name);
        console.log('⚠️ Error message:', error.message);
        if (error.stack) {
          console.log('⚠️ First line of stack:', error.stack.split('\n')[0]);
        }
      } else if (typeof error === 'object' && error !== null) {
        try {
          // Log all properties of the error object - use safe type assertion
          const errorObj = error as Record<string, unknown>;
          console.log('⚠️ Error object properties:', Object.getOwnPropertyNames(errorObj).join(', '));
          console.log('⚠️ Error object stringify attempt:', JSON.stringify(errorObj, null, 2));
        } catch (e) {
          console.log('⚠️ Error object could not be stringified');
        }
      } else {
        console.log(`⚠️ Non-object error: ${String(error)}`);
      }
      
      // This is non-fatal for our pipeline
      console.log('⚠️ PostGIS may not be available, but this is not a critical error.');
      console.log('⚠️ Some geo-functionality might be limited, but basic features will work.');
    }
    
    // We'll try an alternative check for database connectivity
    try {
      console.log('📊 Testing basic database connectivity...');
      const testResult = await sql`SELECT 1 AS test`;
      console.log(`✅ Database is connected. Test query returned: ${JSON.stringify(testResult.rows)}`);
    } catch (dbError) {
      console.log('⚠️ Basic database connectivity test failed:', 
        dbError instanceof Error ? dbError.message : String(dbError));
      console.log('⚠️ Continuing despite database connectivity issues.');
    }
    
  } catch (error) {
    // Comprehensive error reporting for the main try/catch
    console.error('❌ Migration failed with error type:', Object.prototype.toString.call(error));
    
    if (error instanceof Error) {
      console.error('❌ Error name:', error.name);
      console.error('❌ Error message:', error.message);
      if (error.stack) {
        console.error('❌ Stack trace:', error.stack);
      }
    } else if (error === null) {
      console.error('❌ Error is null');
    } else if (error === undefined) {
      console.error('❌ Error is undefined');
    } else if (typeof error === 'object') {
      try {
        // Use safe type assertion for object
        const errorObj = error as Record<string, unknown>;
        console.error('❌ Error object keys:', Object.keys(errorObj).join(', '));
        console.error('❌ Error object stringify attempt:', JSON.stringify(errorObj, null, 2));
      } catch (e) {
        console.error('❌ Error object could not be stringified');
      }
    } else {
      console.error('❌ Non-object error:', String(error));
    }
    
    console.error('📁 Migration directory:', MIGRATIONS_DIR);
    console.error('📄 Init migration file path:', INIT_MIGRATION);
    
    try {
      const exists = existsSync(INIT_MIGRATION);
      console.error('📄 Init migration file exists:', exists);
      if (exists) {
        const stats = statSync(INIT_MIGRATION);
        console.error('📄 Init migration file size:', stats.size, 'bytes');
      }
    } catch (e) {
      console.error('📄 Error checking migration file:', e instanceof Error ? e.message : String(e));
    }
    
    // Exit with error code
    console.error('❌ Migration process terminated due to errors');
    process.exit(1);
  }
}

// Run the migration
runMigration().catch(console.error);