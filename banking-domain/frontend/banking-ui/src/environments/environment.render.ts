export const environment = {
  "apiBaseUrl": "",
  "oauth": {
    "enabled": false,
    "issuer": "https://your-auth-domain/",
    "clientId": "northstar-banking-ui",
    "scope": "openid profile email api://northstar-banking-api/access",
    "requireHttps": true
  }
} as const;
