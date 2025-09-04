document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const statusDisplay = document.querySelector('.status');
    const scoreDisplay = document.querySelector('.score');
    const restartButton = document.getElementById('restart');
    const undoButton = document.getElementById('undo');
    
    let selectedPiece = null;
    let currentPlayer = 'player'; // 'player' or 'computer'
    let playerPieces = 12;
    let computerPieces = 12;
    let moveHistory = [];
    let boardState = [];
    
    // Inicializar o tabuleiro
    function initializeBoard() {
        board.innerHTML = '';
        boardState = [];
        selectedPiece = null;
        currentPlayer = 'player';
        playerPieces = 12;
        computerPieces = 12;
        moveHistory = [];
        updateStatus();
        
        // Criar o tabuleiro 8x8
        for (let row = 0; row < 8; row++) {
            boardState[row] = [];
            for (let col = 0; col < 8; col++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // Adicionar peças nas posições iniciais
                if ((row + col) % 2 !== 0) {
                    if (row < 3) {
                        // Peças do computador (pretas)
                        boardState[row][col] = { type: 'computer', king: false };
                    } else if (row > 4) {
                        // Peças do jogador (vermelhas)
                        boardState[row][col] = { type: 'player', king: false };
                    } else {
                        boardState[row][col] = null;
                    }
                } else {
                    boardState[row][col] = null;
                }
                
                cell.addEventListener('click', () => handleCellClick(row, col));
                board.appendChild(cell);
            }
        }
        
        renderPieces();
    }
    
    // Renderizar as peças no tabuleiro
    function renderPieces() {
        // Limpar todas as peças existentes
        document.querySelectorAll('.piece').forEach(piece => piece.remove());
        
        // Adicionar as peças baseadas no boardState
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = boardState[row][col];
                if (piece) {
                    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
                    const pieceElement = document.createElement('div');
                    pieceElement.classList.add('piece');
                    pieceElement.classList.add(piece.type);
                    if (piece.king) {
                        pieceElement.classList.add('king');
                    }
                    cell.appendChild(pieceElement);
                }
            }
        }
    }
    
    // Manipular clique em uma célula
    function handleCellClick(row, col) {
        if (currentPlayer !== 'player') return;
        
        const clickedPiece = boardState[row][col];
        
        // Se já temos uma peça selecionada, tentar mover
        if (selectedPiece) {
            const [selectedRow, selectedCol] = selectedPiece;
            
            // Verificar se é um movimento válido
            if (isValidMove(selectedRow, selectedCol, row, col)) {
                // Salvar estado atual no histórico
                moveHistory.push(JSON.parse(JSON.stringify(boardState)));
                
                // Mover a peça
                movePiece(selectedRow, selectedCol, row, col);
                
                // Verificar se a peça se tornou uma dama
                checkForKing(row, col);
                
                // Verificar capturas adicionais
                if (Math.abs(row - selectedRow) === 2 && canCapture(row, col)) {
                    // Continua a vez do jogador para captura múltipla
                    selectedPiece = [row, col];
                    highlightValidMoves(row, col);
                } else {
                    // Passar a vez para o computador
                    selectedPiece = null;
                    currentPlayer = 'computer';
                    updateStatus();
                    
                    // Computador faz sua jogada após um breve delay
                    setTimeout(computerMove, 800);
                }
            } else {
                // Se o movimento não é válido, desselecionar ou selecionar outra peça
                if (clickedPiece && clickedPiece.type === 'player') {
                    selectedPiece = [row, col];
                    highlightValidMoves(row, col);
                } else {
                    selectedPiece = null;
                    clearHighlights();
                }
            }
        } else if (clickedPiece && clickedPiece.type === 'player') {
            // Selecionar uma peça do jogador
            selectedPiece = [row, col];
            highlightValidMoves(row, col);
        }
    }
    
    // Verificar se um movimento é válido
    function isValidMove(fromRow, fromCol, toRow, toCol) {
        const piece = boardState[fromRow][fromCol];
        if (!piece) return false;
        
        // Verificar se o destino está vazio
        if (boardState[toRow][toCol] !== null) return false;
        
        // Verificar se é uma casa escura
        if ((toRow + toCol) % 2 === 0) return false;
        
        const rowDiff = toRow - fromRow;
        const colDiff = toCol - fromCol;
        
        // Verificar direção do movimento (para frente ou, se for dama, para trás também)
        if (piece.type === 'player' && !piece.king && rowDiff > 0) return false;
        if (piece.type === 'computer' && !piece.king && rowDiff < 0) return false;
        
        // Movimento normal (uma casa)
        if (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 1) {
            return true;
        }
        
        // Movimento de captura (duas casas)
        if (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 2) {
            const midRow = fromRow + rowDiff / 2;
            const midCol = fromCol + colDiff / 2;
            const midPiece = boardState[midRow][midCol];
            
            if (midPiece && midPiece.type !== piece.type) {
                return true;
            }
        }
        
        return false;
    }
    
    // Mover uma peça
    function movePiece(fromRow, fromCol, toRow, toCol) {
        const piece = boardState[fromRow][fromCol];
        boardState[fromRow][fromCol] = null;
        boardState[toRow][toCol] = piece;
        
        // Verificar se é uma captura
        if (Math.abs(toRow - fromRow) === 2) {
            const midRow = (fromRow + toRow) / 2;
            const midCol = (fromCol + toCol) / 2;
            
            // Remover peça capturada
            boardState[midRow][midCol] = null;
            
            // Atualizar contador de peças
            if (piece.type === 'player') {
                computerPieces--;
            } else {
                playerPieces--;
            }
            
            updateScore();
        }
        
        clearHighlights();
        renderPieces();
        
        // Verificar condições de vitória
        checkGameOver();
    }
    
    // Verificar se uma peça pode capturar
    function canCapture(row, col) {
        const piece = boardState[row][col];
        if (!piece) return false;
        
        const directions = [];
        
        // Definir direções com base no tipo de peça e se é dama
        if (piece.king || piece.type === 'player') {
            directions.push([-2, -2], [-2, 2]);
        }
        if (piece.king || piece.type === 'computer') {
            directions.push([2, -2], [2, 2]);
        }
        
        for (const [dRow, dCol] of directions) {
            const newRow = row + dRow;
            const newCol = col + dCol;
            const midRow = row + dRow / 2;
            const midCol = col + dCol / 2;
            
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                if (boardState[newRow][newCol] === null && 
                    boardState[midRow][midCol] !== null && 
                    boardState[midRow][midCol].type !== piece.type) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    // Destacar movimentos válidos
    function highlightValidMoves(row, col) {
        clearHighlights();
        
        const piece = boardState[row][col];
        if (!piece) return;
        
        const directions = [];
        
        // Adicionar direções com base no tipo de peça
        if (piece.king || piece.type === 'player') {
            directions.push([-1, -1], [-1, 1]);
        }
        if (piece.king || piece.type === 'computer') {
            directions.push([1, -1], [1, 1]);
        }
        
        // Verificar movimentos normais e capturas
        for (const [dRow, dCol] of directions) {
            // Movimento normal
            const newRow = row + dRow;
            const newCol = col + dCol;
            
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                if (boardState[newRow][newCol] === null) {
                    const cell = document.querySelector(`.cell[data-row="${newRow}"][data-col="${newCol}"]`);
                    cell.classList.add('valid-move');
                }
            }
            
            // Movimento de captura
            const captureRow = row + 2 * dRow;
            const captureCol = col + 2 * dCol;
            const midRow = row + dRow;
            const midCol = col + dCol;
            
            if (captureRow >= 0 && captureRow < 8 && captureCol >= 0 && captureCol < 8) {
                if (boardState[captureRow][captureCol] === null && 
                    boardState[midRow][midCol] !== null && 
                    boardState[midRow][midCol].type !== piece.type) {
                    const cell = document.querySelector(`.cell[data-row="${captureRow}"][data-col="${captureCol}"]`);
                    cell.classList.add('valid-move');
                }
            }
        }
        
        // Destacar a peça selecionada
        const selectedCell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        const pieceElement = selectedCell.querySelector('.piece');
        if (pieceElement) {
            pieceElement.classList.add('selected');
        }
    }
    
    // Limpar destaques
    function clearHighlights() {
        document.querySelectorAll('.valid-move').forEach(cell => {
            cell.classList.remove('valid-move');
        });
        document.querySelectorAll('.selected').forEach(piece => {
            piece.classList.remove('selected');
        });
    }
    
    // Verificar se uma peça se tornou dama
    function checkForKing(row, col) {
        const piece = boardState[row][col];
        if (!piece) return;
        
        if ((piece.type === 'player' && row === 0) || 
            (piece.type === 'computer' && row === 7)) {
            piece.king = true;
            renderPieces();
        }
    }
    
    // Jogada do computador
    function computerMove() {
        // Encontrar todas as peças do computador
        const computerPieces = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = boardState[row][col];
                if (piece && piece.type === 'computer') {
                    computerPieces.push([row, col]);
                }
            }
        }
        
        // Verificar capturas primeiro (prioridade)
        for (const [row, col] of computerPieces) {
            const captures = findCaptures(row, col);
            if (captures.length > 0) {
                // Escolher uma captura aleatória
                const randomCapture = captures[Math.floor(Math.random() * captures.length)];
                movePiece(row, col, randomCapture[0], randomCapture[1]);
                checkForKing(randomCapture[0], randomCapture[1]);
                
                // Verificar capturas múltiplas
                if (canCapture(randomCapture[0], randomCapture[1])) {
                    setTimeout(computerMove, 800);
                } else {
                    currentPlayer = 'player';
                    updateStatus();
                }
                return;
            }
        }
        
        // Se não há capturas, fazer um movimento normal
        const possibleMoves = [];
        for (const [row, col] of computerPieces) {
            const moves = findMoves(row, col);
            for (const move of moves) {
                possibleMoves.push({
                    from: [row, col],
                    to: move
                });
            }
        }
        
        if (possibleMoves.length > 0) {
            // Escolher um movimento aleatório
            const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            movePiece(
                randomMove.from[0], 
                randomMove.from[1], 
                randomMove.to[0], 
                randomMove.to[1]
            );
            checkForKing(randomMove.to[0], randomMove.to[1]);
            currentPlayer = 'player';
            updateStatus();
        } else {
            // Sem movimentos possíveis - jogador vence
            statusDisplay.textContent = "Você venceu!";
        }
    }
    
    // Encontrar capturas para uma peça
    function findCaptures(row, col) {
        const piece = boardState[row][col];
        if (!piece) return [];
        
        const captures = [];
        const directions = [];
        
        // Definir direções com base no tipo de peça
        if (piece.king || piece.type === 'computer') {
            directions.push([2, -2], [2, 2]);
        }
        if (piece.king || piece.type === 'player') {
            directions.push([-2, -2], [-2, 2]);
        }
        
        for (const [dRow, dCol] of directions) {
            const newRow = row + dRow;
            const newCol = col + dCol;
            const midRow = row + dRow / 2;
            const midCol = col + dCol / 2;
            
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                if (boardState[newRow][newCol] === null && 
                    boardState[midRow][midCol] !== null && 
                    boardState[midRow][midCol].type !== piece.type) {
                    captures.push([newRow, newCol]);
                }
            }
        }
        
        return captures;
    }
    
    // Encontrar movimentos para uma peça
    function findMoves(row, col) {
        const piece = boardState[row][col];
        if (!piece) return [];
        
        const moves = [];
        const directions = [];
        
        // Definir direções com base no tipo de peça
        if (piece.king || piece.type === 'computer') {
            directions.push([1, -1], [1, 1]);
        }
        if (piece.king || piece.type === 'player') {
            directions.push([-1, -1], [-1, 1]);
        }
        
        for (const [dRow, dCol] of directions) {
            const newRow = row + dRow;
            const newCol = col + dCol;
            
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                if (boardState[newRow][newCol] === null) {
                    moves.push([newRow, newCol]);
                }
            }
        }
        
        return moves;
    }
    
    // Verificar se o jogo acabou
    function checkGameOver() {
        if (playerPieces === 0) {
            statusDisplay.textContent = "Computador venceu!";
            currentPlayer = '';
            return true;
        }
        
        if (computerPieces === 0) {
            statusDisplay.textContent = "Você venceu!";
            currentPlayer = '';
            return true;
        }
        
        // Verificar se o jogador atual tem movimentos válidos
        let hasValidMoves = false;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = boardState[row][col];
                if (piece && piece.type === currentPlayer) {
                    if (findCaptures(row, col).length > 0 || findMoves(row, col).length > 0) {
                        hasValidMoves = true;
                        break;
                    }
                }
            }
            if (hasValidMoves) break;
        }
        
        if (!hasValidMoves) {
            if (currentPlayer === 'player') {
                statusDisplay.textContent = "Computador venceu!";
            } else {
                statusDisplay.textContent = "Você venceu!";
            }
            currentPlayer = '';
            return true;
        }
        
        return false;
    }
    
    // Atualizar o placar
    function updateScore() {
        scoreDisplay.textContent = `Você: ${playerPieces} | Computador: ${computerPieces}`;
    }
    
    // Atualizar o status do jogo
    function updateStatus() {
        if (currentPlayer === 'player') {
            statusDisplay.textContent = "Sua vez!";
        } else if (currentPlayer === 'computer') {
            statusDisplay.textContent = "Vez do computador...";
        }
    }
    
    // Desfazer a última jogada
    function undoMove() {
        if (moveHistory.length > 0) {
            boardState = moveHistory.pop();
            renderPieces();
            
            // Alternar para o jogador anterior
            currentPlayer = currentPlayer === 'player' ? 'computer' : 'player';
            updateStatus();
            
            // Recalcular contagem de peças
            playerPieces = 0;
            computerPieces = 0;
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    const piece = boardState[row][col];
                    if (piece) {
                        if (piece.type === 'player') {
                            playerPieces++;
                        } else {
                            computerPieces++;
                        }
                    }
                }
            }
            updateScore();
        }
    }
    
    // Event listeners
    restartButton.addEventListener('click', initializeBoard);
    undoButton.addEventListener('click', undoMove);
    
    // Inicializar o jogo
    initializeBoard();
});