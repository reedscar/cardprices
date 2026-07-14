import { useState, useEffect } from 'react'

export default function App() {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('baseball card')

  useEffect(() => {
    fetchCards(query)
  }, [])

  async function fetchCards(searchTerm) {
    setLoading(true)
    setError(null)
    try {
      // This calls OUR OWN serverless function, never eBay directly.
      // The function holds the secret; we just get back clean JSON.
      const res = await fetch(`/api/ebay-cards?q=${encodeURIComponent(searchTerm)}`)
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      const data = await res.json()
      setCards(data.itemSummaries || [])
    } catch (err) {
      console.error(err)
      setError('Could not load card data. Is your /api function set up and are env vars set?')
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e) {
    e.preventDefault()
    fetchCards(query)
  }

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', fontFamily: 'sans-serif', padding: '0 16px' }}>
      <h1>⚾ Baseball Card Tracker</h1>
      <p style={{ color: '#555' }}>
        Search active eBay listings for baseball cards. (Swap this in for your
        daily "most active card" logic once the pipeline is built.)
      </p>

      <form onSubmit={handleSearch} style={{ marginBottom: 24 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. mike trout rookie"
          style={{ padding: 8, width: 300, marginRight: 8 }}
        />
        <button type="submit" style={{ padding: '8px 16px' }}>
          Search
        </button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      <div style={{ display: 'grid', gap: 16 }}>
        {cards.map((item) => (
          <div
            key={item.itemId}
            style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, display: 'flex', gap: 16 }}
          >
            {item.image?.imageUrl && (
              <img src={item.image.imageUrl} alt={item.title} style={{ width: 80, height: 'auto' }} />
            )}
            <div>
              <div style={{ fontWeight: 600 }}>{item.title}</div>
              <div>{item.price?.value ? `$${item.price.value}` : 'Price N/A'}</div>
              {item.itemWebUrl && (
                <a href={item.itemWebUrl} target="_blank" rel="noreferrer">
                  View on eBay
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {!loading && !error && cards.length === 0 && <p>No results yet — try a search above.</p>}
    </div>
  )
}
