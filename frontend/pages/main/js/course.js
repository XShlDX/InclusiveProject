function showTrack(track) {
    document.querySelectorAll('.track-section').forEach(s => s.classList.remove('visible'));
    document.getElementById('track-' + track).classList.add('visible');
    document.querySelectorAll('.track-tab').forEach(t => {
      t.className = 'track-tab';
    });
    const idx = ['html','css','js'].indexOf(track);
    document.querySelectorAll('.track-tab')[idx].className = 'track-tab active-' + track;

    // handle hash
    const hash = {'html':'#html','css':'#css','js':'#js'}[track];
    history.replaceState(null, '', hash);
  }

  // open from hash
  const h = location.hash.replace('#','');
  if(['html','css','js'].includes(h)) showTrack(h);