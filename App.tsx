import React, { useState, useEffect, useRef } from 'react';
import { GamePhase, GameState, INITIAL_SCORE, MAX_NUMBER } from './types';
import { generateAIGuess, generateAISecret } from './services/geminiService';
import { RetroButton } from './components/RetroButton';
import { RetroInput } from './components/RetroInput';
import { ScoreBoard } from './components/ScoreBoard';

// Utility for delaying steps to improve UX
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const App: React.FC = () => {
  // Persistent State (Player Profile)
  const [playerName, setPlayerName] = useState('PLAYER 1');
  const [stars, setStars] = useState(0);

  // Load Stars from LocalStorage on mount
  useEffect(() => {
    const savedStars = localStorage.getItem('neon_stars');
    if (savedStars) {
      setStars(parseInt(savedStars, 10));
    }
    const savedName = localStorage.getItem('neon_player_name');
    if (savedName) {
      setPlayerName(savedName);
    }
  }, []);

  const [gameState, setGameState] = useState<GameState>({
    phase: GamePhase.MENU,
    playerScore: INITIAL_SCORE,
    computerScore: INITIAL_SCORE,
    playerSecret: null,
    computerSecret: null,
    lastGuess: null,
    turnCount: 0,
    message: "WELCOME TO NEON GUESS 1985",
    winner: null,
    isKnockout: false,
  });

  const [inputVal, setInputVal] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // --- Game Loop Handlers ---

  const startGame = () => {
    // Save name preference
    localStorage.setItem('neon_player_name', playerName || 'PLAYER 1');

    setGameState({
      phase: GamePhase.PLAYER_SET_SECRET,
      playerScore: INITIAL_SCORE,
      computerScore: INITIAL_SCORE,
      playerSecret: null,
      computerSecret: null,
      lastGuess: null,
      turnCount: 1,
      message: "ROUND 1: ENTER YOUR SECRET NUMBER (0-100)",
      winner: null,
      isKnockout: false,
    });
    setInputVal('');
  };

  const handlePlayerSetSecret = () => {
    const num = parseInt(inputVal);
    if (isNaN(num) || num < 0 || num > MAX_NUMBER) {
      alert("INVALID INPUT. ENTER 0-100.");
      return;
    }
    
    setGameState(prev => ({
      ...prev,
      playerSecret: num,
      phase: GamePhase.AI_THINKING_GUESS,
      message: "CPU IS CALCULATING PROBABILITY..."
    }));
    setInputVal('');
  };

  // Effect to trigger AI Guess when phase changes
  useEffect(() => {
    if (gameState.phase === GamePhase.AI_THINKING_GUESS) {
      const runAIGuess = async () => {
        await sleep(1500); // Dramatic pause
        const aiGuess = await generateAIGuess(`Turn: ${gameState.turnCount}, Player Score: ${gameState.playerScore}`);
        
        setGameState(prev => ({
          ...prev,
          lastGuess: aiGuess,
          phase: GamePhase.REVEAL_AI_GUESS,
          message: `CPU GUESSED: ${aiGuess}`
        }));
      };
      runAIGuess();
    }
  }, [gameState.phase, gameState.turnCount, gameState.playerScore]);

  const handleRevealAIGuess = () => {
    if (gameState.playerSecret === null || gameState.lastGuess === null) return;

    const diff = Math.abs(gameState.playerSecret - gameState.lastGuess);
    
    // KNOCKOUT CHECK
    if (diff === 0) {
        setGameState(prev => ({
            ...prev,
            computerScore: 0, // Instant win for CPU, loss for Player
            playerScore: 0, // Just to be sure visually
            phase: GamePhase.GAME_OVER,
            winner: 'COMPUTER',
            isKnockout: true,
            message: `PERFECT GUESS! CRITICAL SYSTEM FAILURE!`
        }));
        return;
    }

    const newComputerScore = gameState.computerScore - diff;

    if (newComputerScore <= 0) {
      setGameState(prev => ({
        ...prev,
        computerScore: 0,
        phase: GamePhase.GAME_OVER,
        winner: 'PLAYER',
        isKnockout: false,
        message: `CPU CRITICAL FAILURE! SCORE: -${diff}`
      }));
      handleWin();
    } else {
      setGameState(prev => ({
        ...prev,
        computerScore: newComputerScore,
        phase: GamePhase.AI_SETTING_SECRET,
        message: `CPU DAMAGED BY ${diff}. CPU IS NOW HIDING A NUMBER...`,
        lastGuess: null, // clear for next step
      }));
    }
  };

  // Effect to trigger AI Setting Secret
  useEffect(() => {
    if (gameState.phase === GamePhase.AI_SETTING_SECRET) {
      const runAISetSecret = async () => {
        setIsProcessing(true);
        await sleep(2000);
        const secret = await generateAISecret();
        
        setGameState(prev => ({
          ...prev,
          computerSecret: secret,
          phase: GamePhase.PLAYER_GUESSING,
          message: "CPU HIDDEN. ENTER YOUR PREDICTION.",
        }));
        setIsProcessing(false);
      };
      runAISetSecret();
    }
  }, [gameState.phase]);

  const handlePlayerGuess = () => {
    const num = parseInt(inputVal);
    if (isNaN(num) || num < 0 || num > MAX_NUMBER) {
      alert("INVALID INPUT. ENTER 0-100.");
      return;
    }

    setGameState(prev => ({
      ...prev,
      lastGuess: num,
      phase: GamePhase.REVEAL_PLAYER_GUESS,
      message: `CONFIRMING TARGET: ${num}...`
    }));
    setInputVal('');
  };

  const handleWin = () => {
     const newStars = stars + 1;
     setStars(newStars);
     localStorage.setItem('neon_stars', newStars.toString());
  }

  const handleRevealPlayerGuess = () => {
    if (gameState.computerSecret === null || gameState.lastGuess === null) return;

    const diff = Math.abs(gameState.computerSecret - gameState.lastGuess);

    // KNOCKOUT CHECK
    if (diff === 0) {
        setGameState(prev => ({
            ...prev,
            computerScore: 0,
            phase: GamePhase.GAME_OVER,
            winner: 'PLAYER',
            isKnockout: true,
            message: `PERFECT GUESS! INSTANT KNOCKOUT!`
        }));
        handleWin();
        return;
    }

    const newPlayerScore = gameState.playerScore - diff;

    if (newPlayerScore <= 0) {
      setGameState(prev => ({
        ...prev,
        playerScore: 0,
        phase: GamePhase.GAME_OVER,
        winner: 'COMPUTER',
        isKnockout: false,
        message: `PLAYER SIGNAL LOST. DAMAGE: ${diff}`
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        playerScore: newPlayerScore,
        phase: GamePhase.PLAYER_SET_SECRET, // Loop back to start
        turnCount: prev.turnCount + 1,
        message: `YOU TOOK ${diff} DAMAGE. ROUND ${prev.turnCount + 1} BEGINS.`,
        lastGuess: null,
        playerSecret: null,
        computerSecret: null
      }));
    }
  };


  // --- Render Helpers ---

  const renderContent = () => {
    switch (gameState.phase) {
      case GamePhase.MENU:
        return (
          <div className="flex flex-col items-center gap-8 animate-fade-in w-full max-w-md">
            <h1 className="text-6xl md:text-8xl font-arcade text-transparent bg-clip-text bg-gradient-to-b from-[#00f3ff] to-[#ff00de] glow-text text-center leading-tight">
              NEON<br/>GUESS
            </h1>
            <p className="text-xl text-[#00ff41] font-mono tracking-widest flicker">INSERT COIN TO START</p>
            
            <div className="w-full bg-gray-900 border border-[#333] p-6 flex flex-col items-center gap-4">
               <RetroInput 
                 label="ENTER PILOT NAME"
                 placeholder="PLAYER 1"
                 value={playerName}
                 onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
                 maxLength={10}
               />
               <div className="text-[#ffcc00] font-arcade text-sm">
                 RANK: {stars > 0 ? `${stars} STAR GENERAL` : 'ROOKIE'}
               </div>
            </div>

            <RetroButton onClick={startGame} className="animate-pulse text-xl w-full">START GAME</RetroButton>
            <div className="text-xs text-gray-500 font-mono mt-4 text-center">
              MODE: 100 // DIFFERENCE SUBTRACTION<br/>
              <span className="text-[#ff0055]">WARNING: PERFECT GUESS = INSTANT K.O.</span>
            </div>
          </div>
        );

      case GamePhase.PLAYER_SET_SECRET:
        return (
          <div className="flex flex-col items-center gap-6 w-full max-w-md">
            <div className="bg-gray-900 border-2 border-[#00f3ff] p-6 w-full text-center shadow-[0_0_20px_rgba(0,243,255,0.2)]">
              <p className="text-[#00f3ff] mb-4 text-lg">STEP 1: INITIALIZE SECRET</p>
              <p className="text-gray-400 text-sm mb-6">Enter a number (0-100) for the CPU to guess.</p>
              <RetroInput 
                type="number" 
                value={inputVal} 
                onChange={(e) => setInputVal(e.target.value)} 
                placeholder="00"
                min={0}
                max={100}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handlePlayerSetSecret()}
              />
            </div>
            <RetroButton onClick={handlePlayerSetSecret}>LOCK IN SECRET</RetroButton>
          </div>
        );

      case GamePhase.AI_THINKING_GUESS:
        return (
          <div className="flex flex-col items-center justify-center h-48">
             <div className="flex gap-2">
                <div className="w-4 h-16 bg-[#ff0055] animate-[bounce_1s_infinite]"></div>
                <div className="w-4 h-16 bg-[#ff0055] animate-[bounce_1s_infinite_0.1s]"></div>
                <div className="w-4 h-16 bg-[#ff0055] animate-[bounce_1s_infinite_0.2s]"></div>
             </div>
             <p className="mt-6 text-[#ff0055] font-arcade animate-pulse">CPU THINKING...</p>
          </div>
        );

      case GamePhase.REVEAL_AI_GUESS:
        return (
          <div className="flex flex-col items-center gap-6 w-full max-w-md animate-fade-in">
            <div className="bg-gray-900 border-2 border-[#ff0055] p-6 w-full text-center shadow-[0_0_20px_rgba(255,0,85,0.2)]">
               <p className="text-gray-400 text-xs uppercase mb-2">Your Secret</p>
               <div className="text-4xl text-[#00f3ff] font-bold mb-6">{gameState.playerSecret}</div>
               
               <p className="text-gray-400 text-xs uppercase mb-2">CPU Guess</p>
               <div className="text-4xl text-[#ff0055] font-bold mb-4">{gameState.lastGuess}</div>

               <div className="mt-4 border-t border-gray-700 pt-4">
                  <p className="text-xl text-white font-mono">
                    DIFFERENCE: <span className="text-[#ff0055]">{Math.abs((gameState.playerSecret || 0) - (gameState.lastGuess || 0))}</span>
                  </p>
                  {Math.abs((gameState.playerSecret || 0) - (gameState.lastGuess || 0)) === 0 && (
                      <p className="text-[#ff0055] font-arcade animate-pulse mt-2">CRITICAL HIT!</p>
                  )}
               </div>
            </div>
            <RetroButton variant="danger" onClick={handleRevealAIGuess}>
                 {Math.abs((gameState.playerSecret || 0) - (gameState.lastGuess || 0)) === 0 ? "ACCEPT DEFEAT" : "APPLY DAMAGE"}
            </RetroButton>
          </div>
        );

      case GamePhase.AI_SETTING_SECRET:
        return (
          <div className="flex flex-col items-center justify-center h-48">
             <div className="w-16 h-16 border-4 border-[#ff0055] border-t-[#00f3ff] rounded-full animate-spin mb-4"></div>
             <p className="text-[#ff0055] font-arcade uppercase">CPU Hiding Number...</p>
          </div>
        );

      case GamePhase.PLAYER_GUESSING:
        return (
          <div className="flex flex-col items-center gap-6 w-full max-w-md">
            <div className="bg-gray-900 border-2 border-[#00ff41] p-6 w-full text-center shadow-[0_0_20px_rgba(0,255,65,0.2)]">
              <div className="mb-6 flex justify-center">
                 <div className="w-16 h-16 bg-[#111] border border-[#333] flex items-center justify-center text-3xl text-[#ff0055] font-arcade animate-pulse">
                    ?
                 </div>
              </div>
              <p className="text-[#00ff41] mb-4 text-lg">STEP 2: GUESS TARGET</p>
              <p className="text-gray-400 text-sm mb-6">The CPU has hidden a number. Take your shot.</p>
              <RetroInput 
                type="number" 
                value={inputVal} 
                onChange={(e) => setInputVal(e.target.value)} 
                placeholder="??"
                min={0}
                max={100}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handlePlayerGuess()}
              />
            </div>
            <RetroButton variant="success" onClick={handlePlayerGuess}>FIRE GUESS</RetroButton>
          </div>
        );

      case GamePhase.REVEAL_PLAYER_GUESS:
         return (
          <div className="flex flex-col items-center gap-6 w-full max-w-md animate-fade-in">
            <div className="bg-gray-900 border-2 border-[#00ff41] p-6 w-full text-center shadow-[0_0_20px_rgba(0,255,65,0.2)]">
               <p className="text-gray-400 text-xs uppercase mb-2">CPU Secret</p>
               <div className="text-4xl text-[#ff0055] font-bold mb-6">{gameState.computerSecret}</div>
               
               <p className="text-gray-400 text-xs uppercase mb-2">Your Guess</p>
               <div className="text-4xl text-[#00ff41] font-bold mb-4">{gameState.lastGuess}</div>

               <div className="mt-4 border-t border-gray-700 pt-4">
                  <p className="text-xl text-white font-mono">
                    DIFFERENCE: <span className="text-[#00f3ff]">{Math.abs((gameState.computerSecret || 0) - (gameState.lastGuess || 0))}</span>
                  </p>
                  {Math.abs((gameState.computerSecret || 0) - (gameState.lastGuess || 0)) === 0 && (
                      <p className="text-[#00ff41] font-arcade animate-pulse mt-2">PERFECT AIM!</p>
                  )}
               </div>
            </div>
            <RetroButton variant="primary" onClick={handleRevealPlayerGuess}>CALCULATE RESULT</RetroButton>
          </div>
        );

      case GamePhase.GAME_OVER:
        return (
          <div className="flex flex-col items-center gap-8 text-center animate-bounce-in">
             {gameState.isKnockout && (
                 <div className="text-6xl md:text-9xl font-arcade text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 animate-pulse glow-text mb-4 transform -rotate-12">
                     K.O.
                 </div>
             )}
            <h2 className="text-4xl md:text-6xl font-arcade text-white glow-text">GAME OVER</h2>
            <div className="text-4xl">
              {gameState.winner === 'PLAYER' ? (
                <div className="flex flex-col gap-2">
                    <span className="text-[#00ff41] font-bold drop-shadow-[0_0_10px_rgba(0,255,65,0.8)]">YOU WIN!</span>
                    <span className="text-sm text-[#ffcc00] font-arcade">+1 STAR EARNED</span>
                </div>
              ) : (
                <span className="text-[#ff0055] font-bold drop-shadow-[0_0_10px_rgba(255,0,85,0.8)]">YOU LOSE</span>
              )}
            </div>
            <div className="font-mono text-gray-400 text-xl">
              ROUNDS SURVIVED: {gameState.turnCount}
            </div>
            <RetroButton onClick={startGame} className="mt-8">PLAY AGAIN</RetroButton>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col relative z-10 p-4 pt-10">
      
      {/* Grid Background Effect */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-20 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #222 1px, transparent 1px),
            linear-gradient(to bottom, #222 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          perspective: '500px',
        }}
      />
      
      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center relative z-10 w-full max-w-5xl mx-auto">
        
        {/* Scoreboard (Always visible unless Menu) */}
        {gameState.phase !== GamePhase.MENU && (
          <ScoreBoard 
            playerScore={gameState.playerScore} 
            computerScore={gameState.computerScore}
            playerName={playerName || "PLAYER 1"}
            stars={stars}
          />
        )}

        {/* Message Log / Status Bar */}
        {gameState.phase !== GamePhase.MENU && (
          <div className="w-full max-w-2xl bg-black border border-[#333] p-4 mb-8 text-center shadow-lg">
             <p className="font-mono text-lg md:text-xl text-[#e0e0e0] leading-relaxed animate-pulse">
               {">"} {gameState.message} <span className="inline-block w-2 h-4 bg-[#00ff41] animate-pulse ml-1"></span>
             </p>
          </div>
        )}

        {/* Dynamic Content Area */}
        <div className="flex-1 w-full flex justify-center items-center pb-20">
          {renderContent()}
        </div>

      </main>

      {/* Decorative Footer */}
      <footer className="fixed bottom-4 left-0 w-full text-center text-xs text-[#444] font-arcade z-0 pointer-events-none">
        © 1985 NEON CORP SYSTEMS // GEMINI-CORE INTEGRATED
      </footer>
    </div>
  );
};

export default App;