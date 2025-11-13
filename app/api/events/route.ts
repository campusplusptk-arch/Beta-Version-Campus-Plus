import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // If Supabase is not configured, return empty array
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ data: [] });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'scheduled';
    
    const { data, error } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('status', status)
      .order('starts_at', { ascending: true });
    
    if (error) {
      console.error('Supabase error:', error);
      // Fallback: return empty array if Supabase is not configured
      if (error.message.includes('Invalid API key') || error.message.includes('JWT') || error.message.includes('Supabase not configured')) {
        return NextResponse.json({ data: [] });
      }
      throw error;
    }
    
    return NextResponse.json({ data: data || [] });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.club || !body.starts_at || !body.location) {
      return NextResponse.json(
        { error: 'Missing required fields: title, club, starts_at, location' },
        { status: 400 }
      );
    }
    
    // Prepare event data
    const eventData = {
      title: body.title,
      club: body.club,
      starts_at: body.starts_at,
      ends_at: body.ends_at || null,
      location: body.location,
      tags: body.tags || [],
      current_attendees: body.current_attendees || 0,
      status: 'scheduled',
      created_at: new Date().toISOString(),
    };
    
    // If Supabase is not configured, return mock data
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ 
        data: { ...eventData, id: Date.now().toString() } 
      }, { status: 201 });
    }
    
    const { data, error } = await supabaseAdmin
      .from('events')
      .insert(eventData)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      // If Supabase is not configured, return the data anyway for development
      if (error.message.includes('Invalid API key') || error.message.includes('JWT') || error.message.includes('Supabase not configured')) {
        return NextResponse.json({ 
          data: { ...eventData, id: Date.now().toString() } 
        }, { status: 201 });
      }
      throw error;
    }
    
    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

