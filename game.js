class Game {
    constructor() {
        this.player = document.getElementById('player');
        this.teacher = document.getElementById('teacher');
        this.door = document.getElementById('door');
        this.startScreen = document.getElementById('start-screen');
        this.startBtn = document.getElementById('start-btn');
        this.timerDisplay = document.getElementById('timer');
        this.caughtMeter = document.getElementById('caught-meter');
        
        this.playerPos = { x: 100, y: 300 };
        this.teacherPos = { x: 400, y: 300 };
        this.timeLeft = 300;
        this.caughtValue = 0;
        this.gameLoop = null;
        this.keys = {};
        
        this.init();
    }

    init() {
        this.startBtn.addEventListener('click', () => this.startGame());
        document.addEventListener('keydown', (e) => this.keys[e.key] = true);
        document.addEventListener('keyup', (e) => this.keys[e.key] = false);
    }

    startGame() {
        this.startScreen.style.display = 'none';
        this.resetGame();
        this.gameLoop = setInterval(() => this.update(), 1000 / 60);
        this.startTimer();
    }

    resetGame() {
        this.playerPos = { x: 100, y: 300 };
        this.teacherPos = { x: 400, y: 300 };
        this.timeLeft = 300;
        this.caughtValue = 0;
        this.updateUI();
    }

    update() {
        this.movePlayer();
        this.moveTeacher();
        this.checkCollision();
        this.updatePositions();
        this.checkWin();
    }

    movePlayer() {
        const speed = 5;
        if (this.keys['ArrowUp']) this.playerPos.y = Math.max(0, this.playerPos.y - speed);
        if (this.keys['ArrowDown']) this.playerPos.y = Math.min(570, this.playerPos.y + speed);
        if (this.keys['ArrowLeft']) this.playerPos.x = Math.max(0, this.playerPos.x - speed);
        if (this.keys['ArrowRight']) this.playerPos.x = Math.min(770, this.playerPos.x + speed);
    }

    moveTeacher() {
        const speed = 2;
        const dx = this.playerPos.x - this.teacherPos.x;
        const dy = this.playerPos.y - this.teacherPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const viewRange = 200; // 視線範圍

        // 檢查玩家是否在視線範圍內
        if (distance < viewRange) {
            // 加入警告效果
            this.teacher.classList.add('alert');
            
            // 計算追趕方向
            this.teacherPos.x += (dx / distance) * speed;
            this.teacherPos.y += (dy / distance) * speed;
            
            // 增加警戒值
            this.increaseCaughtMeter();
        } else {
            // 移除警告效果
            this.teacher.classList.remove('alert');
            // 老師巡邏
            this.teacherPatrol();
        }
    }

    teacherPatrol() {
        const time = Date.now() / 1000;
        this.teacherPos.x = 400 + Math.sin(time) * 200;
        this.teacherPos.y = 300 + Math.cos(time) * 100;
    }

    checkCollision() {
        const dx = this.playerPos.x - this.teacherPos.x;
        const dy = this.playerPos.y - this.teacherPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 40) {
            this.gameOver('被抓到了！');
        }
    }

    updatePositions() {
        this.player.style.left = this.playerPos.x + 'px';
        this.player.style.top = this.playerPos.y + 'px';
        this.teacher.style.left = this.teacherPos.x + 'px';
        this.teacher.style.top = this.teacherPos.y + 'px';
    }

    checkWin() {
        const dx = this.playerPos.x - 740;
        const dy = this.playerPos.y - 300;
        const distanceToDoor = Math.sqrt(dx * dx + dy * dy);

        // 當玩家靠近門時添加發光效果
        if (distanceToDoor < 100) {
            this.door.classList.add('nearby');
        } else {
            this.door.classList.remove('nearby');
        }

        // 當玩家觸碰到門時獲勝
        if (distanceToDoor < 30) {
            clearInterval(this.gameLoop);
            this.gameOver('成功逃出！', true);
        }
    }

    increaseCaughtMeter() {
        // 當玩家在老師視線範圍內時，警戒值上升
        this.caughtValue = Math.min(100, this.caughtValue + 0.1);
        this.updateUI();
        
        // 當警戒值達到 100% 時，遊戲結束
        if (this.caughtValue >= 100) {
            this.gameOver('警戒值達到100%！');
        }
    }

    startTimer() {
        const timer = setInterval(() => {
            this.timeLeft--;
            this.updateUI();
            
            if (this.timeLeft <= 0) {
                clearInterval(timer);
                this.gameOver('時間到！');
            }
        }, 1000);
    }

    updateUI() {
        // 更新計時器和警戒值顯示
        this.timerDisplay.textContent = `時間: ${Math.ceil(this.timeLeft)}秒`;
        this.caughtMeter.textContent = `警戒值: ${Math.floor(this.caughtValue)}%`;
        
        // 根據警戒值改變顏色
        const red = Math.floor((this.caughtValue / 100) * 255);
        const green = Math.floor(((100 - this.caughtValue) / 100) * 255);
        this.caughtMeter.style.color = `rgb(${red}, ${green}, 0)`;
    }

    gameOver(message, isWin = false) {
        clearInterval(this.gameLoop);
        Swal.fire({
            title: isWin ? '遊戲勝利！' : '遊戲結束',
            text: message,
            icon: isWin ? 'success' : 'error',
            confirmButtonText: '重新開始'
        }).then((result) => {
            if (result.isConfirmed) {
                this.startGame();
            }
        });
    }
}

// 啟動遊戲
const game = new Game();
