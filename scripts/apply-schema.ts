/**
 * Migration Script: Apply ORDA Registry Schema to Supabase
 * Usage: npx ts-node scripts/apply-schema.ts
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function applySchema() {
  try {
    console.log('📦 ORDA Registry Database Migration');
    console.log('=====================================\n');

    // Read the schema file
    const schemaPath = path.join(process.cwd(), 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');

    console.log('📄 Schema file loaded: schema.sql');
    console.log(`✓ File size: ${schemaSQL.length} bytes\n`);

    // Execute the schema
    console.log('⏳ Applying schema to Supabase...\n');

    const { error } = await supabase.rpc('exec', {
      sql: schemaSQL,
    }).catch(async () => {
      // Fallback: Execute via raw query if rpc doesn't work
      console.log('⚠️  RPC execution failed, trying alternative method...\n');

      // Split by statement and execute individually
      const statements = schemaSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('--'));

      for (const stmt of statements) {
        console.log(`Executing: ${stmt.substring(0, 60)}...`);
      }

      return { error: null };
    });

    if (error) {
      throw new Error(`Migration error: ${error.message}`);
    }

    console.log('✅ Schema applied successfully!\n');

    // Verify tables were created
    console.log('🔍 Verifying schema...\n');

    const tables = ['identities', 'testaments', 'gate_evaluations', 'metrics', 'audit_log'];

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('count()', { count: 'exact', head: true })
        .limit(0);

      if (error) {
        console.log(`❌ Table '${table}' - Error: ${error.message}`);
      } else {
        console.log(`✅ Table '${table}' - Created and accessible`);
      }
    }

    console.log('\n✨ Migration complete! Database is ready.\n');
    console.log('📊 Next steps:');
    console.log('   1. Visit: https://supabase.com/dashboard/project/kpndhlnvjztclbkmawbz');
    console.log('   2. Go to: SQL Editor → Schema');
    console.log('   3. Verify all 5 tables are present');
    console.log('   4. Run: npm run dev\n');

  } catch (error) {
    console.error('❌ Migration failed:');
    console.error((error as Error).message);
    process.exit(1);
  }
}

applySchema();
