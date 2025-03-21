// -1 is a mine, 0 is nothing, any number greater than 0 is number of mines near it

const board = document.getElementById('board');
const N = 10, M = 10;
const numberOfMines = 11;
let boardArr = [];
let boardState = []
let visited = []
let mines;
let gameOver = false;

// global get elementById

// document.getElementById('board').addEventListener('click', e => {
//     let td = e.target.closest('td[class="cell"]');
//     if (td) {
//         console.log(e.target.id, 'was clicked');
//         let coordinates = e.target.id;
//         let [x, y] = coordinates.split(" ");
//         clickedCell(x, y);
//     }
// });

document.addEventListener('DOMContentLoaded', () => {
    const clickableElement = document.getElementById('board');

    clickableElement.addEventListener('mousedown', (e) => {
        let coordinates = e.target.id;
        if (e.button === 0) {
            console.log('Left mouse button clicked');
            let coordinates = e.target.id;
            let [x, y] = coordinates.split(" ");
            clickedCell(x, y);
        } else if (e.button === 2) {
            console.log('Right mouse button clicked');
            let coordinates;
            if(e.target.id == ""){
                coordinates = e.target.parentElement.id;
            }
            else{
                coordinates = e.target.id;
            }
            let [x, y] = coordinates.split(" ");
            console.log(e);
            console.log("upper " + x + " " + y)
            addFlag(x, y);
        }
    });

    // Prevent the context menu from appearing on right-click
    clickableElement.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
});

// run functions
createBoard();
initializeMines();
printBoard();
initializeNumbers();
printBoard();



function createBoard() {
    // create the integer board of numbers
    for (let i = 0; i < N; i++) {
        boardArr.push(new Array(M));
    }

    for (let i = 0; i < N; i++) {
        for (let j = 0; j < M; j++) {
            boardArr[i][j] = 0;
        }
    }
    // create the baordState which still be displayed on the screen
    for (let i = 0; i < N; i++) {
        boardState.push(new Array(M));
    }

    for (let i = 0; i < N; i++) {
        for (let j = 0; j < M; j++) {
            boardState[i][j] = ' ';
        }
    }
    // create visited 2D array
    for (let i = 0; i < N; i++) {
        visited.push(new Array(M));
    }

    for (let i = 0; i < N; i++) {
        for (let j = 0; j < M; j++) {
            visited[i][j] = false;
        }
    }
    // create the HTML table element
    for (let i = 0; i < N; i++) {
        let tr = document.createElement('tr');
        for (let j = 0; j < M; j++) {
            let td = document.createElement('td');
            let text = document.createTextNode(' ');
            let a = document.createElement("a");
            a.appendChild(text);
            td.appendChild(a);
            td.setAttribute('id', i + " " + j);
            tr.appendChild(td);
            td.style.backgroundColor = getBGColor(i, j, false);
            td.className = 'cell';
        }
        board.appendChild(tr);
    }
}

function updateBoard() {
    // BoardState can have ' ', '_', '*' or '4' 
    // ' ' -> undiscovered
    // '_' -> opened, visited contains nothing
    // '*' -> contains a bomb
    // '4' -> contains a number
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < M; j++) {
            if( boardState[i][j] == '*' ){ // if this is a bomb
                document.getElementById(i + ' ' + j).style.backgroundColor = 'red';
                document.getElementById(i + ' ' + j).firstChild.innerHTML = '*';
            }
            else if( boardState[i][j] == '_' && visited[i][j] ){ // if it is an empty space
                const color = getBGColor(i, j, true);
                document.getElementById(i + ' ' + j).style.backgroundColor = color;
            }
            else if( boardState[i][j] == '|>' && visited[i][j] ){
                const color = getBGColor(i, j, true);
                document.getElementById(i + ' ' + j).style.backgroundColor = 'yellow';
                document.getElementById(i + ' ' + j).firstChild.innerHTML = boardState[i][j];
            }
            else if( boardState[i][j] != ' ' && visited[i][j] ){ // if it is a number
                const color = getBGColor(i, j, true);
                document.getElementById(i + ' ' + j).style.backgroundColor = color;
                document.getElementById(i + ' ' + j).firstChild.innerHTML = boardState[i][j];
            }
            else if( boardState[i][j] == ' ' && !visited[i][j] ){
                const color = getBGColor(i, j, false);
                document.getElementById(i + ' ' + j).style.backgroundColor = color;
                document.getElementById(i + ' ' + j).firstChild.innerHTML = boardState[i][j];
            }
        }
    }
}

