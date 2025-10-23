 // Elementos da interface
 const tabs = document.querySelectorAll('.tab');
 const tabContents = document.querySelectorAll('.tab-content');
 const drawNumberBtn = document.getElementById('drawNumber');
 const drawNameBtn = document.getElementById('drawName');
 const drawExcelBtn = document.getElementById('drawExcel');
 const resultDiv = document.getElementById('result');
 const historyList = document.getElementById('historyList');
 const clearHistoryBtn = document.getElementById('clearHistory');
 const excelFileInput = document.getElementById('excelFile');
 const columnSelect = document.getElementById('columnSelect');
 const fileInputLabel = document.getElementById('fileInputLabel');
 const successAlert = document.getElementById('successAlert');
 const errorAlert = document.getElementById('errorAlert');
 
 // Histórico de sorteados
 let drawnItems = [];
 
 // Alternar entre abas
 tabs.forEach(tab => {
     tab.addEventListener('click', () => {
         const tabId = tab.getAttribute('data-tab');
         
         // Ativar aba clicada
         tabs.forEach(t => t.classList.remove('active'));
         tab.classList.add('active');
         
         // Mostrar conteúdo correspondente
         tabContents.forEach(content => {
             content.classList.remove('active');
             if (content.id === `${tabId}-tab`) {
                 content.classList.add('active');
             }
         });
     });
 });
 
 // Função para mostrar alertas
 function showAlert(alertElement, message) {
     alertElement.textContent = message;
     alertElement.style.display = 'block';
     setTimeout(() => {
         alertElement.style.display = 'none';
     }, 5000);
 }
 
 // Função para criar efeito de confete
 function createConfetti() {
     const resultCard = document.querySelector('.result-card');
     const colors = ['#6C63FF', '#FF6584', '#4CAF50', '#FF9800', '#9C27B0'];
     
     for (let i = 0; i < 50; i++) {
         const confetti = document.createElement('div');
         confetti.className = 'confetti';
         confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
         confetti.style.left = Math.random() * 100 + '%';
         confetti.style.animation = `confetti-fall ${Math.random() * 3 + 2}s linear forwards`;
         resultCard.appendChild(confetti);
         
         setTimeout(() => {
             confetti.remove();
         }, 5000);
     }
 }
 
 // Sortear números
 drawNumberBtn.addEventListener('click', () => {
     const min = parseInt(document.getElementById('minNumber').value);
     const max = parseInt(document.getElementById('maxNumber').value);
     const quantity = parseInt(document.getElementById('quantity').value);
     
     if (isNaN(min) || isNaN(max) || isNaN(quantity)) {
         showAlert(errorAlert, 'Por favor, preencha todos os campos corretamente.');
         return;
     }
     
     if (min >= max) {
         showAlert(errorAlert, 'O número mínimo deve ser menor que o máximo.');
         return;
     }
     
     if (quantity <= 0) {
         showAlert(errorAlert, 'A quantidade deve ser maior que zero.');
         return;
     }
     
     // Verificar se há números suficientes disponíveis
     const totalNumbers = max - min + 1;
     const availableNumbers = Array.from({length: totalNumbers}, (_, i) => i + min)
         .filter(num => !drawnItems.includes(num.toString()));
     
     if (availableNumbers.length < quantity) {
         showAlert(errorAlert, `Não há números suficientes disponíveis. Apenas ${availableNumbers.length} números restantes.`);
         return;
     }
     
     // Sortear números
     const drawnNumbers = [];
     for (let i = 0; i < quantity; i++) {
         if (availableNumbers.length === 0) break;
         
         const randomIndex = Math.floor(Math.random() * availableNumbers.length);
         const drawnNumber = availableNumbers.splice(randomIndex, 1)[0];
         drawnNumbers.push(drawnNumber);
         drawnItems.push(drawnNumber.toString());
     }
     
     // Exibir resultado
     resultDiv.textContent = drawnNumbers.join(', ');
     
     // Atualizar histórico
     updateHistory();
     
     // Efeito de confete
     createConfetti();
     
     showAlert(successAlert, `Número(s) sorteado(s) com sucesso!`);
 });
 
 // Sortear nomes
 drawNameBtn.addEventListener('click', () => {
     const nameListText = document.getElementById('nameList').value.trim();
     
     if (!nameListText) {
         showAlert(errorAlert, 'Por favor, insira uma lista de nomes.');
         return;
     }
     
     const names = nameListText.split('\n')
         .map(name => name.trim())
         .filter(name => name !== '');
     
     if (names.length === 0) {
         showAlert(errorAlert, 'Nenhum nome válido encontrado na lista.');
         return;
     }
     
     // Filtrar nomes que ainda não foram sorteados
     const availableNames = names.filter(name => !drawnItems.includes(name));
     
     if (availableNames.length === 0) {
         showAlert(errorAlert, 'Todos os nomes já foram sorteados.');
         return;
     }
     
     // Sortear um nome
     const randomIndex = Math.floor(Math.random() * availableNames.length);
     const drawnName = availableNames[randomIndex];
     
     // Adicionar ao histórico
     drawnItems.push(drawnName);
     
     // Exibir resultado
     resultDiv.textContent = drawnName;
     
     // Atualizar histórico
     updateHistory();
     
     // Efeito de confete
     createConfetti();
     
     showAlert(successAlert, 'Nome sorteado com sucesso!');
 });
 
 // Processar arquivo Excel
 excelFileInput.addEventListener('change', (event) => {
     const file = event.target.files[0];
     
     if (!file) {
         fileInputLabel.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> <span>Clique para selecionar um arquivo Excel</span>';
         columnSelect.disabled = true;
         drawExcelBtn.disabled = true;
         return;
     }
     
     fileInputLabel.innerHTML = `<i class="fas fa-file-excel"></i> <span>${file.name}</span>`;
     
     const reader = new FileReader();
     
     reader.onload = function(e) {
         try {
             const data = new Uint8Array(e.target.result);
             const workbook = XLSX.read(data, {type: 'array'});
             
             // Pegar a primeira planilha
             const firstSheetName = workbook.SheetNames[0];
             const worksheet = workbook.Sheets[firstSheetName];
             
             // Converter para JSON
             const jsonData = XLSX.utils.sheet_to_json(worksheet, {header: 1});
             
             if (jsonData.length === 0) {
                 showAlert(errorAlert, 'O arquivo Excel está vazio.');
                 return;
             }
             
             // Obter cabeçalhos (primeira linha)
             const headers = jsonData[0];
             
             // Limpar e preencher o seletor de colunas
             columnSelect.innerHTML = '<option value="">Selecione uma coluna</option>';
             headers.forEach(header => {
                 if (header && header.toString().trim() !== '') {
                     const option = document.createElement('option');
                     option.value = header;
                     option.textContent = header;
                     columnSelect.appendChild(option);
                 }
             });
             
             columnSelect.disabled = false;
             drawExcelBtn.disabled = false;
             
             // Armazenar dados para uso posterior
             columnSelect.excelData = jsonData;
             
             showAlert(successAlert, 'Arquivo Excel carregado com sucesso!');
         } catch (error) {
             console.error('Erro ao processar o arquivo Excel:', error);
             showAlert(errorAlert, 'Erro ao processar o arquivo Excel. Verifique se o formato está correto.');
         }
     };
     
     reader.onerror = function() {
         showAlert(errorAlert, 'Erro ao ler o arquivo.');
     };
     
     reader.readAsArrayBuffer(file);
 });
 
 // Sortear do Excel
 drawExcelBtn.addEventListener('click', () => {
     const selectedColumn = columnSelect.value;
     const excelData = columnSelect.excelData;
     
     if (!selectedColumn || !excelData) {
         showAlert(errorAlert, 'Por favor, selecione uma coluna válida.');
         return;
     }
     
     // Encontrar o índice da coluna selecionada
     const headers = excelData[0];
     const columnIndex = headers.indexOf(selectedColumn);
     
     if (columnIndex === -1) {
         showAlert(errorAlert, 'Coluna selecionada não encontrada.');
         return;
     }
     
     // Extrair dados da coluna (ignorando cabeçalho)
     const columnData = [];
     for (let i = 1; i < excelData.length; i++) {
         if (excelData[i] && excelData[i][columnIndex] !== undefined && excelData[i][columnIndex] !== '') {
             columnData.push(excelData[i][columnIndex].toString().trim());
         }
     }
     
     if (columnData.length === 0) {
         showAlert(errorAlert, 'Nenhum dado válido encontrado na coluna selecionada.');
         return;
     }
     
     // Filtrar itens que ainda não foram sorteados
     const availableItems = columnData.filter(item => !drawnItems.includes(item));
     
     if (availableItems.length === 0) {
         showAlert(errorAlert, 'Todos os itens desta coluna já foram sorteados.');
         return;
     }
     
     // Sortear um item
     const randomIndex = Math.floor(Math.random() * availableItems.length);
     const drawnItem = availableItems[randomIndex];
     
     // Adicionar ao histórico
     drawnItems.push(drawnItem);
     
     // Exibir resultado
     resultDiv.textContent = drawnItem;
     
     // Atualizar histórico
     updateHistory();
     
     // Efeito de confete
     createConfetti();
     
     showAlert(successAlert, 'Item sorteado com sucesso!');
 });
 
 // Atualizar histórico
 function updateHistory() {
     historyList.innerHTML = '';
     
     if (drawnItems.length === 0) {
         historyList.innerHTML = '<div class="history-item"><i class="fas fa-info-circle"></i> Nenhum item sorteado ainda.</div>';
         return;
     }
     
     // Mostrar os últimos 20 itens sorteados (mais recentes primeiro)
     const recentItems = [...drawnItems].reverse().slice(0, 20);
     
     recentItems.forEach(item => {
         const historyItem = document.createElement('div');
         historyItem.className = 'history-item';
         historyItem.innerHTML = `<i class="fas fa-check-circle"></i> ${item}`;
         historyList.appendChild(historyItem);
     });
 }
 
 // Limpar histórico
 clearHistoryBtn.addEventListener('click', () => {
     drawnItems = [];
     updateHistory();
     resultDiv.textContent = '-';
     showAlert(successAlert, 'Histórico limpo com sucesso!');
 });
 
 // Inicializar histórico
 updateHistory();