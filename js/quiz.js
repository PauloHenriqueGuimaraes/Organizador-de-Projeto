 // Dados iniciais
 let currentUser = null;
 let currentQuestionIndex = 0;
 let userAnswers = [];
 let editingQuestionId = null;
 let shuffledOptions = [];
 let quizTimer = null;
 let timeLeft = 300; // 5 minutos em segundos
 
 // Credenciais de administrador
 const adminCredentials = {
     username: "admin",
     password: "admin123"
 };
 
 // Inicializar perguntas padrão se não existirem
 const defaultQuestions = [
     {
         id: 1,
         text: "Qual é a capital do Brasil?",
         options: ["Brasília", "Rio de Janeiro", "São Paulo", "Salvador"],
         correctAnswer: 0
     },
     {
         id: 2,
         text: "Quantos planetas existem no sistema solar?",
         options: ["7", "8", "9", "10"],
         correctAnswer: 1
     },
     {
         id: 3,
         text: "Quem pintou a Mona Lisa?",
         options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
         correctAnswer: 2
     },
     {
         id: 4,
         text: "Qual é o maior oceano do mundo?",
         options: ["Atlântico", "Índico", "Ártico", "Pacífico"],
         correctAnswer: 3
     },
     {
         id: 5,
         text: "Em que ano o homem pisou na Lua pela primeira vez?",
         options: ["1965", "1969", "1972", "1975"],
         correctAnswer: 1
     }
 ];
 
 // Carregar dados do localStorage
 function loadData() {
     try {
         const questions = JSON.parse(localStorage.getItem('quizQuestions')) || defaultQuestions;
         const users = JSON.parse(localStorage.getItem('quizUsers')) || [];
         const scores = JSON.parse(localStorage.getItem('quizScores')) || [];
         return { questions, users, scores };
     } catch (e) {
         console.error('Erro ao carregar dados:', e);
         return { questions: defaultQuestions, users: [], scores: [] };
     }
 }
 
 // Salvar dados no localStorage
 function saveData(questions, users, scores) {
     try {
         localStorage.setItem('quizQuestions', JSON.stringify(questions));
         localStorage.setItem('quizUsers', JSON.stringify(users));
         localStorage.setItem('quizScores', JSON.stringify(scores));
     } catch (e) {
         console.error('Erro ao salvar dados:', e);
     }
 }
 
 // Atualizar estatísticas na tela de boas-vindas
 function updateWelcomeStats() {
     const { questions, users, scores } = loadData();
     
     document.getElementById('total-questions-stat').textContent = questions.length;
     document.getElementById('total-users-stat').textContent = users.length;
     document.getElementById('total-quizzes-stat').textContent = scores.length;
 }
 
 // Mostrar notificação
 function showNotification(message, isError = false, isWarning = false) {
     const notification = document.getElementById('notification');
     const notificationText = document.getElementById('notification-text');
     const icon = notification.querySelector('i');
     
     notificationText.textContent = message;
     
     // Reset classes
     notification.className = 'notification';
     
     if (isError) {
         notification.classList.add('error');
         icon.className = 'fas fa-exclamation-circle';
     } else if (isWarning) {
         notification.classList.add('warning');
         icon.className = 'fas fa-exclamation-triangle';
     } else {
         icon.className = 'fas fa-check-circle';
     }
     
     notification.classList.add('show');
     
     setTimeout(() => {
         notification.classList.remove('show');
     }, 4000);
 }
 
 // Alternar entre telas
 function showScreen(screenId) {
     document.querySelectorAll('.screen').forEach(screen => {
         screen.classList.remove('active');
     });
     document.getElementById(screenId).classList.add('active');
     
     // Atualizar estatísticas se for a tela de boas-vindas
     if (screenId === 'welcome-screen') {
         updateWelcomeStats();
     }
 }
 
 // Embaralhar array (Fisher-Yates shuffle)
 function shuffleArray(array) {
     const newArray = [...array];
     for (let i = newArray.length - 1; i > 0; i--) {
         const j = Math.floor(Math.random() * (i + 1));
         [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
     }
     return newArray;
 }
 
 // Iniciar temporizador do quiz
 function startQuizTimer() {
     clearInterval(quizTimer);
     timeLeft = 300; // 5 minutos
     
     quizTimer = setInterval(() => {
         timeLeft--;
         
         const minutes = Math.floor(timeLeft / 60);
         const seconds = timeLeft % 60;
         document.getElementById('quiz-timer').textContent = 
             `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
         
         // Atualizar barra de progresso do tempo
         const progressPercent = ((300 - timeLeft) / 300) * 100;
         document.getElementById('quiz-progress').style.width = `${progressPercent}%`;
         
         if (timeLeft <= 0) {
             clearInterval(quizTimer);
             showNotification('Tempo esgotado! O quiz será finalizado automaticamente.', true);
             document.getElementById('submit-quiz-btn').click();
         }
     }, 1000);
 }
 
 // Parar temporizador do quiz
 function stopQuizTimer() {
     clearInterval(quizTimer);
 }
 
 // Event Listeners para a tela de boas-vindas
 document.getElementById('start-user-btn').addEventListener('click', function() {
     showScreen('auth-screen');
 });
 
 document.getElementById('start-admin-btn').addEventListener('click', function() {
     showScreen('admin-login-screen');
 });
 
 document.getElementById('user-option').addEventListener('click', function() {
     document.getElementById('user-option').classList.add('active');
     document.getElementById('admin-option').classList.remove('active');
 });
 
 document.getElementById('admin-option').addEventListener('click', function() {
     document.getElementById('admin-option').classList.add('active');
     document.getElementById('user-option').classList.remove('active');
 });
 
 // Cadastrar usuário
 document.getElementById('register-btn').addEventListener('click', function() {
     const username = document.getElementById('username').value.trim();
     const email = document.getElementById('email').value.trim();
     const password = document.getElementById('password').value.trim();
     
     if (!username || !email || !password) {
         showNotification('Por favor, preencha todos os campos!', true);
         return;
     }
     
     if (username.length < 3) {
         showNotification('O nome de usuário deve ter pelo menos 3 caracteres!', true);
         return;
     }
     
     if (password.length < 4) {
         showNotification('A senha deve ter pelo menos 4 caracteres!', true);
         return;
     }
     
     const { questions, users, scores } = loadData();
     
     // Verificar se o usuário já existe
     const existingUser = users.find(user => user.username === username || user.email === email);
     if (existingUser) {
         showNotification('Usuário ou e-mail já cadastrado!', true);
         return;
     }
     
     // Adicionar novo usuário
     const newUser = {
         id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
         username,
         email,
         password,
         registrationDate: new Date().toLocaleString()
     };
     
     users.push(newUser);
     saveData(questions, users, scores);
     
     // Fazer login automaticamente
     currentUser = username;
     document.getElementById('current-user').textContent = username;
     document.getElementById('current-score').textContent = '0';
     
     // Inicializar respostas do usuário
     userAnswers = new Array(questions.length).fill(null);
     
     showQuizScreen();
     
     showNotification(`Bem-vindo, ${username}! Boa sorte no quiz!`);
 });
 
 // Voltar para tela de boas-vindas
 document.getElementById('back-to-welcome-btn').addEventListener('click', function() {
     showScreen('welcome-screen');
 });
 
 document.getElementById('back-to-welcome-btn-2').addEventListener('click', function() {
     showScreen('welcome-screen');
 });
 
 // Login administrativo
 document.getElementById('admin-login-confirm-btn').addEventListener('click', function() {
     const username = document.getElementById('admin-username').value.trim();
     const password = document.getElementById('admin-password').value.trim();
     
     if (username === adminCredentials.username && password === adminCredentials.password) {
         showAdminScreen();
         showNotification('Login administrativo realizado com sucesso!');
     } else {
         showNotification('Credenciais administrativas inválidas!', true);
     }
 });
 
 // Mostrar tela do quiz
 function showQuizScreen() {
     const { questions } = loadData();
     
     if (questions.length === 0) {
         showNotification('Não há perguntas disponíveis. Entre em contato com o administrador.', true);
         return;
     }
     
     document.getElementById('total-questions').textContent = questions.length;
     currentQuestionIndex = 0;
     showQuestion(currentQuestionIndex);
     showScreen('quiz-screen');
     
     // Iniciar temporizador
     startQuizTimer();
 }
 
 // Mostrar pergunta específica
 function showQuestion(index) {
     const { questions } = loadData();
     
     if (index < 0 || index >= questions.length) return;
     
     currentQuestionIndex = index;
     const question = questions[index];
     
     document.getElementById('current-question').textContent = index + 1;
     
     // Embaralhar opções
     const shuffled = shuffleArray(question.options.map((option, i) => ({ option, originalIndex: i })));
     shuffledOptions = shuffled;
     
     const questionContainer = document.getElementById('question-container');
     questionContainer.innerHTML = `
         <div class="question-text">${question.text}</div>
         <div class="options-container">
             ${shuffled.map((item, i) => `
                 <div class="option ${userAnswers[index] === i ? 'selected' : ''}" data-index="${i}" data-original="${item.originalIndex}">
                     <div class="option-number">${i+1}</div>
                     ${item.option}
                 </div>
             `).join('')}
         </div>
     `;
     
     // Adicionar event listeners para as opções
     document.querySelectorAll('.option').forEach(option => {
         option.addEventListener('click', function() {
             // Remover seleção anterior
             document.querySelectorAll('.option').forEach(opt => {
                 opt.classList.remove('selected');
             });
             
             // Selecionar nova opção
             this.classList.add('selected');
             userAnswers[index] = parseInt(this.getAttribute('data-index'));
             
             // Atualizar pontuação atual
             updateCurrentScore();
         });
     });
     
     // Atualizar estado dos botões de navegação
     document.getElementById('prev-question-btn').disabled = index === 0;
     document.getElementById('next-question-btn').disabled = index === questions.length - 1;
     
     // Atualizar barra de progresso
     const progressPercent = ((index + 1) / questions.length) * 100;
     document.getElementById('quiz-progress').style.width = `${progressPercent}%`;
 }
 
 // Atualizar pontuação atual
 function updateCurrentScore() {
     const { questions } = loadData();
     let score = 0;
     
     for (let i = 0; i < questions.length; i++) {
         if (userAnswers[i] !== null) {
             const question = questions[i];
             const selectedOptionIndex = userAnswers[i];
             const originalIndex = shuffledOptions[selectedOptionIndex].originalIndex;
             
             if (originalIndex === question.correctAnswer) {
                 score++;
             }
         }
     }
     
     document.getElementById('current-score').textContent = score;
 }
 
 // Navegação entre perguntas
 document.getElementById('prev-question-btn').addEventListener('click', function() {
     if (currentQuestionIndex > 0) {
         showQuestion(currentQuestionIndex - 1);
     }
 });
 
 document.getElementById('next-question-btn').addEventListener('click', function() {
     const { questions } = loadData();
     if (currentQuestionIndex < questions.length - 1) {
         showQuestion(currentQuestionIndex + 1);
     }
 });
 
 // Finalizar quiz
 document.getElementById('submit-quiz-btn').addEventListener('click', function() {
     const { questions, users, scores } = loadData();
     let finalScore = 0;
     let correctAnswers = 0;
     let incorrectAnswers = 0;
     
     // Calcular pontuação final
     for (let i = 0; i < questions.length; i++) {
         if (userAnswers[i] !== null) {
             const question = questions[i];
             const selectedOptionIndex = userAnswers[i];
             const originalIndex = shuffledOptions[selectedOptionIndex].originalIndex;
             
             if (originalIndex === question.correctAnswer) {
                 finalScore++;
                 correctAnswers++;
             } else {
                 incorrectAnswers++;
             }
         } else {
             incorrectAnswers++;
         }
     }
     
     // Parar temporizador
     stopQuizTimer();
     
     // Salvar pontuação do usuário
     const userScore = {
         username: currentUser,
         score: finalScore,
         maxScore: questions.length,
         correctAnswers: correctAnswers,
         incorrectAnswers: incorrectAnswers,
         percentage: Math.round((finalScore / questions.length) * 100),
         date: new Date().toLocaleString(),
         timeSpent: (300 - timeLeft) + ' segundos'
     };
     
     scores.push(userScore);
     saveData(questions, users, scores);
     
     // Mostrar tela de resultados
     showResultsScreen(finalScore, questions.length, correctAnswers, incorrectAnswers);
 });
 
 // Mostrar tela de resultados
 function showResultsScreen(score, maxScore, correctAnswers, incorrectAnswers) {
     const { questions } = loadData();
     const percentage = Math.round((score / maxScore) * 100);
     
     document.getElementById('final-score').textContent = score;
     document.getElementById('max-score').textContent = maxScore;
     document.getElementById('correct-answers').textContent = correctAnswers;
     document.getElementById('incorrect-answers').textContent = incorrectAnswers;
     document.getElementById('percentage-score').textContent = `${percentage}%`;
     
     // Mensagem de desempenho
     const performanceMessage = document.getElementById('performance-message');
     if (percentage >= 90) {
         performanceMessage.textContent = 'Excelente! Você é um expert!';
         performanceMessage.style.color = '#4CAF50';
     } else if (percentage >= 70) {
         performanceMessage.textContent = 'Muito bom! Continue assim!';
         performanceMessage.style.color = '#2196F3';
     } else if (percentage >= 50) {
         performanceMessage.textContent = 'Bom trabalho! Há espaço para melhorar.';
         performanceMessage.style.color = '#FF9800';
     } else {
         performanceMessage.textContent = 'Não desanime! Tente novamente.';
         performanceMessage.style.color = '#F44336';
     }
     
     const answersSummary = document.getElementById('answers-summary');
     answersSummary.innerHTML = '';
     
     // Criar resumo das respostas
     questions.forEach((question, index) => {
         const userAnswer = userAnswers[index];
         let isCorrect = false;
         let userAnswerText = 'Não respondida';
         let userAnswerClass = '';
         
         if (userAnswer !== null) {
             const originalIndex = shuffledOptions[userAnswer].originalIndex;
             userAnswerText = question.options[originalIndex];
             isCorrect = originalIndex === question.correctAnswer;
             userAnswerClass = isCorrect ? 'option-correct' : 'option-incorrect';
         }
         
         const answerElement = document.createElement('div');
         answerElement.className = `question-container ${isCorrect ? 'correct' : 'incorrect'}`;
         answerElement.style.borderLeft = isCorrect ? '5px solid #4CAF50' : '5px solid #F44336';
         answerElement.innerHTML = `
             <div class="question-text">${index + 1}. ${question.text}</div>
             <div class="option ${userAnswerClass}" style="margin: 10px 0;">
                 <div class="option-number">${userAnswer !== null ? (userAnswer + 1) : '?'}</div>
                 Sua resposta: ${userAnswerText} 
                 ${isCorrect ? '<i class="fas fa-check"></i>' : '<i class="fas fa-times"></i>'}
             </div>
             ${!isCorrect ? `
                 <div class="option option-correct">
                     <div class="option-number"><i class="fas fa-check"></i></div>
                     Resposta correta: ${question.options[question.correctAnswer]}
                 </div>
             ` : ''}
         `;
         
         answersSummary.appendChild(answerElement);
     });
     
     showScreen('results-screen');
 }
 
 // Reiniciar quiz
 document.getElementById('restart-quiz-btn').addEventListener('click', function() {
     userAnswers = new Array(loadData().questions.length).fill(null);
     showQuizScreen();
 });
 
 // Voltar ao menu
 document.getElementById('back-to-menu-btn').addEventListener('click', function() {
     currentUser = null;
     userAnswers = [];
     showScreen('welcome-screen');
 });
 
 // Logout
 document.getElementById('logout-btn').addEventListener('click', function() {
     if (confirm('Tem certeza que deseja sair? Seu progresso será perdido.')) {
         stopQuizTimer();
         currentUser = null;
         userAnswers = [];
         showScreen('welcome-screen');
     }
 });
 
 // Mostrar tela administrativa
 function showAdminScreen() {
     loadQuestionsList();
     loadUsersList();
     loadScoresList();
     showScreen('admin-screen');
 }
 
 // Carregar lista de perguntas no painel admin
 function loadQuestionsList() {
     const { questions } = loadData();
     const questionsList = document.getElementById('questions-list');
     
     if (questions.length === 0) {
         questionsList.innerHTML = '<p style="padding: 20px; text-align: center; color: #6c757d;">Nenhuma pergunta cadastrada.</p>';
         return;
     }
     
     questionsList.innerHTML = questions.map(question => `
         <div class="question-item">
             <div style="flex: 1;">
                 <strong>${question.id}.</strong> ${question.text}
                 <div style="font-size: 12px; color: #6c757d; margin-top: 5px;">
                     ${question.options.length} opções | Resposta correta: ${question.options[question.correctAnswer]}
                 </div>
             </div>
             <div class="question-actions">
                 <button class="action-btn edit-btn" data-id="${question.id}">
                     <i class="fas fa-edit"></i> Editar
                 </button>
                 <button class="action-btn delete-btn" data-id="${question.id}">
                     <i class="fas fa-trash"></i> Excluir
                 </button>
             </div>
         </div>
     `).join('');
     
     // Adicionar event listeners para os botões de editar e excluir
     document.querySelectorAll('.edit-btn').forEach(btn => {
         btn.addEventListener('click', function() {
             const questionId = parseInt(this.getAttribute('data-id'));
             editQuestion(questionId);
         });
     });
     
     document.querySelectorAll('.delete-btn').forEach(btn => {
         btn.addEventListener('click', function() {
             const questionId = parseInt(this.getAttribute('data-id'));
             deleteQuestion(questionId);
         });
     });
 }
 
 // Carregar lista de usuários no painel admin
 function loadUsersList() {
     const { users } = loadData();
     const usersList = document.getElementById('users-list');
     
     if (users.length === 0) {
         usersList.innerHTML = '<p style="padding: 20px; text-align: center; color: #6c757d;">Nenhum usuário cadastrado.</p>';
         return;
     }
     
     usersList.innerHTML = users.map(user => `
         <div class="user-item">
             <div>
                 <strong>${user.username}</strong> - ${user.email}
             </div>
             <div style="font-size: 12px; color: #666;">
                 ${user.registrationDate}
             </div>
         </div>
     `).join('');
 }
 
 // Carregar lista de pontuações no painel admin
 function loadScoresList() {
     const { scores } = loadData();
     const scoresList = document.getElementById('scores-list');
     
     if (scores.length === 0) {
         scoresList.innerHTML = '<p style="padding: 20px; text-align: center; color: #6c757d;">Nenhuma pontuação registrada.</p>';
         return;
     }
     
     // Ordenar por data (mais recente primeiro)
     const sortedScores = [...scores].sort((a, b) => new Date(b.date) - new Date(a.date));
     
     scoresList.innerHTML = sortedScores.map(score => `
         <div class="score-item">
             <div>
                 <strong>${score.username}</strong> - ${score.date}
                 <div style="font-size: 12px; color: #6c757d;">
                     ${score.correctAnswers} acertos, ${score.incorrectAnswers} erros (${score.percentage}%) - ${score.timeSpent}
                 </div>
             </div>
             <div style="font-weight: 600; color: ${score.percentage >= 70 ? '#4CAF50' : score.percentage >= 50 ? '#FF9800' : '#F44336'};">
                 ${score.score}/${score.maxScore}
             </div>
         </div>
     `).join('');
 }
 
 // Adicionar nova pergunta
 document.getElementById('add-question-btn').addEventListener('click', function() {
     const questionText = document.getElementById('question-text').value.trim();
     const option1 = document.getElementById('option1').value.trim();
     const option2 = document.getElementById('option2').value.trim();
     const option3 = document.getElementById('option3').value.trim();
     const option4 = document.getElementById('option4').value.trim();
     
     if (!questionText || !option1 || !option2 || !option3 || !option4) {
         showNotification('Por favor, preencha todos os campos!', true);
         return;
     }
     
     const { questions, users, scores } = loadData();
     
     // Encontrar o próximo ID disponível
     const nextId = questions.length > 0 ? Math.max(...questions.map(q => q.id)) + 1 : 1;
     
     // Adicionar nova pergunta (a primeira opção é sempre a correta)
     const newQuestion = {
         id: nextId,
         text: questionText,
         options: [option1, option2, option3, option4],
         correctAnswer: 0
     };
     
     questions.push(newQuestion);
     saveData(questions, users, scores);
     
     // Limpar formulário
     document.getElementById('question-text').value = '';
     document.getElementById('option1').value = '';
     document.getElementById('option2').value = '';
     document.getElementById('option3').value = '';
     document.getElementById('option4').value = '';
     
     // Recarregar lista de perguntas
     loadQuestionsList();
     
     showNotification('Pergunta adicionada com sucesso!');
 });
 
 // Editar pergunta
 function editQuestion(questionId) {
     const { questions } = loadData();
     const question = questions.find(q => q.id === questionId);
     
     if (!question) return;
     
     // Preencher formulário com os dados da pergunta
     document.getElementById('question-text').value = question.text;
     document.getElementById('option1').value = question.options[0];
     document.getElementById('option2').value = question.options[1];
     document.getElementById('option3').value = question.options[2];
     document.getElementById('option4').value = question.options[3];
     
     // Mostrar botões de atualização e cancelar
     document.getElementById('add-question-btn').classList.add('hidden');
     document.getElementById('update-question-btn').classList.remove('hidden');
     document.getElementById('cancel-edit-btn').classList.remove('hidden');
     
     // Definir pergunta em edição
     editingQuestionId = questionId;
 }
 
 // Atualizar pergunta
 document.getElementById('update-question-btn').addEventListener('click', function() {
     const questionText = document.getElementById('question-text').value.trim();
     const option1 = document.getElementById('option1').value.trim();
     const option2 = document.getElementById('option2').value.trim();
     const option3 = document.getElementById('option3').value.trim();
     const option4 = document.getElementById('option4').value.trim();
     
     if (!questionText || !option1 || !option2 || !option3 || !option4) {
         showNotification('Por favor, preencha todos os campos!', true);
         return;
     }
     
     const { questions, users, scores } = loadData();
     const questionIndex = questions.findIndex(q => q.id === editingQuestionId);
     
     if (questionIndex === -1) return;
     
     // Atualizar pergunta
     questions[questionIndex] = {
         id: editingQuestionId,
         text: questionText,
         options: [option1, option2, option3, option4],
         correctAnswer: 0 // A primeira opção é sempre a correta
     };
     
     saveData(questions, users, scores);
     
     // Limpar formulário e sair do modo de edição
     cancelEdit();
     
     // Recarregar lista de perguntas
     loadQuestionsList();
     
     showNotification('Pergunta atualizada com sucesso!');
 });
 
 // Cancelar edição
 document.getElementById('cancel-edit-btn').addEventListener('click', cancelEdit);
 
 function cancelEdit() {
     // Limpar formulário
     document.getElementById('question-text').value = '';
     document.getElementById('option1').value = '';
     document.getElementById('option2').value = '';
     document.getElementById('option3').value = '';
     document.getElementById('option4').value = '';
     
     // Ocultar botões de atualização e cancelar
     document.getElementById('add-question-btn').classList.remove('hidden');
     document.getElementById('update-question-btn').classList.add('hidden');
     document.getElementById('cancel-edit-btn').classList.add('hidden');
     
     // Limpar ID da pergunta em edição
     editingQuestionId = null;
 }
 
 // Excluir pergunta
 function deleteQuestion(questionId) {
     if (!confirm('Tem certeza que deseja excluir esta pergunta?')) return;
     
     const { questions, users, scores } = loadData();
     const questionIndex = questions.findIndex(q => q.id === questionId);
     
     if (questionIndex === -1) return;
     
     // Remover pergunta
     questions.splice(questionIndex, 1);
     saveData(questions, users, scores);
     
     // Recarregar lista de perguntas
     loadQuestionsList();
     
     showNotification('Pergunta excluída com sucesso!');
 }
 
 // Exportar para CSV
 document.getElementById('export-csv-btn').addEventListener('click', function() {
     const { scores } = loadData();
     
     if (scores.length === 0) {
         showNotification('Não há dados para exportar!', true);
         return;
     }
     
     // Criar cabeçalho do CSV
     let csvContent = "Usuário,Pontuação,Pontuação Máxima,Acertos,Erros,Percentual,Data,Tempo Gasto\n";
     
     // Adicionar dados
     scores.forEach(score => {
         csvContent += `"${score.username}",${score.score},${score.maxScore},${score.correctAnswers},${score.incorrectAnswers},${score.percentage}%,"${score.date}","${score.timeSpent}"\n`;
     });
     
     // Criar e baixar arquivo
     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
     const url = URL.createObjectURL(blob);
     const link = document.createElement('a');
     link.setAttribute('href', url);
     link.setAttribute('download', `pontuacoes_quiz_${new Date().toISOString().split('T')[0]}.csv`);
     link.style.visibility = 'hidden';
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
     
     showNotification('Dados exportados com sucesso! O download começará em instantes.');
 });
 
 // Logout do painel admin
 document.getElementById('admin-logout-btn').addEventListener('click', function() {
     showScreen('welcome-screen');
 });
 
 // Inicializar a aplicação
 function init() {
     // Carregar dados iniciais se não existirem
     const { questions, users, scores } = loadData();
     if (questions.length === 0) {
         saveData(defaultQuestions, users, scores);
     }
     
     // Mostrar tela de boas-vindas por padrão
     showScreen('welcome-screen');
     
     // Atualizar estatísticas
     updateWelcomeStats();
 }
 
 // Inicializar quando a página carregar
 document.addEventListener('DOMContentLoaded', init);