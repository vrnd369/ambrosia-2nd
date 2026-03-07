import { useEffect, useState, useRef } from 'react';
import Eye from '../assets/eye.webp';
import EyeBlink from '../assets/eye-blink.webp';

export default function EyeCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);
  const [hide, setHide] = useState(false);
  const hideRef = useRef(false);
  hideRef.current = hide;

  useEffect(() => {
    const preload = new Image();
    preload.src = EyeBlink;

    const isInteractive = target => {
      return (
        target.closest('a, button, input, textarea, select, [role="button"], [data-cursor="native"]') !== null
      );
    };

    const keepEyeCursor = target => {
      return target.closest('[data-cursor="eye"]') !== null;
    };

    const moveHandler = e => {
      setPos({ x: e.clientX, y: e.clientY });
      const interactive = isInteractive(e.target);
      const keepEye = keepEyeCursor(e.target);
      const v = interactive && !keepEye;
      hideRef.current = v;
      setHide(v);
    };

    const blinkOnce = () => {
      if (hideRef.current) return;
      setBlink(true);
      requestAnimationFrame(() => {
        setTimeout(() => setBlink(false), 150);
      });
    };

    window.addEventListener('mousemove', moveHandler);
    window.addEventListener('pointerdown', blinkOnce);

    return () => {
      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('pointerdown', blinkOnce);
    };
  }, []);

  return (
    <>
      <style>{`
        @media (min-width: 1025px) {
          body {
            cursor: ${hide ? 'auto' : 'none'};
          }
        }
        @media (max-width: 1024px) {
          .custom-eye-cursor {
            display: none !important;
          }
        }
      `}</style>

      {!hide && (
        <div
          className="custom-eye-cursor"
          style={{
            position: 'fixed',
            left: pos.x,
            top: pos.y,
            transform: 'translate3d(-50%, -50%, 0)',
            pointerEvents: 'none',
            zIndex: 99999,
            width: 42,
            willChange: 'transform',
          }}
        >
          <img src={blink ? EyeBlink : Eye} alt="cursor eye" style={{ width: '100%', height: '100%' }} />
        </div>
      )}
    </>
  );
}
