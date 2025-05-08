import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
  try {
    const { story } = await request.json();
    console.log(story);

    const { data, error } = await supabase
      .from('stories')
      .insert([story])
      .select();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error saving story:', error);
    return NextResponse.json(
      { error: 'Failed to save story' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('user_id', userId)
      .order('date_created', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storyId = searchParams.get('storyId');
    const userId = searchParams.get('userId');

    if (!storyId || !userId) {
      return NextResponse.json(
        { error: 'Missing storyId or userId parameter' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('stories')
      .delete()
      .match({ story_id: storyId, user_id: userId });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting story:', error);
    return NextResponse.json(
      { error: 'Failed to delete story' },
      { status: 500 }
    );
  }
} 