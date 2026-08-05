import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore'
import confetti from 'canvas-confetti'
import { db } from '../firebase'
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../cloudinary'

const SLIDE_SECONDS = 4
const MAX_PHOTOS = 10
const LOVE_EMOJIS = ['❤️', '💕', '💗', '💖', '💘', '✨', '🥰', '💓', '💞', '🌸']
const FLOWER_EMOJIS = ['🌸','BIRTHDAY', '🌺', '🌻', '🌹', '🌷', '💐','HAPPY', '🌼', '💮','TO', '🏵️', '🪷','YOU']
const COMPRESS_MAX = 1280
const JPEG_QUALITY = 0.72

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

function compressImage(file) {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(file)
      return
    }
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      if (width <= COMPRESS_MAX && height <= COMPRESS_MAX && file.size < 400000) {
        resolve(file)
        return
      }
      if (width > height && width > COMPRESS_MAX) {
        height = Math.round((height * COMPRESS_MAX) / width)
        width = COMPRESS_MAX
      } else if (height > COMPRESS_MAX) {
        width = Math.round((width * COMPRESS_MAX) / height)
        height = COMPRESS_MAX
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          if (!blob) return resolve(file)
          resolve(
            new File([blob], file.name.replace(/\.\w+$/, '.jpg'), {
              type: 'image/jpeg',
            })
          )
        },
        'image/jpeg',
        JPEG_QUALITY
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(file)
    }
    img.src = url
  })
}

