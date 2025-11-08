# 🗄️ Database Migration Guide

Synapse now uses **Supabase (PostgreSQL) + Prisma** instead of file-based storage!

## ✅ What's Changed

- ✅ All data now stored in **Supabase PostgreSQL** (scalable, searchable)
- ✅ Images stored in **Supabase Storage** (not base64)
- ✅ Voice audio stored in **Supabase Storage**
- ✅ **Prisma ORM** for type-safe database access
- ✅ API-first architecture (no more localStorage sync issues)
- ✅ Ready for real-time sync (future feature)

---

## 🚀 Setup Instructions

### Step 1: Setup Supabase

Follow the detailed guide in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

**Quick summary:**
1. Create Supabase account at https://supabase.com
2. Create new project (save your password!)
3. Get database connection strings from Settings → Database
4. Get API keys from Settings → API
5. Create two storage buckets: `images` and `voice-audio` (both public)
6. Update `.env.local` with your credentials

### Step 2: Run Database Migration

Once your `.env.local` is configured:

```bash
npx prisma migrate dev --name init
```

This will:
- Create the `Item` table in your Supabase database
- Add all necessary indexes
- Generate the Prisma Client

### Step 3: Verify Setup

Open Prisma Studio to view your database:

```bash
npx prisma studio
```

You should see an empty `Item` table. Perfect!

### Step 4: Test the App

```bash
npm run dev
```

Try:
1. **Manual capture** - Click "Capture", paste some text, save
2. **Extension capture** - Right-click on any webpage to save
3. **Image upload** - Upload an image and see it go to Supabase Storage
4. **Voice note** - Record audio and see it transcribed

All data now saves to your Supabase database! 🎉

---

## 📊 Database Schema

```prisma
model Item {
  id          String   @id @default(uuid())
  type        String
  rawContent  String?
  url         String?

  // Core metadata
  title       String?
  summary     String?
  author      String?
  source      String?

  // AI-extracted
  keywords    String[]
  tags        String[]

  // Image data
  imageUrl       String?
  imageAnalysis  String?
  extractedText  String?
  colors         String[]
  visualType     String?

  // Voice data (JSON)
  voice Json?

  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## 🔄 Migrating Existing Data (Optional)

If you have existing data in `data/items.json`, you can migrate it:

### Option 1: Manual Migration (Recommended)

Since your existing data is likely test data, the easiest approach is to:
1. Delete or rename `data/items.json`
2. Start fresh with Supabase
3. Re-capture any important content using the extension

### Option 2: Automated Migration Script

If you have important data to migrate, I can create a migration script. Just let me know!

---

## 🎯 What's Different Now

### Before (File Storage):
```javascript
// Saved to: data/items.json
{
  "id": "1234567890",
  "type": "article",
  "image": "data:image/png;base64,..." // 💥 Huge file!
}
```

### After (Supabase):
```javascript
// Saved to: PostgreSQL database
{
  "id": "uuid-here",
  "type": "article",
  "imageUrl": "https://abc.supabase.co/storage/v1/object/public/images/..." // ✅ Just a URL!
}
```

**Benefits:**
- 📦 No more huge JSON files
- 🚀 Much faster loading
- 🔍 Proper database queries
- 📊 Better analytics
- 🌐 Ready for multi-device sync

---

## 🛠️ Troubleshooting

### Error: "Prisma Client not found"

Run:
```bash
npx prisma generate
```

### Error: "Invalid DATABASE_URL"

Check your `.env.local`:
- Make sure you replaced `[YOUR-PASSWORD]` with your actual password
- Make sure you replaced `[YOUR-PROJECT-REF]` with your project reference
- No spaces around the `=` sign

### Error: "Failed to fetch items"

Check:
1. Is Supabase project running? (Check dashboard)
2. Are the connection strings correct?
3. Did you run `npx prisma migrate dev`?

### Images not uploading

Check:
1. Did you create the `images` bucket in Supabase Storage?
2. Is it set to **public**?
3. Are your `NEXT_PUBLIC_SUPABASE_*` variables in `.env.local`?

---

## 📚 Next Steps

Now that you have a proper database:

1. ✅ **Better search** - Use PostgreSQL full-text search
2. ✅ **Analytics** - Track usage patterns
3. ✅ **Collections** - Group related items
4. ✅ **Sharing** - Share items with others
5. ✅ **Real-time sync** - Sync across devices instantly
6. ✅ **Backup** - Automatic Supabase backups

---

**Need help?** Check the [Supabase Docs](https://supabase.com/docs) or [Prisma Docs](https://www.prisma.io/docs)
