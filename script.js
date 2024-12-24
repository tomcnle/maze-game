const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playerNameInput = document.getElementById('playerName');
const startButton = document.getElementById('startButton');

// Timer setup
let timeRemaining = 30; // Time in seconds
let timerInterval = null;

// Grid setup
const gridSize = 20; // Smaller grid size for larger maze
const rows = canvas.height / gridSize;
const cols = canvas.width / gridSize;

// Player and goal positions
let player = { x: 0, y: 0 };
let goal = { x: cols - 1, y: rows - 1 }; // Default goal placement

// Maze grid
let maze = [];

// Directions for movement
const directions = [
    { x: 0, y: -1 }, // Up
    { x: 0, y: 1 },  // Down
    { x: -1, y: 0 }, // Left
    { x: 1, y: 0 }   // Right
];

let playerName = ''; // Store the player's name

// Create an empty grid
function createEmptyMaze() {
    maze = Array.from({ length: rows }, () => Array(cols).fill(true)); // True = Wall
}

// Recursive Backtracking Algorithm
function generateMaze(x, y) {
    maze[y][x] = false; // Mark this cell as a passage

    // Shuffle directions for randomness
    const shuffledDirections = directions.sort(() => Math.random() - 0.5);

    for (const { x: dx, y: dy } of shuffledDirections) {
        const nx = x + dx * 2;
        const ny = y + dy * 2;

        if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && maze[ny][nx]) {
            // Knock down the wall between current cell and next cell
            maze[y + dy][x + dx] = false;
            generateMaze(nx, ny); // Recurse into the next cell
        }
    }
}

// Flood-Fill Algorithm for Reachability Check
function isGoalReachable() {
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    const queue = [{ x: player.x, y: player.y }];
    visited[player.y][player.x] = true;

    while (queue.length > 0) {
        const { x, y } = queue.shift();

        if (x === goal.x && y === goal.y) return true; // Found the goal

        for (const { x: dx, y: dy } of directions) {
            const nx = x + dx;
            const ny = y + dy;

            if (
                nx >= 0 &&
                nx < cols &&
                ny >= 0 &&
                ny < rows &&
                !maze[ny][nx] && // Must be a path
                !visited[ny][nx]
            ) {
                visited[ny][nx] = true;
                queue.push({ x: nx, y: ny });
            }
        }
    }

    return false; // No path found to the goal
}

// Ensure the goal is reachable
function ensureReachableMaze() {
    createEmptyMaze();
    generateMaze(0, 0); // Generate the maze

    // Keep regenerating until the goal is reachable
    do {
        goal = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) };
    } while (maze[goal.y][goal.x] || !isGoalReachable());
}

// Draw the maze
function drawMaze() {
    ctx.fillStyle = '#000'; // Wall color
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (maze[y][x]) {
                ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
            }
        }
    }
}

// Draw the player
function drawPlayer() {
    ctx.fillStyle = 'blue'; // Player color
    ctx.fillRect(player.x * gridSize, player.y * gridSize, gridSize, gridSize);
}

// Draw the goal
function drawGoal() {
    ctx.fillStyle = 'green'; // Goal color
    ctx.fillRect(goal.x * gridSize, goal.y * gridSize, gridSize, gridSize);
}

function checkWin() {
    if (player.x === goal.x && player.y === goal.y) {
        const winMessage = specialWinMessages[playerName]
            ? specialWinMessages[playerName] // Customized message for special names
            : `Congratulations, ${playerName}! You Win!`; // Generic message

        document.getElementById('gameMessage').textContent = winMessage;
        clearInterval(timerInterval); // Stop the timer
        document.removeEventListener('keydown', movePlayer);
        disableButtons(); // Disable on-screen buttons
    }
}

