// Enhanced Main Quiz Application with PROPER RANDOMIZATION
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const elements = {
        // Screens
        startScreen: document.getElementById('startScreen'),
        quizScreen: document.getElementById('quizScreen'),
        resultScreen: document.getElementById('resultScreen'),
        adminScreen: document.getElementById('adminScreen'),
        
        // Theme
        themeToggle: document.getElementById('themeToggle'),
        themeIcon: document.getElementById('themeIcon'),
        
        // Start Screen
        startBtn: document.getElementById('startBtn'),
        adminToggle: document.getElementById('adminToggle'),
        totalQuestionsCount: document.getElementById('totalQuestionsCount'),
        highScore: document.getElementById('highScore'),
        
        // Quiz Screen
        progressFill: document.getElementById('progressFill'),
        questionCounter: document.getElementById('questionCounter'),
        currentQ: document.getElementById('currentQ'),
        totalQ: document.getElementById('totalQ'),
        currentScore: document.getElementById('currentScore'),
        timerBadge: document.getElementById('timerBadge'),
        timer: document.getElementById('timer'),
        challengeNumber: document.getElementById('challengeNumber'),
        questionText: document.getElementById('questionText'),
        optionsGrid: document.getElementById('optionsGrid'),
        feedbackCard: document.getElementById('feedbackCard'),
        feedbackText: document.getElementById('feedbackText'),
        nextBtn: document.getElementById('nextBtn'),
        
        // Result Screen
        finalScore: document.getElementById('finalScore'),
        correctCount: document.getElementById('correctCount'),
        incorrectCount: document.getElementById('incorrectCount'),
        timeBonus: document.getElementById('timeBonus'),
        resultMessage: document.getElementById('resultMessage'),
        restartBtn: document.getElementById('restartBtn'),
        shareBtn: document.getElementById('shareBtn'),
        homeBtn: document.getElementById('homeBtn'),
        
        // Admin Screen
        closeAdmin: document.getElementById('closeAdmin'),
        
        // Audio
        correctSound: document.getElementById('correctSound'),
        wrongSound: document.getElementById('wrongSound'),
        clickSound: document.getElementById('clickSound')
    };

    // Quiz State
    const state = {
        questions: [],
        currentQuestions: [],
        currentIndex: 0,
        score: 0,
        selectedOption: null,
        isAnswered: false,
        timeLeft: 30,
        timerInterval: null,
        usedQuestionIds: new Set(),
        totalQuestions: 0,
        highScore: localStorage.getItem('quizHighScore') || 0,
        // NEW: Store shuffled options and their correct index mapping
        currentQuestionData: null
    };

    // Initialize Application
    initApplication();

    // Event Listeners
    function initEventListeners() {
        // Theme
        elements.themeToggle.addEventListener('click', toggleTheme);
        
        // Navigation
        elements.startBtn.addEventListener('click', startQuiz);
        elements.adminToggle.addEventListener('click', showAdmin);
        elements.closeAdmin.addEventListener('click', hideAdmin);
        elements.homeBtn.addEventListener('click', goHome);
        
        // Quiz Controls
        elements.nextBtn.addEventListener('click', nextQuestion);
        
        // Results
        elements.restartBtn.addEventListener('click', restartQuiz);
        elements.shareBtn.addEventListener('click', shareResults);
        
        // Audio preload
        preloadAudio();
    }

    // Initialize Application
    function initApplication() {
        initEventListeners();
        loadQuestions();
        updateStartScreenStats();
        elements.highScore.textContent = state.highScore;
        
        // Set initial theme
        const savedTheme = localStorage.getItem('quizTheme') || 'dark';
        document.body.setAttribute('data-theme', savedTheme);
        elements.themeIcon.className = savedTheme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
    }

    // Load Questions
    function loadQuestions() {
        const savedQuestions = localStorage.getItem('quizQuestions');
        state.questions = savedQuestions ? JSON.parse(savedQuestions) : getDefaultQuestions();
        state.totalQuestions = state.questions.length;
        elements.totalQuestionsCount.textContent = state.totalQuestions;
        elements.totalQ.textContent = Math.min(10, state.totalQuestions);
    }

    // Get Default Questions
    function getDefaultQuestions() {
        return [
            {
                id: 1,
                question: "What is the purpose of the 'use strict' directive in JavaScript?",
                options: [
                    "Enforces stricter parsing and error handling",
                    "Enables experimental features",
                    "Improves performance",
                    "Allows insecure operations"
                ],
                correct: 0
            },
            {
                id: 2,
                question: "Which CSS property is used to create a flex container?",
                options: [
                    "display: flex;",
                    "flex: 1;",
                    "flex-direction: row;",
                    "justify-content: center;"
                ],
                correct: 0
            },
            {
                id: 3,
                question: "What does the 'this' keyword refer to in JavaScript?",
                options: [
                    "The current function",
                    "The global object",
                    "The object that owns the executing code",
                    "The parent function"
                ],
                correct: 2
            },
            {
                id: 4,
                question: "Which method is used to add an event listener in JavaScript?",
                options: [
                    "addEventListener()",
                    "attachEvent()",
                    "onEvent()",
                    "listen()"
                ],
                correct: 0
            },
            {
                id: 5,
                question: "What is the output of: console.log(1 + '2' + 3)?",
                options: [
                    "6",
                    "123",
                    "15",
                    "Error"
                ],
                correct: 1
            },
            {
                id: 6,
                question: "Which HTML5 element is used for drawing graphics?",
                options: [
                    "<canvas>",
                    "<svg>",
                    "<graphics>",
                    "<draw>"
                ],
                correct: 0
            },
            {
                id: 7,
                question: "What is a closure in JavaScript?",
                options: [
                    "A function with access to its outer scope",
                    "A way to close a browser tab",
                    "A method to stop execution",
                    "A type of loop"
                ],
                correct: 0
            },
            {
                id: 8,
                question: "Which CSS unit is relative to the root element?",
                options: [
                    "rem",
                    "em",
                    "px",
                    "%"
                ],
                correct: 0
            },
            {
                id: 9,
                question: "What does API stand for?",
                options: [
                    "Application Programming Interface",
                    "Advanced Programming Interface",
                    "Application Process Integration",
                    "Automated Programming Interface"
                ],
                correct: 0
            },
            {
                id: 10,
                question: "Which method creates a new array with results of calling a function?",
                options: [
                    "map()",
                    "filter()",
                    "reduce()",
                    "forEach()"
                ],
                correct: 0
            }
        ];
    }

    // Get Random Questions
    function getRandomQuestions() {
        const availableQuestions = state.questions.filter(q => !state.usedQuestionIds.has(q.id));
        
        if (availableQuestions.length === 0) {
            // Reset used questions if all have been used
            state.usedQuestionIds.clear();
            return getRandomQuestions();
        }
        
        const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, Math.min(10, shuffled.length));
        
        // Mark questions as used
        selected.forEach(q => state.usedQuestionIds.add(q.id));
        
        return selected;
    }

    // FIXED: Shuffle options and track correct answer
    function shuffleOptions(question) {
        // Create array of option indices [0, 1, 2, 3]
        const indices = question.options.map((_, index) => index);
        
        // Shuffle the indices
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        
        // Create shuffled options array
        const shuffledOptions = indices.map(index => question.options[index]);
        
        // Find where the correct answer moved to
        const newCorrectIndex = indices.indexOf(question.correct);
        
        return {
            question: question.question,
            options: shuffledOptions,
            correct: newCorrectIndex,
            originalCorrect: question.correct,
            id: question.id
        };
    }

    // Start Quiz
    function startQuiz() {
        playClickSound();
        
        // Get random questions
        const selectedQuestions = getRandomQuestions();
        
        if (selectedQuestions.length === 0) {
            alert('Please add questions in the admin panel first!');
            showAdmin();
            return;
        }
        
        // FIXED: Shuffle options for each question
        state.currentQuestions = selectedQuestions.map(question => shuffleOptions(question));
        
        // Reset state
        state.currentIndex = 0;
        state.score = 0;
        state.selectedOption = null;
        state.isAnswered = false;
        state.timeLeft = 30;
        
        // Update UI
        elements.currentScore.textContent = '0';
        elements.timer.textContent = '30';
        elements.timerBadge.classList.remove('pulse');
        elements.challengeNumber.textContent = '1';
        
        // Switch screen
        switchScreen('quizScreen');
        
        // Load first question
        loadQuestion();
        startTimer();
    }

    // Load Question
    function loadQuestion() {
        resetQuestionUI();
        
        // FIXED: Get current question data (already shuffled)
        const questionData = state.currentQuestions[state.currentIndex];
        if (!questionData) return;
        
        // Store current question data in state for reference
        state.currentQuestionData = questionData;
        
        // Update UI
        elements.questionText.textContent = questionData.question;
        elements.currentQ.textContent = state.currentIndex + 1;
        elements.challengeNumber.textContent = state.currentIndex + 1;
        
        // Update progress bar
        const progress = ((state.currentIndex + 1) / state.currentQuestions.length) * 100;
        elements.progressFill.style.width = `${progress}%`;
        
        // Create option buttons with SHUFFLED options
        questionData.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.innerHTML = `
                <span class="option-letter">${String.fromCharCode(65 + index)}</span>
                <span class="option-text">${option}</span>
            `;
            
            button.addEventListener('click', () => selectOption(index, button));
            elements.optionsGrid.appendChild(button);
        });
        
        // Reset next button
        elements.nextBtn.classList.add('disabled');
        elements.nextBtn.style.pointerEvents = 'none';
        
        // Reset feedback
        elements.feedbackCard.style.opacity = '0.7';
        elements.feedbackText.textContent = 'Select your answer. Choose wisely!';
        elements.feedbackText.className = 'feedback-text';
    }

    // Select Option
    function selectOption(selectedIndex, button) {
        if (state.isAnswered) return;
        
        playClickSound();
        state.isAnswered = true;
        state.selectedOption = selectedIndex;
        
        // FIXED: Use the shuffled correct index
        const correctIndex = state.currentQuestionData.correct;
        const optionButtons = elements.optionsGrid.querySelectorAll('.option-btn');
        
        // Disable all options
        optionButtons.forEach(btn => {
            btn.style.pointerEvents = 'none';
        });
        
        // Mark selected option
        button.classList.add('selected');
        
        // Check answer using SHUFFLED indices
        if (selectedIndex === correctIndex) {
            // Correct answer
            button.classList.add('correct');
            playCorrectSound();
            
            // Calculate points (base + time bonus)
            const basePoints = 100;
            const timeBonus = Math.floor(state.timeLeft / 3) * 10;
            const points = basePoints + timeBonus;
            
            state.score += points;
            elements.currentScore.textContent = state.score;
            
            // Update feedback
            elements.feedbackCard.style.opacity = '1';
            elements.feedbackText.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <strong>CORRECT!</strong> +${points} points
                ${timeBonus > 0 ? `(${timeBonus} time bonus)` : ''}
            `;
            elements.feedbackText.classList.add('correct');
            
        } else {
            // Wrong answer
            button.classList.add('wrong');
            optionButtons[correctIndex].classList.add('correct');
            playWrongSound();
            
            // Update feedback
            elements.feedbackCard.style.opacity = '1';
            elements.feedbackText.innerHTML = `
                <i class="fas fa-times-circle"></i>
                <strong>INCORRECT!</strong> The right answer was: 
                <strong>${state.currentQuestionData.options[correctIndex]}</strong>
            `;
            elements.feedbackText.classList.add('wrong');
        }
        
        // Enable next button
        elements.nextBtn.classList.remove('disabled');
        elements.nextBtn.style.pointerEvents = 'auto';
        elements.nextBtn.style.animation = 'nextPulse 1s infinite';
        
        // Stop timer
        clearInterval(state.timerInterval);
    }

    // Next Question
    function nextQuestion() {
        playClickSound();
        
        state.currentIndex++;
        state.isAnswered = false;
        state.selectedOption = null;
        state.timeLeft = 30;
        state.currentQuestionData = null;
        
        elements.timer.textContent = '30';
        elements.timerBadge.classList.remove('pulse');
        elements.nextBtn.classList.remove('disabled');
        elements.nextBtn.style.animation = '';
        
        if (state.currentIndex < state.currentQuestions.length) {
            loadQuestion();
            startTimer();
        } else {
            showResults();
        }
    }

    // Start Timer
    function startTimer() {
        clearInterval(state.timerInterval);
        state.timeLeft = 30;
        elements.timer.textContent = state.timeLeft;
        
        state.timerInterval = setInterval(() => {
            state.timeLeft--;
            elements.timer.textContent = state.timeLeft;
            
            if (state.timeLeft <= 10) {
                elements.timerBadge.classList.add('pulse');
            }
            
            if (state.timeLeft <= 0) {
                clearInterval(state.timerInterval);
                if (!state.isAnswered) {
                    autoSelectAnswer();
                }
            }
        }, 1000);
    }

    // Auto Select Answer when time runs out
    function autoSelectAnswer() {
        if (state.isAnswered) return;
        
        const optionButtons = elements.optionsGrid.querySelectorAll('.option-btn');
        const randomIndex = Math.floor(Math.random() * optionButtons.length);
        optionButtons[randomIndex].click();
    }

    // Show Results
    function showResults() {
        switchScreen('resultScreen');
        
        const totalQuestions = state.currentQuestions.length;
        const percentage = Math.round((state.score / (totalQuestions * 150)) * 100);
        const correctAnswers = Math.floor(state.score / 100);
        const timeBonus = state.score - (correctAnswers * 100);
        
        // Update high score if needed
        if (state.score > state.highScore) {
            state.highScore = state.score;
            localStorage.setItem('quizHighScore', state.score);
            elements.highScore.textContent = state.score;
        }
        
        // Animate score circle
        animateScoreCircle(percentage);
        
        // Update UI
        elements.finalScore.textContent = percentage;
        elements.correctCount.textContent = correctAnswers;
        elements.incorrectCount.textContent = totalQuestions - correctAnswers;
        elements.timeBonus.textContent = timeBonus;
        
        // Set result message
        let message = '';
        if (percentage >= 90) {
            message = "LEGENDARY! You're a coding mastermind! 🏆 Perfect score!";
        } else if (percentage >= 75) {
            message = "EXCELLENT! You know your stuff like a pro! ⭐";
        } else if (percentage >= 60) {
            message = "GREAT JOB! Solid understanding of the concepts! 👍";
        } else if (percentage >= 40) {
            message = "GOOD EFFORT! Keep practicing and you'll master it! 📚";
        } else {
            message = "NICE TRY! Review the basics and challenge again! 💪";
        }
        elements.resultMessage.textContent = message;
        
        // Create confetti
        createConfetti();
        
        // Play celebration sound
        if (percentage >= 75) {
            playCorrectSound();
        }
    }

    // Animate Score Circle
    function animateScoreCircle(percentage) {
        const circle = document.querySelector('.progress-ring-fill');
        const radius = circle.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;
        
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = circumference;
        
        setTimeout(() => {
            circle.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
            circle.style.strokeDashoffset = offset;
        }, 300);
    }

    // Create Confetti
    function createConfetti() {
        const container = document.querySelector('.confetti-container');
        container.innerHTML = '';
        
        const confettiCount = 100;
        const colors = ['#00ffcc', '#0099ff', '#ff3366', '#ffcc00', '#00ff88'];
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'absolute';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.borderRadius = '50%';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.top = '-20px';
            confetti.style.opacity = '0';
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            
            // Animation
            const animation = confetti.animate([
                { 
                    opacity: 0, 
                    transform: `translateY(0) rotate(0deg)`,
                    top: '-20px'
                },
                { 
                    opacity: 1, 
                    transform: `translateY(0) rotate(0deg)`,
                    top: '-20px'
                },
                { 
                    opacity: 1,
                    transform: `translateY(${100 + Math.random() * 100}vh) rotate(${Math.random() * 720}deg)`,
                    top: '100vh'
                },
                { 
                    opacity: 0,
                    top: '100vh'
                }
            ], {
                duration: 2000 + Math.random() * 2000,
                delay: Math.random() * 1000,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
            });
            
            container.appendChild(confetti);
            
            // Remove after animation
            animation.onfinish = () => confetti.remove();
        }
    }

    // Restart Quiz
    function restartQuiz() {
        playClickSound();
        startQuiz();
    }

    // Share Results
    function shareResults() {
        playClickSound();
        
        const shareText = `🎯 I scored ${state.score} points on Quiz Challenge Pro! ` +
                         `Can you beat my high score of ${state.highScore}? ` +
                         `Challenge yourself at: ${window.location.href}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'My Quiz Challenge Results',
                text: shareText,
                url: window.location.href
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(shareText)
                .then(() => {
                    alert('Results copied to clipboard! 📋');
                })
                .catch(console.error);
        }
    }

    // Go Home
    function goHome() {
        playClickSound();
        switchScreen('startScreen');
        updateStartScreenStats();
    }

    // Switch Screen
    function switchScreen(screenName) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenName).classList.add('active');
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Show Admin Panel
    function showAdmin() {
        playClickSound();
        switchScreen('adminScreen');
    }

    // Hide Admin Panel
    function hideAdmin() {
        playClickSound();
        switchScreen('startScreen');
    }

    // Toggle Theme
    function toggleTheme() {
        playClickSound();
        
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.body.setAttribute('data-theme', newTheme);
        elements.themeIcon.className = newTheme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
        
        localStorage.setItem('quizTheme', newTheme);
    }

    // Update Start Screen Stats
    function updateStartScreenStats() {
        loadQuestions();
        elements.totalQuestionsCount.textContent = state.totalQuestions;
        elements.highScore.textContent = state.highScore;
    }

    // Reset Question UI
    function resetQuestionUI() {
        elements.optionsGrid.innerHTML = '';
        elements.feedbackCard.style.opacity = '0.7';
        elements.feedbackText.textContent = 'Select your answer. Choose wisely!';
        elements.feedbackText.className = 'feedback-text';
        elements.timerBadge.classList.remove('pulse');
    }

    // Audio Functions
    function preloadAudio() {
        // Audio elements are already in HTML
    }

    function playCorrectSound() {
        elements.correctSound.currentTime = 0;
        elements.correctSound.play().catch(() => {
            // Audio play failed (user gesture required)
        });
    }

    function playWrongSound() {
        elements.wrongSound.currentTime = 0;
        elements.wrongSound.play().catch(() => {
            // Audio play failed (user gesture required)
        });
    }

    function playClickSound() {
        elements.clickSound.currentTime = 0;
        elements.clickSound.play().catch(() => {
            // Audio play failed (user gesture required)
        });
    }
});