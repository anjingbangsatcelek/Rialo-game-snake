const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Elemen UI
const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("highScore");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlayText = document.getElementById("overlay-text");
const startBtn = document.getElementById("start-btn");
const leaderboardList = document.getElementById("leaderboard-list");
const rialoLogoImg = document.getElementById("rialoLogoSource");

// Konfigurasi Grid
const gridSize = 20;
const tileCount = canvas.width / gridSize;

// Status Game
let snake = [];
let food = { x: 0, y: 0 };
let dx = gridSize;
let dy = 0;
let score = 0;
let highScore = 0;
let gameInterval;
let isGameRunning = false;

// Data Simpanan Leaderboard Berbasis Penyimpanan Lokal HP (Local Storage)
let leaderboards = JSON.parse(localStorage.getItem("rialo_leaderboard")) || [
    { name: "Felix", score: 50 },
    { name: "Rialo Bot", score: 30 },
    { name: "Player 3", score: 10 }
];

// Jalankan fungsi memuat peringkat pertama kali game dibuka
updateLeaderboardUI();

// Event Listener
startBtn.addEventListener("click", startGame);
document.addEventListener("keydown", changeDirection);

document.getElementById("ctrl-up").addEventListener("click", () => triggerDirection("UP"));
document.getElementById("ctrl-down").addEventListener("click", () => triggerDirection("DOWN"));
document.getElementById("ctrl-left").addEventListener("click", () => triggerDirection("LEFT"));
document.getElementById("ctrl-right").addEventListener("click", () => triggerDirection("RIGHT"));

const noScrollButtons = document.querySelectorAll('.ctrl-btn');
noScrollButtons.forEach(btn => {
    btn.addEventListener('touchstart', (e) => e.preventDefault(), {passive: false});
    btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        btn.click();
    }, {passive: false});
});

function startGame() {
    overlay.style.display = "none";
    isGameRunning = true;
    
    snake = [
        { x: gridSize * 5, y: gridSize * 10 },
        { x: gridSize * 4, y: gridSize * 10 },
        { x: gridSize * 3, y: gridSize * 10 }
    ];
    dx = gridSize;
    dy = 0;
    score = 0;
    scoreElement.innerText = `SCORE: ${score}`;
    
    // Ambil high score tersimpan di data leaderboard
    highScore = leaderboards[0] ? leaderboards[0].score : 0;
    highScoreElement.innerText = `HIGH SCORE: ${highScore}`;
    
    generateFood();
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 115);
}

function gameLoop() {
    if (checkGameOver()) {
        endGame();
        return;
    }
    clearCanvas();
    drawFood();
    moveSnake();
    drawSnake();
}

