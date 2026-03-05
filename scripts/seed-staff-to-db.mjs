#!/usr/bin/env node
/**
 * Seed staff data from seed-data.json into the Supabase database
 * Run: node scripts/seed-staff-to-db.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load seed data
const seedDataPath = join(__dirname, '../data/.sheets/seed-data.json');
const seedData = JSON.parse(readFileSync(seedDataPath, 'utf-8'));

// Supabase config - use local or cloud
const SUPABASE_URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function seedDatabase() {
  console.log('🌱 Seeding staff data to database...\n');

  // Get the restaurant ID
  const { data: restaurants, error: restError } = await supabase
    .from('restaurants')
    .select('id, name')
    .limit(1);

  if (restError || !restaurants?.length) {
    console.error('❌ No restaurant found. Create a restaurant first.');
    process.exit(1);
  }

  const restaurantId = restaurants[0].id;
  console.log(`📍 Restaurant: ${restaurants[0].name} (${restaurantId})\n`);

  // Get the business admin (who invited the staff)
  const { data: admin } = await supabase
    .from('users')
    .select('id')
    .eq('restaurant_id', restaurantId)
    .eq('role', 'business_admin')
    .single();

  const invitedBy = admin?.id || null;

  // Insert staff members
  let inserted = 0;
  let skipped = 0;

  for (const staff of seedData.staff) {
    // Check if user already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('phone', staff.phone)
      .single();

    if (existing) {
      console.log(`⏭️  Skipped: ${staff.name} (${staff.phone}) - already exists`);
      skipped++;
      continue;
    }

    // Create user record
    const userData = {
      phone: staff.phone,
      name: staff.name,
      email: `${staff.name.toLowerCase()}@burgersingh.com`,
      restaurant_id: restaurantId,
      role: 'employee',
      status: 'active',
      invited_by: invitedBy,
      settings: {
        monthly_salary: staff.monthlySalary,
        shift_hours: staff.shiftHours,
        paid_leaves: 4,
        job_title: staff.role,
      },
      created_at: staff.joinDate ? new Date(staff.joinDate).toISOString() : new Date().toISOString(),
    };

    const { error } = await supabase
      .from('users')
      .insert(userData);

    if (error) {
      console.error(`❌ Error inserting ${staff.name}:`, error.message);
    } else {
      console.log(`✅ Inserted: ${staff.name} (${staff.role}) - ${staff.phone}`);
      inserted++;
    }
  }

  console.log(`\n📊 Summary: ${inserted} inserted, ${skipped} skipped`);

  // Show all users
  const { data: allUsers } = await supabase
    .from('users')
    .select('name, phone, role, status')
    .eq('restaurant_id', restaurantId)
    .order('created_at');

  console.log('\n👥 All staff in database:');
  console.table(allUsers);
}

seedDatabase().catch(console.error);
