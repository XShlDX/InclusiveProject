/* =========================================================
   KahoSound — audio helpers
   ========================================================= */

(function () {
  'use strict';

  let audioCtx = null;

  const resultSounds = {
    correct: new Audio('correct.mp3'),
    error: new Audio('error.mp3')
  };

  function getAudioCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    return audioCtx;
  }

  function playTone(hz, duration = 0.5) {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = hz;
    gain.gain.value = 0.18;

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  function playAudioFile(audio) {
    audio.pause();
    audio.currentTime = 0;
    audio.play().catch(() => {
      // Browsers can block playback until the user interacts with the page.
    });
  }

  function playCorrectSound() {
    playAudioFile(resultSounds.correct);
  }

  function playWrongSound() {
    playAudioFile(resultSounds.error);
  }

  window.KahoAudio = {
    playTone,
    playCorrectSound,
    playWrongSound
  };
})();