function uploadOne(file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
    xhr.open(
      'POST',
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`
    )
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total)
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText).secure_url)
        } catch {
          reject(new Error('Invalid response'))
        }
      } else reject(new Error(xhr.responseText || 'Upload failed'))
    }
    xhr.onerror = () => reject(new Error('Network error'))
    xhr.send(formData)
  })
}

function bloomFlowers() {
  const defaults = {
    spread: 360,
    ticks: 80,
    gravity: 0.65,
    decay: 0.92,
    startVelocity: 35,
    scalar: 1.35,
  }

  confetti({
    ...defaults,
    particleCount: 60,
    origin: { x: 0.5, y: 0.45 },
    shapes: ['circle'],
    colors: ['#ff6b9d', '#f9a8d4', '#c77dff', '#fbbf24', '#fb7185', '#ffffff'],
  })

  const flowerBurst = (angle) => {
    confetti({
      ...defaults,
      particleCount: 18,
      angle,
      spread: 70,
      origin: { x: 0.5, y: 0.48 },
      scalar: 1.6,
      shapes: ['circle'],
      colors: ['#ff6b9d', '#f472b6', '#e879f9', '#fbbf24', '#fda4af'],
    })
  }

  flowerBurst(45)
  flowerBurst(135)
  flowerBurst(225)
  flowerBurst(315)

  confetti({
    particleCount: 40,
    angle: 60,
    spread: 55,
    origin: { x: 0, y: 0.55 },
    startVelocity: 45,
    colors: ['#ff6b9d', '#c77dff', '#fbbf24', '#fb7185', '#ffffff'],
    scalar: 1.2,
  })
  confetti({
    particleCount: 40,
    angle: 120,
    spread: 55,
    origin: { x: 1, y: 0.55 },
    startVelocity: 45,
    colors: ['#ff6b9d', '#c77dff', '#fbbf24', '#fb7185', '#ffffff'],
    scalar: 1.2,
  })

  const layer = document.createElement('div')
  layer.className = 'flower-boom-layer'
  document.body.appendChild(layer)

  for (let i = 0; i < 28; i++) {
    const el = document.createElement('span')
    el.className = 'flower-boom-petal'
    el.textContent = FLOWER_EMOJIS[i % FLOWER_EMOJIS.length]
    const x = 15 + Math.random() * 70
    const delay = Math.random() * 0.25
    const size = 1.4 + Math.random() * 1.8
    el.style.left = `${x}%`
    el.style.fontSize = `${size}rem`
    el.style.animationDelay = `${delay}s`
    layer.appendChild(el)
  }

  setTimeout(() => {
    layer.remove()
  }, 2200)
}

export default function BirthdayGallery({ profile, onBack }) {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [index, setIndex] = useState(0)
  const [fading, setFading] = useState(false)
  const [paused, setPaused] = useState(false)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [percent, setPercent] = useState(0)
  const [progress, setProgress] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [blooming, setBlooming] = useState(false)
  const inputRef = useRef(null)
  const fileProgress = useRef([])
  const isAdmin = !!profile.isAdmin

  const loadPhotos = useCallback(async () => {
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
  }, [profile.username])

  useEffect(() => {
    loadPhotos()
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
  }, [loadPhotos])

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
    if (paused || photos.length < 2 || showUpload) return
    const timer = setInterval(() => goTo(index + 1), SLIDE_SECONDS * 1000)
    return () => clearInterval(timer)
  }, [index, paused, photos.length, goTo, showUpload])

  const handleBloom = () => {
    if (blooming) return
    setBlooming(true)
    bloomFlowers()
    setTimeout(() => setBlooming(false), 2000)
  }

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

  const remaining = Math.max(0, MAX_PHOTOS - photos.length)

  const updateOverall = (total) => {
    const avg =
      fileProgress.current.reduce((a, b) => a + b, 0) / Math.max(total, 1)
    setPercent(Math.min(100, Math.round(avg * 100)))
  }

  const handleAddFiles = async (e) => {
    const selected = Array.from(e.target.files || []).filter((f) =>
      f.type.startsWith('image/')
    )
    if (!selected.length) return
    const allowed = selected.slice(0, remaining)
    if (!allowed.length) {
      setUploadError(`Maximum ${MAX_PHOTOS} photos allowed`)
      return
    }
    if (!CLOUDINARY_CLOUD_NAME || CLOUDINARY_CLOUD_NAME === 'YOUR_CLOUD_NAME') {
      setUploadError('Cloudinary not configured')
      return
    }
    if (!db) {
      setUploadError('Firestore not configured')
      return
    }

    setUploading(true)
    setUploadError('')
    setPercent(0)
    setProgress(`Preparing ${allowed.length}...`)

    try {
      const compressed = await Promise.all(allowed.map((f) => compressImage(f)))
      const total = compressed.length
      fileProgress.current = new Array(total).fill(0)
      let finished = 0
      setProgress(`Uploading 0 / ${total}...`)

      for (let i = 0; i < compressed.length; i++) {
        const url = await uploadOne(compressed[i], (p) => {
          fileProgress.current[i] = p * 0.9
          updateOverall(total)
        })
        await addDoc(collection(db, 'birthdayPhotos'), {
          url,
          name: compressed[i].name,
          username: profile.username,
          displayName: profile.displayName,
          dob: profile.dob || '',
          createdAt: serverTimestamp(),
        })
        fileProgress.current[i] = 1
        finished += 1
        updateOverall(total)
        setProgress(`Uploading ${finished} / ${total}...`)
      }

      setPercent(100)
      setProgress('Done!')
      await loadPhotos()
      setTimeout(() => {
        setShowUpload(false)
        setUploading(false)
        setProgress('')
        setPercent(0)
      }, 400)
    } catch (err) {
      console.error(err)
      setUploadError('Upload failed')
      setUploading(false)
      setProgress('')
      setPercent(0)
    }
    if (inputRef.current) inputRef.current.value = ''
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
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowUpload(true)}
          >
            📸 Add photos
          </button>
          {showUpload && (
            <div style={{ marginTop: '1rem', width: '100%' }}>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handleAddFiles}
              />
              <button
                type="button"
                className="btn btn-yes"
                disabled={uploading}
                onClick={() => inputRef.current?.click()}
              >
                Choose photos (max {MAX_PHOTOS})
              </button>
              {uploading && (
                <div className="upload-progress-wrap">
                  <div className="upload-progress-track">
                    <div className="upload-progress-fill" style={{ width: `${percent}%` }} />
                  </div>
                  <p className="upload-progress-label">
                    {percent}% · {progress}
                  </p>
                </div>
              )}
              {uploadError && <p className="name-error">{uploadError}</p>}
            </div>
          )}
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
        {photos.length}/{MAX_PHOTOS} photos · just for you
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

      <button
        type="button"
        className={`btn btn-bloom ${blooming ? 'btn-bloom-active' : ''}`}
        onClick={handleBloom}
        disabled={blooming}
      >
        {blooming ? '🌸 Blooming...' : '🌸 Bloom flowers'}
      </button>

      {isAdmin && (
        <button
          type="button"
          className="btn"
          onClick={deleteCurrentPhoto}
          disabled={deleting}
          style={{
            marginTop: '0.75rem',
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

      {remaining > 0 && !showUpload && (
        <button
          type="button"
          className="btn btn-secondary"
          style={{ marginTop: '0.85rem' }}
          onClick={() => setShowUpload(true)}
        >
          📸 Add more photos ({remaining} left)
        </button>
      )}

      {remaining === 0 && (
        <p className="subtitle" style={{ marginTop: '0.75rem' }}>
          Album full ({MAX_PHOTOS} photos max)
        </p>
      )}

      {showUpload && remaining > 0 && (
        <div className="card reply-card" style={{ marginTop: '1rem', maxWidth: 400 }}>
          <p className="subtitle" style={{ marginBottom: '0.75rem' }}>
            You can add up to {remaining} more photo{remaining !== 1 ? 's' : ''}.
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={handleAddFiles}
          />
          <button
            type="button"
            className="btn btn-yes"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            Choose photos
          </button>
          {uploading && (
            <div className="upload-progress-wrap">
              <div className="upload-progress-track">
                <div className="upload-progress-fill" style={{ width: `${percent}%` }} />
              </div>
              <p className="upload-progress-label">
                {percent}% · {progress}
              </p>
            </div>
          )}
          {uploadError && <p className="name-error">{uploadError}</p>}
          {!uploading && (
            <button
              type="button"
              className="btn btn-back"
              onClick={() => {
                setShowUpload(false)
                setUploadError('')
              }}
            >
              Cancel
            </button>
          )}
        </div>
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