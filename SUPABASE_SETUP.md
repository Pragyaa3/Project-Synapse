# 🚀 Supabase Setup Guide

Follow these steps to set up your Supabase database for Synapse.

## Step 1: Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign up with GitHub or email

## Step 2: Create a New Project

1. Click **"New Project"**
2. Fill in:
   - **Name**: `synapse` (or whatever you prefer)
   - **Database Password**: Create a strong password (SAVE THIS!)
   - **Region**: Choose closest to you
3. Click **"Create new project"**
4. Wait ~2 minutes for setup to complete

## Step 3: Get Your Database Connection Strings

1. In your project dashboard, click **Settings** (gear icon in sidebar)
2. Click **"Database"** in the left menu
3. Scroll to **"Connection string"** section
4. You'll see two connection modes:

### **Connection Pooling** (for DATABASE_URL)
- Select "**Transaction**" mode
- Copy the URI
- Replace `[YOUR-PASSWORD]` with the password you created
- Example:
  ```
  postgresql://postgres.abc123:mypassword@aws-0-us-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true
  ```

### **Direct Connection** (for DIRECT_URL)
- Select "**Session**" mode
- Copy the URI
- Replace `[YOUR-PASSWORD]` with your password
- Example:
  ```
  postgresql://postgres.abc123:mypassword@db.abc123.supabase.co:5432/postgres
  ```

## Step 4: Get Your API Keys

1. Still in Settings, click **"API"** in the left menu
2. Copy these values:
   - **Project URL** (looks like: `https://abc123.supabase.co`)
   - **anon public** key (the long string under "Project API keys")

## Step 5: Update `.env.local`

Open your `.env.local` file and replace the placeholders:

```env
# Replace these with your actual values:
DATABASE_URL="postgresql://postgres.YOUR_REF:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.YOUR_REF:YOUR_PASSWORD@db.YOUR_REF.supabase.co:5432/postgres"

NEXT_PUBLIC_SUPABASE_URL=https://YOUR_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 6: Create Storage Buckets

We need two buckets for storing files:

1. In Supabase dashboard, click **"Storage"** in sidebar
2. Click **"Create a new bucket"**

### Bucket 1: Images
- **Name**: `images`
- **Public bucket**: ✅ Check this
- Click **"Create bucket"**

### Bucket 2: Voice Audio
- **Name**: `voice-audio`
- **Public bucket**: ✅ Check this
- Click **"Create bucket"**

## Step 7: Run Database Migration

Back in your terminal:

```bash
npx prisma migrate dev --name init
```

This will:
- Create the `Item` table in your Supabase database
- Generate the Prisma client
- Set up all indexes

## Step 8: Verify Setup

Check that it worked:

```bash
npx prisma studio
```

This opens a GUI to view your database. You should see an empty `Item` table.

---

## ✅ You're Done!

Your Supabase database is now set up and ready to use!

## 🔑 Important Notes

- **Keep your password safe** - Store it in a password manager
- **Never commit `.env.local`** - It's already in `.gitignore`
- **Free tier limits**:
  - 500MB database
  - 1GB file storage
  - Unlimited API requests
  - 2GB bandwidth

## 📚 Next Steps

The app will now:
- Save all items to Supabase PostgreSQL
- Store images in Supabase Storage
- Store voice audio in Supabase Storage
- Support real-time sync (future feature)

---

**Need help?** Check [Supabase Docs](https://supabase.com/docs)
