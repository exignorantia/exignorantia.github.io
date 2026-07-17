const bootLines = [
  'American Megatrends /// EX-I BIOS Copyright (C) 1985-2026',
  'EX-IGNORANTIA ACPI BIOS Revision 03.33',
  'CPU: Ritual Processor 8933 MHz',
  'Memory Test: 666K OK',
  'Detecting IDE Primary Master... ST_NINEVEH.IMG',
  'Detecting IDE Primary Slave..... NEW_HORIZON.DAT',
  'Detecting IDE Secondary Master... STAIN_CITY.BIN',
  'USB Legacy Support............... Enabled',
  'Keyboard Found. Mouse Found. Ought Found.',
  'Initializing Steam Wishlist Controller... OK',
  'Loading EX IGNORANTIA OS...',
  'Access granted.'
];

const boot = document.getElementById('boot');
const bootText = document.getElementById('bootText');
const skipBoot = document.getElementById('skipBoot');
const startButton = document.getElementById('startButton');
const startMenu = document.getElementById('startMenu');
const taskButtons = document.getElementById('taskButtons');
const clock = document.getElementById('clock');
const rebootButton = document.getElementById('rebootButton');
let z = 90;
let bootIndex = 0;

function typeBoot() {
  if (bootIndex >= bootLines.length) {
    setTimeout(hideBoot, 650);
    return;
  }
  bootText.textContent += bootLines[bootIndex] + '\n';
  bootIndex += 1;
  setTimeout(typeBoot, 160);
}

function hideBoot(){ boot.classList.add('is-hidden'); }
skipBoot.addEventListener('click', hideBoot);
typeBoot();

function updateClock(){
  const now = new Date();
  clock.textContent = now.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});
}
updateClock();
setInterval(updateClock, 30000);

function refreshTaskbar(){
  taskButtons.innerHTML = '';
  document.querySelectorAll('.window.is-open').forEach(win => {
    const btn = document.createElement('button');
    btn.textContent = win.querySelector('.title-bar-text')?.textContent || win.dataset.window;
    if (win.classList.contains('is-minimized')) btn.classList.add('is-minimized');
    if (win.classList.contains('is-active')) btn.classList.add('is-active-task');
    btn.addEventListener('click', () => {
      if (win.classList.contains('is-minimized')) {
        win.classList.remove('is-minimized');
        activateWindow(win);
      } else if (win.classList.contains('is-active')) {
        win.classList.add('is-minimized');
        win.classList.remove('is-active');
        refreshTaskbar();
      } else {
        activateWindow(win);
      }
    });
    taskButtons.appendChild(btn);
  });
}

function activateWindow(win){
  if (!win) return;
  document.querySelectorAll('.window').forEach(w => w.classList.remove('is-active'));
  win.classList.add('is-open','is-active');
  win.classList.remove('is-minimized');
  win.style.zIndex = ++z;
  refreshTaskbar();
}

function openWindow(key){
  const win = document.querySelector(`[data-window="${key}"]`);
  activateWindow(win);
  if (key === 'secret') corruptSystem();
  if (key === 'cursorlab') initCursorLab();
}

function corruptSystem(){
  if (!document.body.classList.contains('corrupted')) {
    document.body.classList.add('corrupted');
    const fx = document.createElement('div');
    fx.className = 'corruption-fx';
    fx.innerHTML = '<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><filter id="distort"><feTurbulence type="fractalNoise" baseFrequency="0.025 0.35" numOctaves="3" seed="9"/><feDisplacementMap in="SourceGraphic" scale="44"/></filter><rect width="100%" height="100%" filter="url(#distort)" fill="rgba(255,0,0,.12)"/></svg>';
    document.body.appendChild(fx);
  }
}

function reboot(){
  document.body.classList.remove('corrupted');
  document.querySelectorAll('.corruption-fx').forEach(el => el.remove());
  boot.classList.remove('is-hidden');
  bootText.textContent = '';
  bootIndex = 0;
  setTimeout(typeBoot, 200);
}

startButton.addEventListener('click', (e) => {
  e.stopPropagation();
  startMenu.classList.toggle('is-open');
});
rebootButton.addEventListener('click', reboot);

document.addEventListener('click', (event) => {
  const opener = event.target.closest('[data-open]');
  if (opener) {
    if (opener.dataset.dragSuppress === 'true') {
      opener.dataset.dragSuppress = 'false';
    } else {
      openWindow(opener.dataset.open);
      startMenu.classList.remove('is-open');
    }
  }

  const control = event.target.closest('[data-action]');
  if (control) {
    const win = control.closest('.window');
    const action = control.dataset.action;
    if (action === 'close') {
      win.classList.remove('is-open','is-active','is-minimized');
      refreshTaskbar();
    }
    if (action === 'minimize') {
      win.classList.add('is-minimized');
      win.classList.remove('is-active');
      refreshTaskbar();
    }
    if (action === 'maximize') {
      if (win.dataset.maximized === 'true') {
        win.style.left = win.dataset.prevLeft;
        win.style.top = win.dataset.prevTop;
        win.style.width = win.dataset.prevWidth;
        win.style.height = win.dataset.prevHeight;
        win.dataset.maximized = 'false';
      } else {
        win.dataset.prevLeft = win.style.left;
        win.dataset.prevTop = win.style.top;
        win.dataset.prevWidth = win.style.width;
        win.dataset.prevHeight = win.style.height;
        win.style.left = '225px';
        win.style.top = '44px';
        win.style.width = 'calc(100vw - 255px)';
        win.style.height = 'calc(100vh - 100px)';
        win.dataset.maximized = 'true';
      }
      win.classList.remove('is-minimized');
      activateWindow(win);
    }
  }

  const exportButton = event.target.closest('[data-export]');
  if (exportButton) exportCanvas(exportButton.dataset.export);

  if (!event.target.closest('.start-menu') && !event.target.closest('#startButton')) {
    startMenu.classList.remove('is-open');
  }
});

