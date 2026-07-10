const API_URL = window.location.hostname === 'localhost' ? "http://localhost:4000/api" : "https://first-second-year-mcqs-production.up.railway.app/api";

let time  = 0;
let interval = null;
let isRunning = false;
let results = [];
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let wrongQuestions = [];         // tracks wrong ones during quiz
let wrongQuestionsSnapshot = []; // current table — updates after each review
let reviewWrongQuestions = [];   // tracks wrong ones during a review session
let isReviewMode = false;
let reviewIndex = 0;
let history = [];    //hsitory for back and continue
let back_index = 0;  //hsitory for back and continue


const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");

const scoreText = document.getElementById("score-text");

const startBtn = document.getElementById("start-btn");
const nextBtn = document.getElementById("next-btn");
const backBtn = document.getElementById("back-btn");
const conBtn = document.getElementById("con-btn");

//Result action buttons
const BackBtn = document.getElementById("back-btn1");
const restartBtn = document.getElementById("restart-btn");
const ViewBtn = document.getElementById("view-btn");
const statBtn = document.getElementById("stat-btn");
const ReviewBtn = document.getElementById("review-btn");

//Leaderboard container
const container = document.getElementById("leaderboard-section");

const questionNumber = document.getElementById("question-number");
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const feedback = document.getElementById("feedback");

const savedUser = JSON.parse(localStorage.getItem("quizUser"));
const timerBox = document.querySelector(".timer-container");


if (!savedUser) {
    window.location.href = "login.html";
}

//view stat logic
if (localStorage.getItem("quizResults")) {
    const saved = JSON.parse(localStorage.getItem("quizResults"));
    questions = saved.questions;
    results = saved.times;
    score = saved.score;
    wrongQuestionsSnapshot = saved.wrongSnapshot;
    resultScreen.classList.remove("hidden");
    startScreen.classList.add("hidden");
    showResultScreen();
}

// Shuffle function
function shuffleArray(arr) {
    return arr.sort(() => Math.random() - 0.5);
}


//Line by Line code start from here

// Start quiz
startBtn.addEventListener("click", async () => {
    const success = await loadQuestions();


    startScreen.classList.add("hidden");
    quizScreen.classList.remove("hidden");

    currentQuestionIndex = 0;
    score = 0;
    wrongQuestions = [];
    wrongQuestionsSnapshot = [];
    
    if(success){
        toggleTimer();
        showQuestion();
    } 
});


// Load questions from JSON
async function loadQuestions() {
    const selectedQuiz = localStorage.getItem("selectedQuiz");

    try{
        const response = await fetch(`${API_URL}/questions/${selectedQuiz}`);   

            if(!response.ok){
                throw new Error(`Server responded with status ${response.status}`);
            }

        const rawdata = await response.json();

        questions = rawdata.map(row => ({
            id: row.id,
            subject: row.subject,
            question: row.question,
            options: [row.option_a, row.option_b, row.option_c, row.option_d], 
            answer: row.answer 
        }));

        shuffleArray(questions);
        return true;

    } catch(error){
        console.error("Error loading questions:", error);
        showErrorMessage("Server is down or unreachable. Please try again later.");
        return false;
    }

}

// Show error message on the start screen
function showErrorMessage(message) {
    questionText.textContent = message;
    optionsContainer.innerHTML = "";
    questionNumber.textContent = "";
    feedback.classList.add("hidden");
    backBtn.classList.add("hidden");
    nextBtn.classList.add("hidden");
    stoptimer();
}

// Show one question — normal mode uses currentQuestionIndex
function showQuestion() {
    feedback.textContent = "";
    feedback.classList.add("hidden");
    nextBtn.classList.add("hidden");
    backBtn.classList.add("hidden");
    conBtn.classList.add("hidden");
    optionsContainer.innerHTML = "";

    let q = questions[currentQuestionIndex];

    if(currentQuestionIndex >= 1){
        backBtn.classList.remove("hidden");
    }

    questionNumber.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
    questionText.textContent = q.question;

    let shuffledOptions = [...q.options];
    shuffleArray(shuffledOptions);

    shuffledOptions.forEach(option => {
        const btn = document.createElement("button");
        btn.textContent = option;
        btn.classList.add("option-btn");
        btn.addEventListener("click", () => checkAnswer(btn, option, q.answer, q));
        optionsContainer.appendChild(btn);
    });
}

