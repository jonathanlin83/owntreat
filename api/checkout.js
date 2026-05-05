try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Server misconfiguration: STRIPE_SECRET_KEY is missing. Please check .env.local and restart Vercel.' });
  }

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

  const { productId, quantity } = req.body;

  let priceId;
  let sessionMode = 'payment';
  let successPath = '';
  let cancelPath = '';

  if (productId === 'nfc_stand') {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
      return res.status(400).json({ error: 'Quantity must be an integer between 1 and 100' });
    }
    priceId = quantity >= 15 
      ? process.env.STRIPE_NFC_STAND_BULK_PRICE_ID 
      : process.env.STRIPE_NFC_STAND_PRICE_ID;
    
    sessionMode = 'payment';
    successPath = '/success.html?session_id={CHECKOUT_SESSION_ID}';
    cancelPath = '/#buy-stand';

  } else if (productId === 'growth_plan') {
    if (!Number.isInteger(quantity) || quantity !== 1) {
      return res.status(400).json({ error: 'Quantity must be exactly 1 for the Growth Plan' });
    }
    priceId = process.env.STRIPE_GROWTH_PLAN_PRICE_ID;
    
    sessionMode = 'subscription';
    successPath = '/get-started?session_id={CHECKOUT_SESSION_ID}&plan=growth';
    cancelPath = '/#pricing';

  } else {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  if (!priceId) {
    return res.status(500).json({ error: 'Stripe pricing is not configured properly for this product.' });
  }

  try {
    // Always derive baseUrl from request headers on production (Vercel injects x-forwarded-proto correctly)
    // Only fall back to NEXT_PUBLIC_APP_URL if it's a real https/http URL (not localhost)
    const fromHeaders = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`;
    const envUrl = process.env.NEXT_PUBLIC_APP_URL;
    const baseUrl = (envUrl && envUrl.startsWith('https://')) ? envUrl : fromHeaders;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: quantity,
        },
      ],
      mode: sessionMode,
      success_url: `${baseUrl}${successPath}`,
      cancel_url: `${baseUrl}${cancelPath}`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: 'Stripe API Error: ' + err.message });
  }
}
