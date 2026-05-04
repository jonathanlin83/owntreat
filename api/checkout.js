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

  if (productId !== 'nfc_stand') {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  // Validate quantity on the server: minimum 1, maximum 100, must be an integer
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
    return res.status(400).json({ error: 'Quantity must be an integer between 1 and 100' });
  }

  // Choose the price ID based on bulk pricing rules
  const priceId = quantity >= 15 
    ? process.env.STRIPE_NFC_STAND_BULK_PRICE_ID 
    : process.env.STRIPE_NFC_STAND_PRICE_ID;

  if (!priceId) {
    return res.status(500).json({ error: 'Stripe pricing is not configured properly.' });
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: quantity,
        },
      ],
      mode: 'payment',
      // Since there is no /success or /stands routing, we use .html and /#buy-stand
      success_url: `${baseUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/#buy-stand`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: 'Stripe API Error: ' + err.message });
  }
}
