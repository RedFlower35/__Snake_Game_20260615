// 遊戲常數
const GRID_SIZE = 20;
const INITIAL_SPEED = 200;

// 遊戲狀態變數
let snake = [{ x: 10, y: 10 }];
let food = { x: 5, y: 5 };
let direction = 'RIGHT';
let score = 0;
let highScore = parseInt(localStorage.getItem('neon-snake-high-score') || '0', 10);
let isGameOver = false;
let gameInterval = null;

// 取得 DOM 元素
const board = document.getElementById('game-board');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreEl = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');
const resetBtn = document.getElementById('reset-btn');

let hasGameStarted = false;

// 初始化顯示最高分
updateHighScoreDisplay();

// 音效播放函數（使用 Web Audio API，無需外部音訊檔）
function playEatSound() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        
        const audioCtx = new AudioContext();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        // 使用 square 波形使其聽起來像經典電子 bite 聲，並縮短持續時間
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.05);

        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.05);
    } catch (e) {
        console.warn('播放音效時發生錯誤：', e);
    }
}

// 格式化數字為五位數（例如 00010）
function formatScore(num) {
    return num.toString().padStart(5, '0');
}

function updateHighScoreDisplay() {
    highScoreEl.textContent = formatScore(highScore);
}

// 初始化遊戲狀態（不啟動定時器）
function initGame() {
    snake = [{ x: 10, y: 10 }];
    direction = 'RIGHT';
    score = 0;
    scoreEl.textContent = formatScore(score);
    isGameOver = false;
    hasGameStarted = false;
    
    resetBtn.textContent = '開始遊戲';
    gameOverScreen.classList.add('hidden');
    generateFood();
    render();
}

// 開始遊戲
function startGame() {
    hasGameStarted = true;
    resetBtn.textContent = '重置遊戲';
    
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(moveSnake, INITIAL_SPEED);
    playEatSound(); // 啟動 AudioContext
}

// 重新開始遊戲 (從 GameOver 或重置按鈕)
function resetGame() {
    snake = [{ x: 10, y: 10 }];
    direction = 'RIGHT';
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('neon-snake-high-score', highScore.toString());
        updateHighScoreDisplay();
    }
    
    score = 0;
    scoreEl.textContent = formatScore(score);
    isGameOver = false;
    hasGameStarted = true;
    resetBtn.textContent = '重置遊戲';
    
    gameOverScreen.classList.add('hidden');
    generateFood();
    
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(moveSnake, INITIAL_SPEED);
    
    render();
}



// 生成食物位置（避開蛇身）
function generateFood() {
    let newFood;
    let onSnake;
    
    do {
        newFood = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
        onSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    } while (onSnake);
    
    food = newFood;
}

// 移動蛇
function moveSnake() {
    if (isGameOver) return;

    const head = { ...snake[0] };

    switch (direction) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
    }

    // 1. 牆壁碰撞偵測
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        handleGameOver();
        return;
    }

    // 2. 身體碰撞偵測（檢查碰撞時不包含即將移動的尾巴）
    const willEat = (head.x === food.x && head.y === food.y);
    const bodyToCheck = willEat ? snake : snake.slice(0, -1);
    if (bodyToCheck.some(segment => segment.x === head.x && segment.y === head.y)) {
        handleGameOver();
        return;
    }

    // 將新頭加入蛇身
    snake.unshift(head);

    if (willEat) {
        score += 10;
        scoreEl.textContent = formatScore(score);
        playEatSound();
        generateFood();
    } else {
        snake.pop(); // 移除尾巴
    }

    render();
}

// 遊戲結束處理
function handleGameOver() {
    isGameOver = true;
    if (gameInterval) clearInterval(gameInterval);
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('neon-snake-high-score', highScore.toString());
        updateHighScoreDisplay();
    }
    
    finalScoreEl.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

