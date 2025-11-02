const flashCard = document.getElementById('flashCard');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressBar = document.getElementById('progressBar');
const cardCount = document.getElementById('cardCount');
const questionText = document.getElementById('questionText');
const answerText = document.getElementById('answerText');
const endQuizBtn = document.getElementById('endQuizBtn');
const flipHint = document.getElementById('flipHint');

let currentCardIndex = 1;
const TOTAL_QUESTIONS = 10;
let quizData = [];

const API_URL = `https://opentdb.com/api.php?amount=${TOTAL_QUESTIONS}&category=9&type=multiple`;


async function fetchQuizQuestions() 
{
    currentCardIndex = 1;
    questionText.innerHTML = "Loading questions...";
    answerText.innerHTML = "";
    flashCard.style.cursor = 'wait';
    prevBtn.style.display = 'block';
    nextBtn.style.display = 'block';
    
    try 
    {
        const response = await fetch(API_URL);
        if (!response.ok) 
        {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.response_code !== 0) 
        {
            console.error("API Error: No results returned or invalid parameters.");
            questionText.innerHTML = "Error: Could not retrieve questions for this category.";

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
    catch (error) 
    {
        console.error("Error fetching quiz questions:", error);
        questionText.innerHTML = "Network Error: Failed to load quiz questions.";
        prevBtn.disabled = true;
        nextBtn.disabled = true;
    }
}


function loadCard(index) 
{
    const dataIndex = index - 1; 

    if (dataIndex >= 0 && dataIndex < quizData.length) 
    {
        const currentQuestion = quizData[dataIndex];
        
        flipHint.style.display = 'block'; 

        flashCard.classList.remove('flipped');
        
        questionText.innerHTML = currentQuestion.question;
        answerText.innerHTML = currentQuestion.answer; 

    } 
    else if (index > quizData.length) 
    {
        questionText.innerHTML = "Quiz Complete! 🎉";
        
        flipHint.style.display = 'none'; 
        
        flashCard.classList.remove('flipped');
        flashCard.style.cursor = 'default';
    }
}


function updateProgress() 
{
    const isQuizComplete = currentCardIndex > TOTAL_QUESTIONS;
    
    const progressCard = Math.min(currentCardIndex, TOTAL_QUESTIONS);
    const progressPercentage = (progressCard / TOTAL_QUESTIONS) * 100;
    
    progressBar.style.width = `${progressPercentage}%`;
    cardCount.textContent = `Card ${progressCard} / ${TOTAL_QUESTIONS}`;
    
    if (isQuizComplete) 
    {
        prevBtn.style.display = 'none';
        
        nextBtn.textContent = 'Reset Quiz';
        nextBtn.classList.add('btn-reset');
        nextBtn.classList.remove('btn-next');
        nextBtn.style.display = 'block';
        
        nextBtn.removeEventListener('click', nextQuestionHandler); 
        nextBtn.addEventListener('click', resetQuizAndFetch, { once: true }); 

    } 
    else 
    {
        prevBtn.style.display = 'block';
        nextBtn.style.display = 'block';

        nextBtn.textContent = 'Next';
        nextBtn.classList.add('btn-next');
        nextBtn.classList.remove('btn-reset');
        
        nextBtn.removeEventListener('click', resetQuizAndFetch); 

        nextBtn.removeEventListener('click', nextQuestionHandler);
        nextBtn.addEventListener('click', nextQuestionHandler);

        prevBtn.disabled = currentCardIndex <= 1;
        nextBtn.disabled = false;
    }
    
    prevBtn.disabled = currentCardIndex <= 1;
    nextBtn.disabled = false; 
}


function resetQuizAndFetch() 
{
    quizData = [];
    
    nextBtn.removeEventListener('click', resetQuizAndFetch); 

    fetchQuizQuestions();
}


function redirectToIndex() 
{
    window.location.href = 'index.html';
}


const nextQuestionHandler = () => {

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

    if (quizData.length > 0 && currentCardIndex <= TOTAL_QUESTIONS) 
    {
        flashCard.classList.toggle('flipped');
    }
});


prevBtn.addEventListener('click', () => {

    if (currentCardIndex > 1) 
    {
        currentCardIndex--;
        loadCard(currentCardIndex);
        updateProgress();
    }
});


endQuizBtn.addEventListener('click', redirectToIndex);

nextBtn.addEventListener('click', nextQuestionHandler); 


fetchQuizQuestions();