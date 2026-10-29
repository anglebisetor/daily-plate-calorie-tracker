# Daily Plate — Indian Calorie Tracker

A responsive React + TypeScript calorie tracker built for everyday Indian foods. It starts in local-only mode, so you can use it without creating any accounts. Add Supabase configuration to enable account-based cloud sync.

## Included

- 1,500 kcal daily target (editable)
- Searchable built-in food list: raw/cooked rice and dal, dry/rehydrated soya chunks, eggs, oils, ghee, sabzi, and more
- Quantity-based calorie and protein estimates
- Food diary by date and meal
- Edit/delete entries and CSV export
- Custom foods and custom recipes with ingredient calculations
- 7-day calorie overview
- Responsive desktop/mobile layout and PWA manifest
- Optional Supabase email/password and Google OAuth sign-in

Nutrition figures are estimates, particularly for home-cooked dishes. Recipe calories depend on ingredients and the amount of oil used.

## 1. Run locally

Install Node.js LTS from https://nodejs.org/ and Git if you want version control.

In this folder run:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## 2. Enable cloud sync (free-tier options may change)

1. Create a project at https://supabase.com/.
2. In Supabase, open **SQL Editor**, create a query, paste all of `supabase.sql`, and run it.
3. In **Project Settings → API** (or the project's Connect/API section), copy the Project URL and the publishable/anon key. Never use a service-role key in the browser.
4. Create `.env` in this project root:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
```

5. Restart `npm run dev`. Restart Vite whenever environment variables change.
6. In Supabase **Authentication → URL Configuration**, set the Site URL to your deployed URL and add redirect URLs for local development (`http://localhost:5173/**`) and the deployed domain.
7. For Google sign-in, configure Google as an OAuth provider under Supabase Authentication providers. Create OAuth credentials in Google Cloud Console and use the callback URL displayed by Supabase. Add the Google Client ID and Client Secret to Supabase's provider settings (not to `.env`).
8. Test with a new account. Log entries, then sign in with that same account on the other device.

**Important:** the included RLS policies isolate rows by authenticated user. Run the SQL script before signing in. Do not disable RLS or expose a service-role key.

### Existing local data

This initial version saves entries in the browser's local storage before you sign in. It does not automatically merge existing local entries into a cloud account on sign-in. Export your local entries to CSV first if you need a backup. Once cloud sync is configured, test with a new entry and verify it appears on both devices.

## 3. Free deployment using GitHub + Cloudflare Pages

1. Create a GitHub repository and upload these project files.
2. In Cloudflare Dashboard, open **Workers & Pages → Create → Pages → Connect to Git**.
3. Choose your repository. Use:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
4. In the project's **Settings → Environment variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy. Add the resulting HTTPS URL to Supabase Auth's allowed redirect URLs and Site URL.
6. Redeploy after changing environment variables.

Alternative: deploy the same repository to Vercel using `npm run build` and `dist`.

## 4. Use on phone and laptop

Open the deployed HTTPS URL on both devices. Sign in to the same account on both. Entries created after cloud sync is configured are stored in Supabase and are accessible across different Wi-Fi networks. In local-only mode, data stays in that browser/device.

On Android, use Chrome's menu → **Add to Home screen** (or **Install app** if offered).

## Notes / current limitations

- The built-in database is a starter set, not an exhaustive catalogue. Prepared-dish values are approximate.
- Cloud entries, settings, and custom foods are stored in Supabase after setup. The app is not an offline-first sync engine; do not rely on logging while offline.
- Cloud sync requires configuring Supabase and, for Google sign-in, Google OAuth. The app does not deploy itself.
- Check your deployment provider's current free-tier limits before relying on it long term.
