import { useState, useEffect } from 'react'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return { emoji: '🌅', text: 'Good Morning' }
  if (hour >= 12 && hour < 17) return { emoji: '☀️', text: 'Good Afternoon' }
  if (hour >= 17 && hour < 21) return { emoji: '🌇', text: 'Good Evening' }
  return { emoji: '🌙', text: 'Good Night' }
}

const FULL_MESSAGE = `I know this was a little game... 😂

But there's something I've genuinely wanted to tell you.

Thank you for being such an amazing person.
Your smile, your kindness, and the way you make my days better mean more than you know.

No matter where life takes us, I hope you always remember that you're special to me.`

export default function MessageScreen({ name, onSurprise }) {
  const greeting = getGreeting()
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const [showLove, setShowLove] = useState(false)
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    let i = 0
    const speed = 32
    const timer = setInterval(() => {
      if (i < FULL_MESSAGE.length) {
        setDisplayed(FULL_MESSAGE.slice(0, i + 1))
        i++
      } else {
        clearInterval(timer)
        setDone(true)
        setTimeout(() => setShowLove(true), 400)
        setTimeout(() => setShowButton(true), 1200)
      }
    }, speed)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="screen">
      <div className="card message-card">
        <h1 className="greeting">
          {greeting.emoji} {greeting.text}, {name} ❤️
        </h1>

        <div className="message-text">
          {displayed.split('\n').map((line, idx) => (
            <span key={idx}>
              {line}
              {idx < displayed.split('\n').length - 1 && <br />}
            </span>
          ))}
          {!done && <span className="cursor" />}
        </div>

        {showLove && (
          <p className="love-line" style={{ animation: 'fadeIn 0.8s ease both' }}>
            ❤️ I love you, {name}. ❤️
          </p>
        )}

        {showButton && (
          <button className="btn btn-surprise" onClick={onSurprise}>
            🎁 One Last Surprise...
          </button>
        )}
      </div>
    </div>
  )
}