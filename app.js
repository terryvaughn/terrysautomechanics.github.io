const form = document.getElementById("authForm");
const canvas = document.getElementById("signaturePad");
const ctx = canvas.getContext("2d");
const clearSig = document.getElementById("clearSig");
const printBtn = document.getElementById("printBtn");
const emailBtn = document.getElementById("emailBtn");
const statusBox = document.getElementById("status");

let drawing = false;
let hasSignature = false;

function resizeCanvasForDisplay() {
  const rect = canvas.getBoundingClientRect();
  const data = canvas.toDataURL();
  canvas.width = 900;
  canvas.height = 260;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#111";
}

function getPoint(e) {
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches ? e.touches[0] : e;
  return {
    x: (touch.clientX - rect.left) * (canvas.width / rect.width),
    y: (touch.clientY - rect.top) * (canvas.height / rect.height)
  };
}

function startDraw(e) {
  e.preventDefault();
  drawing = true;
  const p = getPoint(e);
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
}

function draw(e) {
  if (!drawing) return;
  e.preventDefault();
  const p = getPoint(e);
  ctx.lineTo(p.x, p.y);
  ctx.stroke();
  hasSignature = true;
}

function endDraw() {
  drawing = false;
}

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", endDraw);
canvas.addEventListener("mouseleave", endDraw);
canvas.addEventListener("touchstart", startDraw, { passive: false });
canvas.addEventListener("touchmove", draw, { passive: false });
canvas.addEventListener("touchend", endDraw);

clearSig.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  hasSignature = false;
});

function showStatus(message) {
  statusBox.textContent = message;
  statusBox.classList.add("show");
}

function collectFormData() {
  const fd = new FormData(form);
  const data = {};
  for (const [key, value] of fd.entries()) {
    if (data[key]) {
      if (!Array.isArray(data[key])) data[key] = [data[key]];
      data[key].push(value);
    } else {
      data[key] = value;
    }
  }
  data.signature_image = canvas.toDataURL("image/png");
  data.timestamp = new Date().toLocaleString();
  return data;
}

function buildEmailBody(data) {
  return `
Terry's Auto Mechanics LLC - Customer Authorization

Submitted: ${data.timestamp}

CUSTOMER
Name: ${data.customer_name || ""}
Phone: ${data.phone || ""}
Email: ${data.email || ""}
Address: ${data.address || ""}

VEHICLE
Year: ${data.year || ""}
Make: ${data.make || ""}
Model: ${data.model || ""}
VIN: ${data.vin || ""}
Plate: ${data.plate || ""}
Mileage: ${data.mileage || ""}
Color: ${data.color || ""}
Fuel Level: ${data.fuel || ""}

SERVICE REQUEST
${data.service_request || ""}

DAMAGE / CONDITION
${Array.isArray(data.damage) ? data.damage.join(", ") : (data.damage || "")}

Damage Notes:
${data.damage_notes || ""}

SIGNED BY
Typed Legal Name: ${data.signature_name || ""}

NOTE:
Customer completed authorization through the website. Save/print the submitted page as PDF for the full signed copy.
`;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  if (!hasSignature) {
    showStatus("Please sign inside the signature box before submitting.");
    return;
  }

  const data = collectFormData();
  localStorage.setItem("terrys_last_authorization", JSON.stringify(data));
  showStatus("Authorization captured on this device. Use Print / Save as PDF, then Email Summary to send a copy.");
});

printBtn.addEventListener("click", () => {
  window.print();
});

emailBtn.addEventListener("click", () => {
  const data = collectFormData();
  const subject = encodeURIComponent("Completed Repair Authorization - " + (data.customer_name || "Customer"));
  const body = encodeURIComponent(buildEmailBody(data));
  window.location.href = `mailto:terrysautomechanicsllc@gmail.com?subject=${subject}&body=${body}`;
});

resizeCanvasForDisplay();
