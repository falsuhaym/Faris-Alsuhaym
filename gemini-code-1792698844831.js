const state = {
  powerOn: false,
  selectedColor: '#ff3333',
  selectedType: 'L',
  selectedTerminal: null,
  wires: []
};

const canvas = document.getElementById('wireCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  const bench = document.getElementById('workbench');
  canvas.width = bench.clientWidth;
  canvas.height = bench.clientHeight;
  drawWires();
}
window.addEventListener('resize', resizeCanvas);
setTimeout(resizeCanvas, 100);

document.querySelectorAll('.wire-opt').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('.wire-opt').forEach(o => o.classList.remove('active'));
    opt.classList.add('active');
    state.selectedColor = opt.getAttribute('data-color');
    state.selectedType = opt.getAttribute('data-type');
  });
});

document.querySelectorAll('.term').forEach(term => {
  term.addEventListener('click', (e) => {
    e.stopPropagation();
    const id = term.getAttribute('data-id');
    if (!state.selectedTerminal) {
      state.selectedTerminal = id;
      term.classList.add('selected');
      updateStatus(`تم اختيار الطرف (${id}). اضغط على الطرف الثاني للتوصيل.`);
    } else {
      if (state.selectedTerminal !== id) {
        state.wires.push({ from: state.selectedTerminal, to: id, color: state.selectedColor, type: state.selectedType });
        updateStatus(`تم توصيل السلك بنجاح.`);
      }
      document.querySelectorAll('.term').forEach(t => t.classList.remove('selected'));
      state.selectedTerminal = null;
      drawWires();
    }
  });
});

function getPos(id) {
  const el = document.querySelector(`[data-id="${id}"]`);
  if (!el) return {x:0, y:0};
  const r = el.getBoundingClientRect();
  const b = document.getElementById('workbench').getBoundingClientRect();
  return { x: r.left + r.width/2 - b.left, y: r.top + r.height/2 - b.top };
}

function drawWires() {
  ctx.clearRect(0,0,canvas.width, canvas.height);
  state.wires.forEach(w => {
    const p1 = getPos(w.from);
    const p2 = getPos(w.to);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.bezierCurveTo(p1.x, (p1.y+p2.y)/2, p2.x, (p1.y+p2.y)/2, p2.x, p2.y);
    ctx.strokeStyle = w.color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    if(state.powerOn && w.type === 'L') {
      ctx.shadowColor = w.color;
      ctx.shadowBlur = 10;
    } else {
      ctx.shadowBlur = 0;
    }
    ctx.stroke();
  });
}

document.getElementById('btn-power').addEventListener('click', () => {
  state.powerOn = !state.powerOn;
  document.getElementById('btn-power').style.background = state.powerOn ? '#ef4444' : '#22c55e';
  document.getElementById('btn-power').innerText = state.powerOn ? 'إيقاف التيار ⚡' : 'تشغيل التيار ⚡';
  
  const bulb = document.getElementById('bulb-icon');
  if(state.powerOn && isConnected('L_IN', 'BULB_L') && isConnected('N_IN', 'BULB_N')) {
    bulb.classList.add('on');
    updateStatus('✅ الدائرة تعمل والمصباح يضيء بامتياز!');
  } else {
    bulb.classList.remove('on');
    updateStatus(state.powerOn ? '⚠️ التيار يعمل، لكن الدائرة غير مكتملة.' : 'تم إيقاف التيار.');
  }
  drawWires();
});

document.getElementById('btn-reset').addEventListener('click', () => {
  state.wires = [];
  state.powerOn = false;
  document.getElementById('bulb-icon').classList.remove('on');
  drawWires();
  updateStatus('تمت إعادة ضبط اللوحة ومسح الأسلاك.');
});

function isConnected(start, target, visited = new Set()) {
  if(start === target) return true;
  visited.add(start);
  for(let w of state.wires) {
    let next = null;
    if(w.from === start) next = w.to;
    if(w.to === start) next = w.from;
    if(next && !visited.has(next)) {
      if(isConnected(next, target, visited)) return true;
    }
  }
  return false;
}

function updateStatus(msg) {
  document.getElementById('status-box').innerText = msg;
}