import { useState, useEffect, useRef, useCallback } from 'react'
import confetti from 'canvas-confetti'
import FloatingHearts from './components/FloatingHearts'
import CodeScreen from './components/CodeScreen'
import WelcomeScreen from './components/WelcomeScreen'
import QuestionScreen from './components/QuestionScreen'
import MessageScreen from './components/MessageScreen'
import GalleryScreen from './components/GalleryScreen'
import ReplyScreen from './components/ReplyScreen'
import BirthdayProfile from './components/BirthdayProfile'
import BirthdayWelcome from './components/BirthdayWelcome'
import BirthdayUpload from './components/BirthdayUpload'
import BirthdayGallery from './components/BirthdayGallery'
import BirthdayAlbums from './components/BirthdayAlbums'

const SCREENS = {
  CODE: 'code',
  WELCOME: 'welcome',
  QUESTION: 'question',
  MESSAGE: 'message',
  GALLERY: 'gallery',
  REPLY: 'reply',
  BDAY_PROFILE: 'bday_profile',
  BDAY_WELCOME: 'bday_welcome',
  BDAY_UPLOAD: 'bday_upload',
  BDAY_GALLERY: 'bday_gallery',
  BDAY_ALBUMS: 'bday_albums',
}

const ROMANTIC_PLAYLIST = ['/music1.mp3', '/music2.mp3', '/music3.mp3']
const BIRTHDAY_PLAYLIST = ['/bday1.mp3', '/bday2.mp3', '/bday3.mp3']

function App() {
  const [screen, setScreen] = useState(SCREENS.CODE)
  const [name, setName] = useState('')
  const [bdayProfile, setBdayProfile] = useState(null)
  const [galleryFromAlbums, setGalleryFromAlbums] = useState(false)
  const [musicStarted, setMusicStarted] = useState(false)
  const audioRef = useRef(null)
  const trackIndexRef = useRef(0)
  const playlistRef = useRef(ROMANTIC_PLAYLIST)

  useEffect(() => {
    const audio = new Audio()
    audio.volume = 0.4
    audioRef.current = audio
    const playNext = () => {
      const list = playlistRef.current
      trackIndexRef.current = (trackIndexRef.current + 1) % list.length
      audio.src = list[trackIndexRef.current]
      audio.play().catch(() => {})
    }
    audio.addEventListener('ended', playNext)
    return () => {
      audio.removeEventListener('ended', playNext)
      audio.pause()
      audioRef.current = null
    }
  }, [])

  const startPlaylist = useCallback((list) => {
    if (!audioRef.current) return
    playlistRef.current = list
    trackIndexRef.current = 0
    audioRef.current.src = list[0]
    audioRef.current.play().catch(() => {})
    setMusicStarted(true)
  }, [])

  const playRomanticMusic = useCallback(() => {
    if (!musicStarted) startPlaylist(ROMANTIC_PLAYLIST)
  }, [musicStarted, startPlaylist])

  const playBirthdayMusic = useCallback(() => {
    startPlaylist(BIRTHDAY_PLAYLIST)
  }, [startPlaylist])

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

  const handleRomantic = () => setScreen(SCREENS.WELCOME)
  const handleBirthday = () => {
    playBirthdayMusic()
    fireConfetti()
    setScreen(SCREENS.BDAY_PROFILE)
  }

  const handleStart = (enteredName) => {
    setName(enteredName.trim() || 'beautiful')
    setScreen(SCREENS.QUESTION)
  }
  const handleYes = () => {
    playRomanticMusic()
    fireConfetti()
    setScreen(SCREENS.MESSAGE)
  }
  const handleSurprise = () => {
    fireConfetti()
    setScreen(SCREENS.GALLERY)
  }
  const handleReply = () => setScreen(SCREENS.REPLY)

  const handleBdayProfile = (profile) => {
    setBdayProfile(profile)
    setGalleryFromAlbums(false)
    setScreen(SCREENS.BDAY_WELCOME)
  }
  const handleBdayContinue = () => setScreen(SCREENS.BDAY_UPLOAD)
  const handleBdayUploadDone = () => {
    fireConfetti()
    setGalleryFromAlbums(false)
    setScreen(SCREENS.BDAY_GALLERY)
  }
  const handleViewAlbums = () => setScreen(SCREENS.BDAY_ALBUMS)
  const handleSelectAlbum = (profile) => {
    setBdayProfile(profile)
    setGalleryFromAlbums(true)
    fireConfetti()
    setScreen(SCREENS.BDAY_GALLERY)
  }
  const handleAlbumsBack = () => setScreen(SCREENS.BDAY_PROFILE)

  return (
    <>
      <FloatingHearts />
      {screen === SCREENS.CODE && (
        <CodeScreen onRomantic={handleRomantic} onBirthday={handleBirthday} />
      )}
      {screen === SCREENS.WELCOME && (
        <WelcomeScreen onStart={handleStart} onBack={() => setScreen(SCREENS.CODE)} />
      )}
      {screen === SCREENS.QUESTION && (
        <QuestionScreen onYes={handleYes} onBack={() => setScreen(SCREENS.WELCOME)} />
      )}
      {screen === SCREENS.MESSAGE && (
        <MessageScreen name={name} onSurprise={handleSurprise} onBack={() => setScreen(SCREENS.QUESTION)} />
      )}
      {screen === SCREENS.GALLERY && (
        <GalleryScreen name={name} onReply={handleReply} onBack={() => setScreen(SCREENS.MESSAGE)} />
      )}
      {screen === SCREENS.REPLY && (
        <ReplyScreen name={name} onBack={() => setScreen(SCREENS.GALLERY)} />
      )}
      {screen === SCREENS.BDAY_PROFILE && (
        <BirthdayProfile
          onContinue={handleBdayProfile}
          onViewAlbums={handleViewAlbums}
          onBack={() => setScreen(SCREENS.CODE)}
        />
      )}
      {screen === SCREENS.BDAY_WELCOME && bdayProfile && (
        <BirthdayWelcome
          profile={bdayProfile}
          onContinue={handleBdayContinue}
          onBack={() => setScreen(SCREENS.BDAY_PROFILE)}
        />
      )}
      {screen === SCREENS.BDAY_UPLOAD && bdayProfile && (
        <BirthdayUpload
          profile={bdayProfile}
          onDone={handleBdayUploadDone}
          onBack={() => setScreen(SCREENS.BDAY_WELCOME)}
        />
      )}
      {screen === SCREENS.BDAY_GALLERY && bdayProfile && (
        <BirthdayGallery
          profile={bdayProfile}
          onBack={() =>
            setScreen(galleryFromAlbums ? SCREENS.BDAY_ALBUMS : SCREENS.BDAY_UPLOAD)
          }
        />
      )}
      {screen === SCREENS.BDAY_ALBUMS && (
        <BirthdayAlbums onSelect={handleSelectAlbum} onBack={handleAlbumsBack} />
      )}
    </>
  )
}

export default App