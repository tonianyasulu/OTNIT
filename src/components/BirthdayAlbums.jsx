import { useState, useEffect } from 'react'
import {
  collection,
  getDocs,
  query,
  where,
  writeBatch,
  doc,
} from 'firebase/firestore'
import { db } from '../firebase'

const ADMIN_CODE = 'tintowachabe'

export default function BirthdayAlbums({ onSelect, onBack }) {
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [showCode, setShowCode] = useState(false)
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState(false)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    const loadAlbums = async () => {
      if (!db) {
        setError('Firestore not configured')
        setLoading(false)
        return
      }
      try {
        const snap = await getDocs(collection(db, 'birthdayPhotos'))
        const map = new Map()
        snap.docs.forEach((d) => {
          const data = d.data()
          const key = data.username || 'unknown'
          if (!map.has(key)) {
            map.set(key, {
              username: key,
              displayName: data.displayName || key,
              dob: data.dob || '',
              count: 0,
            })
          }
          map.get(key).count += 1
        })
        setAlbums(
          Array.from(map.values()).sort((a, b) =>
            a.displayName.localeCompare(b.displayName)
          )
        )
      } catch (err) {
        console.error(err)
        setError('Could not load albums')
      } finally {
        setLoading(false)
      }
    }
    loadAlbums()
  }, [])

  const handleAdminSubmit = (e) => {
    e.preventDefault()
    if (code.trim().toLowerCase() === ADMIN_CODE) {
      setIsAdmin(true)
      setShowCode(false)
      setCode('')
      setCodeError(false)
    } else {
      setCodeError(true)
    }
  }

  const deleteAlbum = async (username, displayName) => {
    if (
      !window.confirm(
        `Delete ALL photos for "${displayName}"? This cannot be undone.`
      )
    ) {
      return
    }
    setDeleting(username)
    try {
      const snap = await getDocs(collection(db, 'birthdayPhotos'))
      // Old photos may have no username field — treat those as "unknown"
      const toDelete = snap.docs.filter((d) => {
        const u = d.data().username
        if (username === 'unknown') {
          return !u || u === '' || u === 'unknown'
        }
        return u === username
      })

      for (let i = 0; i < toDelete.length; i += 400) {
        const batch = writeBatch(db)
        toDelete
          .slice(i, i + 400)
          .forEach((d) => batch.delete(doc(db, 'birthdayPhotos', d.id)))
        await batch.commit()
      }
      setAlbums((prev) => prev.filter((a) => a.username !== username))
    } catch (err) {
      console.error(err)
      alert('Delete failed. Check Firestore rules.')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="screen">
      <div className="card reply-card">
        <div className="welcome-emoji">📂</div>
        <h1 className="title">Saved albums</h1>
        <p className="subtitle">
          {isAdmin ? 'Admin mode — you can delete albums' : 'Tap a name to view their photos'}
        </p>

        {loading && <p className="subtitle">Loading...</p>}
        {error && <p className="name-error">{error}</p>}
        {!loading && !error && albums.length === 0 && (
          <p className="subtitle">No albums yet.</p>
        )}

        <div className="album-list">
          {albums.map((a) => (
            <div key={a.username} className="album-row">
              <button
                type="button"
                className="album-item"
                onClick={() =>
                  onSelect({
                    username: a.username,
                    displayName: a.displayName,
                    dob: a.dob,
                    isAdmin,
                  })
                }
                disabled={deleting === a.username}
              >
                <span className="album-name">{a.displayName}</span>
                <span className="album-meta">
                  {a.count} photo{a.count !== 1 ? 's' : ''}
                </span>
              </button>
              {isAdmin && (
                <button
                  type="button"
                  className="album-delete"
                  onClick={() => deleteAlbum(a.username, a.displayName)}
                  disabled={deleting === a.username}
                >
                  {deleting === a.username ? '…' : '🗑️'}
                </button>
              )}
            </div>
          ))}
        </div>

        {!isAdmin && !showCode && (
          <button type="button" className="btn btn-secondary" onClick={() => setShowCode(true)}>
            🔐 Manage albums
          </button>
        )}

        {showCode && !isAdmin && (
          <form onSubmit={handleAdminSubmit} className="name-form" style={{ marginTop: '1rem' }}>
            <input
              type="password"
              className={`name-input ${codeError ? 'name-input-error' : ''}`}
              placeholder="Admin code..."
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                setCodeError(false)
              }}
              autoComplete="off"
            />
            {codeError && <p className="name-error">Wrong code</p>}
            <button type="submit" className="btn btn-yes name-btn">
              Unlock admin
            </button>
          </form>
        )}

        {isAdmin && (
          <p className="subtitle" style={{ marginTop: '0.75rem', color: '#e84a7f' }}>
            Admin unlocked
          </p>
        )}

        <button type="button" className="btn btn-back" onClick={onBack}>
          ← Back
        </button>
      </div>
    </div>
  )
}