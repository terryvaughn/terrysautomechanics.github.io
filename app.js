document.addEventListener("DOMContentLoaded", () => {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  const form = document.getElementById("authForm");
  const canvas = document.getElementById("signaturePad");
  const clearSig = document.getElementById("clearSig");
  const printBtn = document.getElementById("printBtn");
  const statusBox = document.getElementById("status");
  const dateTime = document.getElementById("dateTime");
  const submissionDate = document.getElementById("submissionDate");
  const signatureImage = document.getElementById("signatureImage");

  if (dateTime) dateTime.value = new Date().toLocaleString();
  if (submissionDate) submissionDate.value = new Date().toLocaleString();

  if (!form || !canvas) return;

  const ctx = canvas.getContext("2d");
  let drawing = false;
  let hasSignature = false;

  function setupCanvas() {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * ratio);
    canvas.height = Math.floor(rect.height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#111";
  }

  function getPoint(event) {
    const rect = canvas.getBoundingClientRect();
    const point = event.touches ? event.touches[0] : event;
    return { x: point.clientX - rect.left, y: point.clientY - rect.top };
  }

  function startDraw(event) {
    event.preventDefault();
    drawing = true;
    const p = getPoint(event);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  }

  function draw(event) {
    if (!drawing) return;
    event.preventDefault();
    const p = getPoint(event);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    hasSignature = true;
  }

  function stopDraw() {
    drawing = false;
  }

  canvas.addEventListener("mousedown", startDraw);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", stopDraw);
  canvas.addEventListener("mouseleave", stopDraw);
  canvas.addEventListener("touchstart", startDraw, { passive: false });
  canvas.addEventListener("touchmove", draw, { passive: false });
  canvas.addEventListener("touchend", stopDraw);

  clearSig?.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasSignature = false;
    if (signatureImage) signatureImage.value = "";
  });

  function showStatus(message) {
    if (!statusBox) return;
    statusBox.textContent = message;
    statusBox.classList.add("show");
  }

  form.addEventListener("submit", (event) => {
    if (!form.checkValidity()) {
      event.preventDefault();
      form.reportValidity();
      return;
    }

    if (!hasSignature) {
      event.preventDefault();
      showStatus("Please sign inside the white signature box before submitting.");
      return;
    }

    if (signatureImage) signatureImage.value = canvas.toDataURL("image/png");
    if (submissionDate) submissionDate.value = new Date().toLocaleString();
    showStatus("Submitting authorization...");
  });

  printBtn?.addEventListener("click", () => window.print());

  setupCanvas();
  window.addEventListener("resize", setupCanvas);
});
