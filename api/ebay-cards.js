// This file runs on Vercel's server, never in the browser.
// process.env values are injected securely at runtime from
// Vercel's Environment Variables (or your local .env.local when
// running `vercel dev`).

let cachedToken = null
let tokenExpiresAt = 0

async function getEbayToken() {
  // Reuse the token if it's still valid, to avoid hitting eBay's
  // auth endpoint on every single request.
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken
  }

  const credentials = Buffer.from(
    `${process.env.EBAY_CLIENT_ID}:${process.env.EBAY_CLIENT_SECRET}`
  ).toString('base64')

  const response = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`eBay token request failed: ${response.status} ${text}`)
  }

  const data = await response.json()
  cachedToken = data.access_token
  // eBay tells you how many seconds the token is valid for (expires_in).
  // Refresh 1 minute early to avoid edge-case expiry during a request.
  tokenExpiresAt = Date.now() + data.expires_in * 1000 - 60000

  return cachedToken
}

export default async function handler(req, res) {
  try {
    const token = await getEbayToken()
    const query = req.query.q || 'baseball card'

    const ebayResponse = await fetch(
      `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(
        query
      )}&category_ids=213&limit=20`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
        },
      }
    )

    if (!ebayResponse.ok) {
      const text = await ebayResponse.text()
      throw new Error(`eBay API request failed: ${ebayResponse.status} ${text}`)
    }

    const data = await ebayResponse.json()
    res.status(200).json(data) // only the card data goes back — no token, no secret
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch eBay data' })
  }
}
