import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

export async function POST(request: Request) {
  try {
    const { action, email, password } = await request.json();

    switch (action) {
      case 'signIn':
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          return NextResponse.json(
            { error: signInError.message },
            { status: 401 }
          );
        }

        return NextResponse.json({
          user: signInData.user,
          session: signInData.session
        });

      case 'signUp':
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          console.error('Sign up error:', email, password);
          return NextResponse.json(
            { error: signUpError.message },
            { status: 400 }
          );
        }

        return NextResponse.json({
          user: signUpData.user,
          session: signUpData.session
        });

      case 'signOut':
        const { error: signOutError } = await supabase.auth.signOut();

        if (signOutError) {
          return NextResponse.json(
            { error: signOutError.message },
            { status: 500 }
          );
        }

        return NextResponse.json({ success: true });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get current user session
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionToken = searchParams.get('session');

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'No session token provided' },
        { status: 401 }
      );
    }

    const { data: { user }, error } = await supabase.auth.getUser(sessionToken);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 