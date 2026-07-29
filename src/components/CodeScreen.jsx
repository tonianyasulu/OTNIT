import { useState } from 'react'

// Change this to whatever secret code you want
const SECRET_CODE = 'wachabe'

export default function CodeScreen({ onUnlock }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)
  const [shaking, setShaking] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (code.trim().toLowerCase() === SECRET_CODE.toLowerCase()) {
      onUnlock()
    } else {
      setError(true)
      setShaking(true)
      setTimeout(() => setShaking(false), 400)
    }
  }

  return (
    <div className="screen">
      <div className={`card ${shaking ? 'card-shake' : ''}`}>
        <div className="welcome-emoji" aria-hidden="true">🔐</div>
        <h1 className="title">This is just for you...</h1>
        <p className="subtitle">Enter the secret code to continue</p>

        <form onSubmit={handleSubmit} className="name-form">
          <input
            type="text"
            className={`name-input ${error ? 'name-input-error' : ''}`}
            placeholder="Secret code..."
            value={code}
            onChange={(e) => {
              setCode(e.target.value)
              setError(false)
            }}
            maxLength={40}
            autoComplete="off"
            autoFocus
          />
          {error && (
            <p className="name-error">Wrong code 😅 Try again</p>
          )}
          <button type="submit" className="btn btn-yes name-btn">
            Unlock ✨
          </button>
        </form>
      </div>
    </div>
  )
}