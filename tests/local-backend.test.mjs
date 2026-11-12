import { test } from 'node:test';
import assert from 'node:assert/strict';
import { frontendEnvironment } from '../scripts/local-backend.mjs';
const status = { API_URL: 'http://127.0.0.1:54321', ANON_KEY: 'local-anon', SERVICE_ROLE_KEY: 'must-not-be-exported' };
test('local browser configuration excludes privileged credentials', () => {
  const env = frontendEnvironment(status);
  assert.match(env, /http:\/\/127.0.0.1:54321/);
  assert.doesNotMatch(env, /must-not-be-exported/);
});
test('Codespaces uses its forwarded API URL', () => {
  assert.match(frontendEnvironment(status, { name: 'autoreach-test', domain: 'app.github.dev' }), /https:\/\/autoreach-test-8080.app.github.dev\/backend/);
});
test('hosted configuration is refused', () => {
  assert.throws(() => frontendEnvironment({ ...status, API_URL: 'https://example.supabase.co' }), /refusing hosted/);
});
test('malformed key and unexpected forwarding domain are refused', () => {
  assert.throws(() => frontendEnvironment({ ...status, ANON_KEY: 'bad\nkey' }));
  assert.throws(() => frontendEnvironment(status, { name: 'test', domain: 'example.com' }));
});
