import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

    // Fetch user credits
    const { data, error } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user credits:', error);
      return NextResponse.json(
        { error: 'Error fetching user credits' },
        { status: 500 }
      );
    }

    // Return the credits (default to 0 if no record exists)
    console.log('User credits:', data?.credits);
    return NextResponse.json({ credits: data?.credits || 0 });
  } catch (error) {
    console.error('Error in credits route:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId in request body' },
        { status: 400 }
      );
    }

    // Fetch current user credits
    const { data: currentCredits, error: fetchError } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching user credits:', fetchError);
      return NextResponse.json(
        { error: 'Error fetching user credits' },
        { status: 500 }
      );
    }

    const credits = currentCredits?.credits || 0;

    if (credits < 1) {
      return NextResponse.json(
        { error: 'Insufficient credits' },
        { status: 400 }
      );
    }

    // Decrement credits by 1
    const newCredits = credits - 1;

    // Update or insert the new credits value
    const { error: updateError } = await supabase
      .from('user_credits')
      .upsert(
        { user_id: userId, credits: newCredits },
        { onConflict: 'user_id' }
      );

    if (updateError) {
      console.error('Error updating user credits:', updateError);
      return NextResponse.json(
        { error: 'Error updating user credits' },
        { status: 500 }
      );
    }

    return NextResponse.json({ credits: newCredits });
  } catch (error) {
    console.error('Error in credits update route:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}