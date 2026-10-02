# Supabase Setup

This static app uses one shared JSON state row. Visitors can read the scoreboard; only Supabase-authenticated users with the `admin` app-metadata role can write it.

## Configure Supabase

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the project SQL Editor.
3. In Authentication settings, disable public sign-ups.
4. Create the admin user in Authentication > Users.
5. In the SQL Editor, grant that user's account the admin role, replacing the email:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where email = 'admin@example.com';
```

6. Copy the Project URL and public anon/publishable key from the Supabase API settings into `js/config.js`.

Only put the public anon/publishable key in `js/config.js`. Never put the `service_role` key in this browser app.

## Initial shared data

On the first admin sign-in, the app uploads that browser's current data if the shared state table is empty. If a shared state already exists, the app downloads it instead. Subsequent admin changes sync through Supabase Realtime to open devices.

The app continues to use localStorage when the URL or public key is blank. Serve the app over HTTPS (or localhost for testing) so authentication and the service worker work correctly.
