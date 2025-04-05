document.addEventListener('DOMContentLoaded', () => {

    // window.addEventListener('beforeunload', (e) => {
    //     e.preventDefault();
    //     e.value = '' ;  // Standard way to trigger confirmation dialog if user does by chrome-Reload button.
    // } ) ;

    // // Prevent page reload on F5 or Ctrl+R
    // document.addEventListener('keydown', function (e) {
    //     if ( (e.key === "F5") || (e.ctrlKey && e.key === "r") ) {
    //         e.preventDefault() ;
    //         alert("Reloading is disabled during the quiz.");
    //     }
    // } ) ;
    
    const startButton = document.getElementById('start-quiz') ;
    const choicesDiv = document.querySelector('.choices') ;
    const correctQuestions = document.getElementById('correct') ;
    const totalQuestions = document.getElementById('total') ;
    const nextButton = document.getElementById('next-question-btn') ;
    const resultDiv = document.querySelector('.result-box') ;
    const timeStatus = document.getElementById('time-status') ;

    let username = '' ;
    let questionIdx = 0 ;
    let pts = 0 ;
    let timer = null ;
    let remainingTime = 0 , maxTime = 0 ;
    let stats = JSON.parse( localStorage.getItem('stats') ) || { name: '' , score: 0 , time: Number.MAX_SAFE_INTEGER } ;
    const triviaURLs = 
    [   "https://opentdb.com/api.php?amount=10&category=19&difficulty=medium&type=multiple",
        "https://opentdb.com/api.php?amount=10&category=9&difficulty=medium&type=multiple",
        "https://opentdb.com/api.php?amount=10&category=22&difficulty=medium&type=multiple", 
        "https://opentdb.com/api.php?amount=10&category=9&difficulty=hard&type=multiple" ,
        "https://opentdb.com/api.php?amount=10&category=23&difficulty=medium&type=multiple",
        "https://opentdb.com/api.php?amount=10&category=18&difficulty=medium&type=multiple",
        "https://opentdb.com/api.php?amount=10&category=15&difficulty=medium&type=multiple",
        "https://opentdb.com/api.php?amount=10&category=19&difficulty=hard&type=multiple",
        "https://opentdb.com/api.php?amount=10&category=15&difficulty=hard&type=multiple",
        "https://opentdb.com/api.php?amount=10&category=21&difficulty=medium&type=multiple",
        "https://opentdb.com/api.php?amount=10&category=23&difficulty=hard&type=multiple",
        "https://opentdb.com/api.php?amount=10&category=18&difficulty=hard&type=multiple",
        "https://opentdb.com/api.php?amount=10&category=22&difficulty=hard&type=multiple",
        "https://opentdb.com/api.php?amount=10&category=21&difficulty=hard&type=multiple"
    ] ;
    const questions = [] ;

    if( stats.name ) {
        document.getElementById('name').textContent = stats.name ;
        document.getElementById('score').textContent = stats.score ;
        document.getElementById('time').textContent = stats.time + 's';
    }

    startButton.addEventListener('click', ( e ) => {
        e.preventDefault() ;
        initializeQuiz() ;
    } ) ;

    choicesDiv.addEventListener('click', ( e ) => {
        if( e.target.classList.contains('ans') ) {
            checkAnswer( e ) ;
            nextButton.classList.add('pop-anim') ;
            clearInterval( timer ) ;
        }
    } ) ;

    nextButton.addEventListener('click', () => {
        questionIdx++ ;
        nextButton.classList.remove('pop-anim') ;
        if( questionIdx < questions.length ) {
            showQuestion() ;
            startTimer() ;
        }
        else
            showResult() ;

        if( questionIdx == questions.length - 1 )
            nextButton.textContent = 'End Quiz' ;
    } ) ;

    async function initializeQuiz() {
        username = document.getElementById('username').value.trim() ;
        if( !username )
            return ;
        
        try {
            const questionData = await fetchTriviaData() ;
            const objArr = questionData.results ;
            for( let i = 0 ; i < objArr.length ; i++ ) {
                const { question , correct_answer , incorrect_answers } = objArr[i] ;
                let choices = incorrect_answers.concat(correct_answer) ; // Used inbuilt-concat as it can 'merge' even const-arrays.
                shuffleArray( choices ) ;
                questions.push( { 
                    question, 
                    answer: correct_answer, 
                    choices 
                } ) ;
            }
            totalQuestions.textContent = questions.length
            correctQuestions.textContent = 0 ;
            maxTime = questions.length * 6 ;
            remainingTime = maxTime ;
            timeStatus.textContent = remainingTime ;
            startTimer() ; // Since we want timer for each time so setInterval NOT "Timeout" as its for once.
            showQuestion() ;
        }
        catch( error ) {
            alert( error ) ;
        }

        document.querySelector('.registration-card').classList.add("hidden") ;
        document.querySelector('.stats-card').classList.add("hidden") ;
        document.querySelector('.quiz-card').classList.remove("hidden") ;
        document.querySelector('.quiz-card').style.display = 'flex' ;
    }
    
    async function fetchTriviaData() {
        const triviaAPI = triviaURLs[ Math.floor( Math.random() * triviaURLs.length ) ] ;
        const response = await fetch( triviaAPI ) ;
        if( !response.ok )
            throw new Error(`Error while fetching questions: ${response.status}`) ;
        
        const data = await response.json() ;
        return data ;
    }

    // Fisher-Yates shuffle function to randomize the order of the array
    function shuffleArray(arr) {
        for ( let i = arr.length - 1 ; i >= 0 ; i-- ) {
            const j = Math.floor( Math.random() * (i + 1) ) ;
            [ arr[i], arr[j] ] = [ arr[j], arr[i] ] ; // Swap elements
        }
    }

    function startTimer() {
        timer = setInterval(() => {
            remainingTime--;
            timeStatus.textContent = remainingTime ; // Update time on UI

            if ( remainingTime <= 0 )
                showResult() ;
            else if( remainingTime < 10 ) 
                timeStatus.style.backgroundColor = 'rgb(199, 36, 14 , .8)' ;
        }, 1000) ;
    }

    function showQuestion() {
        const currentQuestion = questions[questionIdx] ;
        const { question , choices } = currentQuestion ;
        const questionText = document.getElementById('question') ;
        questionText.innerHTML = question ;  // It was given as HTML not direct question.

        choicesDiv.innerHTML = '' ; // MISTAKE ; Reset it also.
        for( let i = 0 ; i < choices.length ; i++ ) {
            const choice = choices[i] ;
            const choicePara = document.createElement('p') ;
            choicePara.textContent = choice ;
            choicePara.classList.add('ans') ;
            choicesDiv.appendChild(choicePara) ;
        }
    }

    function checkAnswer( e ) {
        const paras = choicesDiv.querySelectorAll('p') ; // MISTAKE ; Can't directly do on div as need to query all "paras" 1st.
        if( e.target.textContent === questions[questionIdx].answer ) {
            e.target.classList.add('correct-ans') ;
            pts++ ;
        }
        else
            e.target.classList.add('wrong-ans') ;

        paras.forEach( p => {
            p.style.pointerEvents = 'none' ;
            if( p.textContent === questions[questionIdx].answer ) // No-need of flag as can overwrite.
                p.classList.add('correct-ans') ;
        } ) ;    
        correctQuestions.textContent = pts ;
    }

    function showResult() {
        clearInterval( timer ) ; // Stop timer.
        // document.querySelector('.quiz-card').classList.add("hidden") ; // This was not working evenThough classlist was showing "hidden".
        document.querySelector('.quiz-card').style.display = 'none' ;
        document.querySelector('.result-box').classList.remove("hidden");
    
        let maxPoints = questions.length;
        let cupImage = resultDiv.querySelector('.cup-image');
        const msg = resultDiv.querySelector('.msg-txt');
    
        if ( pts > maxPoints * 0.8 ) {
            cupImage.setAttribute('src', './imgs/gold.png');
            msg.textContent = 'Fantastic! You nailed it! Your knowledge is top-notch. Keep up the great work!' ;
        } 
        else if ( pts <= maxPoints * 0.8 && pts > maxPoints * 0.6 ) {
            cupImage.setAttribute('src', './imgs/silver.png');
            msg.textContent = 'Great job! You did really well. A little more practice, and you\'ll be a pro!';
        } 
        else if ( pts <= maxPoints * 0.6 && pts >= maxPoints * 0.4 ) {
            cupImage.setAttribute('src', './imgs/bronze.png');
            msg.textContent = 'Nice work! You\'ve got the basics down. A bit more studying, and you\'ll be on fire!';
        } 
        else {
            cupImage.setAttribute('src', './imgs/emoji.png');
            msg.textContent = 'Don\'t worry, you gave it your best shot! Take your time to review and try again. You\'ll do better next time!';
        }

        // document.querySelector('.msg-txt').style['-webkit-text-fill-color'] = 'none' ; // Using directly '-' will give error with '.' operator so do like this.
        resultDiv.querySelector('.correct-result').textContent = pts
        resultDiv.querySelector('.total-result').textContent = questions.length;

        if( ( stats.score < pts ) || ( stats.score === pts && stats.time > maxTime - remainingTime ) ) {
            stats.name = username ;
            stats.score = pts ;
            stats.time = maxTime - remainingTime ;
        }
        const para = document.createElement('p') ;
        para.textContent = `New Record!` ;
        para.style.color = 'lime' ;
        msg.appendChild(para) ;
        localStorage.setItem( 'stats' , JSON.stringify( stats ) ) ;
        const restartBtn = resultDiv.querySelector('a') ;
        restartBtn.addEventListener('click' , () => {
            location.reload() ;
        } ) ;
    }
} ) ;