// Check answer
function checkAnswer(selectedBtn, selectedOption, correctAnswer, q) {
    const allButtons = document.querySelectorAll(".option-btn");
    backBtn.classList.add("hidden");

    allButtons.forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === correctAnswer) {
            btn.classList.add("correct");
        }
    });

    if (selectedOption === correctAnswer) {
        score++;

        if (isReviewMode) {
            history.push({ q, selected: selectedOption, correct: correctAnswer });
            back_index = reviewIndex + 1;
            reviewIndex++;
            resetTimer();
            if (reviewIndex < questions.length) {
                showReviewQuestion();
            } else {
                endReview();
            }

        } else {
            history.push({ q, selected: selectedOption, correct: correctAnswer });
            back_index = currentQuestionIndex + 1;
            currentQuestionIndex++;
            resetTimer();
            if (currentQuestionIndex < questions.length) {   // your original limit restored
                showQuestion();
            } else {
                showResult();
            }
        }

    } else {
        stoptimer();
        selectedBtn.classList.add("wrong");
        feedback.textContent = `Wrong! Correct answer is: ${correctAnswer}`;
        nextBtn.classList.remove("hidden");

        if (!isReviewMode) {
            history.push({ q, selected: selectedOption, correct: correctAnswer });
            back_index = currentQuestionIndex; // synced here too
            wrongQuestions.push({ question: q.question, options: q.options, answer: q.answer, yourAnswer: selectedOption });
        } else {
            history.push({ q, selected: selectedOption, correct: correctAnswer });
            back_index = reviewIndex;
            reviewWrongQuestions.push({ question: q.question, options: q.options, answer: q.answer, yourAnswer: selectedOption });
        }
    }
}

// Next question button — only used when answer is wrong
nextBtn.addEventListener("click", () => {
    if (isReviewMode) {
        reviewIndex++;
        back_index = reviewIndex;
        resetTimer();
        if (reviewIndex < questions.length) {
            showReviewQuestion();
        } else {
            endReview();
        }
        return;
    }

    // Normal mode — push current question to history before advancing
    const q = questions[currentQuestionIndex];
    // already pushed in checkAnswer for wrong, so no double push needed
    currentQuestionIndex++;
    back_index = currentQuestionIndex;
    resetTimer();

    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        showResult();
    }
});


//// back-btn and continue logic starts here
backBtn.addEventListener("click", () => {
    back_index--;
    stoptimer();
    conBtn.classList.remove("hidden");

    if (back_index <= 0) {
        backBtn.classList.add("hidden");
    }

    showHistoryQuestion(back_index);
});

conBtn.addEventListener("click", () => {
    back_index++;
    backBtn.classList.remove("hidden");

    if(!isReviewMode){
        if (back_index >= currentQuestionIndex) {
            // Reached the live current question
            back_index = currentQuestionIndex;
            conBtn.classList.add("hidden");
            toggleTimer();
            showQuestion();  // show live question, not history
            return;
        }
    }else{
       if(back_index >= reviewIndex){
        back_index = reviewIndex;
        conBtn.classList.add("hidden");
        toggleTimer();
        showReviewQuestion();  // show live question, not history
        return;
       }
    }

    showHistoryQuestion(back_index);
});

function showHistoryQuestion(index) {
    const entry = history[index];
    const q1 = entry.q;

    feedback.textContent = "";
    optionsContainer.innerHTML = "";
    questionNumber.textContent = `Question ${index + 1} of ${questions.length}`;
    questionText.textContent = q1.question;

    q1.options.forEach(option => {
        const btn = document.createElement("button");
        btn.textContent = option;
        btn.classList.add("option-btn");
        btn.disabled = true;

        if (option === q1.answer) {
            btn.classList.add("correct");
        }
        if (option === entry.selected && option !== q1.answer) {
            btn.classList.add("wrong");
        }

        optionsContainer.appendChild(btn);
    });
}


////////Back and continue logic ends here

