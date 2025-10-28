# Salesforce + Stripe Webhook Integration (Heroku)

This service securely processes Stripe webhook events and updates `Invoice__c` records in Salesforce using the **JWT Bearer OAuth flow** (no passwords or refresh tokens stored).

It acts as a bridge between **Stripe** and **Salesforce**, ensuring that when a patient completes a payment in Stripe, the corresponding invoice is automatically updated in Salesforce.

---

## 🔄 Architecture Overview

Stripe → Webhook Event → Heroku App → JWT Auth → Salesforce Invoice Update


1. Salesforce generates a Stripe checkout session and stores `metadata[invoiceId]`.
2. Patient completes payment via Stripe Checkout.
3. Stripe sends a webhook event to this Heroku app.
4. The app validates the event using Stripe’s signature.
5. The app authenticates to Salesforce using a **Connected App + JWT certificate**.
6. `Invoice__c.Status__c` is updated to `"Paid"`.

---

## ✅ Features

- Verifies Stripe signatures (`stripe.webhooks.constructEvent`)
- Uses **JWT Bearer Flow** to authenticate to Salesforce (no stored credentials)
- Idempotent and retry-safe design
- Clean separation from Salesforce business logic
- Easy to deploy and maintain

---

## 🛠️ Environment Variables

Set the following in Heroku:

| Variable | Description |
|---------|-------------|
| `STRIPE_SECRET_KEY` | Your Stripe API secret key |
| `STRIPE_WEBHOOK_SECRET` | Secret for verifying webhook signatures |
| `SF_CLIENT_ID` | Connected App Consumer Key from Salesforce |
| `SF_USERNAME` | Integration User username |
| `SF_AUDIENCE` | Salesforce login URL (e.g., https://login.salesforce.com) |
| `SF_JWT_PRIVATE_KEY` | **Private key** corresponding to the Connected App certificate |

Example Heroku setup:

```bash
heroku config:set STRIPE_SECRET_KEY=sk_live_...
heroku config:set STRIPE_WEBHOOK_SECRET=whsec_...
heroku config:set SF_CLIENT_ID=3MVG9...
heroku config:set SF_USERNAME=integration.user@yourorg.com
heroku config:set SF_AUDIENCE=https://login.salesforce.com
heroku config:set SF_JWT_PRIVATE_KEY="$(cat server.key)"
