# Northstar Banking

Northstar Banking is a small full-stack banking dashboard with:
- an ASP.NET Core backend API
- an Angular frontend
- overview, accounts, transactions, insights, and support pages
- transaction CRUD APIs and an AG Grid management workspace
- optional OAuth/OIDC plumbing for frontend and backend protection

## Structure

```text
Northstar-Banking/
|-- banking-domain/
|   |-- backend/
|   |   `-- BankingApi/
|   `-- frontend/
|       `-- banking-ui/
`-- Northstar-Banking.sln
```

## Run the Backend

```bash
cd "Northstar-Banking/banking-domain/backend/BankingApi"
dotnet restore
dotnet run
```

OAuth configuration lives in `appsettings.json` and `appsettings.Development.json` under `Authentication`.
Leave `Enabled` as `false` for local mock mode, or set:
- `Enabled` to `true`
- `Authority` to your OAuth/OIDC issuer URL
- `Audience` to the API audience your provider issues access tokens for

## Run the Frontend

```bash
cd "Northstar-Banking/banking-domain/frontend/banking-ui"
npm install
ng serve --proxy-config proxy.conf.json
```

Frontend OAuth configuration lives in:
- `src/environments/environment.ts`
- `src/environments/environment.development.ts`

Set `oauth.enabled` to `true` and provide:
- `issuer`
- `clientId`
- `scope`

## Deploy on Render

This repo now includes a root `render.yaml` blueprint for:
- a static Angular frontend
- a Docker-based .NET web API backend

Render service layout:
- frontend root: `banking-domain/frontend/banking-ui`
- backend Dockerfile: `banking-domain/backend/BankingApi/Dockerfile`

Important environment variables:
- frontend `API_BASE_URL`: set this to your backend Render URL, for example `https://northstar-banking-api.onrender.com`
- backend `Cors__AllowedOrigins__0`: set this to your frontend Render URL

Optional OAuth variables for the frontend static build:
- `OAUTH_ENABLED`
- `OAUTH_ISSUER`
- `OAUTH_CLIENT_ID`
- `OAUTH_SCOPE`
- `OAUTH_REQUIRE_HTTPS`

Render dashboard paths:
- preferred: `New` -> `Blueprint`, then connect the repo and use the root `render.yaml`
- manual fallback: create a `Static Site` for the frontend and a `Web Service` with `Language = Docker` for the backend
