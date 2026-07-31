import { useState, useEffect, useCallback, useRef } from 'react'
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'
import confetti from 'canvas-confetti'
import { db } from '../firebase'
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../cloudinary'

const SLIDE_SECONDS = 4
const ADMIN_CODE = 'tintowachabe'

const STATIC_PHOTOS = [
  { id: 'local-1', src: '/photos/li_thz.jpg', label: 'That Trip Was great', local: true },
  { id: 'local-2', src: '/photos/li_vCall.png', label: 'Calls together', local: true },
  { id: 'local-3', src: '/photos/lil_anime.png', label: 'Favorite date night', local: true },
  { id: 'local-4', src: '/photos/lil_narc.jpg', label: 'I remember Samosa', local: true },
  { id: 'local-5', src: '/photos/lil_psart.jpg', label: 'Celebrating us', local: true },
  { id: 'local-6', src: '/photos/lil_thz_2.jpg', label: 'Just because', local: true },
]

const MAX_SIZE = 1280
const JPEG_QUALITY = 0.72

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
      if (width <= MAX_SIZE && height <= MAX_SIZE && file.size < 400000) {
        resolve(file)
        return
      }
      if (width > height && width > MAX_SIZE) {
        height = Math.round((height * MAX_SIZE) / width)
        width = MAX_SIZE
      } else if (height > MAX_SIZE) {
        width = Math.round((width * MAX_SIZE) / height)
        height = MAX_SIZE
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

function uploadToCloudinary(file, onProgress) {
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

export default function GalleryScreen({ name, onReply, onBack }) {
  const [photos, setPhotos] = useState(STATIC_PHOTOS)
  const [index, setIndex] = useState(0)
  const [fading, setFading] = useState(false)
  const [paused, setPaused] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [percent, setPercent] = useState(0)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const [adminCode, setAdminCode] = useState('')
  const [adminError, setAdminError] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const inputRef = useRef(null)
  const fileProgress = useRef([])

  const loadCloudPhotos = useCallback(async () => {
    if (!db) {
      setLoading(false)
      return
    }
    try {
      const snap = await getDocs(collection(db, 'romanticPhotos'))
      const cloud = snap.docs.map((d) => {
        const data = d.data()
        return {
          id: d.id,
          src: data.url,
          label: data.label || 'A moment together',
          local: false,
          createdAt: data.createdAt?.seconds || 0,
        }
      })
      cloud.sort((a, b) => a.createdAt - b.createdAt)
      setPhotos([...STATIC_PHOTOS, ...cloud])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCloudPhotos()
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
      colors: ['#ff6b9d', '#c77dff', '#ffd700', '#4ade80', '#fb7185'],
    })
  }, [loadCloudPhotos])

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
    if (paused || photos.length < 2 || showUpload || showAdmin) return
    const timer = setInterval(() => goTo(index + 1), SLIDE_SECONDS * 1000)
    return () => clearInterval(timer)
  }, [index, paused, photos.length, goTo, showUpload, showAdmin])

  const updateOverall = (total) => {
    const avg =
      fileProgress.current.reduce((a, b) => a + b, 0) / Math.max(total, 1)
    setPercent(Math.min(100, Math.round(avg * 100)))
  }

  const handleFiles = async (e) => {
    const selected = Array.from(e.target.files || []).filter((f) =>
      f.type.startsWith('image/')
    )
    if (!selected.length) return
    if (!CLOUDINARY_CLOUD_NAME || CLOUDINARY_CLOUD_NAME === 'YOUR_CLOUD_NAME') {
      setError('Cloudinary not configured')
      return
    }
    if (!db) {
      setError('Firestore not configured')
      return
    }

    setUploading(true)
    setError('')
    setPercent(0)
    setProgress(`Preparing ${selected.length}...`)

    try {
      const compressed = await Promise.all(selected.map((f) => compressImage(f)))
      const total = compressed.length
      fileProgress.current = new Array(total).fill(0)
      let finished = 0
      setProgress(`Uploading 0 / ${total}...`)

      for (let i = 0; i < compressed.length; i++) {
        const url = await uploadToCloudinary(compressed[i], (p) => {
          fileProgress.current[i] = p * 0.9
          updateOverall(total)
        })
        await addDoc(collection(db, 'romanticPhotos'), {
          url,
          label: 'A moment together',
          uploadedBy: name || '',
          createdAt: serverTimestamp(),
        })
        fileProgress.current[i] = 1
        finished += 1
        updateOverall(total)
        setProgress(`Uploading ${finished} / ${total}...`)
      }

      setPercent(100)
      setProgress('Done!')
      await loadCloudPhotos()
      setTimeout(() => {
        setShowUpload(false)
        setUploading(false)
        setProgress('')
        setPercent(0)
      }, 500)
    } catch (err) {
      console.error(err)
      setError('Upload failed')
      setUploading(false)
      setProgress('')
      setPercent(0)
    }
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleAdminSubmit = (e) => {
    e.preventDefault()
    if (adminCode.trim().toLowerCase() === ADMIN_CODE) {
      setIsAdmin(true)
      setShowAdmin(false)
      setAdminCode('')
      setAdminError(false)
    } else {
      setAdminError(true)
    }
  }

  const deleteCurrentPhoto = async () => {
    const photo = photos[index]
    if (!photo || photo.local || !isAdmin) return
    if (!window.confirm('Delete this uploaded photo?')) return

    setDeleting(true)
    try {
      await deleteDoc(doc(db, 'romanticPhotos', photo.id))
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
          <p className="subtitle">Loading memories...</p>
        </div>
      </div>
    )
  }

  const photo = photos[index] || photos[0]
  const canDeleteCurrent = isAdmin && photo && !photo.local

  return (
    <div className="screen gallery-screen slideshow-screen">
      <h1 className="gallery-title">Our Memories 💕</h1>
      <p className="gallery-subtitle">
        {name
          ? `Every moment with you, ${name}, is a treasure`
          : 'Every moment with you is a treasure'}
      </p>
      <p className="gallery-subtitle" style={{ marginTop: '-0.75rem' }}>
        {photos.length} photo{photos.length !== 1 ? 's' : ''}
        {isAdmin ? ' · admin' : ''}
      </p>

      {photo && (
        <div
          className={`slideshow ${fading ? 'slideshow-fading' : ''}`}
          onClick={() => setPaused((p) => !p)}
          role="button"
          tabIndex={0}
        >
          <img key={photo.id} src={photo.src} alt={photo.label} className="slideshow-img" />
          <div className="slideshow-caption">{photo.label}</div>
          <div className="slideshow-progress-track">
            <div
              key={`${photo.id}-${paused}`}
              className={`slideshow-progress-bar ${paused ? 'paused' : ''}`}
              style={{ animationDuration: `${SLIDE_SECONDS}s` }}
            />
          </div>
        </div>
      )}

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

      {canDeleteCurrent && (
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
          {deleting ? 'Deleting...' : '🗑️ Delete this uploaded photo'}
        </button>
      )}

      {isAdmin && photo?.local && (
        <p className="subtitle" style={{ marginTop: '0.5rem' }}>
          This is a built-in photo (can&apos;t delete from here)
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={handleFiles}
      />

      {!showUpload && !showAdmin && (
        <button
          type="button"
          className="btn btn-secondary"
          style={{ marginTop: '1rem' }}
          onClick={() => setShowUpload(true)}
        >
          📸 Add more photos
        </button>
      )}

      {showUpload && (
        <div className="card reply-card" style={{ marginTop: '1rem', maxWidth: 400 }}>
          <p className="subtitle" style={{ marginBottom: '0.75rem' }}>
            Your photos will join the slideshow with the ones already here.
          </p>
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

          {error && <p className="name-error">{error}</p>}

          {!uploading && (
            <button
              type="button"
              className="btn btn-back"
              onClick={() => {
                setShowUpload(false)
                setError('')
              }}
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {!isAdmin && !showAdmin && (
        <button
          type="button"
          className="btn btn-secondary"
          style={{ marginTop: '0.75rem' }}
          onClick={() => setShowAdmin(true)}
        >
          🔐 Manage photos
        </button>
      )}

      {showAdmin && !isAdmin && (
        <form
          onSubmit={handleAdminSubmit}
          className="name-form"
          style={{ marginTop: '1rem', maxWidth: 320 }}
        >
          <input
            type="password"
            className={`name-input ${adminError ? 'name-input-error' : ''}`}
            placeholder="Admin code..."
            value={adminCode}
            onChange={(e) => {
              setAdminCode(e.target.value)
              setAdminError(false)
            }}
            autoComplete="off"
          />
          {adminError && <p className="name-error">Wrong code</p>}
          <button type="submit" className="btn btn-yes name-btn">
            Unlock admin
          </button>
          <button
            type="button"
            className="btn btn-back"
            onClick={() => {
              setShowAdmin(false)
              setAdminCode('')
              setAdminError(false)
            }}
          >
            Cancel
          </button>
        </form>
      )}

      {isAdmin && (
        <p className="subtitle" style={{ marginTop: '0.5rem', color: '#e84a7f' }}>
          Admin unlocked — you can delete uploaded photos
        </p>
      )}

      <button type="button" className="btn btn-surprise reply-cta" onClick={onReply}>
        💬 Send him a message
      </button>

      {onBack && (
        <button type="button" className="btn btn-back" onClick={onBack}>
          ← Back
        </button>
      )}

      <p className="finale">
        Made with ❤️ just for you{name ? `, ${name}` : ''}.
      </p>
    </div>
  )
}