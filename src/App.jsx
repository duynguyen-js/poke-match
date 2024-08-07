import { v4 as uuid } from 'uuid';
import { useEffect, useState } from 'react';
import './App.scss';
import pokeballImg from './assets/pokeball.png'
import StageScreen from './components/StageScreen/StageScreen';
import GameScreen from './components/GameScreen/GameScreen';
import HashLoader from 'react-spinners/HashLoader';
import EndGameModal from './components/EndGameModal/EndGameModal';

function App() {
  const [stage, setStage] = useState('');
  const [loading, setLoading] = useState(false);
  const [pokemonData, setPokemonData] = useState([]);
  const [gameCondition, setGameCondition] = useState('');
  const [finalScore, setFinalScore] = useState(0); 
  const [endModal, setEndModal] = useState(false)

  // randomly selects 10 pokemons and add them to state
  const getRandomPokemons = (pokemons) => {
    const shuffledList = [...pokemons].sort(() => 0.5 - Math.random());
    const slicedList = shuffledList.slice(0, 10);
    return slicedList.map(pokemon => ({ ...pokemon, id: uuid() }));
  };

  useEffect(() => {
    const fetchPokemonData = async () => {
        if (!stage) return;

          
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon-habitat/${stage}`);
            const data = await response.json();
            const randomPokemons = getRandomPokemons(data["pokemon_species"]);

            // Fetch images for each pokemon
            const updatedPokemonData = await Promise.all(randomPokemons.map(async (pokemon) => {
                const imgResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}/`);
                const imgData = await imgResponse.json();
                return {
                    ...pokemon,
                    frontImage: imgData.sprites.front_default,
                    backImage: imgData.sprites.back_default
                };
            }));

            setPokemonData(updatedPokemonData);
            setLoading(false)
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    fetchPokemonData();
  }, [stage]);

  const handleGameEnd = () => {
    if (gameCondition.length > 0) {
      setStage('');
      setPokemonData([]);
      setEndModal(true)
    }
  };

  useEffect(() => {
    handleGameEnd();
  }, [gameCondition]);

  return (
    <div className='main-container'>
      <div className="header">
        <img src={pokeballImg} alt="pokeball" />
        <h1>PokeMatch</h1>
      </div>
      {loading && <HashLoader color='green' size={100} className='loader' />}
      {!loading && pokemonData.length === 0 ? (
        <StageScreen setStage={setStage} setLoading={setLoading} />
      ) : (
        <GameScreen
          pokemonData={pokemonData}
          setGameCondition={setGameCondition}
          setFinalScore={setFinalScore}
        />
      )}
      {endModal && (
        <EndGameModal
          headerText={gameCondition === 'win' ? 'You Win!' : 'You Lose!'}
          finalScore={finalScore}
          endImg={gameCondition === 'win' ? 
            'https://media2.giphy.com/media/xx0JzzsBXzcMK542tx/giphy.gif' :
            'https://media.tenor.com/TRTMIXMvMlAAAAAC/ditto-sad.gif'

          }
          setEndModal={() => setEndModal(false)}
        />
      )}
    </div>
  );
}

export default App;
