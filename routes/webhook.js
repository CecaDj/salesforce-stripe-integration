const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { updateSalesforceInvoice } = require('../services/salesforceService');

// Stripe webhook endpoint — listens for payment events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    // Verify and construct the Stripe event
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // When payment completes, update the corresponding Salesforce invoice
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      await updateSalesforceInvoice(session.metadata.invoiceId);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('❌ Webhook verification failed:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

module.exports = router;
