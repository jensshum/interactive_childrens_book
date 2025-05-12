import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Stripe with the correct API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

console.log('Webhook secret length:', webhookSecret.length);

// Initialize Supabase with service role key for admin operations
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Use service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  }
});

export async function POST(request: Request) {
  console.log('Webhook received!');
  
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;
    
    console.log('Webhook signature:', signature);
    
    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log('Webhook signature verified successfully');
    } catch (err: unknown) {
      const error = err as Error;
      console.error(`Webhook signature verification failed: ${error.message}`);
      return new NextResponse(`Webhook signature verification failed: ${error.message}`, { status: 400 });
    }

    console.log(`Processing webhook event: ${event.type}`);

    // Handle both checkout.session.completed and payment_intent.succeeded events
    if (event.type === 'checkout.session.completed') {
      return await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
    } else if (event.type === 'payment_intent.succeeded') {
      return await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
    }

    return new NextResponse('Webhook received but no handler for this event type', { status: 200 });
  } catch (error: unknown) {
    const err = error as Error;
    console.error(`Error processing webhook: ${err.message}`);
    return new NextResponse(`Internal Server Error: ${err.message}`, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log(`Checkout session completed: ${session.id}`);
  console.log('Session metadata:', session.metadata);
  
  const userId = session.metadata?.userId;
  if (!userId) {
    console.error('No user ID in session metadata');
    return new NextResponse('No user ID in session metadata', { status: 400 });
  }

  // Get quantity from metadata, default to 1 if not found
  const quantity = parseInt(session.metadata?.quantity || '1', 10);
  console.log(`Adding ${quantity} credits for user: ${userId}`);
  
  return await updateUserCredits(userId, quantity);
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Payment intent succeeded: ${paymentIntent.id}`);
  console.log('Payment intent metadata:', paymentIntent.metadata);
  
  // For payment_intent.succeeded, we need to find the associated session to get the userId
  // You might need to adapt this based on your specific implementation
  const userId = paymentIntent.metadata?.userId;

  if (!userId) {
    // If userId is not directly in the payment intent metadata, try to find it
    // This is just an example approach - you might need to adjust this
    console.log('Attempting to find session associated with this payment intent');
    
    try {
      // Look up sessions that might be linked to this payment intent
      const sessions = await stripe.checkout.sessions.list({
        payment_intent: paymentIntent.id,
        expand: ['data.metadata']
      });
      
      if (sessions.data.length > 0 && sessions.data[0].metadata?.userId) {
        const sessionUserId = sessions.data[0].metadata.userId;
        const quantity = parseInt(sessions.data[0].metadata?.quantity || '1', 10);
        console.log(`Found userId in associated session: ${sessionUserId}, quantity: ${quantity}`);
        return await updateUserCredits(sessionUserId, quantity);
      }
    } catch (err) {
      console.error('Error looking up associated session:', err);
    }
    
    console.error('Could not find user ID in payment intent or associated sessions');
    return new NextResponse('No user ID found', { status: 400 });
  }

  // Get quantity from payment intent metadata, default to 1 if not found
  const quantity = parseInt(paymentIntent.metadata?.quantity || '1', 10);
  console.log(`Adding ${quantity} credits for user: ${userId}`);
  
  return await updateUserCredits(userId, quantity);
}

async function updateUserCredits(userId: string, creditsToAdd: number) {
  console.log(`Adding ${creditsToAdd} credits for user: ${userId}`);
  
  // Try to get current credits
  const { data: currentCredits, error: fetchError } = await supabase
    .from('user_credits')
    .select('credits')
    .eq('user_id', userId)
    .single();

  // Log the fetch result
  if (fetchError) {
    console.log(`No existing credits found for user: ${userId}. Creating new record.`);
  } else {
    console.log(`Current credits for user ${userId}: ${currentCredits?.credits}`);
  }

  const currentCreditAmount = currentCredits?.credits || 0;
  const newCredits = currentCreditAmount + creditsToAdd;

  // Explicitly handle insert vs update based on whether the record exists
  let result;
  
  if (fetchError && fetchError.code === 'PGRST116') {
    // No row exists, perform an insert
    console.log('Performing insert for new user credits');
    result = await supabase
      .from('user_credits')
      .insert({
        user_id: userId,
        credits: creditsToAdd,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
  } else {
    // Row exists, perform an update
    console.log('Performing update for existing user credits');
    result = await supabase
      .from('user_credits')
      .update({
        credits: newCredits,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
  }

  // Check for errors in the operation
  if (result.error) {
    console.error(`Error updating/inserting credits: ${result.error.message}`);
    return new NextResponse(`Database error: ${result.error.message}`, { status: 500 });
  }

  console.log(`Successfully updated credits for user ${userId}. New total: ${newCredits}`);
  return new NextResponse('Credits updated successfully', { status: 200 });
}

// Disable body parsing since we need the raw body for Stripe signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};