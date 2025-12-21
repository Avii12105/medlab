// Legacy alias: export Supabase client for any code still requiring this file.
// The project uses Supabase. This file exists only to avoid errors
// when older code imports `src/config/db.js` — prefer `src/config/supabase.js`.

module.exports = require('./supabase');