function clearCanvas() {
    ctx.fillStyle = "#121212";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
    for (let i = 0; i < canvas.width; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
}

// MENGUBAH ULAR: Berwarna Emas Rialo Elegan dengan Kepala Lebih Terang
function drawSnake() {
    snake.forEach((part, index) => {
        if (index === 0) {
            ctx.fillStyle = "#f0efe9"; // Kepala Ular Putih Rialo
        } else {
            ctx.fillStyle = "#ffdd53"; // Badan Ular Emas Berkilau
        }
        
        ctx.fillRect(part.x, part.y, gridSize - 1, gridSize - 1);
        ctx.strokeStyle = "#121212";
        ctx.strokeRect(part.x, part.y, gridSize - 1, gridSize - 1);
    });
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    if (snake[0].x === food.x && snake[0].y === food.y) {
        score += 10;
        scoreElement.innerText = `SCORE: ${score}`;
        generateFood();
    } else {
        snake.pop();
    }
}

function generateFood() {
    food.x = Math.floor(Math.random() * tileCount) * gridSize;
    food.y = Math.floor(Math.random() * tileCount) * gridSize;

    snake.forEach(part => {
        if (part.x === food.x && part.y === food.y) generateFood();
    });
}

// MENGUBAH BOLA MAKANAN JADI LOGO RIALO BULAT
function drawFood() {
    ctx.save();
    ctx.beginPath();
    // Buat kliping lingkaran agar gambar logo berbentuk bulat sempurna
    ctx.arc(food.x + gridSize / 2, food.y + gridSize / 2, gridSize / 2, 0, Math.PI * 2);
    ctx.clip();
    
    // Gambar Logo Rialo (IMG_3277.jpeg) tepat di posisi makanan tersebut
    ctx.drawImage(rialoLogoImg, food.x, food.y, gridSize, gridSize);
    ctx.restore();
    
    // Tambahkan efek cahaya tipis di pinggir logo makanan
    ctx.strokeStyle = "#ffdd53";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(food.x + gridSize / 2, food.y + gridSize / 2, gridSize / 2, 0, Math.PI * 2);
    ctx.stroke();
}

function triggerDirection(dir) {
    if (!isGameRunning) return;
    const goingUp = dy === -gridSize;
    const goingDown = dy === gridSize;
    const goingRight = dx === gridSize;
    const goingLeft = dx === -gridSize;

    if (dir === "LEFT" && !goingRight) { dx = -gridSize; dy = 0; }
    if (dir === "UP" && !goingDown) { dx = 0; dy = -gridSize; }
    if (dir === "RIGHT" && !goingLeft) { dx = gridSize; dy = 0; }
    if (dir === "DOWN" && !goingUp) { dx = 0; dy = gridSize; }
}

function changeDirection(event) {
    const keyPressed = event.keyCode;
    if (keyPressed === 37) triggerDirection("LEFT");
    if (keyPressed === 38) triggerDirection("UP");
    if (keyPressed === 39) triggerDirection("RIGHT");
    if (keyPressed === 40) triggerDirection("DOWN");
}

function checkGameOver() {
    if (snake[0].x < 0 || snake[0].x >= canvas.width || snake[0].y < 0 || snake[0].y >= canvas.height) return true;
    for (let i = 4; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
    }
    return false;
}

function endGame() {
    clearInterval(gameInterval);
    isGameRunning = false;

    overlayTitle.innerText = "GAME OVER";
    overlayText.innerText = `Skor Kamu: ${score}`;
    startBtn.innerText = "MAIN LAGI";
    overlay.style.display = "flex";

    // Cek apakah skor masuk 3 besar leaderboard
    checkLeaderboardRecord(score);
}

// LOGIKA SISTEM REKORD LEADERBOARD
function checkLeaderboardRecord(finalScore) {
    // Jika skor lebih tinggi dari peringkat terbawah di leaderboard saat ini
    if (finalScore > leaderboards[2].score) {
        // Beri jeda sedikit setelah game over biar animasi mulus, lalu minta input nama pemain
        setTimeout(() => {
            let playerName = prompt("🔥 LUAR BIASA! Kamu masuk TOP 3 Leaderboard. Masukkan namamu:");
            if (!playerName || playerName.trim() === "") playerName = "Player";
            
            // Masukkan data skor baru
            leaderboards.push({ name: playerName.slice(0, 12), score: finalScore });
            
            // Urutkan dari skor tertinggi ke terendah
            leaderboards.sort((a, b) => b.score - a.score);
            
            // Ambil 3 teratas saja
            leaderboards = leaderboards.slice(0, 3);
            
            // Simpan secara permanen di browser HP
            localStorage.setItem("rialo_leaderboard", JSON.stringify(leaderboards));
            
            // Perbarui tampilan Papan Skor
            updateLeaderboardUI();
        }, 500);
    }
}

function updateLeaderboardUI() {
    leaderboardList.innerHTML = "";
    leaderboards.forEach((player) => {
        const li = document.createElement("li");
        li.innerHTML = `<span class="rank-name">${player.name}</span> <span class="rank-score">${player.score}</span>`;
        leaderboardList.appendChild(li);
    });
}
