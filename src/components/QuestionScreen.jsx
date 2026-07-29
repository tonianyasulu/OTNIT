import { useState, useRef, useCallback } from 'react'

const NO_MESSAGES = [
  '', // 0 – not used
  '', // 1 – first move
  '', // 2
  'Are you sure? 🤨',
  'You almost got me! 😂',
  '', // 5 – swap
  'The "No" button has resigned. 😂',
]

export default function QuestionScreen({ onYes }) {
  const [noClicks, setNoClicks] = useState(0)
  const [noStyle, setNoStyle] = useState({})
  const [noText, setNoText] = useState('❤️ No')
  const [swapped, setSwapped] = useState(false)
  const [hint, setHint] = useState('')
  const [noResigned, setNoResigned] = useState(false)
  const noBtnRef = useRef(null)
  const containerRef = useRef(null)

  const moveNoButton = useCallback(() => {
    if (!containerRef.current) return

    const container = containerRef.current.getBoundingClientRect()
    // Keep button inside viewport with some margin
    const maxX = Math.max(window.innerWidth - 140, 40)
    const maxY = Math.max(window.innerHeight - 70, 40)
    const x = 20 + Math.random() * (maxX - 40)
    const y = 20 + Math.random() * (maxY - 40)

    setNoStyle({
      position: 'fixed',
      left: `${x}px`,
      top: `${y}px`,
      zIndex: 50,
      transition: 'all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)',
    })
  }, [])

  const handleNoClick = (e) => {
    e.preventDefault()
    e.stopPropagation()

    const next = noClicks + 1
    setNoClicks(next)

    if (next === 1) {
      moveNoButton()
      setHint("Nice try... 😏")
    } else if (next === 2) {
      moveNoButton()
      setHint("Still going for No? 😂")
    } else if (next === 3) {
      setNoStyle((s) => ({
        ...s,
        transform: 'scale(0.7)',
        fontSize: '0.85rem',
        padding: '0.6rem 1.2rem',
      }))
      moveNoButton()
      setHint("Getting smaller... 👀")
    } else if (next === 4) {
      setNoText('Are you sure? 🤨')
      moveNoButton()
      setHint('')
    } else if (next === 5) {
      setNoText('You almost got me! 😂')
      moveNoButton()
    } else if (next === 6) {
      // Swap places conceptually – we just make No jump far and Yes stay
      setSwapped(true)
      moveNoButton()
      setHint("Swapped? Or did it just run away again?")
    } else if (next >= 7) {
      setNoResigned(true)
      setNoText('The "No" button has resigned. 😂')
      setNoStyle({
        position: 'relative',
        left: 'auto',
        top: 'auto',
        transform: 'scale(0.85)',
        opacity: 0.6,
        pointerEvents: 'none',
      })
      setHint("Looks like there's only one option left 💚")
    }
  }

  // Also dodge on hover after a few attempts for extra fun
  const handleNoHover = () => {
    if (noClicks >= 1 && noClicks < 7 && !noResigned) {
      moveNoButton()
    }
  }

  return (
    <div className="screen" ref={containerRef}>
      <div className="card">
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🤔</div>
        <h1 className="title">Will you keep making my days brighter? ❤️</h1>
        <p className="subtitle">Choose carefully...</p>

        <div className="btn-group">
          {swapped ? (
            <>
              <button
                ref={noBtnRef}
                className="btn btn-no"
                style={noStyle}
                onClick={handleNoClick}
                onMouseEnter={handleNoHover}
              >
                {noText}
              </button>
              <button className="btn btn-yes" onClick={onYes}>
                💚 Yes
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-yes" onClick={onYes}>
                💚 Yes
              </button>
              {!noResigned && (
                <button
                  ref={noBtnRef}
                  className="btn btn-no"
                  style={noStyle}
                  onClick={handleNoClick}
                  onMouseEnter={handleNoHover}
                >
                  {noText}
                </button>
              )}
            </>
          )}
        </div>

        {noResigned && (
          <div style={{ marginTop: '1.25rem' }}>
            <button className="btn btn-yes" onClick={onYes} style={{ fontSize: '1.15rem' }}>
              💚 Yes (the only choice left)
            </button>
          </div>
        )}

        <p className="no-hint">{hint || '\u00A0'}</p>
      </div>
    </div>
  )
}