// Show review question — uses reviewIndex, separate from showQuestion
function showReviewQuestion() {
    feedback.textContent = "";
    feedback.classList.add("hidden");
    nextBtn.classList.add("hidden");
    backBtn.classList.add("hidden");

    if(reviewIndex >= 1){
        backBtn.classList.remove("hidden");
    }
    optionsContainer.innerHTML = "";

    let q = questions[reviewIndex];

    questionNumber.textContent = `Review ${reviewIndex + 1} of ${questions.length}`;
    questionText.textContent = q.question;

    let shuffledOptions = [...q.options];
    shuffleArray(shuffledOptions);

    shuffledOptions.forEach(option => {
        const btn = document.createElement("button");
        btn.textContent = option;
        btn.classList.add("option-btn");
        btn.addEventListener("click", () => checkAnswer(btn, option, q.answer, q));
        optionsContainer.appendChild(btn);
    });
}


// End review — go back to result screen with updated original table
function endReview() {
    stoptimer();
    timerBox.classList.remove("warning");
    isReviewMode = false;
    quizScreen.classList.add("hidden");
    resultScreen.classList.remove("hidden");
    // Update snapshot — only questions still wrong after this review
    wrongQuestionsSnapshot = [...reviewWrongQuestions];
    reviewWrongQuestions = [];
    showResultScreen();
}


// Show result logic starts after quiz ends
async function showResult() {
    stoptimer();
    timerBox.classList.remove("warning");
    quizScreen.classList.add("hidden");
    resultScreen.classList.remove("hidden");

    // Freeze a snapshot so review doesn't affect the table
    wrongQuestionsSnapshot = [...wrongQuestions];

    showResultScreen();

    const currentUser = JSON.parse(localStorage.getItem("quizUser"));
    const selectedQuiz = localStorage.getItem("selectedQuiz");

    try{

        await fetch(`${API_URL}/results/save`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    user_name: currentUser.username, //abhi idher id bhjni hai jo humne save hi nhi ki jb wo auto generatue hui database me
                    subject: selectedQuiz,
                    score: wrongQuestionsSnapshot.length + score,
                    achieve_score: score
                })
        });

            
        const LeaderboardRes = await fetch(`${API_URL}/results/leaderboard/${selectedQuiz}`);
        const leaderboard = await LeaderboardRes.json();
        renderleaderboard(leaderboard, currentUser.username);

    }catch(err){
        console.error("Error saving result or fetching leaderboard:", err);
    }
}

function renderleaderboard(leaderboard, currentUsername) {
    const container = document.getElementById("leaderboard-section");
    const tbody = document.getElementById("leaderboard-body");
    tbody.innerHTML = "";

    leaderboard.forEach((entry, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${entry.username}</td>
            <td>${entry.achieve_score}/${entry.score}</td>
        `;
        tbody.appendChild(tr);
    });

    container.classList.remove("hidden");
}

// Renders the result screen — called both after quiz and after review
function showResultScreen() {
    const wrongSection = document.getElementById("wrong-section");

    // Wrong table hide karo
    wrongSection.classList.add("hidden");

    scoreText.textContent = `You scored ${score} out of ${wrongQuestionsSnapshot.length + score}`;

    statBtn.classList.remove("hidden");
    ViewBtn.classList.remove("hidden");
    restartBtn.classList.remove("hidden");
    container.classList.remove("hidden"); // leaderboard wapas dikhao

    ReviewBtn.classList.add("hidden");
    BackBtn.classList.add("hidden");

    // Edge case 1: zero wrong questions — Practice Wrong hide karo
    if (wrongQuestionsSnapshot.length === 0) {
        ReviewBtn.classList.add("hidden"); // already hidden hai, but explicit rakhna better hai
        ViewBtn.classList.add("hidden"); // View Wrong bhi hide karo, kuch nahi dikhana
    }
} 

//Only view then review logic starts here
ViewBtn.addEventListener("click", () => {
    const wrongTableBody = document.getElementById("wrong-table-body");
    const wrongSection = document.getElementById("wrong-section");

    statBtn.classList.add("hidden");
    ViewBtn.classList.add("hidden");
    restartBtn.classList.add("hidden");
    
    ReviewBtn.classList.remove("hidden");
    BackBtn.classList.remove("hidden");

    container.classList.add("hidden"); // leaderboard hide karo

    wrongTableBody.innerHTML = "";

    if (wrongQuestionsSnapshot.length === 0) {
        wrongSection.classList.add("hidden");
    } else {
        wrongSection.classList.remove("hidden");

        wrongQuestionsSnapshot.forEach((wq, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${wq.question}</td>
                <td class="your-answer">${wq.yourAnswer}</td>
                <td class="right-answer">${wq.answer}</td>
            `;
            wrongTableBody.appendChild(row);
        });
    }
});