document.querySelectorAll('.window').forEach(win => {
  win.addEventListener('mousedown', () => activateWindow(win));
  const bar = win.querySelector('.title-bar');
  let dragging = false;
  let dx = 0;
  let dy = 0;

  bar.addEventListener('mousedown', (e) => {
    if (e.target.closest('button') || win.dataset.maximized === 'true') return;
    dragging = true;
    dx = e.clientX - win.offsetLeft;
    dy = e.clientY - win.offsetTop;
    activateWindow(win);
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (!dragging || window.matchMedia('(max-width: 800px)').matches) return;
    const x = Math.max(220, Math.min(window.innerWidth - win.offsetWidth - 10, e.clientX - dx));
    const y = Math.max(20, Math.min(window.innerHeight - win.offsetHeight - 48, e.clientY - dy));
    win.style.left = `${x}px`;
    win.style.top = `${y}px`;
  });

  window.addEventListener('mouseup', () => dragging = false);
});

function exportCanvas(id){
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const link = document.createElement('a');
  link.download = `${id}-exos.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function fitImageToCanvas(img, canvas){
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  const x = (canvas.width - w) / 2;
  const y = (canvas.height - h) / 2;
  ctx.drawImage(img, x, y, w, h);
}

function loadImageFromFile(input, cb){
  const file = input.files?.[0];
  if (!file) return;
  const img = new Image();
  img.onload = () => cb(img);
  img.src = URL.createObjectURL(file);
}

function drawDemoPattern(canvas, mode='red'){
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  for(let y=0; y<canvas.height; y+=16){
    for(let x=0; x<canvas.width; x+=16){
      const v = (Math.sin(x*.025)+Math.cos(y*.035)+Math.sin((x+y)*.02))*0.5+0.5;
      ctx.fillStyle = mode === 'gray' ? `rgb(${v*255},${v*255},${v*255})` : `rgb(${Math.floor(v*255)},0,10)`;
      ctx.fillRect(x,y,12,12);
    }
  }
  ctx.strokeStyle = '#ff101a';
  ctx.lineWidth = 2;
  ctx.strokeRect(30,30,canvas.width-60,canvas.height-60);
  ctx.font = '32px Courier New';
  ctx.fillStyle = '#ff101a';
  ctx.fillText('EXOS', 54, 78);
}

function initChartPaint(){
  const canvas = document.getElementById('chartCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let values = [48, 76, 33, 92, 58, 19, 68, 40, 83, 27, 55, 72];
  let painting = false;
  function draw(){
    ctx.fillStyle = '#000'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.strokeStyle = 'rgba(255,16,26,.5)'; ctx.lineWidth = 1;
    for(let x=40; x<canvas.width; x+=40){ ctx.beginPath(); ctx.moveTo(x,20); ctx.lineTo(x,260); ctx.stroke(); }
    for(let y=20; y<270; y+=30){ ctx.beginPath(); ctx.moveTo(30,y); ctx.lineTo(canvas.width-20,y); ctx.stroke(); }
    ctx.strokeStyle = '#ff101a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(30,20); ctx.lineTo(30,270); ctx.lineTo(canvas.width-20,270); ctx.stroke();
    const barW = (canvas.width-70)/values.length;
    values.forEach((v,i)=>{
      const h = v * 2.25;
      const x = 38 + i*barW;
      const y = 270 - h;
      ctx.fillStyle = '#ff101a'; ctx.fillRect(x,y,barW-8,h);
      ctx.fillStyle = '#000';
      for(let yy=y; yy<270; yy+=6){ ctx.fillRect(x,yy,barW-8,2); }
      ctx.fillStyle = '#ff101a'; ctx.font = '12px Courier New'; ctx.fillText(String(v).padStart(2,'0'), x, 292);
    });
  }
  function setFromEvent(e){
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    const i = Math.max(0, Math.min(values.length-1, Math.floor((x-38) / ((canvas.width-70)/values.length))));
    values[i] = Math.max(0, Math.min(100, Math.round((270-y)/2.25)));
    draw();
  }
  canvas.addEventListener('mousedown', e=>{painting=true; setFromEvent(e);});
  canvas.addEventListener('mousemove', e=>{if(painting) setFromEvent(e);});
  window.addEventListener('mouseup', ()=> painting=false);
  document.getElementById('chartRandom').addEventListener('click', ()=>{values = values.map(()=>Math.floor(Math.random()*100)); draw();});
  document.getElementById('chartClear').addEventListener('click', ()=>{values = values.map(()=>0); draw();});
  draw();
}

function initEffecto(){
  const canvas = document.getElementById('effectoCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const file = document.getElementById('effectoFile');
  const contrast = document.getElementById('effectoContrast');
  const noise = document.getElementById('effectoNoise');
  const invert = document.getElementById('effectoInvert');
  let original = null;
  function process(){
    if(!original){ drawDemoPattern(canvas); original = ctx.getImageData(0,0,canvas.width,canvas.height); }
    ctx.putImageData(original,0,0);
    const data = ctx.getImageData(0,0,canvas.width,canvas.height);
    const c = Number(contrast.value)/100;
    const n = Number(noise.value);
    for(let i=0;i<data.data.length;i+=4){
      let g = 0.299*data.data[i] + 0.587*data.data[i+1] + 0.114*data.data[i+2];
      g = (g-128)*c + 128 + (Math.random()*2-1)*n;
      if(invert.checked) g = 255-g;
      const r = Math.max(0, Math.min(255, g));
      data.data[i] = r; data.data[i+1] = r > 125 ? 16 : 0; data.data[i+2] = r > 170 ? 26 : 0;
    }
    ctx.putImageData(data,0,0);
  }
  file.addEventListener('change', ()=> loadImageFromFile(file, img=>{ fitImageToCanvas(img, canvas); original = ctx.getImageData(0,0,canvas.width,canvas.height); process(); }));
  [contrast, noise, invert].forEach(el => el.addEventListener('input', process));
  document.getElementById('effectoDemo').addEventListener('click', ()=>{ original=null; process(); });
  process();
}

function initAsciiMaker(){
  const out = document.getElementById('asciiOutput');
  const text = document.getElementById('asciiText');
  const hidden = document.getElementById('asciiHiddenCanvas');
  const hctx = hidden.getContext('2d');
  const chars = '@#S%?*+;:,. ';
  function renderText(){
    const t = text.value || 'EX IGNORANTIA';
    const top = '═'.repeat(Math.max(12,t.length*2));
    out.textContent = `╔${top}╗\n║ ${t.split('').join(' ')} ║\n╚${top}╝\n\nC:\\EXOS> ascii --source text\n` +
      t.toUpperCase().split('').map(ch => ch === ' ' ? '   ' : `[${ch}]`).join('');
  }
  document.getElementById('asciiRenderText').addEventListener('click', renderText);
  document.getElementById('asciiCopy').addEventListener('click', ()=> navigator.clipboard?.writeText(out.textContent));
  document.getElementById('asciiFile').addEventListener('change', (e)=> loadImageFromFile(e.target, img=>{
    hidden.width = 96; hidden.height = 54;
    hctx.fillStyle = '#000'; hctx.fillRect(0,0,hidden.width,hidden.height);
    fitImageToCanvas(img, hidden);
    const data = hctx.getImageData(0,0,hidden.width,hidden.height).data;
    let s = '';
    for(let y=0;y<hidden.height;y+=2){
      for(let x=0;x<hidden.width;x++){
        const i=(y*hidden.width+x)*4;
        const g=(data[i]+data[i+1]+data[i+2])/3;
        s += chars[Math.floor((255-g)/255*(chars.length-1))];
      }
      s+='\n';
    }
    out.textContent = s;
  }));
  renderText();
}

function initDither(){
  const canvas = document.getElementById('ditherCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const file = document.getElementById('ditherFile');
  const scale = document.getElementById('ditherScale');
  let original = null;
  const bayer = [[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
  function process(){
    if(!original){ drawDemoPattern(canvas, 'gray'); original = ctx.getImageData(0,0,canvas.width,canvas.height); }
    ctx.putImageData(original,0,0);
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const step = Number(scale.value);
    for(let y=0;y<canvas.height;y++){
      for(let x=0;x<canvas.width;x++){
        const i=(y*canvas.width+x)*4;
        const g=(img.data[i]+img.data[i+1]+img.data[i+2])/3;
        const threshold = (bayer[y%4][x%4] + .5) * 16;
        const on = g + step*6 > threshold * 1.2;
        img.data[i]=on?255:0; img.data[i+1]=on?16:0; img.data[i+2]=on?26:0; img.data[i+3]=255;
      }
    }
    ctx.putImageData(img,0,0);
  }
  file.addEventListener('change', ()=> loadImageFromFile(file, img=>{ fitImageToCanvas(img, canvas); original = ctx.getImageData(0,0,canvas.width,canvas.height); process(); }));
  scale.addEventListener('input', process);
  document.getElementById('ditherDemo').addEventListener('click', ()=>{ original=null; process(); });
  process();
}

function initKaleido(){
  const canvas = document.getElementById('kaleidoCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const sym = document.getElementById('kaleidoSym');
  const brush = document.getElementById('kaleidoBrush');
  const color = document.getElementById('kaleidoColor');
  const recordBtn = document.getElementById('kaleidoRecord');
  const eraseBtn = document.getElementById('kaleidoErase');
  const playSpeed = document.getElementById('kaleidoPlaySpeed');
  const strokeLength = document.getElementById('kaleidoStrokeLength');
  const playSpeedOut = document.getElementById('kaleidoPlaySpeedOut');
  const strokeLengthOut = document.getElementById('kaleidoStrokeLengthOut');
  const recordStatus = document.getElementById('kaleidoRecordStatus');
  const cx = canvas.width/2, cy = canvas.height/2;
  let drawing = false;
  let last = null;
  let isRecording = false;
  let recordedSegments = [];
  let playbackRAF = null;
  let playbackIndex = 0;
  let playbackAccumulator = 0;
  let lastPlaybackTime = 0;
  let recordStartTime = 0;
  let playbackStartTime = 0;
  let playbackCursorTime = 0;

  function updateRecordButton(){
    if(!recordBtn) return;
    if(isRecording){
      recordBtn.textContent = 'recording...';
      recordBtn.classList.add('is-recording');
    } else if(recordedSegments.length){
      recordBtn.textContent = 'play';
      recordBtn.classList.remove('is-recording');
    } else {
      recordBtn.textContent = 'record';
      recordBtn.classList.remove('is-recording');
    }
  }

  function updateRecordOutputs(){
    if(playSpeedOut && playSpeed) playSpeedOut.textContent = playSpeed.value;
    if(strokeLengthOut && strokeLength) strokeLengthOut.textContent = strokeLength.value;
  }

  function setRecordStatus(text){
    if(recordStatus) recordStatus.textContent = text;
  }

  function bg(){
    ctx.fillStyle='#000';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.strokeStyle='rgba(255,16,26,.25)';
    ctx.lineWidth = 1;
    for(let r=40;r<260;r+=40){
      ctx.beginPath();
      ctx.arc(cx,cy,r,0,Math.PI*2);
      ctx.stroke();
    }
  }

  function point(e){
    const r=canvas.getBoundingClientRect();
    return {x:(e.clientX-r.left)*(canvas.width/r.width), y:(e.clientY-r.top)*(canvas.height/r.height)};
  }

  function rotate(p, a, mirror){
    let dx=p.x-cx, dy=p.y-cy;
    if(mirror) dx=-dx;
    return {x:cx+dx*Math.cos(a)-dy*Math.sin(a), y:cy+dx*Math.sin(a)+dy*Math.cos(a)};
  }

  function drawSegmentData(data){
    const count = Number(data.symmetry || sym.value);
    ctx.strokeStyle = data.color || color.value;
    ctx.lineWidth = Number(data.brush || brush.value);
    ctx.lineCap = 'square';
    for(let i=0;i<count;i++){
      const ang = Math.PI*2/count*i;
      [false,true].forEach(m=>{
        const p1=rotate(data.a,ang,m), p2=rotate(data.b,ang,m);
        ctx.beginPath();
        ctx.moveTo(p1.x,p1.y);
        ctx.lineTo(p2.x,p2.y);
        ctx.stroke();
      });
    }
  }

  function segment(a,b, save){
    const data = {
      a:{x:a.x,y:a.y},
      b:{x:b.x,y:b.y},
      symmetry:Number(sym.value),
      brush:Number(brush.value),
      color:color.value,
      t: save && isRecording ? Math.max(1, performance.now() - recordStartTime) : 0
    };
    drawSegmentData(data);
    if(save && isRecording) recordedSegments.push(data);
  }

  function lerpPoint(a, b, amount){
    return {
      x: a.x + (b.x - a.x) * amount,
      y: a.y + (b.y - a.y) * amount
    };
  }

  function drawSegmentPortion(data, from, to){
    if(to <= from) return;
    drawSegmentData({
      a: lerpPoint(data.a, data.b, from),
      b: lerpPoint(data.a, data.b, to),
      symmetry: data.symmetry,
      brush: data.brush,
      color: data.color
    });
  }

  function playbackDuration(){
    return recordedSegments.length ? Math.max(1, recordedSegments[recordedSegments.length - 1].t || recordedSegments.length * 16) : 0;
  }

  function playbackRate(){
    const speed = Math.max(1, Number(playSpeed ? playSpeed.value : 50));
    const normalizedSpeed = (speed - 1) / 99;
    // 1 = very slow screensaver pace. 100 = close to the older mid-speed feel, but still fluid.
    return 0.06 + Math.pow(normalizedSpeed, 1.55) * 1.44;
  }

  function drawPlaybackRange(fromTime, toTime){
    if(toTime <= fromTime) return;
    const smoothSubsteps = Math.max(2, Math.round(Number(strokeLength ? strokeLength.value : 100) / 18));

    for(let i=0; i<recordedSegments.length; i++){
      const data = recordedSegments[i];
      const segStart = i === 0 ? 0 : (recordedSegments[i - 1].t || i * 16);
      const segEnd = data.t || ((i + 1) * 16);

      if(segEnd <= fromTime || segStart >= toTime) continue;

      const localFrom = Math.max(0, Math.min(1, (fromTime - segStart) / Math.max(1, segEnd - segStart)));
      const localTo = Math.max(0, Math.min(1, (toTime - segStart) / Math.max(1, segEnd - segStart)));

      let cursor = localFrom;
      const step = Math.max(0.01, (localTo - localFrom) / smoothSubsteps);
      while(cursor < localTo){
        const next = Math.min(localTo, cursor + step);
        drawSegmentPortion(data, cursor, next);
        cursor = next;
      }
    }
  }

  function stopPlayback(){
    if(playbackRAF) cancelAnimationFrame(playbackRAF);
    playbackRAF = null;
    lastPlaybackTime = 0;
  }

  function playbackStep(time){
    if(!playbackStartTime) playbackStartTime = time;

    const duration = playbackDuration();
    const targetTime = Math.min(duration, (time - playbackStartTime) * playbackRate());

    drawPlaybackRange(playbackCursorTime, targetTime);
    playbackCursorTime = targetTime;

    if(playbackCursorTime < duration){
      playbackRAF = requestAnimationFrame(playbackStep);
    } else {
      playbackRAF = null;
      updateRecordButton();
      setRecordStatus('Playback complete. Click play to watch again, or erase to record a new path.');
    }
  }


  function playRecording(){
    stopPlayback();
    if(!recordedSegments.length){
      setRecordStatus('No recorded motion yet. Click record, draw on canvas, then release.');
      updateRecordButton();
      return;
    }
    bg();
    playbackIndex = 0;
    playbackAccumulator = 0;
    lastPlaybackTime = 0;
    playbackStartTime = 0;
    playbackCursorTime = 0;
    setRecordStatus('Playing recorded ritual motion...');
    updateRecordButton();
    playbackRAF = requestAnimationFrame(playbackStep);
  }

  canvas.addEventListener('mousedown', e=>{
    stopPlayback();
    drawing=true;
    last=point(e);
    if(isRecording){
      recordedSegments = [];
      recordStartTime = performance.now();
      bg();
      updateRecordButton();
      setRecordStatus('Recording... release mouse to finish & auto-play.');
    }
  });

  canvas.addEventListener('mousemove', e=>{
    if(!drawing) return;
    const p=point(e);
    segment(last,p,true);
    last=p;
  });

  window.addEventListener('mouseup', ()=>{
    if(!drawing) return;
    drawing=false;
    last=null;
    if(isRecording){
      isRecording=false;
      updateRecordButton();
      playRecording();
    }
  });

  document.getElementById('kaleidoClear').addEventListener('click', ()=>{
    stopPlayback();
    bg();
    setRecordStatus('Canvas cleared. Recorded motion preserved. Press record to overwrite or play to preview.');
  });

  document.getElementById('kaleidoSeed').addEventListener('click', ()=>{
    stopPlayback();
    let prev = {x:cx+Math.random()*80-40, y:cy-Math.random()*120};
    for(let i=0;i<18;i++){
      const next={x:cx+Math.random()*230-115,y:cy+Math.random()*230-115};
      segment(prev,next,false);
      prev=next;
    }
    setRecordStatus('Generated path. Record mode can capture manual drawing only.');
  });

  if(recordBtn){
    recordBtn.addEventListener('click', ()=>{
      if(isRecording){
        isRecording=false;
        updateRecordButton();
        setRecordStatus('Record armed off. Click record again before drawing.');
        return;
      }

      if(recordedSegments.length){
        playRecording();
        return;
      }

      stopPlayback();
      isRecording=true;
      recordedSegments = [];
      updateRecordButton();
      setRecordStatus('Record armed. Draw on canvas. Release mouse to finish & auto-play.');
    });
  }

  if(eraseBtn){
    eraseBtn.addEventListener('click', ()=>{
      stopPlayback();
      recordedSegments = [];
      isRecording = false;
      bg();
      updateRecordButton();
      setRecordStatus('Recorded motion erased.');
    });
  }

  if(playSpeed) playSpeed.addEventListener('input', updateRecordOutputs);
  if(strokeLength) strokeLength.addEventListener('input', updateRecordOutputs);
  updateRecordOutputs();
  bg();
  updateRecordButton();
}

function initPixelRain(){
  const canvas = document.getElementById('rainCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');

  const $ = id => document.getElementById(id);
  const controls = {
    chars: $('rainCharInput'),
    speed: $('rainSpeed'),
    density: $('rainDensity'),
    fontSize: $('rainFontSize'),
    trail: $('rainTrail'),
    charSpeed: $('rainCharSpeed'),
    wind: $('rainWind'),
    gravity: $('rainGravity'),
    randomize: $('rainRandom'),
    glow: $('rainGlow'),
    rainbow: $('rainRainbow'),
    draw: $('rainDrawColor'),
    bg: $('rainBgColor')
  };

  const outputs = {
    speed: $('rainSpeedOut'),
    density: $('rainDensityOut'),
    fontSize: $('rainFontSizeOut'),
    trail: $('rainTrailOut'),
    charSpeed: $('rainCharSpeedOut'),
    wind: $('rainWindOut'),
    gravity: $('rainGravityOut'),
    randomize: $('rainRandomOut'),
    glow: $('rainGlowOut'),
    rainbow: $('rainRainbowOut')
  };

  const toggle = $('rainToggle');
  const fpsEl = $('rainFps');
  const charsLabel = $('rainCharsLabel');
  let running = true;
  let drops = [];
  let lastTime = performance.now();
  let fpsTime = performance.now();
  let frames = 0;

  function val(name){ return Number(controls[name].value); }
  function chars(){ return (controls.chars.value || 'EXIGNORANTIA01').split(''); }
  function updateOutputs(){
    Object.keys(outputs).forEach(k => outputs[k].textContent = controls[k].value);
    charsLabel.textContent = controls.chars.value.slice(0, 3) || 'Ex';
  }

  function hexToRgb(hex){
    const n = parseInt(hex.slice(1), 16);
    return {r:(n>>16)&255, g:(n>>8)&255, b:n&255};
  }
  function rgba(hex, a){
    const c = hexToRgb(hex);
    return `rgba(${c.r},${c.g},${c.b},${a})`;
  }
  function rainbowColor(seed){
    const hue = (performance.now() * 0.04 + seed * 22) % 360;
    return `hsl(${hue},100%,58%)`;
  }

  function makeDrop(forceTop=false){
    const size = val('fontSize');
    return {
      x: Math.random() * canvas.width,
      y: forceTop ? -Math.random() * canvas.height : Math.random() * canvas.height,
      vy: Math.max(0.4, val('speed') * 0.32 + Math.random() * 2),
      phase: Math.random() * 999,
      length: Math.floor(6 + Math.random() * (val('trail') / 3 + 4)),
      charTimer: 0,
      glyphs: [],
      size
    };
  }

  function ensureDensity(){
    const target = Math.floor(val('density') * 1.7);
    while(drops.length < target) drops.push(makeDrop(true));
    if(drops.length > target) drops.length = target;
  }

  function clearRain(){
    ctx.fillStyle = controls.bg.value;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function drawDitherOverlay(){
    const alpha = document.body.classList.contains('is-corrupted') ? 0.18 : 0.08;
    ctx.fillStyle = `rgba(0,0,0,${alpha})`;
    for(let y=0; y<canvas.height; y+=4){
      for(let x=(y/4)%2 ? 2 : 0; x<canvas.width; x+=4){
        ctx.fillRect(x, y, 2, 2);
      }
    }
  }

  function tick(now){
    const dt = Math.min(42, now - lastTime);
    lastTime = now;
    const rainWindow = canvas.closest('.window');
    const rainVisible = !window.matchMedia('(max-width: 800px)').matches && (!rainWindow || (rainWindow.classList.contains('is-open') && !rainWindow.classList.contains('is-minimized')));

    if(!rainVisible){
      requestAnimationFrame(tick);
      return;
    }

    frames++;
    if(now - fpsTime > 500){
      fpsEl.textContent = Math.round(frames * 1000 / (now - fpsTime));
      frames = 0;
      fpsTime = now;
    }

    if(running){
      ensureDensity();
      const trailFade = 1 - (val('trail') / 100);
      ctx.fillStyle = rgba(controls.bg.value, Math.max(0.025, Math.min(0.65, trailFade)));
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const glyphSet = chars();
      const baseSize = val('fontSize');
      const wind = val('wind') / 18;
      const gravity = 1 + val('gravity') / 12;
      const randomize = val('randomize') / 100;
      const glow = val('glow') / 100;
      const rainbow = val('rainbow') / 100;
      ctx.font = `${baseSize}px "Courier New", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      drops.forEach((d, dropIndex) => {
        d.size = baseSize;
        d.y += d.vy * gravity * dt / 16;
        d.x += wind * dt + Math.sin((now/380) + d.phase) * randomize * 1.5;
        d.charTimer += dt;
        const refreshAt = Math.max(12, 220 - val('charSpeed'));
        if(d.charTimer > refreshAt || d.glyphs.length !== d.length){
          d.glyphs = Array.from({length: d.length}, () => glyphSet[Math.floor(Math.random()*glyphSet.length)]);
          d.charTimer = 0;
        }

        for(let i=0; i<d.length; i++){
          const y = d.y - i * baseSize;
          if(y < -baseSize || y > canvas.height + baseSize) continue;
          const a = Math.max(0, 1 - i / d.length);
          const isHead = i === 0;
          const color = rainbow > 0 && Math.random() < rainbow ? rainbowColor(dropIndex+i) : controls.draw.value;
          if(glow > 0){
            ctx.shadowColor = isHead ? '#ffffff' : color;
            ctx.shadowBlur = isHead ? 16 * glow : 10 * glow;
          } else {
            ctx.shadowBlur = 0;
          }
          ctx.fillStyle = isHead ? '#ffffff' : rgba(color, 0.18 + a * 0.82);
          ctx.fillText(d.glyphs[i], d.x, y);
        }

        if(d.y - d.length * baseSize > canvas.height || d.x < -60 || d.x > canvas.width + 60){
          Object.assign(d, makeDrop(true));
          d.y = -Math.random() * canvas.height * 0.25;
        }
      });
      ctx.shadowBlur = 0;
      drawDitherOverlay();
    }
    requestAnimationFrame(tick);
  }

  Object.values(controls).forEach(input => input && input.addEventListener('input', () => {
    updateOutputs();
    if(input === controls.bg) clearRain();
  }));
  document.querySelectorAll('.rain-char-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      controls.chars.value = btn.dataset.chars;
      updateOutputs();
    });
  });
  toggle.addEventListener('click', ()=>{ running=!running; toggle.textContent=running?'Pause':'Play'; });
  $('rainBurst').addEventListener('click', ()=>{ for(let i=0;i<90;i++) drops.push(makeDrop(true)); });
  $('rainClear').addEventListener('click', ()=>{ drops = []; clearRain(); ensureDensity(); });

  updateOutputs();
  clearRain();
  ensureDensity();
  requestAnimationFrame(tick);
}

