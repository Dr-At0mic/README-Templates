import { useEffect, useState } from 'react';
import {
  closeWindow,
  framePlatform,
  hasCustomFrame,
  minimizeWindow,
  toggleMaximizeWindow,
  watchMaximized,
} from '../lib/appWindow';

// 10px glyphs drawn on a 1px grid, like the native caption buttons.
const glyphs = {
  minimize: <path d="M0.5 5.5h9" />,
  maximize: <rect x="0.5" y="0.5" width="9" height="9" rx="1" />,
  restore: (
    <>
      <rect x="0.5" y="2.5" width="7" height="7" rx="1" />
      <path d="M2.5 2.5v-1a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1h-1" />
    </>
  ),
  close: <path d="M0.5 0.5l9 9M9.5 0.5l-9 9" />,
};

function Glyph({ name }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
      {glyphs[name]}
    </svg>
  );
}

// Desktop only: minimize / maximize / close for the frameless window.
export default function WindowControls() {
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    if (!hasCustomFrame()) return;
    let unlisten = null;
    let cancelled = false;
    watchMaximized(setMaximized).then((stop) => (cancelled ? stop() : (unlisten = stop)));
    return () => {
      cancelled = true;
      unlisten?.();
    };
  }, []);

  if (!hasCustomFrame()) return null;

  return (
    <div className={`window-controls window-controls-${framePlatform()}`}>
      <button type="button" className="window-button" onClick={minimizeWindow} aria-label="Minimize" title="Minimize">
        <Glyph name="minimize" />
      </button>
      <button
        type="button"
        className="window-button"
        onClick={toggleMaximizeWindow}
        aria-label={maximized ? 'Restore' : 'Maximize'}
        title={maximized ? 'Restore' : 'Maximize'}
      >
        <Glyph name={maximized ? 'restore' : 'maximize'} />
      </button>
      <button type="button" className="window-button window-button-close" onClick={closeWindow} aria-label="Close" title="Close">
        <Glyph name="close" />
      </button>
    </div>
  );
}
