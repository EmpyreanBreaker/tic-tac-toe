/**
 * A Cell represents one 'square' on the board
 * A Cell's token can have three possibilities
 * X: Player one's token
 * O: Player two's token
 *  : Null
 */
const Cell = () => {

    // Holds token values for the game board
    let token = null;

    // Helper variables to help with game logic
    // With this we can enable winning condition checks
    let cellRowIndex = 0;
    let cellColumnIndex = 0;

    //Getter: Return the token value held in the cell
    const getToken = () => token;

    // Setter: Accept's a player's token to change the value of the cell
    const addToken = (playerToken) => token = playerToken;

    // Getter: Return the index values of the cell
    const getIndices = () => ({ cellRowIndex, cellColumnIndex })

    // Setter: Set the index values of the cell in an object
    const setIndices = (row, col) => {
        cellRowIndex = row;
        cellColumnIndex = col;
    }

    // Use closure to interact with local variables
    return { addToken, getIndices, setIndices, getToken };
}

/**
 * The Gameboard represents the state of the board
 * Each square holds a Cell
 * GameBoard is an IIFE so everything inside it executes immediately which gives us an immediate object
 * containing Gameboard methods:
 */
const GameBoard = (() => {
    // We begin with an empty game board
    const boardRows = 3;
    const boardColumns = 3;
    const board = [];

    // Creates a new board
    const resetGameBoard = () => {
        // Empty the current content of board first for a fresh game state
        board.length = 0;
        // Populate the board with Cells
        for (let row = 0; row < boardRows; row++) {
            // Create an empty array inside our array
            board.push([]);
            for (let column = 0; column < boardColumns; column++) {
                const cell = Cell();
                cell.setIndices(row, column);
                board[row].push(cell);
            }
        }
    }

    // Run the function and populate the board
    resetGameBoard();

    // Adds a new token to the board
    const addPlayerToken = (row, column, playerToken) => {

        if (playerToken !== "X" && playerToken !== "O") { return false; }

        if (row < 0 || row >= boardRows || column < 0 || column >= boardColumns) { return false; }

        console.log(row)
        console.log("this column: " + column)
        const cell = board[row][column];

        if (cell.getToken() !== null) { return false; }

        cell.addToken(playerToken);

        return true;
    }

    // Creates a copy of the board and a snapshot of the tokens
    const getBoardSnapShot = () => {
        const boardSnapshot = board.map((boardRow) => boardRow.map((cell) => ({
            cellRowIndex: cell.getIndices().cellRowIndex,
            cellColumnIndex: cell.getIndices().cellColumnIndex,
            token: cell.getToken(),
        })));

        const tokenSnapshot = boardSnapshot.map((boardRow) => boardRow.map((cell) => cell.token));
        return { boardSnapshot, tokenSnapshot }
    };

    // Return Gameboard dimensions
    const getGameBoardDimensions = () => ({
        getBoardRows: () => boardRows,
        getBoardColumns: () => boardColumns
    });

    return { addPlayerToken, getBoardSnapShot, getGameBoardDimensions, resetGameBoard };
})();


/**
 * The GameboardState is a helper function to handle win or draw conditions
 * Each square holds a Cell
 */
