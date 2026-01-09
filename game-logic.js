/**
 * A Cell represents one 'square' on the board
 * A Cell's value can have three possibilities
 * X: Player one's token
 * O: Player two's token
 * '': No token in the square
 */

const Cell = () => {
    let value = '';

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
    return { getToken, addToken, getIndices, setIndices };
}

/**
 * The Gameboard represents the state of the board
 * Each square holds a Cell
 * GameBoard is an IIFE so everything inside it executes immediately which gives us an immediate object
 * containing three methods:
 * resetGameBoard(): Returns nothing but allows us to generate a new board
 * resetGameBoard() doesn't return anything. It resets the board and state on call
 * addPlayerToken(): Allows us to add tokens to the board
 * getBoardSnapShot(): For UI. We send a snapshot of the board
 * This protects the actual board from being exposed
 * While allowing us to render a copy of the board to the UI
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

        if (row < 0 || row >= boardRows || column < 0 || column >= boardColumns) {
            return false;
        }

        const cell = board[row][column];

        if (cell.getToken() !== '') {
            return false;
        }

        cell.addToken(playerToken);
        return true;
    }

    // Prints a copy of the board
    const getBoardSnapShot = () => {
        const boardSnapshot = board.map(boardRow => boardRow.map(cell => cell.getToken()));
        console.table(boardSnapshot);
        return boardSnapshot;
    }

    return { resetGameBoard, addPlayerToken, getBoardSnapShot };
})();

const GameController = () => { }

const DisplayController = () => { }