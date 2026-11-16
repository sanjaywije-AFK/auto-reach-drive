# AutoReach in GitHub Codespaces

This creates a separate development backend. It does not migrate production data or change the hosted Lovable/Supabase app.

## Launch

1. On the branch containing this configuration, choose **Code → Codespaces → Create codespace on this branch**. Use a machine with at least 4 cores and 8 GB RAM for Docker and Supabase. Workspace billing/quota belongs to your GitHub account.
2. Wait for the dev container and `npm ci` to finish. The configuration installs Node 22 and Docker-in-Docker.
3. In its terminal run:

   ```sh
   npm run backend:start
   npm run backend:env
   npm run dev -- --host 0.0.0.0
   ```

4. Open port **8080** from the Ports panel. Keep its visibility **Private**. API requests use Vite's `/backend` proxy on this same port, avoiding a separately exposed Supabase API port. The environment generator uses the Codespace name to generate the correct browser URL.

The backend applies the saved migrations including the corrective migration, and provisions a private `booking-photos` bucket from `supabase/seed.sql`. No accounts or passwords are seeded. Create a customer through the app. Admin/driver roles require an explicit setup step via the local database; do not expose administrative credentials in frontend environment variables.

`npm run backend:env` writes ignored `.env.development.local` with only the local URL and anonymous browser key. It does not print credentials or overwrite the hosted `.env`. Production builds use the existing hosted configuration; review it before any production deployment.

## Verify

```sh
npm run typecheck
npm run lint
npm run test
npm run test:setup
npm run test:db
npm run build
```

`test:db` uses embedded PostgreSQL, not the running Auth/Storage services. A real three-role browser walkthrough is still required after backend startup.

Stop services with `npm run backend:stop`; do not run `db reset` unless you intend to delete the local database. Codespaces storage is development storage, not a production backup.

## On another computer

Install Node 22 and Docker with its daemon running. Run `npm ci` and the same three startup commands. Outside Codespaces, the generated frontend URL points to `http://127.0.0.1:54321`. Keep production and development credentials separate.

## Status of verification in this Codex environment

The portable configuration and setup-unit tests can be checked here, but the full dev container has not been launched in Codespaces. This session's `GH_TOKEN` is invalid and no connected tool can create a Codespace. Its enforced network policy blocks both the hosted Supabase host and `public.ecr.aws`, so starting the local Supabase database here failed at image download. A new, authorized Codespace with normal registry access is required for the live integration checks.

For a restricted environment, preserve existing allowlists and add the actual Supabase project host and required registry/download domains via the approved settings flow. Do not disable TLS or route around network policy.
