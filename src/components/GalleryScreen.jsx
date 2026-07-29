import { useState, useEffect } from 'react'
import confetti from 'canvas-confetti'

// Put your photos in public/photos/ then update paths below.
// Example: public/photos/1.jpg → src: '/photos/1.jpg'
const PHOTOS = [
  { id: 1, src: '/photos/li_thz.jpg', label: 'That Trip Was great' },
  { id: 2, src: '/photos/li_vCall.png', label: 'Calls together' },
  { id: 3, src: '/photos/lil_anime.png', label: 'Favorite date night' },
  { id: 4, src: '/photos/lil_narc.jpg', label: 'I remember Samosa' },
  { id: 5, src: '/photos/lil_psart.jpg', label: 'Celebrating us' },
  { id: 6, src: '/photos/lil_thz_2.jpg', label: 'Just because' },
]

export default function GalleryScreen({ name }) {
  const [selected, setSelected] = useState(null)
  const [imgErrors, setImgErrors] = useState({})

  useEffect(() => {
    const duration = 4000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 70,
        origin: { x: 0, y: 0.7 },
        colors: ['#ff6b9d', '#c77dff', '#ffd700', '#ffffff'],
      })
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 70,
        origin: { x: 1, y: 0.7 },
        colors: ['#ff6b9d', '#c77dff', '#ffd700', '#ffffff'],
      })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()

    confetti({
      particleCount: 150,
      spread: 120,
      origin: { y: 0.55 },
      colors: ['#ff6b9d', '#c77dff', '#ffd700', '#4ade80', '#fb7185', '#ffffff'],
    })
  }, [])

  const handleImgError = (id) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }))
  }

  return (
    <div className="screen gallery-screen">
      <h1 className="gallery-title">Our Memories 💕</h1>
      <p className="gallery-subtitle">
        {name ? `Every moment with you, ${name}, is a treasure` : 'Every moment with you is a treasure'}
      </p>

      <div className="gallery-grid">
        {PHOTOS.map((photo, i) => (
          <button
            key={photo.id}
            type="button"
            className="gallery-item"
            style={{ animationDelay: `${i * 0.12}s` }}
            onClick={() => setSelected(photo)}
            title={photo.label}
          >
            {!imgErrors[photo.id] ? (
              <img
                src={photo.src}
                alt={photo.label}
                onError={() => handleImgError(photo.id)}
                loading="lazy"
              />
            ) : (
              <span className="gallery-placeholder">{photo.emoji}</span>
            )}
            <span className="gallery-overlay">
              <span className="gallery-label">{photo.label}</span>
            </span>
          </button>
        ))}
      </div>

      <p className="finale">
        Made with ❤️ just for you{name ? `, ${name}` : ''}.
      </p>

      {selected && (
        <div
          className="lightbox"
          onClick={() => setSelected(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            {!imgErrors[selected.id] ? (
              <img
                src={selected.src}
                alt={selected.label}
                className="lightbox-img"
                onError={() => handleImgError(selected.id)}
              />
            ) : (
              <div className="lightbox-fallback">
                <span>{selected.emoji}</span>
              </div>
            )}
            <p className="lightbox-caption">{selected.label}</p>
            <button
              type="button"
              className="lightbox-close"
              onClick={() => setSelected(null)}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}