// CURSOR LAB
let cursorLabReady = false;
let cursorState = { type: 'default', size: 32, glow: 35, trail: true, systemWide: true };
let cursorTrailBound = false;
const cursorGlyphs = {
  default: '➜',
  redArrow: '➜',
  terminalBlock: '█',
  crosshair: '⌖',
  ritualHand: '☞',
  crowBeak: '◆',
  forbidden: '⊗'
};

function initCursorLab(){
  if(cursorLabReady) return;
  cursorLabReady = true;
  const size = document.getElementById('cursorSize');
  const glow = document.getElementById('cursorGlow');
  const trail = document.getElementById('cursorTrail');
  const systemWide = document.getElementById('cursorSystemWide');
  const apply = document.getElementById('cursorApply');
  const reset = document.getElementById('cursorReset');

  document.querySelectorAll('.cursor-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cursor-preset').forEach(b => b.classList.remove('is-selected'));
      btn.classList.add('is-selected');
      cursorState.type = btn.dataset.cursor;
      updateCursorPreview();
      applyCursorLab();
    });
  });

  [size, glow, trail, systemWide].forEach(el => el && el.addEventListener('input', () => {
    cursorState.size = Number(size.value);
    cursorState.glow = Number(glow.value);
    cursorState.trail = trail.checked;
    cursorState.systemWide = systemWide.checked;
    updateCursorPreview();
    applyCursorLab();
  }));
  apply.addEventListener('click', applyCursorLab);
  reset.addEventListener('click', resetCursorLab);
  bindCursorTrail();
  updateCursorPreview();
}

