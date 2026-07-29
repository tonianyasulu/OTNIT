import { useState, useEffect, useCallback } from 'react'
import confetti from 'canvas-confetti'

const PHOTOS = [
  { id: 1, src: '/photos/li_thz.jpg', label: 'That Trip Was great' },
  { id: 2, src: '/photos/li_vCall.png', label: 'Calls together' },
  { id: 3, src: '/photos/lil_anime.png', label: 'Favorite date night' },
  { id: 4, src: '/photos/lil_narc.jpg', label: 'I remember Samosa' },
  { id: 5, src: '/photos/lil_psart.jpg', label: 'Celebrating us' },
  { id: 6, src: '/photos/lil_thz_2.jpg', label: 'Just because' },
]

const SLIDE_SECONDS = 5

export default function GalleryScreen({ name, onReply }) {
  const [index, setIndex] = useState(0)
  const [imgErrors, setImgErrors] = useState({})
  const [fading, setFading] = useState(false)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
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
      particleCount: 120,
      spread: 100,
      origin: { y: 0.55 },
      colors: ['#ff6b9d', '#c77dff', '#ffd700', '#4ade80', '#fb7185', '#ffffff'],
    })
  }, [])

  const goTo = useCallback((nextIndex) => {
    setFading(true)
    setTimeout(() => {
      setIndex((nextIndex + PHOTOS.length) % PHOTOS.length)
      setFading(false)
    }, 350)
  }, [])

  useEffect(() => {
    if (paused) return
    const timer = setInterval(() => {
      goTo(index + 1)
    }, SLIDE_SECONDS * 1000)
    return () => clearInterval(timer)
  }, [index, paused, goTo])

  const photo = PHOTOS[index]
  const hasError = imgErrors[photo.id]

  const handleImgError = (id) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }))
  }

  return (
    <div className="screen gallery-screen slideshow-screen">
      <h1 className="gallery-title">Our Memories 💕</h1>
      <p className="gallery-subtitle">
        {name
          ? `Every moment with you, ${name}, is a treasure`
          : 'Every moment with you is a treasure'}
      </p>

      <div
        className={`slideshow ${fading ? 'slideshow-fading' : ''}`}
        onClick={() => setPaused((p) => !p)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') goTo(index + 1)
          if (e.key === 'ArrowLeft') goTo(index - 1)
          if (e.key === ' ') {
            e.preventDefault()
            setPaused((p) => !p)
          }
        }}
      >
        {!hasError ? (
          <img
            key={photo.id}
            src={photo.src}
            alt={photo.label}
            className="slideshow-img"
            onError={() => handleImgError(photo.id)}
          />
        ) : (
          <div className="slideshow-fallback">
            <span>{photo.emoji}</span>
          </div>
        )}

        <div className="slideshow-caption">{photo.label}</div>

        <div className="slideshow-progress-track">
          <div
            key={`${photo.id}-${paused}`}
            className={`slideshow-progress-bar ${paused ? 'paused' : ''}`}
            style={{ animationDuration: `${SLIDE_SECONDS}s` }}
          />
        </div>
      </div>

      <div className="slideshow-dots">
        {PHOTOS.map((p, i) => (
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

      <button type="button" className="btn btn-surprise reply-cta" onClick={onReply}>
        💬 Send him a message
      </button>

      <p className="finale">
        Made with ❤️ just for you{name ? `, ${name}` : ''}.
      </p>
    </div>
  )
}