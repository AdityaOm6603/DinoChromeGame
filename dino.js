let board;
let boardWidth = 800;
let boardHeight = 300;
let context;

// dino code
let dinoWidth = 82;
let dinoHeight = 77;
let dinoCrouchHeight = 34; // height when dino is crouching
let dinoX = 40;
let dinoY = boardHeight - dinoHeight;
let dinoImg;
let dinoDuck1Img;
let dinoDuck2Img;
let dinoCrouching = false; // track crouching state

// js object
let dino = {
    x: dinoX,
    y: dinoY,
    width: dinoWidth,
    height: dinoHeight
}

// cactus
let catcArray = [];
let catc1Width = 30;
let catc2Width = 60;
let catc3Width = 94;
let catcHeight = 66;
let catcX = 660;
let catcY = boardHeight - catcHeight;

let catc1Img;
let catc2Img;
let catc3Img;

// clouds
let cloudArray = [];
let cloudWidth = 95;
let cloudHeight = 46;
let cloudY = 45;
let cloudImg;

// birds
let birdArray = [];
let birdWidth = 80;
let birdHeight = 40;
let birdY = [93, 148]; // two different heights for birds
let bird1Img;
let bird2Img;
let birdFrame = 0; // track bird animation frame

// gamePhysics
let velocityX = -6;
let velBird = -8;
let velocityY = 0;
let gravity = 0.4;

let gameOver = false;
let score = 0;
let gameOverImg;
let trackImg;
let resetImg;
let resetWidth = 90;
let resetHeight = 48;

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;

    context = board.getContext("2d");

    // Load images
    dinoImg = new Image();
    dinoImg.src = "./img dino/dino.png";

    dinoDuck1Img = new Image();
    dinoDuck1Img.src = "./img dino/dino-duck1.png";

    dinoDuck2Img = new Image();
    dinoDuck2Img.src = "./img dino/dino-duck2.png";

    catc1Img = new Image();
    catc1Img.src = "./img dino/cactus1.png";

    catc2Img = new Image();
    catc2Img.src = "./img dino/cactus2.png";

    catc3Img = new Image();
    catc3Img.src = "./img dino/cactus3.png";

    cloudImg = new Image();
    cloudImg.src = "./img dino/cloud.png";

    bird1Img = new Image();
    bird1Img.src = "./img dino/bird1.png";

    bird2Img = new Image();
    bird2Img.src = "./img dino/bird2.png";

    gameOverImg = new Image();
    gameOverImg.src = "./img dino/game-over.png";

    trackImg = new Image();
    trackImg.src = "./img dino/track.png";

    resetImg = new Image();
    resetImg.src = "./img dino/reset.png";

    resetImg.onload = function() {
        // Add click event listener to the canvas
        board.addEventListener("click", handleClick);
    };

    requestAnimationFrame(update);
    setInterval(placeCactus, 1000);
    setInterval(placeCloud, 2000);
    setInterval(placeBird, 10000);
    document.addEventListener("keydown", moveDino);
    document.addEventListener("keyup", stopCrouch);
}

