// Admin Panel Management
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const adminElements = {
        // Inputs
        newQuestion: document.getElementById('newQuestion'),
        optionsInputs: document.getElementById('optionsInputs'),
        addOptionBtn: document.getElementById('addOptionBtn'),
        correctAnswer: document.getElementById('correctAnswer'),
        saveQuestionBtn: document.getElementById('saveQuestionBtn'),
        clearFormBtn: document.getElementById('clearFormBtn'),
        questionsList: document.getElementById('questionsList'),
        totalChallenges: document.getElementById('totalChallenges'),
        storageUsed: document.getElementById('storageUsed'),
        
        // Audio
        clickSound: document.getElementById('clickSound')
    };

    let optionCount = 0;
    let nextQuestionId = 1000;

    // Initialize Admin Panel
    initAdminPanel();

    // Event Listeners
    adminElements.addOptionBtn.addEventListener('click', addOptionInput);
    adminElements.saveQuestionBtn.addEventListener('click', saveQuestion);
    adminElements.clearFormBtn.addEventListener('click', clearForm);
    
    // Live updates for correct answer dropdown
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('option-input-field')) {
            updateCorrectAnswerOptions();
        }
    });

    // Initialize Admin Panel
    function initAdminPanel() {
        // Add initial two options
        addOptionInput();
        addOptionInput();
        
        // Load existing questions
        loadQuestions();
        
        // Generate initial question ID
        const questions = JSON.parse(localStorage.getItem('quizQuestions') || '[]');
        if (questions.length > 0) {
            nextQuestionId = Math.max(...questions.map(q => q.id || 0)) + 1;
        }
    }

    // Add Option Input
    function addOptionInput() {
        if (optionCount >= 6) {
            alert('Maximum 6 options allowed per question');
            return;
        }
        
        playClickSound();
        
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option-input';
        optionDiv.innerHTML = `
            <input type="text" 
                   class="option-input-field"
                   placeholder="Option ${String.fromCharCode(65 + optionCount)}"
                   data-index="${optionCount}">
            <button class="btn-remove-option" onclick="removeOption(this)">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        adminElements.optionsInputs.appendChild(optionDiv);
        optionCount++;
        
        // Update correct answer options
        updateCorrectAnswerOptions();
        
        // Add animation
        optionDiv.style.animation = 'itemSlideIn 0.3s ease';
    }

    // Remove Option (global function for onclick)
    window.removeOption = function(button) {
        playClickSound();
        
        if (optionCount <= 2) {
            alert('Minimum 2 options required');
            return;
        }
        
        const optionDiv = button.parentElement;
        optionDiv.style.animation = 'itemSlideIn 0.3s ease reverse';
        
        setTimeout(() => {
            optionDiv.remove();
            optionCount--;
            updateCorrectAnswerOptions();
            updateOptionLabels();
        }, 300);
    };

    // Update Option Labels
    function updateOptionLabels() {
        const inputs = adminElements.optionsInputs.querySelectorAll('.option-input-field');
        inputs.forEach((input, index) => {
            input.placeholder = `Option ${String.fromCharCode(65 + index)}`;
            input.dataset.index = index;
        });
    }

    // Update Correct Answer Options
    function updateCorrectAnswerOptions() {
        const inputs = adminElements.optionsInputs.querySelectorAll('.option-input-field');
        adminElements.correctAnswer.innerHTML = '<option value="">Select the correct option</option>';
        
        inputs.forEach((input, index) => {
            const option = document.createElement('option');
            option.value = index;
            const text = input.value.trim() || `Option ${String.fromCharCode(65 + index)}`;
            option.textContent = `${String.fromCharCode(65 + index)}: ${text}`;
            adminElements.correctAnswer.appendChild(option);
        });
    }

    // Save Question
    function saveQuestion() {
        playClickSound();
        
        // Validate question
        const questionText = adminElements.newQuestion.value.trim();
        if (!questionText) {
            showError('Please enter a question');
            return;
        }
        
        // Get options
        const optionInputs = adminElements.optionsInputs.querySelectorAll('.option-input-field');
        const options = Array.from(optionInputs)
            .map(input => input.value.trim())
            .filter(option => option !== '');
        
        if (options.length < 2) {
            showError('Please enter at least 2 options');
            return;
        }
        
        // Check for duplicates
        const uniqueOptions = new Set(options);
        if (uniqueOptions.size !== options.length) {
            showError('Duplicate options are not allowed');
            return;
        }
        
        // Validate correct answer
        const correctAnswerIndex = parseInt(adminElements.correctAnswer.value);
        if (isNaN(correctAnswerIndex) || correctAnswerIndex < 0 || correctAnswerIndex >= options.length) {
            showError('Please select a valid correct answer');
            return;
        }
        
        // Create question object
        const newQuestion = {
            id: nextQuestionId++,
            question: questionText,
            options: options,
            correct: correctAnswerIndex,
            dateAdded: new Date().toISOString()
        };
        
        // Save to localStorage
        const existingQuestions = JSON.parse(localStorage.getItem('quizQuestions') || '[]');
        existingQuestions.push(newQuestion);
        localStorage.setItem('quizQuestions', JSON.stringify(existingQuestions));
        
        // Show success animation
        showSuccess('Question saved successfully!');
        
        // Clear form
        clearForm();
        
        // Reload questions list
        loadQuestions();
        
        // Update main quiz if running
        if (typeof loadQuestions === 'function' && window.parent.loadQuestions) {
            window.parent.loadQuestions();
        }
    }

    // Clear Form
    function clearForm() {
        playClickSound();
        
        adminElements.newQuestion.value = '';
        
        // Remove all but two options
        const optionInputs = adminElements.optionsInputs.querySelectorAll('.option-input-field');
        optionInputs.forEach((input, index) => {
            if (index >= 2) {
                input.parentElement.remove();
            } else {
                input.value = '';
            }
        });
        
        // Reset option count
        optionCount = Math.min(2, optionInputs.length);
        updateOptionLabels();
        updateCorrectAnswerOptions();
        adminElements.correctAnswer.value = '';
    }

    // Load Questions
    function loadQuestions() {
        const questions = JSON.parse(localStorage.getItem('quizQuestions') || '[]');
        
        // Update stats
        adminElements.totalChallenges.textContent = questions.length;
        const storagePercentage = Math.min(100, Math.round((questions.length / 50) * 100));
        adminElements.storageUsed.textContent = `${storagePercentage}%`;
        
        // Clear list
        adminElements.questionsList.innerHTML = '';
        
        if (questions.length === 0) {
            adminElements.questionsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No challenges created yet</p>
                    <small>Add your first challenge above!</small>
                </div>
            `;
            return;
        }
        
        // Add questions to list
        questions.forEach((question, index) => {
            const questionItem = document.createElement('div');
            questionItem.className = 'question-item';
            questionItem.innerHTML = `
                <div class="question-preview">
                    <div class="question-title">
                        <strong>#${index + 1}</strong> - ${question.question}
                    </div>
                    <div class="question-options">
                        ${question.options.map((opt, i) => `
                            <span class="option-tag ${i === question.correct ? 'correct-tag' : ''}">
                                ${String.fromCharCode(65 + i)}: ${opt}
                            </span>
                        `).join('')}
                    </div>
                </div>
                <button class="btn-delete" onclick="deleteQuestion(${question.id})">
                    <i class="fas fa-trash"></i> DELETE
                </button>
            `;
            
            // Stagger animation
            questionItem.style.animationDelay = `${index * 0.05}s`;
            adminElements.questionsList.appendChild(questionItem);
        });
    }

    // Delete Question (global function)
    window.deleteQuestion = function(questionId) {
        playClickSound();
        
        if (!confirm('Are you sure you want to delete this challenge?')) {
            return;
        }
        
        const questions = JSON.parse(localStorage.getItem('quizQuestions') || '[]');
        const updatedQuestions = questions.filter(q => q.id !== questionId);
        localStorage.setItem('quizQuestions', JSON.stringify(updatedQuestions));
        
        // Find and animate removal
        const questionItems = adminElements.questionsList.querySelectorAll('.question-item');
        questionItems.forEach(item => {
            const deleteBtn = item.querySelector('.btn-delete');
            if (deleteBtn && deleteBtn.onclick && deleteBtn.onclick.toString().includes(questionId.toString())) {
                item.style.animation = 'itemSlideIn 0.3s ease reverse';
                setTimeout(() => {
                    loadQuestions();
                }, 300);
            }
        });
        
        // Update main quiz if running
        if (typeof loadQuestions === 'function' && window.parent.loadQuestions) {
            window.parent.loadQuestions();
        }
    };

    // Show Error Message
    function showError(message) {
        const saveBtn = adminElements.saveQuestionBtn;
        const originalHTML = saveBtn.innerHTML;
        const originalBg = saveBtn.style.background;
        
        saveBtn.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        saveBtn.style.background = 'var(--error)';
        saveBtn.disabled = true;
        
        setTimeout(() => {
            saveBtn.innerHTML = originalHTML;
            saveBtn.style.background = originalBg;
            saveBtn.disabled = false;
        }, 2000);
    }

    // Show Success Message
    function showSuccess(message) {
        const saveBtn = adminElements.saveQuestionBtn;
        const originalHTML = saveBtn.innerHTML;
        
        saveBtn.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        saveBtn.style.background = 'var(--success)';
        
        setTimeout(() => {
            saveBtn.innerHTML = originalHTML;
            saveBtn.style.background = '';
        }, 2000);
    }

    // Play Click Sound
    function playClickSound() {
        adminElements.clickSound.currentTime = 0;
        adminElements.clickSound.play().catch(() => {
            // Audio play failed
        });
    }
});