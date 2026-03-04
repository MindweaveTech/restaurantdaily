#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function pushSchema() {
  console.log('🚀 Pushing database schema to Supabase...\n');

  // Get credentials from environment
  const supabaseUrl = process.env.SUPABASE_URL || 'https://hukaqbgfmerutzhtchiu.supabase.co';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1a2FxYmdmbWVydXR6aHRjaGl1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzU1MDcyOSwiZXhwIjoyMDUzMTI2NzI5fQ.L7e3OvFKJxh-Ej_Ao8xJUjkm1C5T5ZVqVuRJxbBGUEA';

  console.log(`📍 Target: ${supabaseUrl}`);
  console.log(`🔑 Using service role key: ${serviceKey.substring(0, 20)}...`);

  // Create Supabase client
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    // Read the SQL migration file
    const sqlPath = join(__dirname, 'setup-database.sql');
    const migrationSQL = readFileSync(sqlPath, 'utf8');

    console.log(`\n📄 Loaded migration SQL (${migrationSQL.length} characters)`);

    // Split into individual statements and execute them
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--') && stmt !== 'SELECT \'Database setup completed successfully!\' as message');

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;

      const preview = statement.substring(0, 60).replace(/\s+/g, ' ');
      console.log(`⏳ [${i + 1}/${statements.length}] ${preview}...`);

      try {
        const { error } = await supabase.rpc('exec_sql', {
          query: statement + ';'
        });

        if (error) {
          // Check if it's a "already exists" error (which is okay)
          if (error.message.includes('already exists') || error.message.includes('does not exist')) {
            console.log(`   ✅ Skipped (already exists)`);
          } else {
            console.log(`   ❌ Error: ${error.message}`);
            errorCount++;
          }
        } else {
          console.log(`   ✅ Success`);
          successCount++;
        }
      } catch (err) {
        console.log(`   ❌ Exception: ${err.message}`);
        errorCount++;
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n📊 Migration Results:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📝 Total: ${statements.length}`);

    // Verify tables were created
    console.log(`\n🔍 Verifying tables...`);
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['restaurants', 'users', 'staff_invitations']);

    if (tableError) {
      console.log(`❌ Verification failed: ${tableError.message}`);
    } else {
      const tableNames = tables?.map(t => t.table_name) || [];
      console.log(`📋 Created tables: ${tableNames.join(', ')}`);

      if (tableNames.length >= 3) {
        console.log(`\n🎉 Schema push completed successfully!`);
        console.log(`✅ All core tables are ready`);
        console.log(`🚀 Database is ready for use`);
      } else {
        console.log(`\n⚠️  Some tables may be missing`);
        console.log(`Expected: restaurants, users, staff_invitations`);
        console.log(`Found: ${tableNames.join(', ')}`);
      }
    }

  } catch (error) {
    console.error(`\n❌ Schema push failed: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  pushSchema().catch(error => {
    console.error('Push error:', error);
    process.exit(1);
  });
}