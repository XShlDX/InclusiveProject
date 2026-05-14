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








  (function() {
    const btn = document.getElementById('burgerBtn');
    const nav = document.getElementById('mobileNav');
    const backdrop = document.getElementById('mobileNavBackdrop');
    function open() { btn.classList.add('is-open'); nav.classList.add('is-open'); nav.setAttribute('aria-hidden','false'); btn.setAttribute('aria-expanded','true'); document.body.style.overflow='hidden'; }
    function close() { btn.classList.remove('is-open'); nav.classList.remove('is-open'); nav.setAttribute('aria-hidden','true'); btn.setAttribute('aria-expanded','false'); document.body.style.overflow=''; }
    btn.addEventListener('click', () => nav.classList.contains('is-open') ? close() : open());
    backdrop.addEventListener('click', close);
    document.addEventListener('keydown', e => { if(e.key==='Escape') close(); });
  })();




  