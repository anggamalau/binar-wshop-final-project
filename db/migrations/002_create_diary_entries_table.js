exports.up = function(knex) {
  return knex.schema.createTable('diary_entries', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.string('title', 255);
    table.text('content').notNullable();
    table.date('entry_date').defaultTo(knex.fn.now());
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Foreign key constraint
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    
    // Indexes for performance
    table.index('user_id');
    table.index('entry_date');
    table.index('created_at');
    table.index(['user_id', 'entry_date']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('diary_entries');
};