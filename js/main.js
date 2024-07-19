import { words as INITIAL_WORDS } from './data.js';

  const $time = document.querySelector('time');
  const $paragraph = document.querySelector('p');
  const $input = document.querySelector('input');
  const $game = document.querySelector('#game');
  const $results = document.querySelector('#results');
  const $wpm = $results.querySelector('#results-wpm');
  const $accuracy = $results.querySelector('#results-accuracy');
  const $button = document.querySelector('#reload-button');
  const $activeButtonTime = document.querySelector('.textButton[mode="time"]')
  const $activeButtonWords = document.querySelector('.textButton[mode="words"]')
  const $startTimer = document.querySelector('.time')
  const $countWords = document.querySelector('.wordCount')
  const $textButtonTime = document.querySelectorAll('.time .textButton')
  const $textButtonWords = document.querySelectorAll('.wordCount .textButton')

  const INITIAL_TIME = 30;  
  const INITIAL_WORD_COUNT = 32;
  
  let words = []
  let currentTime = INITIAL_TIME;
  let wordCount = INITIAL_WORD_COUNT
  let intervalId;

  initGame()
  initEvents()


  function initTimer () {
    $startTimer.classList.add('hidden')
    $countWords.classList.remove('hidden')
  
  }

  function intitWords () {
    $countWords.classList.add('hidden')
    $startTimer.classList.remove('hidden')
  }

 

  function initGame() {
    $game.style.display = 'flex';
    $results.style.display = 'none';
    $input.value = ''

    words = INITIAL_WORDS.toSorted(
      () => Math.random() - 0.5
    ).slice(0,wordCount)

    currentTime = INITIAL_TIME;

    $time.textContent = currentTime;

    $paragraph.innerHTML = words.map((word, index) => {
      const letters = word.split('')

      return `<x-word>
        ${letters
        .map(letter => `<x-letter>${letter}</x-letter>`)
        .join('')
        }
        </x-word>`
    }).join('')

    const $firstWord = $paragraph.querySelector('x-word')
    $firstWord.classList.add('active')
    $firstWord.querySelector('x-letter').classList.add('active')

    const intervalId = setInterval(() => {
      currentTime--;
      $time.textContent = currentTime

      if(currentTime === 0){
        clearInterval(intervalId)
        gameOver()
      }
    }, 1000)
  }


  function initEvents() {
    document.addEventListener('keydown', () => {
      $input.focus()
    })
    $input.addEventListener('keydown', onKeyDown)
    $input.addEventListener('keyup', onKeyUp)
    $button.addEventListener('click', initGame)
    $activeButtonTime.addEventListener('click', initTimer)
    $activeButtonWords.addEventListener('click', intitWords)
    // $startTimer.addEventListener('click', countTime)

    $textButtonTime.forEach(button => {
      button.addEventListener('click', () => {
        const timeConfig = button.getAttribute('timeconfig');
        currentTime = parseInt(timeConfig, 10);
        $time.textContent = currentTime;
        clearInterval(intervalId); 
      });
    });

    $textButtonWords.forEach(button => {
      button.addEventListener('click', () => {
        const wordCountConfig = button.textContent.trim()
        wordCount = parseInt(wordCountConfig, 10)
        initGame()
      })
    })
  }


  function onKeyDown (event) {
    
  const $currentWord = $paragraph.querySelector('x-word.active')
  const $currentLetter = $currentWord.querySelector('x-letter.active')
    
    const { key } = event
    if (key === ' ') {
      event.preventDefault()

      const $nextWord = $currentWord.nextElementSibling
      const $nextLetter = $nextWord.querySelector('x-letter')

      $currentWord.classList.remove('active', 'marked')
      $currentLetter.classList.remove('active')

      $nextWord.classList.add('active')
      $nextLetter.classList.add('active')

      $input.value = ''

      const hasMissedLetters = $currentWord
      .querySelectorAll('x-letter:not(.correct)').length > 0

      const classToAdd = hasMissedLetters ? 'marked' : 'correct'
      $currentWord.classList.add(classToAdd)
      return
    }

    if (key === 'Backspace') {
      const $prevWord = $currentWord.previousElementSibling
      const $prevLetter = $currentLetter.previousElementSibling

      if(!$prevWord && !$prevLetter) {
        event.preventDefault()
        return
      }

      const $wordMarked = $paragraph.querySelector('x-word.marked')

      if($wordMarked && !$prevLetter) {
        event.preventDefault()
        $prevWord.classList.remove('marked')
        $prevWord.classList.add('active')

        const $letterToGo = $prevWord.querySelector('x-letter:last-child')

        $currentLetter.classList.remove('active')
        $letterToGo.classList.add('active')

        $input.value = [
          ...$prevWord.querySelectorAll('x-letter.correct, x-letter.incorrect')
        ].map( $el => {
          return $el.classList.contains('correct') ? $el.innerText : '*'
        })
        .join('')
      }
    }
  }

  function onKeyUp() {
    const $currentWord = $paragraph.querySelector('x-word.active');
    const $currentLetter = $currentWord.querySelector('x-letter.active')
  

    const currentWord = $currentWord.innerText.trim()
    $input.maxLength = currentWord.length
    console.log({value: $input.value,currentWord})

    const $allLetters = $currentWord.querySelectorAll('x-letter')

    $allLetters.forEach($letter => $letter.classList.remove('correct', 'incorrect'))

    $input.value.split('').forEach((char, index) => {
      const $letter = $allLetters [index]
      const letterToCheck = currentWord[index]

      const isCorrect = char === letterToCheck
      const letterClass = isCorrect ? 'correct' : 'incorrect'
      $letter.classList.add(letterClass)

      $currentLetter.classList.remove('active', 'is-last')
      const inputLength = $input.value.length
      const $nextActiveLetter = $allLetters[inputLength]

      if($nextActiveLetter) {
        $nextActiveLetter.classList.add('active')
      } else {
        $currentLetter.classList.add('active', 'is-last')
      }

    })
  }

  function gameOver() {
    $game.style.display = 'none'
    $results.style.display = 'flex'

    const correctWords = $paragraph.querySelectorAll('x-word.correct').length
    const correctLetter = $paragraph.querySelectorAll('x-letter.correct').length
    const incorrectLetter = $paragraph.querySelectorAll('x-letter.incorrect').length

    const totalLetters = correctLetter + incorrectLetter
    const accuracy = totalLetters > 0
    ? (correctLetter / totalLetters) * 100
    : 0

    const wpm = correctWords * 60 / INITIAL_TIME
    $wpm.textContent = wpm
    $accuracy.textContent = `${accuracy.toFixed(2)}%`

  }