const GameBoardState = (() => {

    // Get board dimensions
    const gameBoardDimensions = GameBoard.getGameBoardDimensions();
    const boardRows = gameBoardDimensions.getBoardRows();
    const boardColumns = gameBoardDimensions.getBoardColumns();

    // Check if the board has been won in all directions
    const hasWinnerBoardState = (tokenSnapshot) => {
        // Check for a win condition in the horizontal direction
        for (let i = 0; i < boardRows; i++) {
            let c = 0;
            const t0 = tokenSnapshot[i][c].token;
            const t1 = tokenSnapshot[i][c + 1].token;
            const t2 = tokenSnapshot[i][c + 2].token;

            if (t0 !== null && t0 === t1 && t0 === t2) { return true; }
        }

        // Check for a win condition in the vertical direction
        for (let i = 0; i < boardColumns; i++) {
            let r = 0;
            const t0 = tokenSnapshot[r][i].token;
            const t1 = tokenSnapshot[r + 1][i].token;
            const t2 = tokenSnapshot[r + 2][i].token;

            if (t0 !== null && t0 === t1 && t0 === t2) { return true; }
        }

        // Check for a win condition at the diagonals
        const r = 1;
        const c = 1;
        const middle = tokenSnapshot[r][c].token;
        const topRight = tokenSnapshot[r - 1][c + 1].token;
        const bottomLeft = tokenSnapshot[r + 1][c - 1].token;
        const bottomRight = tokenSnapshot[r + 1][c + 1].token;
        const topLeft = tokenSnapshot[r - 1][c - 1].token;

        // Check bottom left to top right diagonal
        if (middle !== null && middle === bottomLeft && middle === topRight) { return true; }

        // Check bottom right to top left diagonal
        if (middle !== null && middle === bottomRight && middle === topLeft) { return true; }

        return false;
    }

    // Draw state is false if a single cell contains a null value
    // And true if every cell contains a non null value
    const hasDrawnBoardState = (tokenSnapshot) => {
        if (tokenSnapshot.every((boardRow) => boardRow.every((cell) => cell.token !== null))) { return true; }
        return false;
    }

    // 
    const hasViableGameState = (tokenSnapshot) => !(hasWinnerBoardState(tokenSnapshot) || hasDrawnBoardState(tokenSnapshot));

    return { hasDrawnBoardState, hasWinnerBoardState, hasViableGameState };
})();

/* 
** The GameController will be responsible for controlling the 
** flow and state of the game's turns, as well as whether
** anybody has won the game
*/
const GameController = (() => {

    // We start with a viable game board state
    let gameViable = true;

    // Of course our first game isn't drawn
    let gameDrawn = false;

    let validPlacement = true;

    // Players are also going to be stored in objects
    const playerOneName = "Player One";
    const playerTwoName = "Player Two";

    const players = [
        {
            name: playerOneName,
            token: "X",
            winner: false
        },
        {
            name: playerTwoName,
            token: "O",
            winner: false
        },
    ]

    // Getter to get the active player
    const getActivePlayer = () => { return activePlayer };

    // Change active player - used when switching turns
    const changeActivePlayer = () => activePlayer === players[0] ? activePlayer = players[1] : activePlayer = players[0];

    const getAllPlayerStatus = () => ({ playerOneStatus: players[0].winner, playerTwoStatus: players[1].winner });

    const resetPlayerStatus = () => players.forEach(player => player.winner = false);

    const getGameDrawnStatus = () => gameDrawn;

    const setDrawnStatus = () => gameDrawn = false;

    const getValidPlacement = () => validPlacement;

    // As usual player one will be the active player
    let activePlayer = players[0];

    // Temporary function for testing
    const printRound = () => {
        // Print the board
        console.table(GameBoard.getBoardSnapShot().tokenSnapshot);
        // Print player's turn
        console.log(`It is ${getActivePlayer().name}'s turn.`)
    }

    const playRound = (playerRow, playerColumn) => {

        if (gameViable) {
            // Add active player's token to the board
            const tokenAdded = GameBoard.addPlayerToken(playerRow, playerColumn, getActivePlayer().token);

            // If token added then check win and draw conditions
            if (tokenAdded) {

                validPlacement = true;

                const tokenSnapshot = GameBoard.getBoardSnapShot().boardSnapshot;

                let gameWon = GameBoardState.hasWinnerBoardState(tokenSnapshot);

                if (!gameWon) {
                    // Check for a draw state
                    gameDrawn = GameBoardState.hasDrawnBoardState(tokenSnapshot);

                    if (!gameDrawn) {
                        // Switch the current player and start a new round if token added and game still viable
                        console.log(`Dropping ${getActivePlayer().name}'s token into row ${playerRow} and column ${playerColumn}`);
                        changeActivePlayer();
                        printRound();
                    }
                }
                else {
                    // Placeholder
                    console.log("GAME OVER - GAMEWON")
                    console.table(GameBoard.getBoardSnapShot().tokenSnapshot);
                    getActivePlayer().winner = true;
                }
                gameViable = GameBoardState.hasViableGameState(tokenSnapshot);
            }
            else {
                // Since the token addition fail, return the current player's turn and redo the round
                validPlacement = false;
                printRound();
            }
        }
        else {
            console.log("REJECTED - GAME STATE NOT VIABLE")
            console.table(GameBoard.getBoardSnapShot().tokenSnapshot);
            return;
        }
    }

    const startNewGame = () => {
        console.log("RESETTING IT ALL!!!!!!");
        // Reset the board and input new cells
        GameBoard.resetGameBoard();
        // Reset viable state to true
        gameViable = true;
        // Reset draw state to false
        setDrawnStatus();
        // Reset winner state to false
        resetPlayerStatus();
        // As usual player one will be the active player
        activePlayer = players[0];
    }

    // Init function to start the game
    // Final version must not be an IIFE
    // Since it returns undefined we can just cut out the middleman and use printRound()
    // Fine for testing purposes
    const init = (() => { printRound() })();

    return { init, playRound, getActivePlayer, getAllPlayerStatus, getGameDrawnStatus, getValidPlacement, startNewGame, }
})();

