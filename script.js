const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const inputFoto = document.getElementById("foto");
const zoomInput = document.getElementById("zoom");
const botaoBaixar = document.getElementById("baixar");
const botaoCentralizar = document.getElementById("centralizar");

const W = canvas.width;
const H = canvas.height;

const COLORS = {
  ink: "#000000",
  red: "#b82b2b",
  gold: "#f0a625",
  white: "#ffffff"
};

let foto = null;
let zoom = 1;
let offsetX = 0;
let offsetY = 0;

let arrastando = false;
let ultimoX = 0;
let ultimoY = 0;

function fitCover(img, zoomFactor = 1) {
  const base = Math.max(W / img.width, H / img.height);
  const scale = base * zoomFactor;

  const drawW = img.width * scale;
  const drawH = img.height * scale;

  return {
    x: (W - drawW) / 2 + offsetX,
    y: (H - drawH) / 2 + offsetY,
    w: drawW,
    h: drawH
  };
}

function strokeAndFillText(
  text,
  x,
  y,
  font,
  fill,
  stroke = "#000000",
  lineWidth = 10,
  align = "left"
) {
  ctx.save();
  ctx.font = font;
  ctx.textAlign = align;
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = stroke;
  ctx.fillStyle = fill;
  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawOverlay() {
  // =========================
  // TOPO
  // =========================
  strokeAndFillText(
    "SOU ESTUDANTE",
    62,
    175,
    '700 122px "Anton", Impact, sans-serif',
    COLORS.gold,
    COLORS.ink,
    18
  );

  strokeAndFillText(
    "E TÔ COM A DANY!",
    62,
    300,
    '700 104px "Anton", Impact, sans-serif',
    COLORS.white,
    COLORS.red,
    18
  );

  // Linha decorativa
  ctx.save();
  ctx.strokeStyle = COLORS.red;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(66, 342);
  ctx.lineTo(540, 342);
  ctx.stroke();
  ctx.restore();

  // =========================
  // RODAPÉ
  // =========================
  const baseY = 1570;

  // Nome
  strokeAndFillText(
    "DANY OLIVEIRA",
    60,
    baseY,
    '700 108px "Anton", Impact, sans-serif',
    COLORS.white,
    COLORS.ink,
    18
  );

  // Cargo: amarelo com contorno preto
  strokeAndFillText(
    "DEPUTADA FEDERAL",
    62,
    baseY + 92,
    '700 54px "Oswald", Arial, sans-serif',
    COLORS.gold,
    COLORS.ink,
    12
  );

  // UP: branco com contorno preto
  strokeAndFillText(
    "UP",
    62,
    baseY + 235,
    '700 92px "Anton", Impact, sans-serif',
    COLORS.white,
    COLORS.ink,
    14
  );

  // 8080: preto com contorno branco
  strokeAndFillText(
    "8080",
    W - 58,
    baseY + 250,
    '700 190px "Anton", Impact, sans-serif',
    COLORS.ink,
    COLORS.white,
    16,
    "right"
  );
}

function drawPlaceholder() {
  ctx.clearRect(0, 0, W, H);

  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = "#ffffff";
  ctx.font = '700 58px "Oswald", Arial, sans-serif';
  ctx.textAlign = "center";
  ctx.fillText("ESCOLHA SUA FOTO", W / 2, H / 2);
  ctx.restore();

  drawOverlay();
}

function desenhar() {
  ctx.clearRect(0, 0, W, H);

  if (!foto) {
    drawPlaceholder();
    return;
  }

  const p = fitCover(foto, zoom);
  ctx.drawImage(foto, p.x, p.y, p.w, p.h);

  // degradê leve no topo para legibilidade
  const topShade = ctx.createLinearGradient(0, 0, 0, 430);
  topShade.addColorStop(0, "rgba(0,0,0,.22)");
  topShade.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = topShade;
  ctx.fillRect(0, 0, W, 430);

  // degradê leve embaixo para legibilidade
  const bottomShade = ctx.createLinearGradient(0, H - 520, 0, H);
  bottomShade.addColorStop(0, "rgba(0,0,0,0)");
  bottomShade.addColorStop(1, "rgba(0,0,0,.35)");
  ctx.fillStyle = bottomShade;
  ctx.fillRect(0, H - 520, W, 520);

  drawOverlay();
}

function resetPosition() {
  zoom = 1;
  offsetX = 0;
  offsetY = 0;
  zoomInput.value = 1;
  desenhar();
}

function loadFile(file) {
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Escolha um arquivo de imagem.");
    return;
  }

  const reader = new FileReader();

  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      foto = img;
      resetPosition();
    };
    img.src = e.target.result;
  };

  reader.readAsDataURL(file);
}

inputFoto.addEventListener("change", e => loadFile(e.target.files[0]));

zoomInput.addEventListener("input", e => {
  zoom = Number(e.target.value);
  desenhar();
});

botaoCentralizar.addEventListener("click", resetPosition);

function getPointerPos(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (W / rect.width),
    y: (event.clientY - rect.top) * (H / rect.height)
  };
}

canvas.addEventListener("pointerdown", e => {
  if (!foto) return;

  arrastando = true;
  canvas.classList.add("dragging");

  const p = getPointerPos(e);
  ultimoX = p.x;
  ultimoY = p.y;

  canvas.setPointerCapture(e.pointerId);
});

canvas.addEventListener("pointermove", e => {
  if (!arrastando || !foto) return;

  const p = getPointerPos(e);

  offsetX += p.x - ultimoX;
  offsetY += p.y - ultimoY;

  ultimoX = p.x;
  ultimoY = p.y;

  desenhar();
});

function encerrarArrasto(e) {
  arrastando = false;
  canvas.classList.remove("dragging");

  if (e?.pointerId && canvas.hasPointerCapture(e.pointerId)) {
    canvas.releasePointerCapture(e.pointerId);
  }
}

canvas.addEventListener("pointerup", encerrarArrasto);
canvas.addEventListener("pointercancel", encerrarArrasto);

botaoBaixar.addEventListener("click", () => {
  if (!foto) {
    alert("Escolha uma foto primeiro.");
    return;
  }

  desenhar();

  const link = document.createElement("a");
  link.download = "sou-estudante-to-com-dany-8080.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

["dragenter", "dragover"].forEach(type => {
  canvas.addEventListener(type, e => e.preventDefault());
});

canvas.addEventListener("drop", e => {
  e.preventDefault();
  const file = e.dataTransfer.files?.[0];
  if (file) loadFile(file);
});

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(desenhar);
} else {
  desenhar();
}