// Review wrong questions
ReviewBtn.addEventListener("click", () => {
    if (wrongQuestionsSnapshot.length === 0) return;

    isReviewMode = true;
    reviewIndex = 0;
    back_index = reviewIndex;
    score = 0;
    reviewWrongQuestions = []; // reset for this review session
    history = [];
    results = [];
    wrongQuestions = [];
    localStorage.removeItem("quizResults"); //local stat result remove
    // Build review questions from the frozen snapshot
    questions = wrongQuestionsSnapshot.map(wq => ({
        question: wq.question,
        options: wq.options,
        answer: wq.answer
    }));

    resultScreen.classList.add("hidden");
    quizScreen.classList.remove("hidden");

    toggleTimer();
    showReviewQuestion();
});


BackBtn.addEventListener("click", () => {
    const wrongSection = document.getElementById("wrong-section");

    // Wrong table hide karo
    wrongSection.classList.add("hidden");
    ReviewBtn.classList.add("hidden");

    // Result screen ke buttons wapas dikhao
    statBtn.classList.remove("hidden");
    restartBtn.classList.remove("hidden");
    container.classList.remove("hidden"); // leaderboard wapas dikhao

    // View Wrong aur Practice Wrong — sirf tab dikhao jab wrong questions hon aur review mode nahi ho
    if (wrongQuestionsSnapshot.length > 0 && !isReviewMode) {
        ViewBtn.classList.remove("hidden");
    }

    BackBtn.classList.add("hidden");
});

//stats button logic
statBtn.addEventListener("click", () => {
    if(localStorage.getItem("quizResults")){
        const saved = JSON.parse(localStorage.getItem("quizResults"));
        localStorage.setItem("quizResults", JSON.stringify({
            history: saved.history,
            questions: saved.questions,
            times: saved.times,
            score: saved.score,
            wrongSnapshot: saved.wrongSnapshot
        })); 
         window.location.href = "stat.html";
    }else{
        localStorage.setItem("quizResults", JSON.stringify({
            history: history,
            questions: questions,
            times: results,
            score: score,
            wrongSnapshot: wrongQuestionsSnapshot
        }));
        window.location.href = "stat.html";
    }
});


// Logout
const logoutBtn = document.getElementById("logout-btn");
logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("quizUser");
    window.location.href = "login.html";
});


// Timer
function startTimer() {
    interval = setInterval(() => {
        time++;
        document.getElementById("time").innerText = time;
        if (time >= 100) {
            timerBox.classList.add("warning");
        } else {
            timerBox.classList.remove("warning");
        }
    }, 1000);
}

function toggleTimer() {
    if (isRunning) {
        clearInterval(interval);
        isRunning = false;
    } else {
        startTimer();
        isRunning = true;
    }
}

function resetTimer() {
    clearInterval(interval);
    let usedTime = time;
    results.push(usedTime);
    timerBox.classList.remove("warning");
    time = 0;
    document.getElementById("time").innerText = time;
    startTimer();
    isRunning = true;
}

function stoptimer() {
    clearInterval(interval);
    isRunning = false;
}

// Restart quiz
restartBtn.addEventListener("click", async () => {
    isReviewMode = false;
    wrongQuestions = [];
    wrongQuestionsSnapshot = [];
    reviewWrongQuestions = [];
    score = 0;
    currentQuestionIndex = 0;
    back_index = 0;
    history = [];
    results = [];
    localStorage.removeItem("quizResults"); //local stat resutl remove
    resultScreen.classList.add("hidden");
    startScreen.classList.remove("hidden");
});


// extra orbs.........
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

for (let i = 0; i < 800; i++) {
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