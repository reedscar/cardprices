import { useState, useEffect } from 'react'

export default function App() {
  const [cards, setCards] = useState([])
  const [player, setPlayer] = useState('no player selected')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('baseball card')
  const [playerId, setPlayerId] = useState('000000')
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetchCards(query)
    fetchPlayer('Ohtani')
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

  async function fetchPlayer(searchTerm) {
    setLoading(true)
    setError(null)
    setStats(null)

    let id
    try {
      const res = await fetch(`https://statsapi.mlb.com/api/v1/people/search?names=${encodeURIComponent(searchTerm)}`)
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      const data = await res.json()
      id = data.people?.[0]?.id
      setPlayerId(id || '000000')
      setPlayer(data.people?.[0]?.fullName || 'Unknown player')
    } catch (err) {
      console.error(err)
      setError('Could not load player data')
    } finally {
      setLoading(false)
    }

    try {
      const statres = await fetch(`https://statsapi.mlb.com/api/v1/people/${encodeURIComponent(id)}/stats?stats=gamelog&group=hitting&season=2026`)
      if (!statres.ok) throw new Error(`Request failed: ${statres.status}`)
      const data = await statres.json()
      setStats(data.stats[0].splits.at(-1) || null)
    } catch (err) {
      console.error(err)
      setError('Could not load player stats')
    } finally {
      setLoading(false)
    }
  }

  function handleCardSearch(e) {
    e.preventDefault()
    fetchCards(query)
    fetchPlayer(query)
  }

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', fontFamily: 'sans-serif', padding: '0 16px' }}>
      <div>
        {player}
        <br></br>
        <img 
          src={`https://img.mlbstatic.com/mlb-photos/image/upload/w_360,q_100/v1/people/${playerId}/headshot/67/current`}
          alt={player}
          style={{ width: 120, borderRadius: 8 }}
        />
        <br></br>
        {stats && (
          <>
          <p>
            {stats.date} vs {stats.opponent?.name}: {stats.stat?.summary}
          </p>
          <p>{stats.stat?.summary}</p>
          </>
        )}
      </div>
      <h1>⚾ Baseball Card Tracker</h1>
      <p style={{ color: '#555' }}>
        Search active eBay listings for baseball cards. (Swap this in for your
        daily "most active card" logic once the pipeline is built.)
      </p>

      <form onSubmit={handleCardSearch} style={{ marginBottom: 24 }}>
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