const DisplayController = (() => {
    // Grab the elements from index.html that we need
    const gameUI = document.querySelector(".game__main");
    const gameStatus = document.querySelector(".game__status");
    const playerOneStatus = document.querySelector(".game__player-x-status");
    const playerTwoStatus = document.querySelector(".game__player-o-status");
    const gameBarButton = document.querySelector(".game__reset-button");

    const updateGameScreen = () => {
        // Clear the board
        gameUI.textContent = "";

        // Get the newest version of the board and player turn
        const board = GameBoard.getBoardSnapShot().boardSnapshot;

        // Display player's turn
        /**TODO */

        //Render the board
        board.forEach((boardRow) => boardRow.forEach((cell) => {
            // Create the button
            const cellButton = document.createElement("button");

            // Build the button
            cellButton.classList.add("game__main-cell");
            cellButton.textContent = cell.token ?? "";
            cellButton.setAttribute("data-cell-row-index", cell.cellRowIndex);
            cellButton.setAttribute("data-cell-column-index", cell.cellColumnIndex);

            // Append the button
            gameUI.append(cellButton);
        }))

        updatePlayerBoards();
        updateGameStatus();
    }

    const updatePlayerBoards = () => {
        // Display play conditions
        if (GameController.getActivePlayer().token === 'X') {
            playerOneStatus.textContent = `${GameController.getActivePlayer().name}'s turn.`
            playerTwoStatus.textContent = "";
        }
        else {
            playerTwoStatus.textContent = `${GameController.getActivePlayer().name}'s turn.`;
            playerOneStatus.textContent = "";
        }
    }

    const updateGameStatus = () => {
        // Display Win Or Draw conditions
        const playerStatus = GameController.getAllPlayerStatus();

        const validStatus = GameController.getValidPlacement();

        let gameDrawn = GameController.getGameDrawnStatus();

        if (gameDrawn) {
            gameStatus.textContent = `GAMEOVER - DRAW`
            playerOneStatus.textContent = "";
            playerTwoStatus.textContent = "";
            gameBarButton.hidden = false;
            return;
        }

        if (playerStatus.playerOneStatus === true && playerStatus.playerTwoStatus === false) {
            gameStatus.textContent = `Player One Wins`
            playerOneStatus.textContent = "";
            gameBarButton.hidden = false;
            return;
        }

        if (playerStatus.playerOneStatus === false && playerStatus.playerTwoStatus === true) {
            gameStatus.textContent = `Player Two Wins`
            playerTwoStatus.textContent = "";
            gameBarButton.hidden = false;
            return;
        }

        if (!validStatus && !gameDrawn && playerStatus.playerOneStatus === false && playerStatus.playerTwoStatus === false) {
            gameStatus.textContent = `INVALID PLACEMENT - PLEASE TRY AGAIN`;
        }
        else {
            gameStatus.textContent = "Welcome, Please Enter Your Usernames!"
        }
    }

    // Initial Render
    updateGameScreen();

    // Add event listener for the board
    gameUI.addEventListener("click", (e) => {
        const cell = e.target.closest(".game__main-cell");
        if (!cell) return;

        const row = Number(cell.dataset.cellRowIndex);
        const col = Number(cell.dataset.cellColumnIndex);

        console.log(row);

        GameController.playRound(row, col);

        updateGameScreen();
    });

    // Reset the game
    gameBarButton.addEventListener("click", (e) => {
        GameController.startNewGame();
        updateGameScreen();
    });
})();