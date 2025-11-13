# Supabase Setup Guide

To enable event synchronization across all browsers and devices, you need to set up Supabase.

## Steps:

1. **Create a Supabase Project**
   - Go to https://supabase.com
   - Sign up or log in
   - Click "New Project"
   - Fill in your project details

2. **Get Your API Keys**
   - Go to Project Settings → API
   - Copy your "Project URL" (this is `NEXT_PUBLIC_SUPABASE_URL`)
   - Copy your "anon public" key (this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

3. **Create the Database Schema**
   - Go to SQL Editor in your Supabase dashboard
   - Copy and paste the entire contents of `database-schema.sql` from this project
   - Click "Run" to execute the schema
   
   **OR** if you just want the minimal setup for events:
   
   ```sql
   CREATE TABLE IF NOT EXISTS events (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     title TEXT NOT NULL,
     club TEXT NOT NULL,
     starts_at TIMESTAMPTZ NOT NULL,
     ends_at TIMESTAMPTZ,
     location TEXT NOT NULL,
     tags TEXT[] DEFAULT '{}',
     current_attendees INTEGER DEFAULT 0,
     status TEXT DEFAULT 'scheduled',
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );
   
   ALTER TABLE events ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "Allow public read access" ON events
     FOR SELECT USING (true);
   
   CREATE POLICY "Allow public insert access" ON events
     FOR INSERT WITH CHECK (true);
   ```
   
   > **Note:** The full `database-schema.sql` includes tables for users, clubs, RSVPs, attendance, points, and more. Use the full schema for the complete PTK Campus+ experience.

4. **Set Environment Variables**
   - Create a `.env.local` file in the root of your project
   - Add your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

5. **Deploy to Vercel**
   - Add these same environment variables in your Vercel project settings
   - Go to Settings → Environment Variables
   - Add both variables for Production, Preview, and Development

## Without Supabase

If you don't set up Supabase, the app will still work but events won't sync across browsers/devices. Each browser will have its own separate event list.

