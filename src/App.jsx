import './App.css';

import { useCallback, useEffect, useState } from "react";

import { wordsList } from "./data/words";

import StartScreen from './components/StartScreen';
import Game from './components/Game';
import GameOver from './components/GameOver';

// importar audios do jogo
import audioAcerto from "./assets/audio/acerto.mp3";
import audioErro from "./assets/audio/erro.mp3";

const stages = [
  {id: 1, name: "start"},
  {id: 2, name: "game"},
  {id: 3, name: "end"},
];

const guessesQtd = 5;
const scorePoints = 100;

function App() {
  const [gameStage, setGameStage] = useState(stages[0].name);
  const [words] = useState(wordsList);

  const [pickedWord, setPickedWord] = useState("");
  const [pickedCategory, setPickedCategory] = useState("");
  const [letters, setLetters] = useState([]);

  const [guessedLetters, setGuessedLetters] = useState([]);
  const [wrongLetters, setWrongLetters] = useState([]);
  const [guesses, setGuesses] = useState(guessesQtd);
  const [score, setScore] = useState(0);

  const playAudio = (bool) => {
    if (bool) {
      new Audio(audioAcerto).play();
    } else {
      new Audio(audioErro).play();
    }
  }

  const pickWordAndCategory = useCallback(() => {
    // pegar uma categoria aleatoria
    const categories = Object.keys(words);
    const category = categories[Math.floor(Math.random() * Object.keys(categories).length)];
    
    // pegar uma palavra aleatoria a partir da categoria
    const word = words[category][Math.floor(Math.random() * words[category].length)];

    return { word, category };
  }, [words]);

  // inicia o game
  const startGame = useCallback(() => {
    // limpar letras acertadas e erradas
    clearLetterStates();

    // pegar palavra e categoria
    const {word, category} = pickWordAndCategory();

    // criar um array com as letras
    let wordLetters = word.split("");
    
    // deixa todas as letras minusculas
    wordLetters = wordLetters.map((l) => l.toLowerCase())

    // aplica as informações
    setPickedCategory(category);
    setPickedWord(word);
    setLetters(wordLetters);

    setGameStage(stages[1].name);
  }, [pickWordAndCategory]);

  // verifica a letra digitada
  const verifyLetter = (letter) => {
    const normalizedLetter = letter.toLowerCase();

    // checa se a letra foi utilizada
    if (guessedLetters.includes(normalizedLetter) || wrongLetters.includes(normalizedLetter)) {
      return;
    }

    // inclui a letra correta ou remove uma chance
    if (letters.includes(normalizedLetter)) {
      setGuessedLetters((actualGuessedLetters) => [
        ...actualGuessedLetters,
        normalizedLetter,
      ]);

      playAudio(true);
    } else {
      setWrongLetters((actualWrongLetters) => [
        ...actualWrongLetters,
        normalizedLetter,
      ]);

      playAudio(false);
      
      setGuesses((actualGuesses) => actualGuesses -1);
    }
  };

  const clearLetterStates = () => {
    setGuessedLetters([]);
    setWrongLetters([]);
  }

  // checa se as tentativas acabaram
  useEffect(() => {
    if (guesses <= 0) {
      // resetar todos os states
      clearLetterStates();

      setGameStage(stages[2].name);
    }
  }, [guesses]);

  // checa se todas as letras foram acertadas
  useEffect(() => {
    // extrai as letras acertadas do array formado a partir da palavra que esta sendo adivinhada
    const uniqueLetters = [...new Set(letters)];

    if (guessedLetters.length === uniqueLetters.length) {
      // adicionar score
      setScore((actualScore) => actualScore += scorePoints);

      // recomeçar jogo
      startGame();
      setGuesses(guessesQtd);
    }

  }, [guessedLetters, letters, startGame])

  // reiniciar game
  const retry = () => {
    setScore(0);
    setGuesses(guessesQtd);

    setGameStage(stages[0].name);
  }

  return (
    <div className="App">
      {gameStage === "start" && <StartScreen startGame={startGame} />}
      {gameStage === "game" && (
        <Game
          verifyLetter={verifyLetter} 
          pickedWord={pickedWord} 
          pickedCategory={pickedCategory} 
          letters={letters} 
          guessedLetters={guessedLetters} 
          wrongLetters={wrongLetters} 
          guesses={guesses}
          score={score}
        />)
      }
      {gameStage === "end" && <GameOver retry={retry} score={score}/>}
    </div>
  );
}

export default App;
