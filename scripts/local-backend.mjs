import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Never copy a hosted service-role credential into a browser environment.
export function frontendEnvironment(status, codespace = {}) {
  const api = new URL(status.API_URL);
  if (!['127.0.0.1', 'localhost'].includes(api.hostname)) {
    throw new Error('Expected a local Supabase instance; refusing hosted configuration.');
  }
  const key = status.ANON_KEY;
  if (typeof key !== 'string' || !key || /[\r\n"']/.test(key)) {
    throw new Error('Local Supabase did not provide a valid anonymous key.');
  }
  if (codespace.name) {
    if (!/^[a-z0-9-]+$/.test(codespace.name) || codespace.domain !== 'app.github.dev') {
      throw new Error('Unexpected Codespaces port-forwarding address.');
    }
    api.href = `https://${codespace.name}-8080.${codespace.domain}/backend`;
  }
  return `# Generated for local development only; do not commit.\nVITE_SUPABASE_URL="${api.href.replace(/\/$/, '')}"\nVITE_SUPABASE_PUBLISHABLE_KEY="${key}"\n`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const cli = fileURLToPath(new URL('../node_modules/.bin/supabase', import.meta.url));
  const status = JSON.parse(execFileSync(cli, ['status', '-o', 'json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }));
  const env = frontendEnvironment(status, {
    name: process.env.CODESPACE_NAME,
    domain: process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN,
  });
  writeFileSync(new URL('../.env.development.local', import.meta.url), env, { mode: 0o600 });
  console.log('Development backend configured. No credentials were printed.');
}
