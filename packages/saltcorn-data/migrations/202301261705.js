const sql_pg = `alter table _sc_tables add column "ownership" jsonb`;
const sql_sqlite = `alter table _sc_tables add column "ownership" json`;

module.exports = { sql_pg, sql_sqlite };
