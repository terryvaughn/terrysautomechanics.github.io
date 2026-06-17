document.addEventListener("DOMContentLoaded",()=>{const year=document.getElementById("year");if(year)year.textContent=new Date().getFullYear();const form=document.getElementById("authForm"),canvas=document.getElementById("signaturePad"),clearSig=document.getElementById("clearSig"),printBtn=document.getElementById("printBtn"),emailBtn=document.getElementById("emailBtn"),statusBox=document.getElementById("status"),dateTime=document.getElementById("dateTime");if(dateTime)dateTime.value=new Date().toLocaleString();if(!form||!canvas)return;const ctx=canvas.getContext("2d");let drawing=false,hasSignature=false;function setupCanvas(){const ratio=Math.max(window.devicePixelRatio||1,1),rect=canvas.getBoundingClientRect();canvas.width=Math.floor(rect.width*ratio);canvas.height=Math.floor(rect.height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);ctx.lineWidth=3;ctx.lineCap="round";ctx.lineJoin="round";ctx.strokeStyle="#111"}function getPoint(event){const rect=canvas.getBoundingClientRect(),point=event.touches?event.touches[0]:event;return{x:point.clientX-rect.left,y:point.clientY-rect.top}}function startDraw(event){event.preventDefault();drawing=true;const p=getPoint(event);ctx.beginPath();ctx.moveTo(p.x,p.y)}function draw(event){if(!drawing)return;event.preventDefault();const p=getPoint(event);ctx.lineTo(p.x,p.y);ctx.stroke();hasSignature=true}function stopDraw(){drawing=false}canvas.addEventListener("mousedown",startDraw);canvas.addEventListener("mousemove",draw);canvas.addEventListener("mouseup",stopDraw);canvas.addEventListener("mouseleave",stopDraw);canvas.addEventListener("touchstart",startDraw,{passive:false});canvas.addEventListener("touchmove",draw,{passive:false});canvas.addEventListener("touchend",stopDraw);if(clearSig)clearSig.addEventListener("click",()=>{ctx.clearRect(0,0,canvas.width,canvas.height);hasSignature=false});function showStatus(message){if(!statusBox)return;statusBox.textContent=message;statusBox.classList.add("show")}function collectFormData(){const fd=new FormData(form),data={};for(const[key,value]of fd.entries()){if(data[key]){if(!Array.isArray(data[key]))data[key]=[data[key]];data[key].push(value)}else data[key]=value}data.timestamp=new Date().toLocaleString();data.signature_image=canvas.toDataURL("image/png");return data}function buildEmailBody(data){const damage=Array.isArray(data.damage)?data.damage.join(", "):(data.damage||"None selected");return`Terry's Auto Mechanics LLC - Completed Authorization

Submitted: ${data.timestamp}

CUSTOMER INFORMATION
Name: ${data.customer_name||""}
Phone: ${data.phone||""}
Email: ${data.email||""}
Address: ${data.address||""}

VEHICLE INFORMATION
Year: ${data.year||""}
Make: ${data.make||""}
Model: ${data.model||""}
VIN: ${data.vin||""}
License Plate: ${data.plate||""}
Mileage: ${data.mileage||""}
Color: ${data.color||""}
Fuel Level: ${data.fuel||""}

SERVICE REQUEST
${data.service_request||""}

VEHICLE CONDITION / DAMAGE
${damage}

Additional Notes:
${data.damage_notes||""}

RATES ACKNOWLEDGED
Diagnosis: $125.00/hour
Repair labor: $100.00/hour
Roadside callout: $75.00 minimum + $2.50/mile
Bad weather roadside callout: $150.00 minimum + $2.50/mile

SIGNED BY
${data.signature_name||""}

NOTE:
Customer completed this authorization through the website. Use Print / Save as PDF for the full signed copy.`}form.addEventListener("submit",event=>{event.preventDefault();if(!form.checkValidity()){form.reportValidity();return}if(!hasSignature){showStatus("Please sign inside the white signature box before submitting.");return}const data=collectFormData();localStorage.setItem("terrys_last_authorization",JSON.stringify(data));showStatus("Authorization captured on this device. Click Print / Save as PDF, then Email Summary to send a copy.")});if(printBtn)printBtn.addEventListener("click",()=>window.print());if(emailBtn)emailBtn.addEventListener("click",()=>{const data=collectFormData(),subject=encodeURIComponent("Completed Repair Authorization - "+(data.customer_name||"Customer")),body=encodeURIComponent(buildEmailBody(data));window.location.href=`mailto:terrysautomechanicsllc@gmail.com?subject=${subject}&body=${body}`});setupCanvas();window.addEventListener("resize",setupCanvas)});
