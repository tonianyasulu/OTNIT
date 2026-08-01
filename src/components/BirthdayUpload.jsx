import { useState, useRef, useEffect } from 'react'
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../cloudinary'

const MAX_PHOTOS = 10
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

export default function BirthdayUpload({ profile, onDone, onBack }) {
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState('')
  const [percent, setPercent] = useState(0)
  const [error, setError] = useState('')
  const [existingCount, setExistingCount] = useState(0)
  const inputRef = useRef(null)
  const fileProgress = useRef([])

  useEffect(() => {
    const load = async () => {
      if (!db || !profile?.username) return
      try {
        const q = query(
          collection(db, 'birthdayPhotos'),
          where('username', '==', profile.username)
        )
        const snap = await getDocs(q)
        setExistingCount(snap.size)
      } catch (err) {
        console.error(err)
      }
    }
    load()
  }, [profile?.username])

  const slotsLeft = Math.max(0, MAX_PHOTOS - existingCount)

  const handleSelect = (e) => {
    const selected = Array.from(e.target.files || [])
    if (!selected.length) return
    const images = selected.filter((f) => f.type.startsWith('image/'))
    if (!images.length) {
      setError('Please choose image files only')
      return
    }
    setError('')
    setFiles((prev) => [...prev, ...images].slice(0, slotsLeft))
    const newPreviews = images.map((f) => URL.createObjectURL(f))
    setPreviews((prev) => [...prev, ...newPreviews].slice(0, slotsLeft))
  }

  const removeAt = (i) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== i))
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[i])
      return prev.filter((_, idx) => idx !== i)
    })
  }

  const updateOverall = (total) => {
    const avg =
      fileProgress.current.reduce((a, b) => a + b, 0) / Math.max(total, 1)
    setPercent(Math.min(100, Math.round(avg * 100)))
  }

  const handleUpload = async () => {
    if (!files.length) {
      onDone()
      return
    }
    if (!CLOUDINARY_CLOUD_NAME || CLOUDINARY_CLOUD_NAME === 'YOUR_CLOUD_NAME') {
      setError('Add your Cloudinary cloud name in src/cloudinary.js')
      return
    }
    if (!db) {
      setError('Firebase Firestore not configured')
      return
    }

    setUploading(true)
    setError('')
    setPercent(0)
    setProgress(`Preparing ${files.length} photo${files.length > 1 ? 's' : ''}...`)

    try {
      const compressed = await Promise.all(files.map((f) => compressImage(f)))
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
      setTimeout(() => onDone(), 400)
    } catch (err) {
      console.error(err)
      setError('Upload failed. Check Cloudinary + Firestore.')
      setUploading(false)
      setProgress('')
      setPercent(0)
    }
  }

  return (
    <div className="screen">
      <div className="card reply-card">
        <div className="welcome-emoji">📸</div>
        <h1 className="title">Add photos for {profile.displayName}</h1>
        <p className="subtitle">
          These will only show in {profile.displayName}&apos;s album.
          <br />
          <span style={{ fontSize: '0.85rem', opacity: 0.85 }}>
            {existingCount > 0
              ? `${existingCount} already saved · ${slotsLeft} slot${slotsLeft !== 1 ? 's' : ''} left (max ${MAX_PHOTOS})`
              : `Up to ${MAX_PHOTOS} photos · compressed for faster upload`}
          </span>
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={handleSelect}
        />

        {slotsLeft > 0 ? (
          <button
            type="button"
            className="btn btn-yes"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            Choose photos
          </button>
        ) : (
          <p className="subtitle">Album is full ({MAX_PHOTOS} photos)</p>
        )}

        {previews.length > 0 && (
          <div className="upload-grid">
            {previews.map((src, i) => (
              <div key={i} className="upload-thumb">
                <img src={src} alt="" />
                {!uploading && (
                  <button type="button" className="upload-remove" onClick={() => removeAt(i)}>
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

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
        {!uploading && progress && <p className="subtitle">{progress}</p>}

        <button
          type="button"
          className="btn btn-surprise"
          onClick={handleUpload}
          disabled={uploading}
          style={{ marginTop: '1rem' }}
        >
          {uploading
            ? 'Uploading...'
            : files.length
              ? `Upload ${files.length} photo${files.length > 1 ? 's' : ''} & continue`
              : 'Skip & view album'}
        </button>

        {onBack && !uploading && (
          <button type="button" className="btn btn-back" onClick={onBack}>
            ← Back
          </button>
        )}
      </div>
    </div>
  )
}