import { useState, useEffect, useCallback } from 'react'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import confetti from 'canvas-confetti'
import { db } from '../firebase'

const SLIDE_SECONDS = 4

export default function BirthdayGallery() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [index, setIndex] = useState(0)
  const [fading, setFading] = useState(false)
  const [paused, setPaused] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const q = query(collection(db, 'birthdayPhotos'), orderBy('createdAt', 'asc'))
        const snap = await getDocs(q)
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        setPhotos(list)
      } catch (err) {
        console.error(err)
        setError('Could not load photos. Check Firebase setup.')
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
  }, [])

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

  if (loading) {
    return (
      <div className="screen">
        <div className="card">
          <p className="subtitle">Loading memories...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="screen">
        <div className="card">
          <p className="name-error">{error}</p>
        </div>
      </div>
    )
  }

  if (!photos.length) {
    return (
      <div className="screen">
        <div className="card">
          <div className="welcome-emoji">🎂</div>
          <h1 className="title">No photos yet</h1>
          <p className="subtitle">
            When she uploads photos with this code, they&apos;ll appear here in a slideshow.
          </p>
        </div>
      </div>
    )
  }

  const photo = photos[index]

  return (
    <div className="screen gallery-screen slideshow-screen">
      <h1 className="gallery-title">Birthday Memories 🎂</h1>
      <p className="gallery-subtitle">
        {photos.length} photo{photos.length > 1 ? 's' : ''} · made with love
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

      <p className="finale">Happy Birthday ❤️</p>
    </div>
  )
}