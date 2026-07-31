import { useState } from 'react'

export default function BirthdayProfile({ onContinue, onViewAlbums, onBack }) {
  const [name, setName] = useState('')
  const [dob, setDob] = useState('')
  const [error, setError] = useState('')

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
    const username = trimmed.toLowerCase().replace(/\s+/g, '_')
    onContinue({ displayName: trimmed, username, dob })
  }

  return (
    <div className="screen">
      <div className="card">
        <div className="welcome-emoji">🎂</div>
        <h1 className="title">Who&apos;s celebrating?</h1>
        <p className="subtitle">Enter your name and birthday</p>

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

        {onBack && (
          <button type="button" className="btn btn-back" onClick={onBack}>
            ← Back
          </button>
        )}
      </div>
    </div>
  )
}