# Supabase Storage Policy Setup

## Quick Fix: Enable Public Image & Audio Uploads

Your database is working perfectly, but images need storage policies to upload to Supabase Storage buckets.

---

## Step 1: Add Policy for Images Bucket

1. Go to **Supabase Dashboard** → **Storage** → **Policies**
2. Select the `images` bucket
3. Click **"New Policy"**
4. Click **"For full customization"**
5. Paste this SQL:

```sql
-- Allow public uploads to images bucket
CREATE POLICY "Public Upload Access"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'images');

-- Allow public read access to images
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');
```

---

## Step 2: Add Policy for Voice Audio Bucket

1. Select the `voice-audio` bucket
2. Click **"New Policy"** → **"For full customization"**
3. Paste this SQL:

```sql
-- Allow public uploads to voice-audio bucket
CREATE POLICY "Public Upload Access"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'voice-audio');

-- Allow public read access to voice audio
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'voice-audio');
```

---

## Step 3: Make Buckets Public (Alternative Method)

If the SQL policies seem complex, you can simply make the buckets public:

1. Go to **Storage** → **Configuration**
2. For each bucket (`images`, `voice-audio`):
   - Click the **⋮** menu
   - Select **"Make Public"**
   - Confirm

This will automatically create the necessary policies.

---

## Verification

After adding policies, test image upload:

1. Open [http://localhost:3000](http://localhost:3000)
2. Upload a new image
3. Go to **Supabase Dashboard** → **Storage** → **images**
4. You should see `{timestamp}-{id}.png` files appearing

---

## Current Architecture Status

✅ **Database**: PostgreSQL with Prisma ORM (6 items, 21 columns)
✅ **Job Queue**: In-memory async processing
✅ **Storage Buckets**: Created (`images`, `voice-audio`)
⚠️ **Storage Policies**: Need to be added (this guide)
✅ **Chrome Extension**: Manifest V3 with context menus
✅ **AI Classification**: Claude Sonnet + Vision API
✅ **Voice Transcription**: OpenAI Whisper
✅ **Search**: Semantic search with query parsing

**Once you add the storage policies, the entire blueprint will be 100% functional!**
