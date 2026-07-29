import { useState } from 'react'

export default function WelcomeScreen({ onStart }) {
  const [name, setName] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError(true)
      return
    }
    onStart(name.trim())
  }

  return (
    <div className="screen">
      <div className="card">
        <div className="welcome-emoji" aria-hidden="true">💕</div>
        <h1 className="title">I have something important to ask you...</h1>
        <p className="subtitle">But first, what should I call you?</p>

        <form onSubmit={handleSubmit} className="name-form">
          <input
            type="text"
            className={`name-input ${error ? 'name-input-error' : ''}`}
            placeholder="Type your name..."
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError(false)
            }}
            maxLength={30}
            autoComplete="off"
            autoFocus
          />
          {error && <p className="name-error">Please enter your name 💕</p>}
          <button type="submit" className="btn btn-yes name-btn">
            I&apos;m ready ✨
          </button>
        </form>
      </div>
    </div>
  )
}