function cursorSvg(type, size){
  const s = size;
  const red = '#ff101a';
  const black = '#000000';
  const white = '#ffffff';
  if(type === 'terminalBlock') return {hot: [Math.floor(s/2), Math.floor(s/2)], svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}"><rect x="4" y="4" width="${s-8}" height="${s-8}" fill="${red}"/><path d="M8 ${s/2} H${s-8} M${s/2} 8 V${s-8}" stroke="${black}" stroke-width="2"/></svg>`};
  if(type === 'crosshair') return {hot: [Math.floor(s/2), Math.floor(s/2)], svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}"><circle cx="${s/2}" cy="${s/2}" r="${s*.24}" fill="none" stroke="${red}" stroke-width="3"/><path d="M${s/2} 1 V${s*.35} M${s/2} ${s*.65} V${s-1} M1 ${s/2} H${s*.35} M${s*.65} ${s/2} H${s-1}" stroke="${red}" stroke-width="3"/><circle cx="${s/2}" cy="${s/2}" r="2" fill="${white}"/></svg>`};
  if(type === 'ritualHand') return {hot: [3, 3], svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}"><path d="M4 4 L${s*.78} ${s*.18} L${s*.48} ${s*.34} L${s*.88} ${s*.58} L${s*.66} ${s*.72} L${s*.42} ${s*.52} L${s*.32} ${s*.92} L${s*.16} ${s*.88} L${s*.24} ${s*.46} L4 4Z" fill="${red}" stroke="${white}" stroke-width="1.5"/><circle cx="${s*.47}" cy="${s*.42}" r="${s*.08}" fill="${black}"/></svg>`};
  if(type === 'crowBeak') return {hot: [3, 3], svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}"><path d="M3 3 L${s-3} ${s*.42} L${s*.38} ${s*.56} L${s*.55} ${s-4} L${s*.34} ${s-4} L${s*.22} ${s*.58} L3 3Z" fill="${red}" stroke="${white}" stroke-width="1.5"/><path d="M${s*.42} ${s*.47} L${s-5} ${s*.42}" stroke="${black}" stroke-width="2"/></svg>`};
  if(type === 'forbidden') return {hot: [Math.floor(s/2), Math.floor(s/2)], svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}"><circle cx="${s/2}" cy="${s/2}" r="${s*.42}" fill="${black}" stroke="${red}" stroke-width="4"/><path d="M${s*.25} ${s*.25} L${s*.75} ${s*.75} M${s*.75} ${s*.25} L${s*.25} ${s*.75}" stroke="${red}" stroke-width="4"/><circle cx="${s/2}" cy="${s/2}" r="${s*.08}" fill="${white}"/></svg>`};
  return {hot: [2, 2], svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}"><path d="M2 2 L${s-5} ${s*.5} L${s*.52} ${s*.6} L${s*.67} ${s-4} L${s*.52} ${s-2} L${s*.36} ${s*.64} L${s*.2} ${s*.82} L2 2Z" fill="${red}" stroke="${white}" stroke-width="1.5"/><path d="M${s*.35} ${s*.64} L${s*.5} ${s*.58}" stroke="${black}" stroke-width="2"/></svg>`};
}

