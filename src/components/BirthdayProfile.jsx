import { useState } from 'react'

const ADMIN_CODE = 'tintowachabe'

function isBirthdayToday(dob) {
  if (!dob) return false
  try {
    const d = new Date(dob + 'T00:00:00')
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
  } catch {
    return false
  }
}

export default function BirthdayProfile({ onContinue, onViewAlbums, onBack }) {
  const [name, setName] = useState('')
  const [dob, setDob] = useState('')
  const [error, setError] = useState('')
  const [showAdmin, setShowAdmin] = useState(false)
  const [adminCode, setAdminCode] = useState('')
  const [adminError, setAdminError] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Please enter a name')
      return
    }
    if (!dob) {
      setError('Please enter date of birth')
      return
    }

    if (!isAdmin && !isBirthdayToday(dob)) {
      setError("It's not your birthday today 🎂 Come back on your special day!")
      return
    }

    const username = trimmed.toLowerCase().replace(/\s+/g, '_')
    onContinue({ displayName: trimmed, username, dob, isAdmin })
  }

  const handleAdminSubmit = (e) => {
    e.preventDefault()
    if (adminCode.trim().toLowerCase() === ADMIN_CODE) {
      setIsAdmin(true)
      setShowAdmin(false)
      setAdminCode('')
      setAdminError(false)
      setError('')
    } else {
      setAdminError(true)
    }
  }

  return (
    <div className="screen">
      <div className="card">
        <div className="welcome-emoji">🎂</div>
        <h1 className="title">Who&apos;s celebrating?</h1>
        <p className="subtitle">
          {isAdmin
            ? 'Admin mode'
            : 'Enter your name and birthday'}
        </p>

        <form onSubmit={handleSubmit} className="name-form">
          <input
            type="text"
            className="name-input"
            placeholder="Your name..."
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError('')
            }}
            maxLength={40}
            autoComplete="off"
            autoFocus
          />
          <input
            type="date"
            className="name-input"
            value={dob}
            onChange={(e) => {
              setDob(e.target.value)
              setError('')
            }}
            style={{ colorScheme: 'light' }}
          />
          {error && <p className="name-error">{error}</p>}
          <button type="submit" className="btn btn-yes name-btn">
            Continue ✨
          </button>
        </form>

        <button type="button" className="btn btn-secondary" onClick={onViewAlbums}>
          📂 View saved albums
        </button>

        {!isAdmin && !showAdmin && (
          <button
            type="button"
            className="btn btn-secondary"
            style={{ marginTop: '0.65rem' }}
            onClick={() => setShowAdmin(true)}
          >
            🔐 Admin unlock
          </button>
        )}

        {showAdmin && !isAdmin && (
          <form onSubmit={handleAdminSubmit} className="name-form" style={{ marginTop: '1rem' }}>
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
          <p className="subtitle" style={{ marginTop: '0.75rem', color: '#e84a7f' }}>
            Admin unlocked
          </p>
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