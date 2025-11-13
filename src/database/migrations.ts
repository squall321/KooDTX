/**
 * WatermelonDB Schema Migrations
 * Manages database schema changes across versions
 */

import {
  schemaMigrations,
  createTable,
  addColumns,
} from '@nozbe/watermelondb/Schema/migrations';

/**
 * Migration from version 7 to version 8
 * Added sync_queue and files tables
 */
export const migrations = schemaMigrations({
  migrations: [
    // Version 1 -> 2: Initial migrations (if needed in future)
    // {
    //   toVersion: 2,
    //   steps: [
    //     // Migration steps
    //   ],
    // },

    // Version 7 -> 8: Add sync_queue and files tables
    {
      toVersion: 8,
      steps: [
        // Add sync_queue table
        createTable({
          name: 'sync_queue',
          columns: [
            {name: 'session_id', type: 'string', isIndexed: true},
            {name: 'item_type', type: 'string', isIndexed: true},
            {name: 'item_id', type: 'string', isIndexed: true},
            {name: 'status', type: 'string', isIndexed: true},
            {name: 'retry_count', type: 'number'},
            {name: 'max_retries', type: 'number'},
            {name: 'priority', type: 'number', isIndexed: true},
            {name: 'error_message', type: 'string', isOptional: true},
            {name: 'last_attempt_at', type: 'number', isOptional: true},
            {name: 'next_retry_at', type: 'number', isOptional: true},
            {name: 'completed_at', type: 'number', isOptional: true},
            {name: 'created_at', type: 'number'},
            {name: 'updated_at', type: 'number'},
          ],
        }),

        // Add files table
        createTable({
          name: 'files',
          columns: [
            {name: 'session_id', type: 'string', isIndexed: true},
            {name: 'file_type', type: 'string', isIndexed: true},
            {name: 'file_path', type: 'string'},
            {name: 'file_name', type: 'string'},
            {name: 'file_size', type: 'number'},
            {name: 'mime_type', type: 'string'},
            {name: 'checksum', type: 'string', isOptional: true},
            {name: 'is_uploaded', type: 'boolean'},
            {name: 'uploaded_url', type: 'string', isOptional: true},
            {name: 'uploaded_at', type: 'number', isOptional: true},
            {name: 'metadata', type: 'string', isOptional: true},
            {name: 'created_at', type: 'number'},
            {name: 'updated_at', type: 'number'},
          ],
        }),
      ],
    },

    // Example: Future migration from version 8 to 9
    // {
    //   toVersion: 9,
    //   steps: [
    //     // Add new columns to existing tables
    //     addColumns({
    //       table: 'recording_sessions',
    //       columns: [
    //         {name: 'new_field', type: 'string', isOptional: true},
    //       ],
    //     }),
    //   ],
    // },
  ],
});

/**
 * Migration helper functions for common operations
 */

/**
 * Create a migration step to add columns to an existing table
 * @param tableName - Name of the table
 * @param columns - Array of column definitions
 */
export function createAddColumnsMigration(
  tableName: string,
  columns: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean';
    isOptional?: boolean;
    isIndexed?: boolean;
  }>,
) {
  return addColumns({
    table: tableName,
    columns: columns.map(col => ({
      name: col.name,
      type: col.type,
      isOptional: col.isOptional,
      isIndexed: col.isIndexed,
    })),
  });
}

/**
 * Validate migration integrity
 * Ensures all migrations are properly ordered
 */
export function validateMigrations(): {valid: boolean; errors: string[]} {
  const errors: string[] = [];
  const migrationSteps = migrations.migrations;

  // Check that versions are sequential
  for (let i = 0; i < migrationSteps.length; i++) {
    const current = migrationSteps[i];

    // Check if steps array exists
    if (!current.steps || current.steps.length === 0) {
      errors.push(`Migration to version ${current.toVersion} has no steps`);
    }

    // Check if version increases
    if (i > 0) {
      const previous = migrationSteps[i - 1];
      if (current.toVersion <= previous.toVersion) {
        errors.push(
          `Migration version order error: ${previous.toVersion} -> ${current.toVersion}`,
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get current schema version from migrations
 */
export function getCurrentSchemaVersion(): number {
  const migrationSteps = migrations.migrations;
  if (migrationSteps.length === 0) {
    return 1; // Default to version 1 if no migrations
  }
  return migrationSteps[migrationSteps.length - 1].toVersion;
}

/**
 * Get migration history as a readable string
 */
export function getMigrationHistory(): string {
  const migrationSteps = migrations.migrations;
  const lines = ['Database Migration History:', ''];

  migrationSteps.forEach(migration => {
    lines.push(`Version ${migration.toVersion}:`);
    lines.push(`  - ${migration.steps.length} migration step(s)`);
  });

  lines.push('');
  lines.push(`Current version: ${getCurrentSchemaVersion()}`);

  return lines.join('\n');
}

/**
 * Check if a specific table was created in migrations
 */
export function isTableInMigrations(tableName: string): boolean {
  const migrationSteps = migrations.migrations;

  for (const migration of migrationSteps) {
    for (const step of migration.steps) {
      if ('name' in step && step.name === tableName) {
        return true;
      }
    }
  }

  return false;
}

// Validate migrations on import (development only)
if (__DEV__) {
  const validation = validateMigrations();
  if (!validation.valid) {
    console.warn('⚠️ Migration validation failed:');
    validation.errors.forEach(error => console.warn(`  - ${error}`));
  } else {
    console.log('✓ Database migrations validated successfully');
    console.log(getMigrationHistory());
  }
}