function ensureCustomCursor(){
  let el = document.getElementById('exCustomCursor');
  if(!el){
    el = document.createElement('div');
    el.id = 'exCustomCursor';
    el.className = 'ex-custom-cursor';
    document.body.appendChild(el);
  }
  return el;
}

function applyCursorLab(){
  cursorState.size = Number(document.getElementById('cursorSize')?.value || cursorState.size);
  cursorState.glow = Number(document.getElementById('cursorGlow')?.value || cursorState.glow);
  cursorState.trail = document.getElementById('cursorTrail')?.checked ?? cursorState.trail;
  cursorState.systemWide = document.getElementById('cursorSystemWide')?.checked ?? cursorState.systemWide;
  const custom = ensureCustomCursor();
  if(cursorState.type === 'default'){
    document.body.classList.remove('cursor-lab-active');
    custom.innerHTML = '';
  } else {
    const data = cursorSvg(cursorState.type, cursorState.size);
    custom.innerHTML = data.svg;
    custom.dataset.hotX = data.hot[0];
    custom.dataset.hotY = data.hot[1];
    document.body.classList.toggle('cursor-lab-active', cursorState.systemWide);
  }
  document.body.classList.toggle('cursor-trail-on', cursorState.trail);
  document.body.style.setProperty('--cursor-glow', `${cursorState.glow / 100}`);
}