// 渲染畫面
function render() {
    // 移除舊的蛇和食物元件，只保留 grid-overlay
    const elementsToRemove = board.querySelectorAll('.game-element');
    elementsToRemove.forEach(el => el.remove());

    // 1. 渲染食物
    const foodEl = document.createElement('div');
    foodEl.className = 'game-element food-element';
    foodEl.style.left = `${(food.x / GRID_SIZE) * 100}%`;
    foodEl.style.top = `${(food.y / GRID_SIZE) * 100}%`;
    
    const foodInner = document.createElement('div');
    foodInner.className = 'food-inner';
    foodEl.appendChild(foodInner);
    board.appendChild(foodEl);

    // 2. 渲染蛇
    snake.forEach((segment, index) => {
        const isHead = index === 0;
        const isTail = index === snake.length - 1;

        const segmentEl = document.createElement('div');
        segmentEl.className = 'game-element';
        segmentEl.style.left = `${(segment.x / GRID_SIZE) * 100}%`;
        segmentEl.style.top = `${(segment.y / GRID_SIZE) * 100}%`;

        if (isHead) {
            const headInner = document.createElement('div');
            headInner.className = 'snake-head';
            
            // 蛇吐信子與方向旋轉
            const tongue = document.createElement('div');
            tongue.className = 'snake-tongue';
            
            if (direction === 'UP') tongue.className += ' rotate-up';
            else if (direction === 'DOWN') tongue.className += ' rotate-down';
            else if (direction === 'LEFT') tongue.className += ' rotate-left';
            else tongue.className += ' rotate-right';
            
            headInner.appendChild(tongue);
            segmentEl.appendChild(headInner);
        } else if (isTail) {
            const tailInner = document.createElement('div');
            tailInner.className = 'snake-tail';
            segmentEl.appendChild(tailInner);
        } else {
            const bodyInner = document.createElement('div');
            bodyInner.className = 'snake-body';
            segmentEl.appendChild(bodyInner);
        }

        board.appendChild(segmentEl);
    });
}

// 監聽鍵盤事件
window.addEventListener('keydown', (e) => {
    if (!hasGameStarted || isGameOver) return;
    switch (e.key) {
        case 'ArrowUp':
            if (direction !== 'DOWN') direction = 'UP';
            break;
        case 'ArrowDown':
            if (direction !== 'UP') direction = 'DOWN';
            break;
        case 'ArrowLeft':
            if (direction !== 'RIGHT') direction = 'LEFT';
            break;
        case 'ArrowRight':
            if (direction !== 'LEFT') direction = 'RIGHT';
            break;
    }
});

// 監聽虛擬按鍵事件
document.getElementById('ctrl-up').addEventListener('click', () => {
    if (!hasGameStarted || isGameOver) return;
    if (direction !== 'DOWN') direction = 'UP';
});
document.getElementById('ctrl-down').addEventListener('click', () => {
    if (!hasGameStarted || isGameOver) return;
    if (direction !== 'UP') direction = 'DOWN';
});
document.getElementById('ctrl-left').addEventListener('click', () => {
    if (!hasGameStarted || isGameOver) return;
    if (direction !== 'RIGHT') direction = 'LEFT';
});
document.getElementById('ctrl-right').addEventListener('click', () => {
    if (!hasGameStarted || isGameOver) return;
    if (direction !== 'LEFT') direction = 'RIGHT';
});

// 支援滑動手勢 (Swipe) 偵測
let touchStartX = 0;
let touchStartY = 0;

board.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: true });

board.addEventListener('touchend', (e) => {
    if (!hasGameStarted || isGameOver) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;
    
    // 設定滑動閾值，避免微小觸碰誤判
    const threshold = 30;
    
    if (Math.abs(dx) > Math.abs(dy)) {
        // 水平滑動
        if (Math.abs(dx) > threshold) {
            if (dx > 0 && direction !== 'LEFT') {
                direction = 'RIGHT';
            } else if (dx < 0 && direction !== 'RIGHT') {
                direction = 'LEFT';
            }
        }
    } else {
        // 垂直滑動
        if (Math.abs(dy) > threshold) {
            if (dy > 0 && direction !== 'UP') {
                direction = 'DOWN';
            } else if (dy < 0 && direction !== 'DOWN') {
                direction = 'UP';
            }
        }
    }
}, { passive: true });

// 監聽按鈕事件
restartBtn.addEventListener('click', resetGame);
resetBtn.addEventListener('click', () => {
    if (!hasGameStarted) {
        startGame();
    } else {
        resetGame();
    }
});

// 初始化遊戲畫面，顯示開始畫面
initGame();

