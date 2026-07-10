const signupForm = document.getElementById("signupForm");
const message = document.getElementById("message");

const API_URL = window.location.hostname === '127.0.0.1' ? "http://localhost:4000/api" : "https://first-second-year-mcqs-production.up.railway.app/api";

signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    if (password !== confirmPassword) {
        message.style.color = "red";
        message.textContent = "Passwords do not match!";
        return;
    }

    if (password.length < 6) {
        message.style.color = "red";
        message.textContent = "Password must be at least 6 characters!";
        return;
    }

    // Here you would typically send the data to the backend for processing

    try{
        const response = await fetch(`${API_URL}/signup`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ username, email, password })
        });

        const result = await response.json();

        if(response.ok){
            message.style.color = "lightgreen";
            message.textContent = "Signup successful! Redirecting to login...";
            setTimeout(() => {
            window.location.href = "login.html";
            }, 1500);
        }
        else{
           message.style.color = "red";
           message.textContent = result.error;
        }
    }catch (error) {
        message.style.color = "red";
        message.textContent = "An error occurred. Please try again.";
    }

});

const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let W, H;
const particles = [];
function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
resize();
window.addEventListener('resize', resize);
for (let i = 0; i < 180; i++) {
    particles.push({ x: Math.random()*W, y: Math.random()*H, r: Math.random()*1.5+0.3, sx: (Math.random()-0.5)*0.2, sy: (Math.random()-0.5)*0.2, o: Math.random()*0.45+0.1 });
}
function draw() {
    ctx.clearRect(0,0,W,H);
    particles.forEach(p => {
    ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fillStyle=`rgba(192,132,252,${p.o})`; ctx.fill();
    p.x+=p.sx; p.y+=p.sy;
    if(p.x<0)p.x=W; if(p.x>W)p.x=0;
    if(p.y<0)p.y=H; if(p.y>H)p.y=0;
    });
    requestAnimationFrame(draw);
}
draw();