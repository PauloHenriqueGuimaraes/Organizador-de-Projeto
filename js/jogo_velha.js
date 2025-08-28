 // Variáveis do jogo
 let currentPlayer = 'X';
 let gameState = ['', '', '', '', '', '', '', '', ''];
 let gameActive = false;
 let gameMode = '';
 let difficulty = 'medium';
 let scores = {
     X: 0,
     O: 0,
     draw: 0
 };
 
 // Elementos do DOM
 const currentPlayerElement = document.getElementById('current-player');
 const messageElement = document.getElementById('message');
 const scoreXElement = document.getElementById('score-x');
 const scoreOElement = document.getElementById('score-o');
 const playerXElement = document.getElementById('player-x');
 const playerOElement = document.getElementById('player-o');
 const difficultySelector = document.getElementById('difficulty-selector');
 
 // Condições de vitória (índices das células)
 const winningConditions = [
     [0, 1, 2], [3, 4, 5], [6, 7, 8], // linhas
     [0, 3, 6], [1, 4, 7], [2, 5, 8], // colunas
     [0, 4, 8], [2, 4, 6]             // diagonais
 ];
 
 // Selecionar modo de jogo
 function selectMode(mode) {
     gameMode = mode;
     
     // Atualizar UI dos botões de modo
     document.querySelectorAll('.mode-btn').forEach(btn => {
         btn.classList.remove('selected');
     });
     
     if (mode === 'vs-computer') {
         document.querySelector('.mode-btn.computer').classList.add('selected');
         difficultySelector.style.display = 'block';
     } else {
         document.querySelector('.mode-btn.player').classList.add('selected');
         difficultySelector.style.display = 'none';
     }
     
     // Iniciar novo jogo
     startNewGame();
 }
 
 // Definir dificuldade
 function setDifficulty(level) {
     difficulty = level;
     
     // Atualizar UI dos botões de dificuldade
     document.querySelectorAll('.difficulty-btn').forEach(btn => {
         btn.classList.remove('selected');
     });
     
     document.querySelector(`.difficulty-btn:nth-child(${
         level === 'easy' ? 1 : level === 'medium' ? 2 : 3
     })`).classList.add('selected');
     
     // Reiniciar jogo se estiver ativo
     if (gameActive) {
         startNewGame();
     }
 }
 
 // Inicializar o jogo
 function initGame() {
     const cells = document.querySelectorAll('.cell');
     cells.forEach(cell => {
         cell.addEventListener('click', handleCellClick);
     });
     
     updatePlayerIndicator();
 }
 
 // Atualizar indicador de jogador atual
 function updatePlayerIndicator() {
     playerXElement.classList.toggle('active', currentPlayer === 'X');
     playerOElement.classList.toggle('active', currentPlayer === 'O');
 }
 
 // Atualizar o placar
 function updateScores() {
     scoreXElement.textContent = scores.X;
     scoreOElement.textContent = scores.O;
 }
 
 // Manipular clique na célula
 function handleCellClick(clickedCellEvent) {
     if (!gameActive || !gameMode) return;
     
     const clickedCell = clickedCellEvent.target;
     const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));
     
     // Verificar se a célula já foi preenchida
     if (gameState[clickedCellIndex] !== '') {
         return;
     }
     
     // Processar o movimento do jogador
     handleCellPlayed(clickedCell, clickedCellIndex);
     
     // Verificar se há vencedor
     if (checkWin()) {
         handleWin();
         return;
     }
     
     // Verificar se há empate
     if (checkDraw()) {
         handleDraw();
         return;
     }
     
     // Mudar jogador
     handlePlayerChange();
     
     // Se for modo contra a máquina e for a vez dela
     if (gameMode === 'vs-computer' && currentPlayer === 'O' && gameActive) {
         // Pequeno delay para parecer mais natural
         setTimeout(makeComputerMove, 600);
     }
 }
 
 // Processar jogada
 function handleCellPlayed(clickedCell, clickedCellIndex) {
     gameState[clickedCellIndex] = currentPlayer;
     clickedCell.textContent = currentPlayer;
     clickedCell.classList.add(currentPlayer.toLowerCase());
 }
 
 // Mudar jogador
 function handlePlayerChange() {
     currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
     updatePlayerIndicator();
 }
 
 // Verificar vitória
 function checkWin() {
     for (let i = 0; i < winningConditions.length; i++) {
         const [a, b, c] = winningConditions[i];
         if (
             gameState[a] !== '' &&
             gameState[a] === gameState[b] &&
             gameState[a] === gameState[c]
         ) {
             return true;
         }
     }
     return false;
 }
 
 // Verificar empate
 function checkDraw() {
     return !gameState.includes('');
 }
 
 // Processar vitória
 function handleWin() {
     gameActive = false;
     messageElement.textContent = `Jogador ${currentPlayer} venceu!`;
     messageElement.classList.add('win');
     
     // Atualizar placar
     scores[currentPlayer]++;
     updateScores();
 }
 
 // Processar empate
 function handleDraw() {
     gameActive = false;
     messageElement.textContent = 'Empate!';
     messageElement.classList.add('draw');
     
     // Atualizar placar
     scores.draw++;
 }
 
 // Movimento do computador
 function makeComputerMove() {
     if (!gameActive) return;
     
     let move = -1;
     
     // Estratégia baseada na dificuldade
     if (difficulty === 'easy') {
         // Movimento aleatório
         move = getRandomMove();
     } else if (difficulty === 'medium') {
         // 50% de chance de bloquear/vencer, 50% de movimento aleatório
         move = Math.random() < 0.5 ? getStrategicMove() : getRandomMove();
     } else {
         // Sempre joga estrategicamente (busca vitória ou bloqueio)
         move = getStrategicMove();
     }
     
     // Fazer o movimento
     if (move !== -1) {
         const cell = document.querySelector(`[data-cell-index="${move}"]`);
         handleCellPlayed(cell, move);
         
         // Verificar se há vencedor
         if (checkWin()) {
             handleWin();
             return;
         }
         
         // Verificar se há empate
         if (checkDraw()) {
             handleDraw();
             return;
         }
         
         // Mudar jogador
         handlePlayerChange();
     }
 }
 
 // Obter movimento aleatório
 function getRandomMove() {
     const availableMoves = [];
     for (let i = 0; i < gameState.length; i++) {
         if (gameState[i] === '') {
             availableMoves.push(i);
         }
     }
     
     if (availableMoves.length === 0) return -1;
     return availableMoves[Math.floor(Math.random() * availableMoves.length)];
 }
 
 // Obter movimento estratégico (tenta vencer ou bloquear)
 function getStrategicMove() {
     // Primeiro, verifica se pode vencer
     for (let i = 0; i < winningConditions.length; i++) {
         const [a, b, c] = winningConditions[i];
         const line = [gameState[a], gameState[b], gameState[c]];
         
         // Verificar se tem duas 'O' e uma vazia (para vencer)
         if (line.filter(cell => cell === 'O').length === 2 && line.includes('')) {
             return line[0] === '' ? a : line[1] === '' ? b : c;
         }
     }
     
     // Depois, verifica se precisa bloquear o jogador
     for (let i = 0; i < winningConditions.length; i++) {
         const [a, b, c] = winningConditions[i];
         const line = [gameState[a], gameState[b], gameState[c]];
         
         // Verificar se tem duas 'X' e uma vazia (para bloquear)
         if (line.filter(cell => cell === 'X').length === 2 && line.includes('')) {
             return line[0] === '' ? a : line[1] === '' ? b : c;
         }
     }
     
     // Se não houver jogadas críticas, joga no centro se disponível
     if (gameState[4] === '') return 4;
     
     // Senão, joga em um canto aleatório
     const corners = [0, 2, 6, 8];
     const availableCorners = corners.filter(index => gameState[index] === '');
     if (availableCorners.length > 0) {
         return availableCorners[Math.floor(Math.random() * availableCorners.length)];
     }
     
     // Por último, movimento aleatório
     return getRandomMove();
 }
 
 // Iniciar novo jogo
 function startNewGame() {
     if (!gameMode) {
         alert('Por favor, selecione um modo de jogo primeiro!');
         return;
     }
     
     gameActive = true;
     currentPlayer = 'X';
     gameState = ['', '', '', '', '', '', '', '', ''];
     
     // Limpar tabuleiro
     document.querySelectorAll('.cell').forEach(cell => {
         cell.textContent = '';
         cell.classList.remove('x', 'o');
     });
     
     // Limpar mensagem
     messageElement.textContent = '';
     messageElement.classList.remove('win', 'draw');
     
     // Atualizar indicador de jogador
     updatePlayerIndicator();
 }
 
 // Zerar placar
 function resetScores() {
     scores.X = 0;
     scores.O = 0;
     scores.draw = 0;
     updateScores();
     startNewGame();
 }
 
 // Inicializar o jogo quando a página carregar
 window.onload = initGame;