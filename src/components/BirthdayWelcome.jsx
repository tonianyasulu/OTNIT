function formatDob(dob) {
  if (!dob) return ''
  try {
    const d = new Date(dob + 'T00:00:00')
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dob
  }
}

export default function BirthdayWelcome({ profile, onContinue, onBack }) {
  return (
    <div className="screen">
      <div className="card">
        <div className="welcome-emoji">🎂</div>
        <h1 className="title">Happy Birthday, {profile.displayName}! 🎉</h1>
        {profile.dob && (
          <p className="subtitle" style={{ marginBottom: '0.5rem', fontWeight: 500 }}>
            {formatDob(profile.dob)}
          </p>
        )}
        <p className="subtitle" style={{ lineHeight: 1.7 }}>
          Today is all about you.
          <br />
          May this year bring you laughter, peace, and every little thing that makes you smile.
          <br /><br />
          You deserve the world — and more.
        </p>
        <button className="btn btn-yes" onClick={onContinue}>
          Let&apos;s celebrate ✨
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