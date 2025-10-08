const express = require('express');
const webhookRoutes = require('./routes/webhook');

const app = express();

// Mount Stripe webhook route
app.use('/stripe', webhookRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Webhook listener running on port ${PORT}`));
