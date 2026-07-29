<<<<<<< HEAD
# 💕 Romantic Surprise – React App

A polished little interactive love note with a mischievous "No" button that refuses to be clicked.

## Features

- Soft animated floating hearts background
- Welcome screen → Question with runaway "No" button
- Progressive teasing messages as she tries to click No
- Confetti celebration on Yes
- Time-aware greeting (Good Morning / Afternoon / Evening / Night)
- Typing-effect love message
- Final photo gallery + fireworks
- Mobile responsive & smooth animations

## Quick start

```bash
cd romantic-surprise
npm install
npm run dev
```

Open the URL shown in the terminal (usually http://localhost:5173).

## Customize

### 1. Change the message
Edit `src/components/MessageScreen.jsx` → `FULL_MESSAGE` constant.

### 2. Add your real photos
1. Create folder: `public/photos/`
2. Add images named `1.jpg`, `2.jpg`, … (or update the list)
3. In `src/components/GalleryScreen.jsx`, replace the placeholder span with:

```jsx
<img src={`/photos/${photo.id}.jpg`} alt={photo.label} />
```

### 3. Background music
The app tries to play a soft romantic track after she clicks Yes.
You can replace the URL in `src/App.jsx` with your own MP3 (put it in `public/` and use `/your-song.mp3`).

### 4. Deploy
```bash
npm run build
```
Upload the `dist/` folder to Netlify, Vercel, GitHub Pages, etc.

Made with ❤️ for someone special.
=======
# OTNIT
>>>>>>> e5df0c2a13b595cc77d8b4e5ea4216f2cf12a540
