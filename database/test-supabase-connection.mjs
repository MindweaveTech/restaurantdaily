#!/usr/bin/env node

/**
 * Test Supabase Connection Script
 *
 * Connects to your remote Supabase instance and validates credentials
 * Requires Vault to be running with SUPABASE_* credentials configured
 */

import { createClient } from '@supabase/supabase-js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Helper function to get secrets from Vault using vault CLI
async function getVaultSecret(secretPath) {
  try {
    const vaultAddr = process.env.VAULT_ADDR || 'http://127.0.0.1:8200';
    const vaultToken = process.env.VAULT_TOKEN;

    if (!vaultToken) {
      throw new Error('VAULT_TOKEN environment variable not set');
    }

    const { stdout } = await execAsync(
      `VAULT_ADDR=${vaultAddr} VAULT_TOKEN=${vaultToken} vault kv get -format=json ${secretPath}`,
      { maxBuffer: 10 * 1024 * 1024 }
    );

    const response = JSON.parse(stdout);
    // Vault KV v2 returns data nested under .data.data
    return response?.data?.data || response?.data;
  } catch (error) {
    console.error(`❌ Failed to get Vault secret: ${error.message}`);
    throw error;
  }
}

// Main test function
async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...\n');

  try {
    // Step 1: Get credentials from Vault
    console.log('📦 Fetching credentials from Vault...');
    const supabaseSecrets = await getVaultSecret('secret/supabase');

    if (!supabaseSecrets || !supabaseSecrets.url || !supabaseSecrets.anon_key) {
      throw new Error(`Missing required Supabase credentials in Vault (url, anon_key). Got: ${JSON.stringify(supabaseSecrets)}`);
    }

    const supabaseUrl = supabaseSecrets.url;
    const supabaseKey = supabaseSecrets.anon_key;

    console.log(`✅ Credentials retrieved`);
    console.log(`   URL: ${supabaseUrl}`);
    console.log(`   Key: ${supabaseKey.substring(0, 10)}...`);

    // Step 2: Create Supabase client
    console.log('\n🚀 Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Client created');

    // Step 3: Test connection by querying users table
    console.log('\n🔗 Testing connection to users table...');
    const { error: userError, count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (userError) {
      throw new Error(`Failed to query users table: ${userError.message}`);
    }

    console.log(`✅ Connection successful!`);
    console.log(`   Users table accessible`);
    console.log(`   Total users in database: ${count || 0}`);

    // Step 4: Test with service role key if available
    if (supabaseSecrets.service_role_key) {
      console.log('\n🔐 Testing with service role key...');
      const supabaseAdmin = createClient(supabaseUrl, supabaseSecrets.service_role_key);

      const { error: adminError } = await supabaseAdmin
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (adminError) {
        throw new Error(`Service role key test failed: ${adminError.message}`);
      }

      console.log(`✅ Service role key working!`);
      console.log(`   Admin access confirmed`);
    }

    // Success summary
    console.log('\n' + '='.repeat(50));
    console.log('✅ ALL TESTS PASSED!');
    console.log('='.repeat(50));
    console.log('\nYour Supabase connection is working correctly.');
    console.log('You can now use the Supabase MCP server in Claude Code.');

    process.exit(0);
  } catch (error) {
    console.error('\n' + '='.repeat(50));
    console.error('❌ CONNECTION TEST FAILED');
    console.error('='.repeat(50));
    console.error(`\nError: ${error.message}\n`);

    console.error('Troubleshooting steps:');
    console.error('1. Ensure Vault server is running: vault server -dev');
    console.error('2. Set VAULT_TOKEN and VAULT_ADDR environment variables');
    console.error('3. Verify credentials in Vault: vault kv get secret/supabase');
    console.error('4. Check internet connection to Supabase');
    console.error('5. Verify Supabase project is active at: https://app.supabase.com\n');

    process.exit(1);
  }
}

// Run the test
testSupabaseConnection();
