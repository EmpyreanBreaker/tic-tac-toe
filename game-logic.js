/**
 * A Cell represents one 'square' on the board
 * A Cell's value can have three possibilities
 * X: Player one's token
 * O: Player two's token
 * []: No token in the square
 */

const Cell = () => {
    let value = "";

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
    const getIndices = () => ({ colIndex: colIndex, rowIndex: rowIndex })

    // Setter: Set the index values of the cell in an object
    const setIndices = (row, col) => {
        rowIndex = row;
        colIndex = col;
    }

    // Use closure to interact with local variables
    return {
        getToken: getToken,
        addToken: addToken,
        getIndices: getIndices,
        setIndices: setIndices,
    }
}