const chapterBtn = document.getElementById("chapter-btn");
const poemBtn = document.getElementById("poem-btn");
const compBtn = document.getElementById("comp-btn");
const phyBtn = document.getElementById("phy-btn");
const mth1Btn = document.getElementById("math1-btn");
const mth2Btn = document.getElementById("math2-btn");
const mth3Btn = document.getElementById("math3-btn");
const mth4Btn = document.getElementById("math4-btn");
const pstBtn = document.getElementById("pst-btn");
const login = document.getElementById("login-btn");
const signup = document.getElementById("signup-btn");
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

// Agar banda login ke bina category page khol de
const savedUser = JSON.parse(localStorage.getItem("quizUser"));

if (!savedUser) {
    window.location.href = "login.html";
}

chapterBtn.addEventListener("click", () => {
    localStorage.setItem("selectedQuiz", "English");
    window.location.href = "index.html";
});

poemBtn.addEventListener("click", () => {
    localStorage.setItem("selectedQuiz", "English Extra");
    window.location.href = "index.html";
});

compBtn.addEventListener("click", () => {
    localStorage.setItem("selectedQuiz", "Computer");
    window.location.href = "index.html";
});

phyBtn.addEventListener("click", () => {
    localStorage.setItem("selectedQuiz", "Physics");
    window.location.href = "index.html";
});

mth1Btn.addEventListener("click", () => {
    localStorage.setItem("selectedQuiz", "Permutation");
    window.location.href = "index.html";
});

mth2Btn.addEventListener("click", () => {
    localStorage.setItem("selectedQuiz", "Sequence");
    window.location.href = "index.html";
});

mth3Btn.addEventListener("click", () => {
    localStorage.setItem("selectedQuiz", "Quadratic");
    window.location.href = "index.html";
});

mth4Btn.addEventListener("click", () => {
    localStorage.setItem("selectedQuiz", "Trigonometry");
    window.location.href = "index.html";
});

pstBtn.addEventListener("click", () => {
    localStorage.setItem("selectedQuiz", "Pak Studies");
    window.location.href = "index.html";
});

login.addEventListener("click", () => {
    window.location.href = "login.html";
});

signup.addEventListener("click", () => {
    window.location.href = "signup.html";
});

let W, H;
const particles = [];

function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

for (let i = 0; i < 500; i++) {
    particles.push({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 1.5 + 0.3,
    sx: (Math.random() - 0.5) * 0.2,
    sy: (Math.random() - 0.5) * 0.2,
    o: Math.random() * 0.45 + 0.1
    });
}

function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(192,132,252,${p.o})`;
    ctx.fill();
    p.x += p.sx;
    p.y += p.sy;
    if (p.x < 0) p.x = W;
    if (p.x > W) p.x = 0;
    if (p.y < 0) p.y = H;
    if (p.y > H) p.y = 0;
    });
    requestAnimationFrame(draw);
}
draw();