function initializeMines() {
    let size = N * M;
    let randomCells = [];

    while (randomCells.length < numberOfMines) {
        let r = Math.floor(Math.random() * size);
        if (randomCells.indexOf(r) === -1) randomCells.push([Math.floor(r / M), r % M]);
    }

    for (let i = 0; i < randomCells.length; i++) {
        boardArr[randomCells[i][0]][randomCells[i][1]] = -1;
    }
    mines = randomCells;

    return randomCells;
}

function initializeNumbers() {

    for (let i = 0; i < N; i++) {
        for (let j = 0; j < M; j++) {
            if (boardArr[i][j] != -1)
                boardArr[i][j] = getNeighbouringBombs(i, j);
        }
    }
}

function getNeighbouringBombs(x, y) {
    let row = [-1, -1, -1, 0, 0, 0, 1, 1, 1];
    let col = [-1, 0, 1, -1, 0, 1, -1, 0, 1];
    let count = 0;

    for (let i = 0; i < row.length; i++) {
        if (isInBoard(x + row[i], y + col[i]) && boardArr[x + row[i]][y + col[i]] == -1) {
            count += 1;
        }
    }
    return count;
}

function clickedCell(x, y) {
    if(gameOver) return; // Stop if the game is over 

    let cellValue = boardArr[x][y];
    if (cellValue == -1) {
        showBombs();
        // gameOver();
        gameOver = true;
        alert("Game Over! you clicked on mine."); // Display a message
        return;
    } else if (cellValue >= 1 && cellValue <= 8) {
        revealCell(x, y);
        return;
    } else {
        revealDFS(x, y);
        return;
    }
}

function revealCell(x, y) {
    // console.log('revealing cell');
    if( boardArr[x][y] == -1 ){
        boardState[x][y] = '*';
    }
    else{
        boardState[x][y] = boardArr[x][y];
        visited[x][y] = true;
    }
    updateBoard();
}

function addFlag(x, y){
    if(gameOver) return;

    if( boardState[x][y] != '|>' && boardState[x][y] != ' ' ){
        return;
    }
    if( boardState[x][y] == '|>' ){
        boardState[x][y] = ' ';
        visited[x][y] = false;
    }
    else{
        boardState[x][y] = '|>';
        visited[x][y] = true;
    }
    updateBoard();
}

// along with 0 also get the bodering numbers
function revealDFS(R, C) {
    // utility array
    let row = [-1, -1, -1, 0, 0, 1, 1, 1];
    let col = [-1, 0, 1, -1, 1, -1, 0, 1];
    // run a dfs function either till you reach the boudary or till you reach the numbers
    let queue = [];
    // type case to a number
    R = Number(R);
    C = Number(C);


    queue.push([R, C]);
    boardState[R][C] = '_';
    visited[R][C] = true;

    while( queue.length > 0 ){
        const [x, y] = queue.shift();

        for(let i=0;i<row.length;i++){
            let newX = x + row[i], newY = y + col[i];
            if( (isInBoard(newX, newY) && !visited[newX][newY] && boardArr[newX][newY] == 0) ||
                (isInBoard(newX, newY) && !visited[newX][newY] && boardArr[x][y] == 0 && boardArr[newX][newY] > 0 ) ){
                queue.push([newX, newY]);
                visited[newX][newY] = true;
                if( boardArr[newX][newY] > 0 ){
                    boardState[newX][newY] = boardArr[newX][newY];
                }
                else{
                    boardState[newX][newY] = '_';
                }
            }
        }
    }
    updateBoard();
    

}

function showBombs(){
    mines.forEach((ele) => {
        boardState[ele[0]][ele[1]] = '*';
    })
    updateBoard();
}

function isInBoard(x, y) {
    return x >= 0 && x < N && y >= 0 && y < M;
}

function getBGColor(r, c, revealed) {
    if( !revealed ){
        if (r % 2 == 0) {
            return c % 2 == 0 ? '#AAD750' : '#A2D148';
        }
        else {
            return c % 2 == 1 ? '#AAD750' : '#A2D148';
        }
    }
    else{
        if (r % 2 == 0) {
            return c % 2 == 0 ? '#E5C29F' : '#D7B899';
        }
        else {
            return c % 2 == 1 ? '#E5C29F' : '#D7B899';
        }
    }
}

function printBoard() {
    for (let i = 0; i < N; i++) {
        let str = "";
        for (let j = 0; j < M; j++) {
            str += boardArr[i][j] + "\t";
        }
        console.log(str);
    }
    console.log("################");
    console.log();

}

function printBoardState() {
    for (let i = 0; i < N; i++) {
        let str = "";
        for (let j = 0; j < M; j++) {
            str += boardState[i][j] + "\t";
        }
        console.log(str);
    }
    console.log("***********");
    console.log();

}


// revealing mode colors
// light: '#E5C29F'
// dark: '#D7B899'

