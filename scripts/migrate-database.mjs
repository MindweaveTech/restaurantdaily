#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import 'dotenv/config';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function migrateDatabase() {
  console.log('🗄️  Starting Restaurant Daily Database Migration...\n');

  // Get Supabase configuration
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase configuration');
    console.log('Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    console.log('Check .env.local or Vault configuration');
    process.exit(1);
  }

  console.log(`📍 Database URL: ${supabaseUrl}`);
  console.log(`🔑 Service Key: ${supabaseKey.substring(0, 20)}...`);

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    // Test connection first
    console.log('\n🔍 Testing database connection...');
    const { error } = await supabase
      .from('_test_')
      .select('*')
      .limit(1);

    if (error && error.code !== 'PGRST106') {
      throw new Error(`Connection failed: ${error.message}`);
    }
    console.log('✅ Database connection successful');

    // Read migration SQL
    const sqlPath = join(__dirname, 'setup-database.sql');
    console.log(`\n📄 Reading migration file: ${sqlPath}`);

    const migrationSQL = readFileSync(sqlPath, 'utf8');
    console.log(`✅ Migration SQL loaded (${migrationSQL.length} characters)`);

    // For now, we'll use the postgresql connection directly
    console.log('\n📋 Migration script prepared');
    console.log('🔧 Creating database setup command...');

    // Get database URL from Vault or environment
    let databaseUrl;
    try {
      // Try to get from Vault first
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);

      const vaultToken = process.env.VAULT_TOKEN;
      if (vaultToken) {
        try {
          const { stdout } = await execAsync('vault kv get -format=json secret/supabase', {
            env: { ...process.env, VAULT_ADDR: 'http://127.0.0.1:8200' }
          });
          const vaultData = JSON.parse(stdout);
          databaseUrl = vaultData.data?.data?.database_url;
          if (databaseUrl) {
            console.log('✅ Database URL retrieved from Vault');
          }
        } catch {
          console.log('⚠️  Vault unavailable, using environment fallback');
        }
      }
    } catch {
      console.log('⚠️  Using environment fallback for database URL');
    }

    // Fallback to constructing URL from Supabase credentials
    if (!databaseUrl) {
      console.log('🔧 Constructing database URL from Supabase credentials...');

      // Parse project info from Supabase URL
      const urlMatch = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
      if (urlMatch) {
        const projectRef = urlMatch[1];
        databaseUrl = `postgresql://postgres:[POOLER_PASSWORD]@db.${projectRef}.supabase.co:5432/postgres`;
        console.log('📋 Database URL template created');
        console.log('⚠️  You may need to set the POOLER_PASSWORD manually');
      }
    }

    console.log('\n🚀 Migration preparation completed!');
    console.log('');
    console.log('📋 To complete the migration, you have two options:');
    console.log('');
    console.log('Option 1: Using psql (if available):');
    console.log(`psql "${databaseUrl}" < scripts/setup-database.sql`);
    console.log('');
    console.log('Option 2: Copy and paste in Supabase Dashboard:');
    console.log('1. Go to Supabase Dashboard → SQL Editor');
    console.log('2. Copy contents of scripts/setup-database.sql');
    console.log('3. Paste and run in SQL Editor');
    console.log('');

    // Verify tables were created
    console.log('\n🔍 Verifying table creation...');
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['restaurants', 'users', 'staff_invitations']);

    if (tableError) {
      throw tableError;
    }

    const tableNames = tables?.map(t => t.table_name) || [];
    console.log(`📋 Found tables: ${tableNames.join(', ')}`);

    if (tableNames.length >= 3) {
      console.log('\n🎉 Database migration completed successfully!');
      console.log('✅ All core tables are ready');
      console.log('🚀 Application can now use real database operations');
    } else {
      console.log('\n⚠️  Migration partially completed');
      console.log('Some tables may be missing - check Supabase dashboard');
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('🔍 Check Supabase credentials and connection');
    process.exit(1);
  }
}

// Handle direct execution
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateDatabase().catch(error => {
    console.error('Migration error:', error);
    process.exit(1);
  });
}