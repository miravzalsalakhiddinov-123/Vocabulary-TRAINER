# Vocabulary Trainer

Two separate sites sharing one Supabase database:

- **`public-site/`** — what students use. Browse collections → sets → flashcards/quiz. Read-only, no admin controls anywhere in the code.
- **`admin-site/`** — a completely separate app, on its own URL, gated by a real login. This is where you add/edit/remove collections, sets, and words.
- **`supabase/`** — the database schema (`schema.sql`) and starter content (`seed.sql`).

Because both sites read/write the same Supabase database, anything you change in the admin site appears on the public site immediately — no exporting or re-uploading files.

---

## 1. Set up Supabase (the database)

1. Go to [supabase.com](https://supabase.com), create a free account, and create a new project.
2. Once it's ready, open **SQL Editor → New query**, paste in the contents of `supabase/schema.sql`, and run it. This creates the `books` and `items` tables with the right permissions (Row Level Security: anyone can read, only signed-in users can write).
3. New query again, paste in `supabase/seed.sql`, and run it. This creates your 4 starting collections and loads the Day 35 word list. (Skip this if you'd rather start empty and add everything from the admin panel.)
4. Create your admin login: **Authentication → Users → Add user**. Give it your email and a password — this is what you'll use to sign in to the admin site.
5. **Turn off public sign-ups** so nobody else can create an account: **Authentication → Providers → Email**, disable "Allow new users to sign up." Only the account(s) you create manually will ever be able to sign in.
6. Grab your API keys: **Project Settings → API**. You'll need the **Project URL** and the **anon public** key (not the `service_role` key — never put that in client-side code).

## 2. Fill in the config files

Open both of these and paste in your Project URL and anon key:
- `public-site/config.js`
- `admin-site/config.js`

They can use the same values — the anon key is safe to expose publicly; access control is enforced by the database policies, not by hiding this key.

## 3. Push to GitHub

Create a GitHub repo and push this whole folder (all three subfolders) to it. One repo is enough — Vercel will deploy each site from a different subfolder (next step).

```
git init
git add .
git commit -m "Vocabulary trainer"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

## 4. Deploy with Vercel — two separate projects

You'll create **two** Vercel projects from the same repo, so the public site and admin site end up on two different URLs (e.g. `vocab-trainer.vercel.app` and `vocab-trainer-admin.vercel.app`). Students never see a link to the admin one.

For each project:
1. [vercel.com](https://vercel.com) → **Add New → Project** → import your GitHub repo.
2. Under **Root Directory**, click "Edit" and choose:
   - `public-site` for the student-facing project
   - `admin-site` for the admin project
3. Framework preset: **Other** (it's a plain static site, no build step needed).
4. Deploy.

Repeat for the second one. You now have two independent URLs. Keep the admin URL private — don't link it from the public site or share it with students. (If you'd rather have it on a subdomain like `admin.yoursite.com`, add that as a custom domain to the admin Vercel project.)

## 5. Using the admin site

Open your admin URL, sign in with the email/password you created in step 1.4. From the dashboard you can:
- **Add / edit / delete collections** — the top-level categories.
- **Add / edit / delete sets** inside a collection — a day, a test, whatever grouping makes sense.
- **Edit words** in a set — click "📝 Words" on any set. Words are plain text:

  ```
  ## Part 1
  abroad = за границей
  belongings = личные вещи

  ## Part 2
  comply = соблюдать
  ```
  Each `##` line starts a new part; each `word = translation` line adds a word to the current part. Paste in a whole list at once, or edit it line by line.

Changes save straight to Supabase and are live on the public site right away.

## Notes

- **Weak words** (the "still learning" tracker) are personal to each student's own browser (stored locally there), not shared — that's intentional, it's their own study progress, not shared data.
- **Security model:** the admin site's `signInWithPassword` call is a real authentication check against Supabase, and the database policies (`schema.sql`) only allow writes from signed-in users. Reads are public by design (students need to see the words) but writes are not.
- Want more admins? Add more users the same way in **Authentication → Users**.

## Files
```
public-site/   index.html, style.css, app.js, config.js   — student site
admin-site/    index.html, style.css, admin.js, config.js — admin site (separate URL)
supabase/      schema.sql, seed.sql                       — run once in Supabase's SQL editor
```

## Credits
Prepared by **Miravzal Salakhiddinov**. Telegram: [@salakhiddinovm](https://t.me/salakhiddinovm)
