// Simple twibbon composer: load image, allow pan/zoom/rotate, composite with inline SVG overlay and download PNG.
(() => {
  const canvas = document.getElementById('previewCanvas');
  const ctx = canvas.getContext('2d', { alpha: true });
  const fileInput = document.getElementById('fileInput');
  const sampleBtn = document.getElementById('sampleBtn');
  const zoomInput = document.getElementById('zoom');
  const rotateInput = document.getElementById('rotate');
  const resetBtn = document.getElementById('resetBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const bgSelect = document.getElementById('bgSelect');
  const canvasWrap = document.getElementById('canvasWrap');
  const twibbonSvg = document.getElementById('twibbon-svg');

  // target drawing size (square) - canvas internal pixels
  const SIZE = 1200;
  canvas.width = SIZE;
  canvas.height = SIZE;

  // model
  let img = new Image();
  let imgLoaded = false;
  let overlayImg = null;
  let state = {
    x: SIZE / 2,
    y: SIZE * 0.36, // focus a little above center for school frame
    scale: 1,
    rotate: 0
  };

  // drag state
  let dragging = false;
  let last = { x: 0, y: 0 };

  // helpers
  function resetState() {
    state.x = SIZE / 2;
    state.y = SIZE * 0.36;
    state.scale = 1;
    state.rotate = 0;
    zoomInput.value = state.scale;
    rotateInput.value = state.rotate;
    draw();
  }

  function fitImageToCanvas(img) {
    // compute initial scale so the image covers the twibbon hole
    const holeRadius = 270 / 360 * (SIZE / 3); // approximate mapping
    const minDim = Math.min(img.width, img.height);
    // choose scale so smallest dimension covers ~60% of canvas
    const base = (SIZE * 0.9) / Math.max(img.width, img.height);
    return base;
  }

  function serializeSVG(svgEl) {
    const clone = svgEl.cloneNode(true);
    // make sure size matches canvas
    clone.setAttribute('width', SIZE);
    clone.setAttribute('height', SIZE);
    const serializer = new XMLSerializer();
    const str = serializer.serializeToString(clone);
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(str);
  }

  function prepareOverlay() {
    const dataUrl = serializeSVG(twibbonSvg);
    overlayImg = new Image();
    overlayImg.src = dataUrl;
    return new Promise((res) => {
      overlayImg.onload = () => res();
      overlayImg.onerror = () => res();
    });
  }

  async function init() {
    await prepareOverlay();
    // load default sample image
    const sampleUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...'; // intentionally empty (not used)
    // instead, set a soft default background until user uploads
    imgLoaded = false;
    resetState();
    draw();
  }

  function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function draw() {
    clearCanvas();

    // background
    const bg = bgSelect.value;
    if (bg === 'transparent') {
      // keep transparent
    } else {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, SIZE, SIZE);
    }

    // draw photo if available
    if (imgLoaded) {
      ctx.save();
      // apply transform: translate to state.x,state.y, then rotate and scale, then draw centered image
      ctx.translate(state.x, state.y);
      ctx.rotate((state.rotate * Math.PI) / 180);
      ctx.scale(state.scale, state.scale);

      // draw image centered on 0,0
      const w = img.width;
      const h = img.height;
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      ctx.restore();
    } else {
      // placeholder pattern
      ctx.save();
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, SIZE, SIZE);
      ctx.fillStyle = '#e6eef7';
      ctx.fillRect(SIZE * 0.06, SIZE * 0.12, SIZE * 0.88, SIZE * 0.6);
      ctx.fillStyle = '#cfe7ff';
      ctx.font = '30px Inter, Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Unggah foto kamu', SIZE / 2, SIZE * 0.45);
      ctx.restore();
    }

    // draw overlay on top
    if (overlayImg) {
      ctx.drawImage(overlayImg, 0, 0, SIZE, SIZE);
    }
  }

  // file handling
  fileInput.addEventListener('change', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    await loadUserImage(url);
    URL.revokeObjectURL(url);
  });

  sampleBtn.addEventListener('click', async () => {
    // Use a simple embedded placeholder sample (SVG data URL)
    const sample = createSampleDataURL();
    await loadUserImage(sample);
  });

  async function loadUserImage(url) {
    return new Promise((res, rej) => {
      const tmp = new Image();
      tmp.crossOrigin = 'anonymous';
      tmp.onload = () => {
        img = tmp;
        imgLoaded = true;
        // scale image to cover canvas reasonably
        const base = Math.max(SIZE / img.width, SIZE / img.height) * 0.9;
        state.scale = base;
        zoomInput.value = state.scale;
        draw();
        res();
      };
      tmp.onerror = rej;
      tmp.src = url;
    });
  }

  // pointer drag to reposition
  canvas.addEventListener('pointerdown', (e) => {
    dragging = true;
    last.x = e.clientX;
    last.y = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });
  window.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = (e.clientX - last.x) * (SIZE / canvas.clientWidth);
    const dy = (e.clientY - last.y) * (SIZE / canvas.clientHeight);
    state.x += dx;
    state.y += dy;
    last.x = e.clientX;
    last.y = e.clientY;
    draw();
  });
  window.addEventListener('pointerup', (e) => {
    dragging = false;
  });

  // zoom/rotate controls
  zoomInput.addEventListener('input', (e) => {
    state.scale = parseFloat(e.target.value);
    draw();
  });
  rotateInput.addEventListener('input', (e) => {
    state.rotate = parseFloat(e.target.value);
    draw();
  });

  resetBtn.addEventListener('click', () => {
    resetState();
  });

  bgSelect.addEventListener('change', () => {
    draw();
  });

  downloadBtn.addEventListener('click', () => {
    // if background is transparent, export as transparent PNG
    const bg = bgSelect.value;
    if (bg !== 'transparent') {
      // ensure background is painted
      // already painted in draw()
    }
    // prepare final image and download
    draw();
    const data = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = data;
    a.download = 'twibbon-sekolah.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

  // small helper to create a pleasant sample image (SVG data URL)
  function createSampleDataURL() {
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200">
      <defs>
        <linearGradient id="s" x1="0" x2="1">
          <stop offset="0" stop-color="#fef3c7"/>
          <stop offset="1" stop-color="#cffafe"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#s)"/>
      <g transform="translate(600,420)">
        <circle r="260" fill="#fff" stroke="#fde68a" stroke-width="12"/>
        <g transform="translate(-110,-40)">
          <rect width="220" height="300" rx="28" fill="#fb7185"/>
          <circle cx="110" cy="90" r="64" fill="#fff"/>
          <rect y="160" width="220" height="100" rx="18" fill="#fff" opacity="0.9"/>
        </g>
      </g>
      <text x="600" y="980" font-size="42" text-anchor="middle" font-family="Inter, Arial" fill="#0f172a">Contoh Foto Sekolah</text>
    </svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  // keyboard accessibility: arrow keys nudge
  window.addEventListener('keydown', (e) => {
    const step = 8;
    if (e.key === 'ArrowLeft') { state.x -= step; draw(); }
    if (e.key === 'ArrowRight') { state.x += step; draw(); }
    if (e.key === 'ArrowUp') { state.y -= step; draw(); }
    if (e.key === 'ArrowDown') { state.y += step; draw(); }
  });

  // init
  prepareOverlay().then(() => {
    resetState();
    draw();
  });

})();