function resetCursorLab(){
  cursorState = { type: 'default', size: 32, glow: 35, trail: false, systemWide: true };
  document.querySelectorAll('.cursor-preset').forEach(b => b.classList.toggle('is-selected', b.dataset.cursor === 'default'));
  if(document.getElementById('cursorSize')) document.getElementById('cursorSize').value = 32;
  if(document.getElementById('cursorGlow')) document.getElementById('cursorGlow').value = 35;
  if(document.getElementById('cursorTrail')) document.getElementById('cursorTrail').checked = false;
  if(document.getElementById('cursorSystemWide')) document.getElementById('cursorSystemWide').checked = true;
  document.body.classList.remove('cursor-lab-active','cursor-trail-on');
  const custom = document.getElementById('exCustomCursor');
  if(custom) custom.innerHTML = '';
  updateCursorPreview();
}

function updateCursorPreview(){
  const glyph = document.getElementById('cursorPreviewGlyph');
  const size = document.getElementById('cursorSize');
  const glow = document.getElementById('cursorGlow');
  if(document.getElementById('cursorSizeOut')) document.getElementById('cursorSizeOut').textContent = size?.value || cursorState.size;
  if(document.getElementById('cursorGlowOut')) document.getElementById('cursorGlowOut').textContent = glow?.value || cursorState.glow;
  if(glyph){
    glyph.textContent = cursorGlyphs[cursorState.type] || '➜';
    glyph.style.fontSize = `${Math.max(42, Number(size?.value || 32) * 2)}px`;
    glyph.style.textShadow = `0 0 ${Number(glow?.value || 35)/3}px #ff101a`;
  }
}

