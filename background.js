// background.js
// Lightweight interactivity for the SVG scene (kids walking + click to wave/move).
document.addEventListener('DOMContentLoaded', () => {
  const scene = document.getElementById('scene');
  if (!scene) return;

  // Create control panel
  const ctrl = document.createElement('div');
  ctrl.className = 'focus';
  ctrl.innerHTML = `
    <button id="toggleAnim" class="btn">Pause</button>
    <div class="speed">Speed: <input id="speedRange" type="range" min="0.3" max="2" step="0.1" value="1"></div>
  `;
  scene.appendChild(ctrl);

  const svg = scene.querySelector('svg');
  if (!svg) return;

  // Identify kids by class 'kid' inside the inline SVG
  const kids = Array.from(svg.querySelectorAll('.kid'));
  // Assign different speeds & start walking
  kids.forEach((k, i) => {
    const baseDur = 6 + Math.random() * 6; // 6-12s
    k.style.animationDuration = `${baseDur}s`;
    k.classList.add('walk');
    // make smaller kids slightly faster visually
    const scale = 0.9 + Math.random() * 0.3;
    k.style.transform = `scale(${scale})`;
  });

  // Pause/Resume toggle
  const toggleBtn = document.getElementById('toggleAnim');
  let paused = false;
  toggleBtn.addEventListener('click', () => {
    paused = !paused;
    if (paused) {
      kids.forEach(k => k.style.animationPlayState = 'paused');
      toggleBtn.textContent = 'Play';
    } else {
      kids.forEach(k => k.style.animationPlayState = 'running');
      toggleBtn.textContent = 'Pause';
    }
  });

  // Speed control modifies animationDuration
  const speedRange = document.getElementById('speedRange');
  speedRange.addEventListener('input', (e) => {
    const speed = parseFloat(e.target.value);
    kids.forEach((k) => {
      // read original duration or fallback
      const cur = parseFloat(k.style.animationDuration) || 8;
      // adjust by dividing by speed (e.g. speed 2 => faster => half duration)
      k.style.animationDuration = `${cur / speed}s`;
    });
  });

  // Click on a kid: wave; click on background: make nearest kid walk to point
  svg.addEventListener('click', (ev) => {
    // get svg point
    const pt = svg.createSVGPoint();
    pt.x = ev.clientX; pt.y = ev.clientY;
    const ctm = svg.getScreenCTM().inverse();
    const loc = pt.matrixTransform(ctm);

    const targetX = loc.x, targetY = loc.y;

    // determine if clicked a kid group
    const clickedKid = ev.target.closest('.kid');
    if (clickedKid) {
      // trigger wave: add 'wave' class briefly
      clickedKid.classList.add('wave');
      setTimeout(() => clickedKid.classList.remove('wave'), 1200);
      return;
    }

    // otherwise move nearest kid
    let nearest = null; let nd = Infinity;
    kids.forEach(k => {
      const bbox = k.getBBox();
      const cx = bbox.x + bbox.width / 2;
      const cy = bbox.y + bbox.height / 2;
      const d = Math.hypot(cx - targetX, cy - targetY);
      if (d < nd) { nd = d; nearest = k; }
    });
    if (!nearest) return;

    // animate translate via CSS transform + transition
    // compute delta relative to current transform origin
    const bbox = nearest.getBBox();
    const cx = bbox.x + bbox.width / 2;
    const cy = bbox.y + bbox.height / 2;
    const dx = targetX - cx;
    const dy = targetY - cy;

    // Use a temporary wrapper transform via style transform (preserve scale)
    const prev = nearest.style.transform || '';
    nearest.style.transition = 'transform 1.2s ease-out';
    nearest.style.transform = `${prev} translate(${dx}px, ${dy}px)`;
    // keep walking while moving
    nearest.classList.add('walk');
    setTimeout(() => {
      nearest.style.transition = '';
      // small wave on arrival
      nearest.classList.add('wave');
      setTimeout(() => nearest.classList.remove('wave'), 900);
    }, 1300);
  });

});
