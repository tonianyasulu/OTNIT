import { useState, useRef } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../cloudinary'

export default function BirthdayUpload({ profile, onDone, onBack }) {
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  const handleSelect = (e) => {
    const selected = Array.from(e.target.files || [])
    if (!selected.length) return
    const images = selected.filter((f) => f.type.startsWith('image/'))
    if (!images.length) {
      setError('Please choose image files only')
      return
    }
    setError('')
    setFiles((prev) => [...prev, ...images].slice(0, 12))
    const newPreviews = images.map((f) => URL.createObjectURL(f))
    setPreviews((prev) => [...prev, ...newPreviews].slice(0, 12))
  }

  const removeAt = (i) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== i))
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[i])
      return prev.filter((_, idx) => idx !== i)
    })
  }

  const uploadOne = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    )
    if (!res.ok) throw new Error(await res.text())
    const data = await res.json()
    return data.secure_url
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
    try {
      for (let i = 0; i < files.length; i++) {
        setProgress(`Uploading ${i + 1} of ${files.length}...`)
        const url = await uploadOne(files[i])
        await addDoc(collection(db, 'birthdayPhotos'), {
          url,
          name: files[i].name,
          username: profile.username,
          displayName: profile.displayName,
          dob: profile.dob || '',
          createdAt: serverTimestamp(),
        })
      }
      setProgress('Done!')
      setTimeout(() => onDone(), 500)
    } catch (err) {
      console.error(err)
      setError('Upload failed. Check Cloudinary + Firestore.')
      setUploading(false)
      setProgress('')
    }
  }

  return (
    <div className="screen">
      <div className="card reply-card">
        <div className="welcome-emoji">📸</div>
        <h1 className="title">Add photos for {profile.displayName}</h1>
        <p className="subtitle">
          These will only show in {profile.displayName}&apos;s album.
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={handleSelect}
        />

        <button
          type="button"
          className="btn btn-yes"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          Choose photos
        </button>

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

        {error && <p className="name-error">{error}</p>}
        {progress && <p className="subtitle">{progress}</p>}

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