function bindCursorTrail(){
  if(cursorTrailBound) return;
  cursorTrailBound = true;
  window.addEventListener('mousemove', e => {
    const custom = document.getElementById('exCustomCursor');
    if(custom && document.body.classList.contains('cursor-lab-active')){
      const hotX = Number(custom.dataset.hotX || 0);
      const hotY = Number(custom.dataset.hotY || 0);
      custom.style.transform = `translate(${e.clientX - hotX}px, ${e.clientY - hotY}px)`;
    }
    if(!document.body.classList.contains('cursor-trail-on')) return;
    const dot = document.createElement('i');
    dot.className = 'cursor-trail-dot';
    dot.style.left = `${e.clientX}px`;
    dot.style.top = `${e.clientY}px`;
    document.body.appendChild(dot);
    setTimeout(()=>dot.remove(), 520);
  });
}



function initDesktopIconDrag(){
  const iconLayer = document.querySelector('.desktop-icons');
  if(!iconLayer) return;
  const icons = Array.from(iconLayer.querySelectorAll('.desktop-icon'));
  let drag = null;

  function boundsFor(icon){
    const layerRect = iconLayer.getBoundingClientRect();
    return {
      maxX: Math.max(0, layerRect.width - icon.offsetWidth),
      maxY: Math.max(0, layerRect.height - icon.offsetHeight)
    };
  }

  icons.forEach(icon => {
    const key = `exos-icon-pos-${icon.dataset.open || icon.textContent.trim()}`;
    const saved = localStorage.getItem(key);
    if(saved && !window.matchMedia('(max-width: 800px)').matches){
      try{
        const pos = JSON.parse(saved);
        if(Number.isFinite(pos.x) && Number.isFinite(pos.y)){
          icon.style.left = `${pos.x}px`;
          icon.style.top = `${pos.y}px`;
        }
      }catch(e){}
    }

    icon.addEventListener('pointerdown', e => {
      if(window.matchMedia('(max-width: 800px)').matches) return;
      const rect = icon.getBoundingClientRect();
      drag = {
        icon,
        key,
        startX: e.clientX,
        startY: e.clientY,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
        moved: false
      };
      icon.setPointerCapture?.(e.pointerId);
      icon.classList.add('is-dragging');
    });

    icon.addEventListener('pointermove', e => {
      if(!drag || drag.icon !== icon || window.matchMedia('(max-width: 800px)').matches) return;
      const layerRect = iconLayer.getBoundingClientRect();
      const b = boundsFor(icon);
      let x = e.clientX - layerRect.left - drag.offsetX;
      let y = e.clientY - layerRect.top - drag.offsetY;
      x = Math.max(0, Math.min(b.maxX, x));
      y = Math.max(0, Math.min(b.maxY, y));
      if(Math.abs(e.clientX - drag.startX) > 4 || Math.abs(e.clientY - drag.startY) > 4) drag.moved = true;
      icon.style.left = `${Math.round(x)}px`;
      icon.style.top = `${Math.round(y)}px`;
    });

    icon.addEventListener('pointerup', e => {
      if(!drag || drag.icon !== icon) return;
      icon.releasePointerCapture?.(e.pointerId);
      icon.classList.remove('is-dragging');
      if(drag.moved){
        icon.dataset.dragSuppress = 'true';
        localStorage.setItem(key, JSON.stringify({x: parseInt(icon.style.left,10) || 0, y: parseInt(icon.style.top,10) || 0}));
        setTimeout(() => { icon.dataset.dragSuppress = 'false'; }, 0);
      }
      drag = null;
    });

    icon.addEventListener('pointercancel', () => {
      if(drag && drag.icon === icon){
        icon.classList.remove('is-dragging');
        drag = null;
      }
    });
  });
}

