# Backend Deployment to cPanel (ambrosia-api)

## Folder structure to upload

Your backend folder on cPanel should look like this:

```
ambrosia-api/
├── package.json
├── package-lock.json
├── .env
└── server/
    ├── index.js
    ├── loadEnv.js
    ├── middleware/
    │   ├── auth.js
    │   └── rateLimit.js
    ├── routes/
    │   ├── admin.js
    │   ├── orders.js
    │   ├── packs.js
    │   ├── razorpay.js
    │   ├── shiprocket.js
    │   ├── shipping.js
    │   ├── shippingCombos.js
    │   └── users.js
    └── utils/
        └── shiprocket.js
```

## Files to upload (from your project root)

| Local path | Upload to |
|------------|-----------|
| `package.json` | `ambrosia-api/package.json` |
| `package-lock.json` | `ambrosia-api/package-lock.json` |
| `.env` | `ambrosia-api/.env` |
| `server/index.js` | `ambrosia-api/server/index.js` |
| `server/loadEnv.js` | `ambrosia-api/server/loadEnv.js` |
| `server/middleware/*` | `ambrosia-api/server/middleware/` |
| `server/routes/*` | `ambrosia-api/server/routes/` |
| `server/utils/*` | `ambrosia-api/server/utils/` |

## Do NOT upload

- `src/` (frontend – already in public_html)
- `public/`
- `dist/`
- `supabase/`
- `docs/`
- `node_modules/`
- `index.html`, `vite.config.js`, etc.

## After upload

1. In cPanel Node.js App terminal or SSH:
   ```bash
   cd ~/ambrosia-api
   npm install --production
   ```

2. Set startup file: `server/index.js`

3. Set `PORT` in .env if cPanel assigns a different port (e.g. 3000 or 8080)

4. Restart the Node.js application from cPanel
