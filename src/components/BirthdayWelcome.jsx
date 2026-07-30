export default function BirthdayWelcome({ onContinue }) {
  return (
    <div className="screen">
      <div className="card">
        <div className="welcome-emoji" aria-hidden="true">🎂</div>
        <h1 className="title">Happy Birthday! 🎉</h1>
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
      </div>
    </div>
  )
}