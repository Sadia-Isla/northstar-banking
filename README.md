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
