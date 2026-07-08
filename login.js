const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();


    if(!email || !password){
        message.style.color = "red";
        message.textContent = "Email or Password are required!";
        return;
    }

    try{
        const response = await fetch('http://localhost:4000/api/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password})
        });

        const result  = await response.json();

        if(response.ok){

            localStorage.setItem('quizUser', JSON.stringify(result));

            message.style.color = "lightgreen";
            message.textContent = `Login successful! Welcome ${result.username}`;

            setTimeout(() => {
                window.location.href = "category.html";
            }, 1200);
        }else{
            message.style.color = "red";
            message.textContent = "Invalid email or password!";
        }
    }catch(err){
        message.style.color = "red";
        message.textContent = err.message || "Server is down or not responding!";
    }

});

    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    let W, H;
    const particles = [];
    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);
    for (let i = 0; i < 160; i++) {
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