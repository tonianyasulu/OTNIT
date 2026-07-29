import { useState, useEffect, useRef, useCallback } from 'react'
import confetti from 'canvas-confetti'
import FloatingHearts from './components/FloatingHearts'
import CodeScreen from './components/CodeScreen'
import WelcomeScreen from './components/WelcomeScreen'
import QuestionScreen from './components/QuestionScreen'
import MessageScreen from './components/MessageScreen'
import GalleryScreen from './components/GalleryScreen'
import ReplyScreen from './components/ReplyScreen'

const SCREENS = {
  CODE: 'code',
  WELCOME: 'welcome',
  QUESTION: 'question',
  MESSAGE: 'message',
  GALLERY: 'gallery',
  REPLY: 'reply',
}

function App() {
  const [screen, setScreen] = useState(SCREENS.CODE)
  const [name, setName] = useState('')
  const [musicPlaying, setMusicPlaying] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    audioRef.current = new Audio('/music.mp3')
    audioRef.current.loop = true
    audioRef.current.volume = 0.4
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const playMusic = useCallback(() => {
    if (audioRef.current && !musicPlaying) {
      audioRef.current.play().catch(() => {})
      setMusicPlaying(true)
    }
  }, [musicPlaying])

  const fireConfetti = useCallback(() => {
    const duration = 3500
    const end = Date.now() + duration
    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ff6b9d', '#c77dff', '#ffd700', '#4ade80', '#fb7185'],
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ff6b9d', '#c77dff', '#ffd700', '#4ade80', '#fb7185'],
      })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
    confetti({
      particleCount: 120,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#ff6b9d', '#c77dff', '#ffd700', '#ffffff', '#fb7185'],
    })
  }, [])

  const handleUnlock = () => setScreen(SCREENS.WELCOME)

  const handleStart = (enteredName) => {
    setName(enteredName.trim() || 'beautiful')
    setScreen(SCREENS.QUESTION)
  }

  const handleYes = () => {
    playMusic()
    fireConfetti()
    setScreen(SCREENS.MESSAGE)
  }

  const handleSurprise = () => {
    fireConfetti()
    setScreen(SCREENS.GALLERY)
  }

  const handleReply = () => setScreen(SCREENS.REPLY)

  return (
    <>
      <FloatingHearts />
      {screen === SCREENS.CODE && <CodeScreen onUnlock={handleUnlock} />}
      {screen === SCREENS.WELCOME && <WelcomeScreen onStart={handleStart} />}
      {screen === SCREENS.QUESTION && <QuestionScreen onYes={handleYes} />}
      {screen === SCREENS.MESSAGE && (
        <MessageScreen name={name} onSurprise={handleSurprise} />
      )}
      {screen === SCREENS.GALLERY && (
        <GalleryScreen name={name} onReply={handleReply} />
      )}
      {screen === SCREENS.REPLY && <ReplyScreen name={name} />}
    </>
  )
}

export default App