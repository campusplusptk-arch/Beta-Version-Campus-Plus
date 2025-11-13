import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const { data, error } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.club || !body.starts_at || !body.location) {
      return NextResponse.json(
        { error: 'Missing required fields: title, club, starts_at, location' },
        { status: 400 }
      );
    }

    // Validate creator_id is provided
    if (!body.creator_id) {
      return NextResponse.json(
        { error: 'Authentication required. Please provide creator_id.' },
        { status: 401 }
      );
    }

    if (!isSupabaseConfigured()) {
      // Mock update for development
      return NextResponse.json({
        data: {
          id,
          ...body,
          updated_at: new Date().toISOString(),
        }
      });
    }

    // First, check if event exists and verify creator
    const { data: existingEvent, error: fetchError } = await supabaseAdmin
      .from('events')
      .select('creator_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }
      throw fetchError;
    }

    // Verify creator_id matches
    if (existingEvent.creator_id !== body.creator_id) {
      return NextResponse.json(
        { error: 'Unauthorized. You can only edit events you created.' },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData = {
      title: body.title,
      club: body.club,
      starts_at: body.starts_at,
      ends_at: body.ends_at || null,
      location: body.location,
      tags: body.tags || [],
      current_attendees: body.current_attendees || 0,
      updated_at: new Date().toISOString(),
    };

    // Update the event
    const { data, error } = await supabaseAdmin
      .from('events')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Validate creator_id is provided
    if (!body.creator_id) {
      return NextResponse.json(
        { error: 'Authentication required. Please provide creator_id.' },
        { status: 401 }
      );
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ data: { id } });
    }

    // First, check if event exists and verify creator
    const { data: existingEvent, error: fetchError } = await supabaseAdmin
      .from('events')
      .select('creator_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }
      throw fetchError;
    }

    // Verify creator_id matches
    if (existingEvent.creator_id !== body.creator_id) {
      return NextResponse.json(
        { error: 'Unauthorized. You can only delete events you created.' },
        { status: 403 }
      );
    }

    // Delete the event
    const { error } = await supabaseAdmin
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ data: { id } });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

