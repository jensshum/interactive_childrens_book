import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

const supabaseUrl = process.env.SUPABASE_URL!;
// Use service role key for admin operations if needed
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}


export async function POST(request: Request) {
  try {
    const { priceId, quantity, userId } = await request.json();

    if (!userId) {
      console.error('No user ID provided');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    console.log(`Creating checkout session for user: ${userId}, price: ${priceId}, quantity: ${quantity}`);

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: quantity || 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/customize`,
      metadata: {
        userId: userId,
      },
      // Transfer metadata to the payment intent as well
      payment_intent_data: {
        metadata: {
          userId: userId,
        },
      },
    });

    console.log(`Checkout session created: ${checkoutSession.id}`);
    return NextResponse.json({ sessionId: checkoutSession.id, url: checkoutSession.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', errorcatch (error: any) {xtResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
} NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}