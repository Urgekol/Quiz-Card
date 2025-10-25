const flashCard = document.getElementById('flashCard');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressBar = document.getElementById('progressBar');
const cardCount = document.getElementById('cardCount');
const questionText = document.getElementById('questionText');
const answerText = document.getElementById('answerText');
const endQuizBtn = document.getElementById('endQuizBtn');
const flipHint = document.getElementById('flipHint');

// --- Quiz State ---
let currentCardIndex = 1;
const TOTAL_QUESTIONS = 10;
let quizData = [];

const API_URL = `https://opentdb.com/api.php?amount=${TOTAL_QUESTIONS}&category=9&type=multiple`;

// =================================================================
// 1. API FETCHING LOGIC
// =================================================================

async function fetchQuizQuestions() {
    // Resetting UI/State for start or restart
    currentCardIndex = 1;
    questionText.innerHTML = "Loading questions...";
    answerText.innerHTML = "";
    flashCard.style.cursor = 'wait';
    prevBtn.style.display = 'block'; // Ensure buttons are visible during load
    nextBtn.style.display = 'block';
    
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.response_code !== 0) {
            console.error("API Error: No results returned or invalid parameters.");
            questionText.innerHTML = "Error: Could not retrieve questions for this category. (Try another refresh)";
            return; 
        }

        quizData = data.results.map(item => ({
            question: item.question,
            answer: item.correct_answer 
        }));
        
        flashCard.style.cursor = 'pointer';
        loadCard(currentCardIndex);
        updateProgress();

    } 
    catch (error) {
        console.error("Error fetching quiz questions:", error);
        questionText.innerHTML = "Network Error: Failed to load quiz questions. Check your connection.";
        prevBtn.disabled = true;
        nextBtn.disabled = true;
    }
}

// =================================================================
// 2. UI UPDATE & NAVIGATION LOGIC
// =================================================================

function loadCard(index) {
    const dataIndex = index - 1; 

    if (dataIndex >= 0 && dataIndex < quizData.length) {
        const currentQuestion = quizData[dataIndex];
        
        flipHint.style.display = 'block'; 

        flashCard.classList.remove('flipped');
        
        questionText.innerHTML = currentQuestion.question;
        answerText.innerHTML = currentQuestion.answer; 

    } 
    else if (index > quizData.length) {
        // STATE: Quiz Finished (on the 11th click after 10 questions)
        questionText.innerHTML = "Quiz Complete! 🎉";
        answerText.innerHTML = "You've gone through all 10 cards. Click 'Reset Quiz' to play again!";
        
        flipHint.style.display = 'none'; 
        
        flashCard.classList.remove('flipped');
        flashCard.style.cursor = 'default';
    }
}

function updateProgress() {
    const isQuizComplete = currentCardIndex > TOTAL_QUESTIONS;
    
    const progressCard = Math.min(currentCardIndex, TOTAL_QUESTIONS);
    const progressPercentage = (progressCard / TOTAL_QUESTIONS) * 100;
    
    progressBar.style.width = `${progressPercentage}%`;
    cardCount.textContent = `Card ${progressCard} / ${TOTAL_QUESTIONS}`;
    
    // -----------------------------------------------------------
    // LOGIC: Conditional Button Display (Reset Button fetches new data)
    // -----------------------------------------------------------
    if (isQuizComplete) {
        // 1. Hide the Previous button
        prevBtn.style.display = 'none';
        
        // 2. Transform the Next button into the Reset button
        nextBtn.textContent = 'Reset Quiz';
        nextBtn.classList.add('btn-reset');
        nextBtn.classList.remove('btn-next');
        nextBtn.style.display = 'block';
        
        // 3. Swap the event handler to the reset function
        nextBtn.removeEventListener('click', nextQuestionHandler); 
        nextBtn.addEventListener('click', resetQuizAndFetch, { once: true }); 

    } else {
        // Normal quiz view
        prevBtn.style.display = 'block';
        nextBtn.style.display = 'block';

        nextBtn.textContent = 'Next';
        nextBtn.classList.add('btn-next');
        nextBtn.classList.remove('btn-reset');
        
        // Ensure the Next button has the standard handler
        nextBtn.removeEventListener('click', resetQuizAndFetch); 
        // Only re-add the nextQuestionHandler if it's not the last card state
        // The handler is permanently attached at init, but removing/adding guarantees clean state:
        nextBtn.removeEventListener('click', nextQuestionHandler);
        nextBtn.addEventListener('click', nextQuestionHandler);

        prevBtn.disabled = currentCardIndex <= 1;
        nextBtn.disabled = false;
    }
    
    // Final navigation state control
    prevBtn.disabled = currentCardIndex <= 1;
    nextBtn.disabled = false; // The text/functionality change handles the "end" state
}

// -----------------------------------------------------------
// NEW FUNCTION: Reset Quiz (Fetches new data)
// -----------------------------------------------------------

function resetQuizAndFetch() {
    // 1. Reset array data
    quizData = [];
    
    // 2. Remove the one-time event listener to prevent duplicates on the next click
    nextBtn.removeEventListener('click', resetQuizAndFetch); 

    // 3. Restart the fetch process (which resets currentCardIndex to 1)
    fetchQuizQuestions();
}

// -----------------------------------------------------------
// HELPER FUNCTION: Redirect to Index (Used by End Quiz)
// -----------------------------------------------------------

function redirectToIndex() {
    window.location.href = 'index.html';
}

// =================================================================
// 3. EVENT LISTENERS
// =================================================================

const nextQuestionHandler = () => {
    // Logic to force un-flip and transition (300ms delay)
    if (currentCardIndex < TOTAL_QUESTIONS + 1) 
    {
        flashCard.classList.remove('flipped');
        
        setTimeout(() => {
            currentCardIndex++;
            loadCard(currentCardIndex);
            updateProgress();
        }, 300); 
    }
};

flashCard.addEventListener('click', () => {
    if (quizData.length > 0 && currentCardIndex <= TOTAL_QUESTIONS) {
        flashCard.classList.toggle('flipped');
    }
});


// Initial attachment of the Next button handler is done via updateProgress now 
// to ensure the state management is clean, but for initialization we need it:
// nextBtn.addEventListener('click', nextQuestionHandler); // Removed this line from init


prevBtn.addEventListener('click', () => {
    if (currentCardIndex > 1) 
    {
        currentCardIndex--;
        loadCard(currentCardIndex);
        updateProgress();
    }
});

// "End Quiz" button uses the redirect function
endQuizBtn.addEventListener('click', redirectToIndex);

// =================================================================
// 4. INITIALIZATION
// =================================================================

// Attach initial next handler and start the quiz
nextBtn.addEventListener('click', nextQuestionHandler); 
fetchQuizQuestions();