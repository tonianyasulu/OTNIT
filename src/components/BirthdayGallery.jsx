import { useState, useEffect, useCallback, useMemo } from 'react'
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore'
import confetti from 'canvas-confetti'
import { db } from '../firebase'

const SLIDE_SECONDS = 4
const LOVE_EMOJIS = ['❤️', '💕', '💗', '💖', '💘', '✨', '🥰', '💓', '💞', '🌸']

function formatDob(dob) {
  if (!dob) return ''
  try {
    const d = new Date(dob + 'T00:00:00')
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dob
  }
}

function LoveFloaters() {
  const items = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        emoji: LOVE_EMOJIS[i % LOVE_EMOJIS.length],
        left: `${5 + Math.random() * 90}%`,
        delay: `${Math.random() * 8}s`,
        duration: `${8 + Math.random() * 10}s`,
        size: `${1 + Math.random() * 1.4}rem`,
      })),
    []
  )

  return (
    <div className="love-floaters" aria-hidden="true">
      {items.map((h) => (
        <span
          key={h.id}
          className="love-floater"
          style={{
            left: h.left,
            fontSize: h.size,
            animationDelay: h.delay,
            animationDuration: h.duration,
          }}
        >
          {h.emoji}
        </span>
      ))}
    </div>
  )
}

export default function BirthdayGallery({ profile, onBack }) {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [index, setIndex] = useState(0)
  const [fading, setFading] = useState(false)
  const [paused, setPaused] = useState(false)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const isAdmin = !!profile.isAdmin

  useEffect(() => {
    const load = async () => {
      if (!db) {
        setError('Firestore not configured')
        setLoading(false)
        return
      }
      try {
        const q = query(
          collection(db, 'birthdayPhotos'),
          where('username', '==', profile.username)
        )
        const snap = await getDocs(q)
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        list.sort((a, b) => {
          const ta = a.createdAt?.seconds || 0
          const tb = b.createdAt?.seconds || 0
          return ta - tb
        })
        setPhotos(list)
      } catch (err) {
        console.error(err)
        setError('Could not load photos. Check Firestore rules.')
      } finally {
        setLoading(false)
      }
    }
    load()

    const duration = 3500
    const end = Date.now() + duration
    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 70,
        origin: { x: 0, y: 0.7 },
        colors: ['#ff6b9d', '#c77dff', '#ffd700', '#ffffff'],
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 70,
        origin: { x: 1, y: 0.7 },
        colors: ['#ff6b9d', '#c77dff', '#ffd700', '#ffffff'],
      })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { y: 0.55 },
      colors: ['#ff6b9d', '#c77dff', '#ffd700', '#4ade80', '#fb7185'],
    })
  }, [profile.username])

  const goTo = useCallback(
    (next) => {
      if (!photos.length) return
      setFading(true)
      setTimeout(() => {
        setIndex((next + photos.length) % photos.length)
        setFading(false)
      }, 350)
    },
    [photos.length]
  )

  useEffect(() => {
    if (paused || photos.length < 2) return
    const timer = setInterval(() => goTo(index + 1), SLIDE_SECONDS * 1000)
    return () => clearInterval(timer)
  }, [index, paused, photos.length, goTo])

  const deleteCurrentPhoto = async () => {
    if (!photos.length || !isAdmin) return
    const photo = photos[index]
    if (!window.confirm('Delete this photo?')) return

    setDeleting(true)
    try {
      await deleteDoc(doc(db, 'birthdayPhotos', photo.id))
      const next = photos.filter((p) => p.id !== photo.id)
      setPhotos(next)
      if (next.length === 0) setIndex(0)
      else setIndex((i) => Math.min(i, next.length - 1))
    } catch (err) {
      console.error(err)
      alert('Delete failed. Check Firestore rules.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="screen">
        <div className="card">
          <p className="subtitle">Loading {profile.displayName}&apos;s memories...</p>
          {onBack && (
            <button type="button" className="btn btn-back" onClick={onBack}>
              ← Back
            </button>
          )}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="screen">
        <div className="card">
          <p className="name-error">{error}</p>
          {onBack && (
            <button type="button" className="btn btn-back" onClick={onBack}>
              ← Back
            </button>
          )}
        </div>
      </div>
    )
  }

  if (!photos.length) {
    return (
      <div className="screen">
        <LoveFloaters />
        <div className="card">
          <div className="welcome-emoji">🎂</div>
          <h1 className="title">Happy Birthday, {profile.displayName}!</h1>
          {profile.dob && <p className="subtitle">{formatDob(profile.dob)}</p>}
          <p className="subtitle">No photos in this album yet.</p>
          {onBack && (
            <button type="button" className="btn btn-back" onClick={onBack}>
              ← Back
            </button>
          )}
        </div>
      </div>
    )
  }

  const photo = photos[index]

  return (
    <div className="screen gallery-screen slideshow-screen">
      <LoveFloaters />
      <h1 className="gallery-title">Happy Birthday, {profile.displayName}! 🎂</h1>
      {profile.dob && (
        <p className="gallery-subtitle" style={{ marginBottom: '0.35rem' }}>
          {formatDob(profile.dob)}
        </p>
      )}
      <p className="gallery-subtitle">
        {photos.length} photo{photos.length > 1 ? 's' : ''} · just for you
        {isAdmin ? ' · admin' : ''}
      </p>

      <div
        className={`slideshow ${fading ? 'slideshow-fading' : ''}`}
        onClick={() => setPaused((p) => !p)}
        role="button"
        tabIndex={0}
      >
        <img key={photo.id} src={photo.url} alt="" className="slideshow-img" />
        <div className="slideshow-progress-track">
          <div
            key={`${photo.id}-${paused}`}
            className={`slideshow-progress-bar ${paused ? 'paused' : ''}`}
            style={{ animationDuration: `${SLIDE_SECONDS}s` }}
          />
        </div>
      </div>

      <div className="slideshow-dots">
        {photos.map((p, i) => (
          <button
            key={p.id}
            type="button"
            className={`dot ${i === index ? 'dot-active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Photo ${i + 1}`}
          />
        ))}
      </div>

      <div className="slideshow-nav">
        <button type="button" className="nav-btn" onClick={() => goTo(index - 1)}>
          ‹
        </button>
        <button
          type="button"
          className="nav-btn pause-btn"
          onClick={() => setPaused((p) => !p)}
        >
          {paused ? '▶' : '❚❚'}
        </button>
        <button type="button" className="nav-btn" onClick={() => goTo(index + 1)}>
          ›
        </button>
      </div>

      {isAdmin && (
        <button
          type="button"
          className="btn"
          onClick={deleteCurrentPhoto}
          disabled={deleting}
          style={{
            marginTop: '1rem',
            background: 'linear-gradient(135deg, #fb7185, #e11d48)',
            color: 'white',
            padding: '0.7rem 1.5rem',
            borderRadius: '50px',
            fontWeight: 600,
          }}
        >
          {deleting ? 'Deleting...' : '🗑️ Delete this photo'}
        </button>
      )}

      {onBack && (
        <button type="button" className="btn btn-back" onClick={onBack}>
          ← Back
        </button>
      )}

      <p className="finale">Made with love for {profile.displayName} ❤️</p>
    </div>
  )
}