function initThemeGlyphs(){
  const buttons = document.querySelectorAll('.sigil-theme-button');
  if(!buttons.length) return;

  function applyTheme(btn){
    const color = btn.dataset.theme || '#d8381c';
    const rgb = btn.dataset.rgb || '216,56,28';
    document.documentElement.style.setProperty('--theme', color);
    document.documentElement.style.setProperty('--theme-rgb', rgb);
    buttons.forEach(b => b.classList.toggle('is-active', b === btn));

    // Keep creative tool defaults aligned with the selected OS color without overwriting user input during active use.
    const rainDraw = document.getElementById('rainDrawColor');
    if(rainDraw && !rainDraw.matches(':focus')) rainDraw.value = color;
    const kaleidoColor = document.getElementById('kaleidoColor');
    if(kaleidoColor){
      let option = Array.from(kaleidoColor.options).find(o => o.value.toLowerCase() === color.toLowerCase());
      if(!option){
        option = document.createElement('option');
        option.value = color;
        option.textContent = btn.getAttribute('title') || 'theme';
        kaleidoColor.appendChild(option);
      }
      kaleidoColor.value = color;
    }
  }

  buttons.forEach(btn => btn.addEventListener('click', () => applyTheme(btn)));
  applyTheme(document.querySelector('.sigil-theme-button.is-active') || buttons[0]);
}


initThemeGlyphs();
initDesktopIconDrag();
initChartPaint();
initEffecto();
initAsciiMaker();
initDither();
initKaleido();
initPixelRain();
initCursorLab();
refreshTaskbar();