// Move the player
function movePlayer(e) {
    const newPlayer = { ...player };
    if (e.key === 'ArrowUp') newPlayer.y -= 1;
    if (e.key === 'ArrowDown') newPlayer.y += 1;
    if (e.key === 'ArrowLeft') newPlayer.x -= 1;
    if (e.key === 'ArrowRight') newPlayer.x += 1;

    // Check if the new position is valid
    if (
        newPlayer.x >= 0 &&
        newPlayer.x < cols &&
        newPlayer.y >= 0 &&
        newPlayer.y < rows &&
        !maze[newPlayer.y][newPlayer.x]
    ) {
        player = newPlayer;
    }

    updateCanvas();
    checkWin();
}

// Update the canvas
function updateCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMaze();
    drawPlayer();
    drawGoal();
}

// Update the timer display
function updateTimer() {
    const timerElement = document.getElementById('timer');
    timerElement.textContent = `Time Remaining: ${timeRemaining} seconds`;

    if (timeRemaining <= 0) {
        clearInterval(timerInterval); // Stop the timer
        document.getElementById('gameMessage').textContent = `Time’s Up, ${playerName}. You Lose! Try Again.`;
        document.removeEventListener('keydown', movePlayer); // Disable keyboard controls
        disableButtons(); // Disable on-screen buttons
    }

    timeRemaining -= 1;
}

// Enable and disable buttons
const moveUp = () => handleButtonPress('up');
const moveDown = () => handleButtonPress('down');
const moveLeft = () => handleButtonPress('left');
const moveRight = () => handleButtonPress('right');

function enableButtons() {
    document.getElementById('upButton').addEventListener('click', moveUp);
    document.getElementById('downButton').addEventListener('click', moveDown);
    document.getElementById('leftButton').addEventListener('click', moveLeft);
    document.getElementById('rightButton').addEventListener('click', moveRight);
}

function disableButtons() {
    document.getElementById('upButton').removeEventListener('click', moveUp);
    document.getElementById('downButton').removeEventListener('click', moveDown);
    document.getElementById('leftButton').removeEventListener('click', moveLeft);
    document.getElementById('rightButton').removeEventListener('click', moveRight);
}

// Initialize the game
function init() {
    document.getElementById('gameMessage').textContent = '';
    player = { x: 0, y: 0 }; // Reset player position
    timeRemaining = 30; // Reset timer

    ensureReachableMaze(); // Generate a maze and ensure it's solvable
    updateCanvas();

    // Start the timer
    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);

    document.addEventListener('keydown', movePlayer);
    enableButtons(); // Enable on-screen buttons
}

const gameTitle = document.getElementById('gameTitle'); // Get the H1 element

const specialWinMessages = {
    "Joe": "You've won a Ben & Jerry's icecream! Collect your prize from Mum and Dad",
    "Artie": "You've won a Ben & Jerry's icecream! Collect your prize from Mum and Dad",
    "Hugh": "You've won a Ben & Jerry's icecream! Collect your prize from Mum and Dad",
    "Tully": "You've won $20 v-bucks! Collect your prize from Mum and Dad",
    "Ollie": "You've won an age-appropriate treat! Collect your prize from Mum and Dad",
    "Orla": "You've won a Ben & Jerry's icecream! Collect your prize from Mum and Dad",
    "Riley": "You've won a Ben & Jerry's icecream! Collect your prize from Mum and Dad",
};

// Start the game when the button is clicked
startButton.addEventListener('click', () => {
    playerName = playerNameInput.value.trim() || 'Player'; // Default to 'Player' if no name is entered
    document.title = `${playerName}'s Maze`; // Change the browser tab title
    gameTitle.textContent = `${playerName}'s Maze`; // Change the H1 title on the page
    init();
});

// Function to handle movement based on button presses
function handleButtonPress(direction) {
    const newPlayer = { ...player };
    if (direction === 'up') newPlayer.y -= 1;
    if (direction === 'down') newPlayer.y += 1;
    if (direction === 'left') newPlayer.x -= 1;
    if (direction === 'right') newPlayer.x += 1;

    // Check if the new position is valid
    if (
        newPlayer.x >= 0 &&
        newPlayer.x < cols &&
        newPlayer.y >= 0 &&
        newPlayer.y < rows &&
        !maze[newPlayer.y][newPlayer.x]
    ) {
        player = newPlayer;
    }

    updateCanvas();
    checkWin();
}
