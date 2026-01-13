/**
 * A Cell represents one 'square' on the board
 * A Cell's value can have three possibilities
 * X: Player one's token
 * O: Player two's token
 * '': No token in the square
 */
const Cell = () => {
    let value = null;

    /**
     * Helper variables to help with game logic
     * With this we can enable winning condition checks
     */
    let rowIndex = 0;
    let colIndex = 0;

    //Getter: Return the token value held in the cell
    const getToken = () => value;

    // Setter: Accept's a player's token to change the value of the cell
    const addToken = (playerToken) => value = playerToken;

    // Getter: Return the index values of the cell in an object
    const getIndices = () => ({ colIndex, rowIndex })

    // Setter: Set the index values of the cell in an object
    const setIndices = (row, col) => {
        rowIndex = row;
        colIndex = col;
    }

    // Use closure to interact with local variables
    return { addToken, getIndices, setIndices, getToken };
}

/**
 * The Gameboard represents the state of the board
 * Each square holds a Cell
 * GameBoard is an IIFE so everything inside it executes immediately which gives us an immediate object
 * containing three methods:
 * resetGameBoard(): Returns nothing but allows us to generate a new board
 * resetGameBoard() doesn't return anything. It resets the board and state on call
 * addPlayerToken(): Allows us to add tokens to the board
 * getBoardSnapShot(): Creates a copy of the board for UI purposes without exposing the real board
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
        for (let r = 0; r < boardRows; r++) {
            // Create an empty array inside our array
            board.push([]);
            for (let c = 0; c < boardColumns; c++) {
                const cell = Cell();
                cell.setIndices(r, c);
                board[r].push(cell);
            }
        }
    }

    // Run the function and populate the board
    resetGameBoard();

    // Adds a new token to the board
    const addPlayerToken = (row, column, playerToken) => {

        if (playerToken !== "X" && playerToken !== "O") { return false; }

        if (row < 0 || row >= boardRows || column < 0 || column >= boardColumns) { return false; }

        const cell = board[row][column];

        if (cell.getToken() !== null) { return false; }

        cell.addToken(playerToken);

        return true;
    }

    // Creates and returns a copy of the board
    const getBoardSnapShot = () => board.map(boardRow => boardRow.map(cell => cell.getToken()));

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
        // Snapshot doesn't contain cells
        // It contains the values of each cell directly
        // So we can just use the index operators to access the values
        // Check for a win condition in the horizontal direction
        for (let i = 0; i < boardRows; i++) {
            let c = 0;
            const t0 = tokenSnapshot[i][c];
            const t1 = tokenSnapshot[i][c + 1];
            const t2 = tokenSnapshot[i][c + 2];

            if (t0 !== null && t0 === t1 && t0 === t2) { return true; }
        }

        // Check for a win condition in the vertical direction
        for (let i = 0; i < boardColumns; i++) {
            let r = 0;
            const t0 = tokenSnapshot[r][i];
            const t1 = tokenSnapshot[r + 1][i];
            const t2 = tokenSnapshot[r + 2][i];

            if (t0 !== null && t0 === t1 && t0 === t2) { return true; }
        }

        // Check for a win condition at the diagonals
        const r = 1;
        const c = 1;
        const middle = tokenSnapshot[r][c];
        const topRight = tokenSnapshot[r - 1][c + 1];
        const bottomLeft = tokenSnapshot[r + 1][c - 1];
        const bottomRight = tokenSnapshot[r + 1][c + 1];
        const topLeft = tokenSnapshot[r - 1][c - 1];

        // Check bottom left to top right diagonal
        if (middle !== null && middle === bottomLeft && middle === topRight) { return true; }

        // Check bottom right to top left diagonal
        if (middle !== null && middle === bottomRight && middle === topLeft) { return true; }

        return false;
    }

    // Draw state is false if a single cell contains a null value
    // And true if every cell contains a value
    const hasDrawBoardState = (tokenSnapshot) => {
        if (tokenSnapshot.every((row) => row.every((value) => value !== null))) { return true; }
        return false;
    }

    // 
    const hasViableGameState = (tokenSnapshot) => !(hasWinnerBoardState(tokenSnapshot) || hasDrawBoardState(tokenSnapshot));

    return { hasDrawBoardState, hasWinnerBoardState, hasViableGameState };
})();

/* 
** The GameController will be responsible for controlling the 
** flow and state of the game's turns, as well as whether
** anybody has won the game
*/
const GameController = (() => {

    // Players are also going to be stored in objects
    const playerOneName = "Player One";
    const playerTwoName = "Player Two";

    const players = [
        {
            name: playerOneName,
            token: "X"
        },
        {
            name: playerTwoName,
            token: "O"
        },
    ]

    // As usual player one will be the active player
    let activePlayer = players[0];

    // Getter to get the active player
    const getActivePlayer = () => { return activePlayer };

    // Change active player - used when switching turns
    const changeActivePlayer = () => activePlayer === players[0] ? activePlayer = players[1] : activePlayer = players[0];

    // Temporary function for testing
    const printRound = () => {
        // Print the board
        console.table(GameBoard.getBoardSnapShot());
        // Print player's turn
        console.log(`It is ${getActivePlayer().name}'s turn.`)
    }

    // We start with a viable game board state
    let viableGameBoardState = true;

    const playRound = (playerRow, playerColumn) => {

        if (viableGameBoardState) {
            // Add active player's token to the board
            const tokenAdded = GameBoard.addPlayerToken(playerRow, playerColumn, getActivePlayer().token);

            // If token added then check win and draw conditions
            if (tokenAdded) {
                const tokenSnapshot = GameBoard.getBoardSnapShot();

                let gameWon = GameBoardState.hasWinnerBoardState(tokenSnapshot);

                if (!gameWon) {
                    // Check for a draw state
                    let gameDrawn = GameBoardState.hasDrawBoardState(tokenSnapshot);

                    if (!gameDrawn) {
                        // Switch the current player and start a new round if token added and game still viable
                        console.log(`Dropping ${getActivePlayer().name}'s token into row ${playerRow} and column ${playerColumn}`);
                        changeActivePlayer();
                        printRound();
                    }
                    else {
                        // Placeholder
                        console.log("GAME OVER - DRAW")
                        console.table(GameBoard.getBoardSnapShot());
                    }
                }
                else {
                    // Placeholder
                    console.log("GAME OVER - GAMEWON")
                    console.table(GameBoard.getBoardSnapShot());
                }
                viableGameBoardState = GameBoardState.hasViableGameState(tokenSnapshot);
            }
            else {
                // Since the token addition fail, return the current player's turn and redo the round
                printRound();
            }
        }
        else {
            console.log("REJECTED - GAME STATE NOT VIABLE")
            console.table(GameBoard.getBoardSnapShot());
            return;
        }
    }

    // Reset The Board
    // Reset Gamestate
    const startNewGame = () => {
        console.log("RESETTING IT ALL!!!!!!");
        // Reset the board and input new cells
        GameBoard.resetGameBoard();
        // Reset Gameboard state to true
        viableGameBoardState = true;
        // 
    }

    // Init function to start the game
    // Final version must not be an IIFE
    // Since it returns undefined we can just cut out the middleman and use printRound()
    // Fine for testing purposes
    const init = (() => { printRound() })();

    return { init, playRound, startNewGame }
})();

const DisplayController = () => { }