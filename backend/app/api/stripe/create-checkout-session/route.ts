import { NextResponse } from 'next/server';
import Stripe from 'stripe';

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
      console.log('No user ID provided');
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
      // Include the quantity in the metadata and success URL
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&quantity=${quantity}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/customize`,
      metadata: {
        userId: userId,
        quantity: quantity.toString(),
      },
      // Transfer metadata to the payment intent as well
      payment_intent_data: {
        metadata: {
          userId: userId,
          quantity: quantity.toString(),
        },
      },
    });

    console.log(`Checkout session created: ${checkoutSession.id}`);
    
    // Return both the session ID and the URL so the frontend can handle the redirect
    return NextResponse.json({ 
      sessionId: checkoutSession.id, 
      url: checkoutSession.url 
    });
  } catch (error: any) {
    console.log('Error creating checkout session:', error);
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}