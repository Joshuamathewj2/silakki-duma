import React, { useEffect, useState } from 'react';
import { CONFIG } from '../config.js';
import { useGameStore } from '../store/useGameStore.js';
import { audio } from '../utils/audio.js';

function getTimeUntilBirthday() {
  const now = new Date();
  let year = now.getFullYear();
  let target = new Date(
    year,
    CONFIG.recipientBirthday.month - 1,
    CONFIG.recipientBirthday.day,
    0,
    0,
    0
  );
  if (target <= now) {
    target = new Date(
      year + 1,
      CONFIG.recipientBirthday.month - 1,
      CONFIG.recipientBirthday.day,
      0,
      0,
      0
    );
  }
  const diff = Math.max(0, target.getTime() - now.getTime());
  return {
    days: String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0'),
    hours: String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0'),
    mins: String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0'),
    secs: String(Math.floor((diff / 1000) % 60)).padStart(2, '0'),
  };
}

/**
 * Finale Birthday Card & "Wish him back at 12 AM" Countdown Modal.
 */
export function WishModal() {
  const wishCardOpen = useGameStore((s) => s.wishCardOpen);
  const setWishCardOpen = useGameStore((s) => s.setWishCardOpen);
  const countdownOpen = useGameStore((s) => s.countdownOpen);
  const setCountdownOpen = useGameStore((s) => s.setCountdownOpen);

  const [timeLeft, setTimeLeft] = useState(getTimeUntilBirthday);

  useEffect(() => {
    if (!countdownOpen) return;
    setTimeLeft(getTimeUntilBirthday());
    const id = window.setInterval(() => setTimeLeft(getTimeUntilBirthday()), 1000);
    return () => clearInterval(id);
  }, [countdownOpen]);

  return (
    <>
      {/* Unfolding Birthday Letter Card */}
      {wishCardOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="wish-card">
            <button
              type="button"
              className="modal-close"
              onClick={() => setWishCardOpen(false)}
              aria-label="Close"
            >
              ✕
            </button>
            <span className="pill-tag pill-tag--gold">BELATED, BUT REAL</span>
            <h2 className="wish-title">{CONFIG.finalMessage.heading}</h2>

            <div className="wish-body">
              {CONFIG.finalMessage.body.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            <p className="wish-sig">{CONFIG.finalMessage.signature}</p>

            <div className="wish-actions">
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  audio.playInteract();
                  setCountdownOpen(true);
                }}
              >
                ⏰ Wish him back at 12 AM
              </button>
              <button
                type="button"
                className="btn-pill btn-pill--cyan"
                onClick={() => setWishCardOpen(false)}
              >
                Keep Exploring
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Countdown to Srinath's Next Birthday */}
      {countdownOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="countdown-card">
            <button
              type="button"
              className="modal-close"
              onClick={() => setCountdownOpen(false)}
              aria-label="Close"
            >
              ✕
            </button>
            <span className="pill-tag">NEXT 12 AM TIMER</span>
            <h3 className="countdown-title">Countdown to {CONFIG.recipientName}'s Next Birthday</h3>
            <p className="countdown-sub">Target: 12:00 AM • {CONFIG.recipientBirthday.label}</p>

            <div className="countdown-grid">
              <div className="cd-cell">
                <span className="cd-num">{timeLeft.days}</span>
                <span className="cd-unit">DAYS</span>
              </div>
              <div className="cd-cell">
                <span className="cd-num">{timeLeft.hours}</span>
                <span className="cd-unit">HRS</span>
              </div>
              <div className="cd-cell">
                <span className="cd-num">{timeLeft.mins}</span>
                <span className="cd-unit">MIN</span>
              </div>
              <div className="cd-cell">
                <span className="cd-num">{timeLeft.secs}</span>
                <span className="cd-unit">SEC</span>
              </div>
            </div>

            <p className="countdown-note">{CONFIG.recipientBirthday.funnyNote}</p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setCountdownOpen(false)}
            >
              Deal, broski 🤝
            </button>
          </div>
        </div>
      )}
    </>
  );
}
