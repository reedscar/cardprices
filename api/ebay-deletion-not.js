// api/ebay-deletion-not.js
import crypto from 'crypto'

const VERIFICATION_TOKEN = process.env.EBAY_VERIFICATION_TOKEN
const ENDPOINT_URL = 'https://cardprices-2uqjran2e-siamesecat.vercel.app//api/ebay-deletion-notification'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { challenge_code } = req.query
    const hash = crypto.createHash('sha256')
    hash.update(challenge_code + VERIFICATION_TOKEN + ENDPOINT_URL)
    const responseHash = hash.digest('hex')
    return res.status(200).json({ challengeResponse: responseHash })
  }

  if (req.method === 'POST') {
    // eBay notifies you here when a user requests account deletion.
    // For a portfolio project with no stored user data, just acknowledge it.
    return res.status(200).end()
  }

  res.status(405).end()
}