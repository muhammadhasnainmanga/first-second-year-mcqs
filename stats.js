const canvas = document.getElementById('bg-canvas');
        const ctx = canvas.getContext('2d');
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
                x:  Math.random() * W,
                y:  Math.random() * H,
                r:  Math.random() * 1.2 + 0.3,
                sx: (Math.random() - 0.5) * 0.15,
                sy: (Math.random() - 0.5) * 0.15,
                o:  Math.random() * 0.3 + 0.08
            });
        }

        function draw() {
            ctx.clearRect(0, 0, W, H);
            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(192,132,252,${p.o})`;
                ctx.fill();
                p.x += p.sx; p.y += p.sy;
                if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
                if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
            });
            requestAnimationFrame(draw);
        }
        draw();

//orbs finish ---------

const saved = JSON.parse(localStorage.getItem("quizResults"));
const wrongTableBody = document.getElementById("stats-body");
const sortBtn = document.getElementById("sort-btn");
const bckBtn = document.getElementById("back-btn");
const history = saved.history;
const times  = saved.times;
history.question

//conbining both questions ith time
let combined = history.map((entry,index) => ({
    question: entry.q.question,
    time: times[index],
    OriginalIndex: index+1
}));

//adding them into a normal result screen and displaying
let ascending = false;
function RenderTable(){
    wrongTableBody.innerHTML = "";
    combined.forEach((item,i) => {
        const row = document.createElement("tr");
            row.innerHTML = `
            <td>${item.OriginalIndex}</td>
            <td>${item.question}</td>
            <td>${item.time}</td>
        `;
        wrongTableBody.appendChild(row);
    });
}
RenderTable();

//sorting the table by time
sortBtn.addEventListener("click", () => {
    ascending = !ascending;
    combined.sort((a, b) => ascending ? a.time - b.time : b.time - a.time);
    sortBtn.textContent = ascending ? "Sort by Time ↓" : "Sort by Time ↑";
    RenderTable();
});

bckBtn.addEventListener("click", () => {
    window.location.href = "index.html";
});

