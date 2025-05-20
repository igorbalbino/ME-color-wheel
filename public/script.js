const canvas = document.getElementById('colorWheel');
const ctx = canvas.getContext('2d');
const radius = canvas.width / 2;
const selectedHexText = document.getElementById('selectedHex');

document.getElementById('mainColor').addEventListener('input', (e) => {
  const hex = e.target.value;
  selectedHexText.textContent = hex.toUpperCase();
  lastClick = hexToPosition(hex); // calcula posição da bolinha
  redrawWheel(hex);
});

// Desenha a roda de cores
function drawColorWheel() {
  for (let angle = 0; angle <= 360; angle++) {
    const startAngle = (angle - 1) * Math.PI / 180;
    const endAngle = angle * Math.PI / 180;
    ctx.beginPath();
    ctx.moveTo(radius, radius);
    ctx.arc(radius, radius, radius, startAngle, endAngle, false);
    ctx.closePath();
    ctx.fillStyle = `hsl(${angle}, 100%, 50%)`;
    ctx.fill();
  }

  // Máscara no centro para deixar como "anel"
  ctx.beginPath();
  ctx.arc(radius, radius, radius * 0.5, 0, 2 * Math.PI, false);
  ctx.fillStyle = "#f4f4f4";
  ctx.fill();
}

drawColorWheel();

//*

let lastClick = null;

canvas.addEventListener('click', function (e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // Salva última posição
  lastClick = { x, y };

  // Captura cor clicada
  const imgData = ctx.getImageData(x, y, 1, 1).data;
  const hex = rgbToHex(imgData[0], imgData[1], imgData[2]);

  selectedHexText.textContent = hex.toUpperCase();

  // Redesenha tudo incluindo a bolinha
  redrawWheel(hex);
});

function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

//*

function redrawWheel(selectedHex) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawColorWheel();

  if (lastClick) {
    drawDot(lastClick.x, lastClick.y);
  }

  updateColors(selectedHex);
}

function drawDot(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, 2 * Math.PI);
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();
}


//*

function updateColors(hex) {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const complementaryH = (hsl.h + 180) % 360;
  const analog1H = (hsl.h + 30) % 360;
  const analog2H = (hsl.h + 330) % 360;
  const triad1H = (hsl.h + 120) % 360;
  const triad2H = (hsl.h + 240) % 360;

  const colors = {
    mainColor: hex,
    complementary: hslToHex(complementaryH, hsl.s, hsl.l),
    analog1: hslToHex(analog1H, hsl.s, hsl.l),
    analog2: hslToHex(analog2H, hsl.s, hsl.l),
    triad1: hslToHex(triad1H, hsl.s, hsl.l),
    triad2: hslToHex(triad2H, hsl.s, hsl.l)
  };

  for (const [id, color] of Object.entries(colors)) {
    const box = document.getElementById(id);
    box.style.backgroundColor = color;
    box.querySelector('span').textContent = color.toUpperCase();
    box.style.color = getTextColor(color);
  }
}

function hexToRgb(hex) {
  const bigint = parseInt(hex.replace('#', ''), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return { h, s, l };
}

function hslToHex(h, s, l) {
  l = Math.min(1, Math.max(0, l));
  s = Math.min(1, Math.max(0, s));

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let [r, g, b] = [0, 0, 0];

  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const toHex = v => ('0' + Math.round((v + m) * 255).toString(16)).slice(-2);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function getTextColor(bgColor) {
  const rgb = hexToRgb(bgColor);
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness > 125 ? '#000' : '#fff';
}

function hexToPosition(hex) {
  const hsl = hexToHSL(hex);
  const angle = hsl.h; // Hue (0–360)
  const r = radius * 0.75; // distância média do centro (ajuste se quiser)
  const radians = angle * Math.PI / 180;

  const x = radius + r * Math.cos(radians);
  const y = radius + r * Math.sin(radians);

  return { x, y };
}

function hexToHSL(hex) {
  let r = 0, g = 0, b = 0;
  if (hex.length == 7) {
    r = parseInt(hex.substring(1, 3), 16) / 255;
    g = parseInt(hex.substring(3, 5), 16) / 255;
    b = parseInt(hex.substring(5, 7), 16) / 255;
  }

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }

  return { h, s, l };
}


// Inicialização
updateColors('#ff0000');
