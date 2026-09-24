import React from 'react'

export default function QawayCleanLoader({ fullScreen = true, text = '' }) {
  return (
    <div className={`qaway-clean-loader-root ${fullScreen ? 'fullscreen' : 'inline'}`}>
      <div className="dots-container">
        <div className="dot" />
        <div className="dot" />
        <div className="dot" />
      </div>
      {text && <p className="qaway-loader-caption">{text}</p>}

      <style>{`
        .qaway-clean-loader-root {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #f7f7f8;
          width: 100%;
          user-select: none;
        }

        .qaway-clean-loader-root.fullscreen {
          min-height: 100vh;
          position: fixed;
          inset: 0;
          z-index: 9999;
        }

        .qaway-clean-loader-root.inline {
          min-height: 200px;
          padding: 40px 0;
        }

        /* From Uiverse.io by adamgiebl - Adapted for Qaway Lab */
        .dots-container {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dot {
          height: 18px;
          width: 18px;
          margin-right: 12px;
          border-radius: 50%;
          background-color: #ffd8cc;
          animation: qawayDotPulse 1.5s infinite ease-in-out;
        }

        .dot:last-child {
          margin-right: 0;
        }

        .dot:nth-child(1) {
          animation-delay: -0.3s;
        }

        .dot:nth-child(2) {
          animation-delay: -0.1s;
        }

        .dot:nth-child(3) {
          animation-delay: 0.1s;
        }

        @keyframes qawayDotPulse {
          0% {
            transform: scale(0.8);
            background-color: #ffd8cc;
            box-shadow: 0 0 0 0 rgba(255, 75, 11, 0.4);
          }

          50% {
            transform: scale(1.22);
            background-color: #ff4b0b;
            box-shadow: 0 0 0 10px rgba(255, 75, 11, 0);
          }

          100% {
            transform: scale(0.8);
            background-color: #ffd8cc;
            box-shadow: 0 0 0 0 rgba(255, 75, 11, 0.4);
          }
        }

        .qaway-loader-caption {
          margin-top: 22px;
          font-size: 13px;
          font-weight: 600;
          color: #73737b;
          letter-spacing: -0.2px;
          font-family: Inter, system-ui, -apple-system, sans-serif;
        }
      `}</style>
    </div>
  )
}
