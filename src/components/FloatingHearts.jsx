import { useMemo } from 'react'

const HEARTS = ['❤️', '💕', '💗', '💖', '💘', '✨', '🌸']

export default function FloatingHearts() {
  const hearts = useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      emoji: HEARTS[i % HEARTS.length],
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 12}s`,
      duration: `${10 + Math.random() * 14}s`,
      size: `${0.9 + Math.random() * 1.4}rem`,
    }))
  }, [])

  return (
    <div className="hearts-bg" aria-hidden="true">
      {hearts.map((h) => (
        <span
          key={h.id}
          className="floating-heart"
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
