import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const outputPath = resolve('src/environments/environment.render.ts');

const asBoolean = (value, fallback) => {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  return value.toLowerCase() === 'true';
};

const environment = {
  apiBaseUrl: process.env.API_BASE_URL ?? '',
  oauth: {
    enabled: asBoolean(process.env.OAUTH_ENABLED, false),
    issuer: process.env.OAUTH_ISSUER ?? 'https://your-auth-domain/',
    clientId: process.env.OAUTH_CLIENT_ID ?? 'northstar-banking-ui',
    scope: process.env.OAUTH_SCOPE ?? 'openid profile email api://northstar-banking-api/access',
    requireHttps: asBoolean(process.env.OAUTH_REQUIRE_HTTPS, true)
  }
};

const fileContents = `export const environment = ${JSON.stringify(environment, null, 2)} as const;\n`;

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, fileContents, 'utf8');

console.log(`Generated ${outputPath}`);
