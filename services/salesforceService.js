const axios = require('axios');
const fs = require('fs');
const jwt = require('jsonwebtoken');

// Generate Salesforce access token using JWT flow
async function getSalesforceAccessToken() {
const privateKey = process.env.SF_JWT_PRIVATE_KEY;

  // Build and sign the JWT token
  const token = jwt.sign(
    {
      iss: process.env.SF_CLIENT_ID,
      sub: process.env.SF_USERNAME,
      aud: process.env.SF_AUDIENCE,
      exp: Math.floor(Date.now() / 1000) + 3 * 60, // valid for 3 min
    },
    privateKey,
    { algorithm: 'RS256' }
  );

  // Exchange JWT for an OAuth access token
  const response = await axios.post(
    `${process.env.SF_AUDIENCE}/services/oauth2/token`,
    new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: token,
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  return {
    accessToken: response.data.access_token,
    instanceUrl: response.data.instance_url,
  };
}

// Update Salesforce Invoice__c record after successful Stripe payment
async function updateSalesforceInvoice(invoiceId) {
  try {
    const { accessToken, instanceUrl } = await getSalesforceAccessToken();

    const url = `${instanceUrl}/services/data/v60.0/sobjects/Invoice__c/${invoiceId}`;
    await axios.patch(
      url,
      { Status__c: 'Paid' },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`✅ Invoice ${invoiceId} marked as Paid in Salesforce`);
  } catch (err) {
    const apiErr = err.response?.data || err.message;
    console.error(`❌ Failed to update Salesforce for ${invoiceId}:`, apiErr);
    throw err; // Re-throw for visibility in the webhook handler
  }
}


module.exports = { updateSalesforceInvoice };
