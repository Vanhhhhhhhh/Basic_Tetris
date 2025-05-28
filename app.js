document.addEventListener('DOMContentLoaded', function() {
    const grid = document.querySelector('.grid');
    let squares = Array.from(document.querySelectorAll('.grid div'));
    const scoreDisplay = document.querySelector('#score');
    const startBtn = document.querySelector('#start-btn');
    const width = 10;    
    let nextRandom = 0;
    let timerId;
    let score = 0;

    // The Tetrominoes
    const l1Tetromino = [
        [0, width, width * 2, width * 2 + 1],
        [width, width + 1, width + 2, width * 2],
        [0, 1, width + 1, width * 2 + 1],
        [width, width + 1, width + 2, 2],
    ];
    const l2Tetromino = [
        [1, width + 1, width * 2 + 1, width * 2],
        [0, width, width + 1, width + 2],
        [0, width, width * 2, 1],
        [width, width + 1, width +2, width * 2 + 2],
    ];
    const z1Tetromino = [
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1],
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1]
    ];
    const z2Tetromino = [
        [1, width, width + 1, width * 2],
        [width, width + 1, width * 2 + 1, width * 2 + 2],
        [1, width, width + 1, width * 2],
        [width, width + 1, width * 2 + 1, width * 2 + 2],
    ];
    const tTetromino = [
        [1, width, width + 1, width + 2],
        [1, width + 1, width + 2, width * 2 + 1],
        [width, width + 1, width + 2, width * 2 + 1],
        [1, width, width + 1, width * 2 + 1]
    ];
    const oTetromino = [
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1]
    ];
    const iTetromino = [
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3],
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3]
    ];
    const tetrominoes = [l1Tetromino, l2Tetromino, z1Tetromino, z2Tetromino, tTetromino, oTetromino, iTetromino];

    let currentPosition = 4;
    let currentRotation = 0;
    //Select a random tetromino and its first rotation
    let random = nextRandom
    nextRandom = Math.floor(Math.random()*tetrominoes.length);
    let current = tetrominoes[random][currentRotation];

    //draw the tetromino
    function draw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.add('tetromino');
        })
    }
    // draw();

    //undraw the tetromino
    function undraw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.remove('tetromino');
        })
    }

    // move down function
    function moveDown() {
        undraw();
        displayNextTetromino();
        currentPosition += width;
        draw();
        freeze();
        addScore();
    }
    // freezing the tetromino
    function freeze(){
        if (current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
            current.forEach(index => squares[currentPosition + index].classList.add('taken'));
            // start a new tetromino falling
            random = nextRandom;
            nextRandom = Math.floor(Math.random() * tetrominoes.length);
            currentRotation = 0; // reset rotation
            current = tetrominoes[random][currentRotation];
            currentPosition = 4;
            // check for game over BEFORE drawing
            if (current.some(index => {
                const pos = currentPosition + index;
                // chỉ kiểm tra các ô nằm trong lưới
                return pos >= 0 && squares[pos].classList.contains('taken');
            })) {
                clearInterval(timerId);
                return;
            }
            draw();
            displayNextTetromino();
        }
    }
    function moveLeft() {
        undraw();
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);
        if (!isAtLeftEdge) currentPosition -= 1;
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition += 1;
        }
        draw();
    }

    function moveRight() {
        undraw();
        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1);
        if (!isAtRightEdge) currentPosition += 1;
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition -= 1; //1 step back if it hits the wall
        }
        draw();
    }

    function rotate() {
        undraw();
        currentRotation++;
        if (currentRotation === current.length) {
            currentRotation = 0;
        }
        current = tetrominoes[random][currentRotation];
        draw();
    }
    
    function control(e) {
        if (e.keyCode === 37) {
            moveLeft();
        } else if (e.keyCode === 39) {
            moveRight();
        } else if (e.keyCode === 38) {
            rotate();
        } else if (e.keyCode === 40) {
            moveDown();
        } else if (e.keyCode === 67) { // 'C' key to change tetromino with the holder
            undraw();
            let temp = random
            random = nextRandom; // swap current tetromino with the next one
            nextRandom = temp; // set the next tetromino to the one we just had
            current = tetrominoes[random][0]; // reset to first rotation of new tetromino
            currentPosition = 4; // reset position
            draw();
            displayNextTetromino();
        }
    }
    document.addEventListener('keydown', control);

    //show the next tetromino in the mini-grid display
    const displaySquares = document.querySelectorAll('.mini-grid div');
    const displayWidth = 4;
    let displayIndex = 0;
// [l1Tetromino, l2Tetromino, z1Tetromino, z2Tetromino, tTetromino, oTetromino, iTetromino]
    //The tetrominoes without rotations for the mini-grid
    const upNextTetrominoes = [
        [displayWidth, displayWidth + 1, displayWidth + 2, displayWidth * 2],
        [0, displayWidth, displayWidth + 1, displayWidth + 2],
        [displayWidth + 1, displayWidth + 2, displayWidth * 2, displayWidth * 2 + 1],
        [displayWidth, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 2 + 2],
        [1, displayWidth + 1, displayWidth + 2, displayWidth * 2 + 1],
        [0, 1, displayWidth, displayWidth + 1],
        [displayWidth, displayWidth + 1, displayWidth + 2, displayWidth + 3],
    ]
    // display the upcoming tetromino
    function displayNextTetromino() {
        displaySquares.forEach(square => {
            square.classList.remove('tetromino');
        });
        upNextTetrominoes[nextRandom].forEach(index => {
            displaySquares[displayIndex + index].classList.add('tetromino');
        });
    }

    startBtn.addEventListener('click', () => {
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
        } else {
            draw();
            timerId = setInterval(moveDown, 300);
            displayNextTetromino();
        }
    });

    // add score
    function  addScore() {
        for (let i = 0; i < 199; i += width) {
            const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9]

            if (row.every(index => squares[index].classList.contains('taken'))) {
                score += 10
                scoreDisplay.innerHTML = score
                row.forEach(index => {
                    squares[index].classList.remove('taken')
                    squares[index].classList.remove('tetromino')
                })
                const squaresRemoved = squares.splice(i, width)
                squares = squaresRemoved.concat(squares)
                squares.forEach(cell => grid.appendChild(cell))
            }
        }
    }
});