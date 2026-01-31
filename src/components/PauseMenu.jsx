import React from 'react';

export default function PauseMenu({ onResume, onQuit }) {
  return (
    <div className="pause-overlay">
      <div className="pause-menu">
        <h2>PAUSED</h2>
        <button className="pause-button" onClick={onResume}>
          RESUME
        </button>
        <button className="pause-button quit" onClick={onQuit}>
          QUIT TO MENU
        </button>
        <p className="pause-hint">Press P or ESC to Resume</p>
      </div>
    </div>
  );
}
