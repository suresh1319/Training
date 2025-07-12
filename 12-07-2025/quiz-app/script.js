class QuizApp {
    constructor() {
        this.currentQuestion = 0;
        this.score = 0;
        this.timeLeft = 10;
        this.timer = null;
        this.playerName = '';
        this.answers = [];
        this.questions = [];
        this.isLoading = false;
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadLeaderboard();
    }

    async fetchQuestions() {
        try {
            this.isLoading = true;
            this.startQuizBtn.textContent = 'Loading...';
            this.startQuizBtn.disabled = true;

            const difficulty = this.difficultySelect.value;
            const numQuestions = this.numQuestionsSelect.value;
            const category = this.categorySelect.value;
            
            let apiUrl = `https://the-trivia-api.com/api/questions?limit=${numQuestions}&difficulty=${difficulty}`;
            if (category) {
                apiUrl += `&categories=${category}`;
            }
            
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const apiQuestions = await response.json();
            
            // Transform API questions to our format
            this.questions = apiQuestions.map((q, index) => {
                // Combine correct and incorrect answers, then shuffle
                const allOptions = [q.correctAnswer, ...q.incorrectAnswers];
                const shuffledOptions = this.shuffleArray([...allOptions]);
                const correctIndex = shuffledOptions.indexOf(q.correctAnswer);
                
                return {
                    id: index + 1,
                    topic: q.category,
                    question: q.question,
                    options: shuffledOptions,
                    correct: correctIndex
                };
            });

            return true;
        } catch (error) {
            console.error('Error fetching questions:', error);
            this.showError('Failed to load questions. Please check your internet connection and try again.');
            return false;
        } finally {
            this.isLoading = false;
            this.startQuizBtn.textContent = 'Start Quiz';
            this.startQuizBtn.disabled = false;
        }
    }

    showError(message) {
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <div class="error-content">
                <span class="error-icon">⚠️</span>
                <span class="error-text">${message}</span>
            </div>
        `;
        
        this.startQuizBtn.parentNode.insertBefore(errorDiv, this.startQuizBtn.nextSibling);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    async startQuiz() {
        const name = this.playerNameInput.value.trim();
        if (!name) {
            this.playerNameInput.focus();
            this.playerNameInput.style.borderColor = '#e74c3c';
            setTimeout(() => {
                this.playerNameInput.style.borderColor = '#e1e5e9';
            }, 2000);
            return;
        }

        if (this.isLoading) {
            return;
        }

        // Fetch fresh questions from API
        const questionsLoaded = await this.fetchQuestions();
        if (!questionsLoaded) {
            return;
        }
        
        this.playerName = name;
        this.currentQuestion = 0;
        this.score = 0;
        this.answers = [];
        
        this.switchScreen(this.welcomeScreen, this.quizScreen);
        this.loadQuestion();
    }

    initializeElements() {
        // Screens
        this.welcomeScreen = document.getElementById('welcome-screen');
        this.quizScreen = document.getElementById('quiz-screen');
        
        // Modals
        this.resultsModal = document.getElementById('results-modal');
        this.leaderboardModal = document.getElementById('leaderboard-modal');
        
        // Back button
        this.backButton = document.getElementById('back-to-welcome');
        
        // Welcome screen elements
        this.playerNameInput = document.getElementById('player-name');
        this.startQuizBtn = document.getElementById('start-quiz');
        this.showLeaderboardBtn = document.getElementById('show-leaderboard');
        this.categorySelect = document.getElementById('category');
        this.difficultySelect = document.getElementById('difficulty');
        this.numQuestionsSelect = document.getElementById('num-questions');
        
        // Quiz elements
        this.currentQuestionSpan = document.getElementById('current-question');
        this.progressFill = document.getElementById('progress-fill');
        this.timerCircle = document.getElementById('timer-circle');
        this.timerText = document.getElementById('timer-text');
        this.questionText = document.getElementById('question-text');
        this.optionsContainer = document.getElementById('options-container');
        this.nextQuestionBtn = document.getElementById('next-question');
        
        // Results modal elements
        this.scoreDisplay = document.getElementById('score-display');
        this.answerReview = document.getElementById('answer-review');
        this.playAgainBtn = document.getElementById('play-again');
        this.viewLeaderboardBtn = document.getElementById('view-leaderboard');
        
        // Leaderboard modal elements
        this.leaderboardList = document.getElementById('leaderboard-list');
        this.closeLeaderboardBtn = document.getElementById('close-leaderboard');
        this.clearLeaderboardBtn = document.getElementById('clear-leaderboard');
    }

    attachEventListeners() {
        this.startQuizBtn.addEventListener('click', () => this.startQuiz());
        this.showLeaderboardBtn.addEventListener('click', () => this.showLeaderboard());
        this.nextQuestionBtn.addEventListener('click', () => this.nextQuestion());
        this.playAgainBtn.addEventListener('click', () => this.resetQuiz());
        this.backButton.addEventListener('click', () => this.confirmBack());
        this.viewLeaderboardBtn.addEventListener('click', () => {
            this.hideModal(this.resultsModal);
            this.showLeaderboard();
        });
        this.closeLeaderboardBtn.addEventListener('click', () => this.hideModal(this.leaderboardModal));
        this.clearLeaderboardBtn.addEventListener('click', () => this.clearLeaderboard());
        
        // Close modals when clicking backdrop
        this.resultsModal.addEventListener('click', (e) => {
            if (e.target === this.resultsModal) {
                this.hideModal(this.resultsModal);
            }
        });
        
        this.leaderboardModal.addEventListener('click', (e) => {
            if (e.target === this.leaderboardModal) {
                this.hideModal(this.leaderboardModal);
            }
        });

        // Enter key to start quiz
        this.playerNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && this.playerNameInput.value.trim()) {
                this.startQuiz();
            }
        });
    }

    async startQuiz() {
        const name = this.playerNameInput.value.trim();
        if (!name) {
            this.playerNameInput.focus();
            this.playerNameInput.style.borderColor = '#e74c3c';
            setTimeout(() => {
                this.playerNameInput.style.borderColor = '#e1e5e9';
            }, 2000);
            return;
        }

        if (this.isLoading) {
            return;
        }

        const questionsLoaded = await this.fetchQuestions();
        if (!questionsLoaded) {
            return;
        }
        
        this.playerName = name;
        this.currentQuestion = 0;
        this.score = 0;
        this.answers = [];
        
        this.switchScreen(this.welcomeScreen, this.quizScreen);
        this.loadQuestion();
    }

    switchScreen(from, to) {
        from.classList.remove('active');
        to.classList.add('active');
    }

    loadQuestion() {
        if (this.currentQuestion >= this.questions.length) {
            this.endQuiz();
            return;
        }

        const question = this.questions[this.currentQuestion];
        
        // Update UI
        this.currentQuestionSpan.textContent = this.currentQuestion + 1;
        document.getElementById('total-questions').textContent = this.questions.length;
        this.questionText.textContent = question.question;
        this.updateProgress();
        
        // Load options
        this.optionsContainer.innerHTML = '';
        question.options.forEach((option, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option';
            optionDiv.innerHTML = `
                <input type="radio" name="answer" value="${index}" id="option-${index}">
                <label for="option-${index}" class="option-label">
                    <span class="option-text">${option}</span>
                </label>
            `;
            this.optionsContainer.appendChild(optionDiv);
        });

        // Radio button change event for enabling next button
        this.optionsContainer.addEventListener('change', (e) => {
            if (e.target.type === 'radio') {
                this.nextQuestionBtn.disabled = false;
                this.nextQuestionBtn.style.opacity = '1';
            }
        });

        this.nextQuestionBtn.disabled = true;
        this.nextQuestionBtn.style.opacity = '0.5';
        
        this.startTimer();
    }

    updateProgress() {
        // Add 1 to currentQuestion to show progress including the current question
        const progress = ((this.currentQuestion + 1) / this.questions.length) * 100;
        this.progressFill.style.width = `${progress}%`;
    }

    startTimer() {
        clearInterval(this.timer);
        this.timeLeft = 10;
        this.updateTimerDisplay();
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.timeLeft <= 3) {
                this.timerCircle.classList.add('timer-warning');
            }
            
            if (this.timeLeft <= 0) {
                this.timeUp();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        this.timerText.textContent = this.timeLeft;
        const angle = ((10 - this.timeLeft) / 10) * 360;
        this.timerCircle.style.background = `conic-gradient(#667eea ${angle}deg, rgba(102, 126, 234, 0.2) ${angle}deg)`;
    }

    timeUp() {
        clearInterval(this.timer);
        this.timerCircle.classList.remove('timer-warning');
        
        // Record as incorrect answer
        this.answers.push({
            questionId: this.questions[this.currentQuestion].id,
            selectedAnswer: -1,
            correctAnswer: this.questions[this.currentQuestion].correct,
            isCorrect: false,
            timeUp: true
        });
        
        this.showAnswerFeedback();
        setTimeout(() => this.nextQuestion(), 2000);
    }

    nextQuestion() {
        clearInterval(this.timer);
        this.timerCircle.classList.remove('timer-warning');
        
        const selectedAnswer = document.querySelector('input[name="answer"]:checked');
        const selectedIndex = selectedAnswer ? parseInt(selectedAnswer.value) : -1;
        const correctIndex = this.questions[this.currentQuestion].correct;
        const isCorrect = selectedIndex === correctIndex;
        
        if (isCorrect) {
            this.score++;
        }
        
        this.answers.push({
            questionId: this.questions[this.currentQuestion].id,
            selectedAnswer: selectedIndex,
            correctAnswer: correctIndex,
            isCorrect: isCorrect,
            timeUp: false
        });
        
        this.showAnswerFeedback();
        
        setTimeout(() => {
            this.currentQuestion++;
            this.loadQuestion();
        }, 2000);
    }

    showAnswerFeedback() {
        const options = this.optionsContainer.querySelectorAll('.option');
        const selectedAnswer = document.querySelector('input[name="answer"]:checked');
        const selectedIndex = selectedAnswer ? parseInt(selectedAnswer.value) : -1;
        const isCorrect = selectedIndex === this.questions[this.currentQuestion].correct;
        
        // Only highlight the selected answer
        options.forEach((option, index) => {
            const radio = option.querySelector('input[type="radio"]');
            radio.disabled = true;
            
            if (index === selectedIndex) {
                option.classList.add(isCorrect ? 'correct' : 'incorrect');
            }
        });
        
        this.nextQuestionBtn.disabled = true;
    }

    endQuiz() {
        this.saveScore();
        this.showResults();
    }

    confirmBack() {
        if (confirm('Are you sure you want to quit the quiz? Your progress will be lost.')) {
            this.resetQuiz();
        }
    }

    showResults() {
        const percentage = Math.round((this.score / this.questions.length) * 100);
        const stars = this.calculateStars(percentage);
        const incorrectAnswers = this.questions.length - this.score;
        
        // Update score number
        this.scoreDisplay.querySelector('.score-number').textContent = `${this.score}/${this.questions.length}`;
        
        // Update statistics
        this.scoreDisplay.querySelector('.correct-answers .stat-count').textContent = this.score;
        this.scoreDisplay.querySelector('.incorrect-answers .stat-count').textContent = incorrectAnswers;
        
        // Update star rating
        const starRating = this.scoreDisplay.querySelector('.star-rating');
        starRating.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('span');
            star.className = 'star';
            star.textContent = '⭐';
            if (i < stars) {
                setTimeout(() => {
                    star.classList.add('filled');
                }, i * 200);
            }
            starRating.appendChild(star);
        }
        
        // Update score message
        this.scoreDisplay.querySelector('.score-message').textContent = this.getScoreMessage(percentage);
        
        // Update answer review
        this.updateAnswerReview();
        
        this.showModal(this.resultsModal);
    }

    updateAnswerReview() {
        this.answerReview.innerHTML = '';
        
        this.answers.forEach((answer, index) => {
            const question = this.questions[index];
            const reviewItem = document.createElement('div');
            reviewItem.className = `review-item ${answer.isCorrect ? 'correct' : 'incorrect'}`;
            
            const icon = answer.isCorrect ? '✓' : '✗';
            const status = answer.timeUp ? 'Time Up' : (answer.isCorrect ? 'Correct' : 'Incorrect');
            
            reviewItem.innerHTML = `
                <span class="review-icon">${icon}</span>
                <div class="review-content">
                    <div class="review-question">${question.question}</div>
                    <div class="review-answer">
                        ${answer.timeUp ? 'No answer given' : `Your answer: ${question.options[answer.selectedAnswer]}`}
                        <br>
                        Correct answer: ${question.options[answer.correctAnswer]}
                    </div>
                </div>
            `;
            
            this.answerReview.appendChild(reviewItem);
        });
    }

    calculateStars(percentage) {
        if (percentage >= 90) return 5;
        if (percentage >= 80) return 4;
        if (percentage >= 70) return 3;
        if (percentage >= 60) return 2;
        if (percentage >= 50) return 1;
        return 0;
    }

    getScoreMessage(percentage) {
        if (percentage >= 90) return 'Outstanding! You\'re a quiz master! 🏆';
        if (percentage >= 80) return 'Excellent work! Well done! 🎉';
        if (percentage >= 70) return 'Good job! Keep it up! 👍';
        if (percentage >= 60) return 'Not bad! Room for improvement! 📚';
        if (percentage >= 50) return 'You can do better! Try again! 💪';
        return 'Keep studying and try again! 📖';
    }

    saveScore() {
        const percentage = Math.round((this.score / this.questions.length) * 100);
        const stars = this.calculateStars(percentage);
        
        const newScore = {
            name: this.playerName,
            score: this.score,
            total: this.questions.length,
            percentage: percentage,
            stars: stars,
            date: new Date().toLocaleDateString(),
            difficulty: this.difficultySelect.value,
            category: this.categorySelect.value || 'All Categories'
        };
        
        let leaderboard = this.getLeaderboard();
        leaderboard.push(newScore);
        
        // Sort by percentage (descending), then difficulty, then date, and keep top 5
        leaderboard.sort((a, b) => {
            if (b.percentage !== a.percentage) return b.percentage - a.percentage;
            if (b.difficulty && a.difficulty && b.difficulty !== a.difficulty) {
                const difficultyOrder = { hard: 3, medium: 2, easy: 1 };
                return difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty];
            }
            return new Date(b.date) - new Date(a.date);
        });
        
        leaderboard = leaderboard.slice(0, 5);
        
        localStorage.setItem('quizLeaderboard', JSON.stringify(leaderboard));
    }

    getLeaderboard() {
        const saved = localStorage.getItem('quizLeaderboard');
        return saved ? JSON.parse(saved) : [];
    }

    loadLeaderboard() {
        const leaderboard = this.getLeaderboard();
        this.leaderboardList.innerHTML = '';
        
        if (leaderboard.length === 0) {
            this.leaderboardList.innerHTML = '<div class="no-scores">No scores yet. Be the first to play!</div>';
            return;
        }
        
        leaderboard.forEach((entry, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            
            const stars = '⭐'.repeat(entry.stars);
            const difficultyBadge = entry.difficulty ? 
                `<span class="difficulty-badge ${entry.difficulty}">${entry.difficulty}</span>` : '';
            const categoryBadge = entry.category ?
                `<span class="category-badge">${entry.category}</span>` : '';
            
            item.innerHTML = `
                <span class="leaderboard-rank">#${index + 1}</span>
                <span class="leaderboard-name">${entry.name}</span>
                <span class="leaderboard-score">${entry.score}/${entry.total}</span>
                <div class="leaderboard-details">
                    ${categoryBadge}
                    ${difficultyBadge}
                    <span class="leaderboard-stars">${stars}</span>
                </div>
            `;
            
            this.leaderboardList.appendChild(item);
        });
    }

    showLeaderboard() {
        this.loadLeaderboard();
        this.showModal(this.leaderboardModal);
    }

    clearLeaderboard() {
        if (confirm('Are you sure you want to clear the leaderboard?')) {
            localStorage.removeItem('quizLeaderboard');
            this.loadLeaderboard();
        }
    }

    showModal(modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    hideModal(modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }

    resetQuiz() {
        clearInterval(this.timer);
        this.hideModal(this.resultsModal);
        this.switchScreen(this.quizScreen, this.welcomeScreen);
        this.playerNameInput.value = '';
        this.playerNameInput.focus();
    }
}

// Initialize the quiz app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new QuizApp();
});
