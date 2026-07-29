import { useState } from 'react'

// Your WhatsApp number with country code, no + or spaces
// Example Kenya: '254712345678'
// Example US: '15551234567'
const WHATSAPP_NUMBER = '0894974564' // ← CHANGE THIS TO YOUR NUMBER

export default function ReplyScreen({ name }) {
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  const handleWhatsApp = (e) => {
    e.preventDefault()
    if (!message.trim() || !WHATSAPP_NUMBER) return

    const text = encodeURIComponent(
      `💕 Reply from ${name || 'someone special'}:\n\n${message.trim()}`
    )
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank')
    setSent(true)
  }

  if (sent) {
    return (
      <div className="screen">
        <div className="card">
          <div className="welcome-emoji">💌</div>
          <h1 className="title">Opening WhatsApp...</h1>
          <p className="subtitle">
            Thank you{name ? `, ${name}` : ''}. Send the message when WhatsApp opens ❤️
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="screen">
      <div className="card reply-card">
        <div className="welcome-emoji">💬</div>
        <h1 className="title">Want to say something back?</h1>
        <p className="subtitle">
          {name ? `${name}, type` : 'Type'} a message — it will open WhatsApp to send it
        </p>

        <form onSubmit={handleWhatsApp} className="reply-form">
          <textarea
            className="reply-textarea"
            placeholder="Write your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            maxLength={1000}
            required
          />
          <p className="reply-count">{message.length}/1000</p>

          <button
            type="submit"
            className="btn btn-whatsapp"
            disabled={!message.trim()}
          >
            Send via WhatsApp 💬
          </button>
        </form>
      </div>
    </div>
  )
}