function update() {
    if (gameOver) {
        context.clearRect(0, 0, board.width, board.height);
        context.drawImage(trackImg, 0, boardHeight - trackImg.height, boardWidth, trackImg.height);
        context.drawImage(gameOverImg, boardWidth / 2 - gameOverImg.width / 2, boardHeight / 2 - gameOverImg.height / 2);

        // Draw the score
        context.fillStyle = "black";
        context.font = "30px courier";
        context.textAlign = "center";
        context.fillText("Final Score: " + score, boardWidth / 2, boardHeight / 2 + gameOverImg.height / 2 + 80);

        // Draw the reset button
        context.drawImage(resetImg, boardWidth / 2 - resetWidth / 2, boardHeight / 2 + gameOverImg.height / 2 + 20, resetWidth, resetHeight);
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    // Draw the track image
    context.drawImage(trackImg, 0, boardHeight - trackImg.height, boardWidth, trackImg.height);

    // Apply gravity
    velocityY += gravity;
    dino.y = Math.min(dino.y + velocityY, dinoY);

    // Draw the dino
    if (dinoCrouching) {
        context.drawImage(birdFrame % 2 === 0 ? dinoDuck1Img : dinoDuck2Img, dino.x, dino.y + dinoHeight - dinoCrouchHeight, dino.width, dinoCrouchHeight);
    } else {
        context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
    }

    // Draw cacti
    for (let i = 0; i < catcArray.length; i++) {
        let cactus = catcArray[i];
        cactus.x += velocityX;
        context.drawImage(cactus.img, cactus.x, cactus.y, cactus.width, cactus.height);

        if (detectCollision(dino, cactus)) {
            gameOver = true;
            dinoImg.src = "./img dino/dino-dead.png";
            dinoImg.onload = function () {
                context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
            }
        }
    }

    // Draw clouds
    for (let i = 0; i < cloudArray.length; i++) {
        let cloud = cloudArray[i];
        cloud.x += velocityX / 2; // clouds move slower
        context.drawImage(cloud.img, cloud.x, cloud.y, cloud.width, cloud.height);
    }

    // Draw birds
    for (let i = 0; i < birdArray.length; i++) {
        let bird = birdArray[i];
        bird.x += velBird;
        context.drawImage(birdFrame % 2 === 0 ? bird1Img : bird2Img, bird.x, bird.y, bird.width, bird.height);

        if (detectCollision(dino, bird)) {
            gameOver = true;
            dinoImg.src = "./img dino/dino-dead.png";
            dinoImg.onload = function () {
                context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
            }
        }
    }

    birdFrame++; // update bird animation frame

    // Score
    context.fillStyle = "black";
    context.font = "20px courier";
    score++;
    context.fillText(score, 5, 20);

    requestAnimationFrame(update);
}

function moveDino(e) {
    if (gameOver) {
        return;
    }
    if ((e.code == "Space" || e.code == "ArrowUp") && dino.y == dinoY) {
        // Jump
        velocityY = -10;
    } else if (e.code == "ArrowDown") {
        // Crouch
        dinoCrouching = true;
        dino.height = dinoCrouchHeight;
    }
}

function stopCrouch(e) {
    if (e.code == "ArrowDown") {
        dinoCrouching = false;
        dino.height = dinoHeight;
    }
}

function placeCactus() {
    if (gameOver) {
        return;
    }

    let cactus = {
        img: null,
        x: catcX,
        y: catcY,
        width: null,
        height: catcHeight
    }

    let placeCactusChance = Math.random();

    if (placeCactusChance > .90) {
        cactus.img = catc3Img;
        cactus.width = catc3Width;
        catcArray.push(cactus);
    } else if (placeCactusChance > .70) {
        cactus.img = catc2Img;
        cactus.width = catc2Width;
        catcArray.push(cactus);
    } else if (placeCactusChance > .50) {
        cactus.img = catc1Img;
        cactus.width = catc1Width;
        catcArray.push(cactus);
    }

    if (catcArray.length > 5) {
        catcArray.shift();
    }
}

function placeCloud() {
    if (gameOver) {
        return;
    }

    let cloud = {
        img: cloudImg,
        x: boardWidth,
        y: cloudY + Math.random() * 100, // randomize cloud height a bit
        width: cloudWidth,
        height: cloudHeight
    }

    cloudArray.push(cloud);

    if (cloudArray.length > 5) {
        cloudArray.shift();
    }
}

function placeBird() {
    if (gameOver) {
        return;
    }

    let bird = {
        img: null,
        x: boardWidth,
        y: birdY[Math.floor(Math.random() * birdY.length)],
        width: birdWidth,
        height: birdHeight
    }

    birdArray.push(bird);

    if (birdArray.length > 3) {
        birdArray.shift();
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}

function handleClick(e) {
    if (gameOver) {
        let rect = board.getBoundingClientRect();
        let mouseX = e.clientX - rect.left;
        let mouseY = e.clientY - rect.top;

        // Check if the click is within the reset button bounds
        if (mouseX >= boardWidth / 2 - resetWidth / 2 &&
            mouseX <= boardWidth / 2 + resetWidth / 2 &&
            mouseY >= boardHeight / 2 + gameOverImg.height / 2 + 20 &&
            mouseY <= boardHeight / 2 + gameOverImg.height / 2 + 20 + resetHeight) {

            // Reset the game
            resetGame();
        }
    }
}

function resetGame() {
    gameOver = false;
    score = 0;
    dino.x = dinoX;
    dino.y = dinoY;
    dino.width = dinoWidth;
    dino.height = dinoHeight;
    velocityX = -8;
    velBird = -5;
    velocityY = 0;
    gravity = 0.4;
    catcArray = [];
    cloudArray = [];
    birdArray = [];
    requestAnimationFrame(update);
}
