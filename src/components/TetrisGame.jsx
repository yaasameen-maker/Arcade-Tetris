import React, { useState, useEffect, useCallback, useRef } from 'react';
import TetrisBoard from './TetrisBoard';
import NextPiece from './NextPiece';
import ScorePanel from './ScorePanel';
import LevelSelect from './LevelSelect';
import GameOver from './GameOver';
import PauseMenu from './PauseMenu';
import Leaderboard from './Leaderboard';
import Auth from './Auth';
import {
  createEmptyBoard,
  checkCollision,
  lockPiece,
  clearLines,
  spawnPiece,
  movePiece,
  rotatePiece,
  hardDrop,
  softDrop,
  isGameOver,
  getRandomPiece,
  resetRandomBag
} from '../game-engine/tetris-logic';
import { calculateScore, calculateLevel } from '../game-engine/tetris-scoring';
import { getDropInterval } from '../game-engine/tetris-levels';
import { storageService } from '../services/storageService';
import { apiService } from '../services/apiService';

export default function TetrisGame() {
  // Game states
  const [gameState, setGameState] = useState('menu'); // menu, playing, paused, gameover
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState(null);
  const [nextPiece, setNextPiece] = useState(null);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(0);
  const [startingLevel, setStartingLevel] = useState(0);
  const [leaderboardScores, setLeaderboardScores] = useState(storageService.getScores());
  const [isHighScore, setIsHighScore] = useState(false);
  const [newRank, setNewRank] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isOnline, setIsOnline] = useState(apiService.isOnline());
  const [currentUser, setCurrentUser] = useState(null);
  const gameStartTimeRef = useRef(null);

  // Refs for game loop - use refs to avoid stale closures
  const gameLoopRef = useRef(null);
  const dropCounterRef = useRef(0);
  const dropIntervalRef = useRef(getDropInterval(0));
  
  // Refs for current state (avoid stale closures in game loop)
  const boardRef = useRef(board);
  const scoreRef = useRef(score);
  const linesRef = useRef(lines);
  const levelRef = useRef(level);
  const startingLevelRef = useRef(startingLevel);
  const nextPieceRef = useRef(nextPiece);
  const currentPieceRef = useRef(currentPiece);

  // Keep refs in sync with state
  useEffect(() => { boardRef.current = board; }, [board]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { linesRef.current = lines; }, [lines]);
  useEffect(() => { levelRef.current = level; }, [level]);
  useEffect(() => { startingLevelRef.current = startingLevel; }, [startingLevel]);
  useEffect(() => { nextPieceRef.current = nextPiece; }, [nextPiece]);
  useEffect(() => { currentPieceRef.current = currentPiece; }, [currentPiece]);

  const refreshLeaderboard = useCallback(() => {
    const local = storageService.getScores();
    setLeaderboardScores(local);
    apiService.getLeaderboard(20).then(data => {
      if (data.scores && data.scores.length > 0) {
        setLeaderboardScores(data.scores);
      }
    }).catch(() => {});
  }, []);

  // Load high scores on mount
  useEffect(() => {
    refreshLeaderboard();

    // Load current user if logged in
    apiService.getCurrentUser().then(user => {
      if (user) setCurrentUser(user);
    });

    // Listen for online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      console.log('🌐 Back online');
    };
    const handleOffline = () => {
      setIsOnline(false);
      console.log('📴 Offline mode');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing' || !currentPiece) return;

    const gameLoop = () => {
      dropCounterRef.current += 16; // ~60 FPS

      if (dropCounterRef.current >= dropIntervalRef.current) {
        dropCounterRef.current = 0;
        
        // Use refs to get current values
        const piece = currentPieceRef.current;
        if (!piece) return;

        const currentBoard = boardRef.current;
        const newPos = [piece.position[0] + 1, piece.position[1]];

        if (checkCollision(currentBoard, piece, newPos)) {
          // Lock the piece
          lockCurrentPiece(piece);
        } else {
          setCurrentPiece({ ...piece, position: newPos });
        }
      }
    };

    gameLoopRef.current = setInterval(gameLoop, 16);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState, currentPiece]);

  const lockCurrentPiece = useCallback((piece) => {
    const currentBoard = boardRef.current;
    const currentLines = linesRef.current;
    const currentLevel = levelRef.current;
    const currentStartingLevel = startingLevelRef.current;
    const currentNextPiece = nextPieceRef.current;

    const newBoard = lockPiece(currentBoard, piece, piece.position);
    const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);

    const newLines = currentLines + linesCleared;
    const newLevel = calculateLevel(currentStartingLevel, newLines);
    const lineScore = linesCleared > 0 ? calculateScore(linesCleared, currentLevel) : 0;

    setBoard(clearedBoard);
    setLines(newLines);
    setScore(prev => prev + lineScore);
    setLevel(newLevel);

    // Update drop interval based on new level
    dropIntervalRef.current = getDropInterval(newLevel);

    // Check game over
    if (isGameOver(clearedBoard)) {
      handleGameOver(scoreRef.current + lineScore, newLines, newLevel);
    } else {
      // Spawn next piece
      const newNextPiece = getRandomPiece();
      setCurrentPiece(spawnPiece(currentNextPiece || newNextPiece));
      setNextPiece(newNextPiece);
      dropCounterRef.current = 0;
    }
  }, []);

  const handleGameOver = useCallback((finalScore, finalLines, finalLevel) => {
    const duration = gameStartTimeRef.current ? Date.now() - gameStartTimeRef.current : 0;
    
    // Save to localStorage
    const isHigh = storageService.isHighScore(finalScore);
    setIsHighScore(isHigh);

    if (isHigh) {
      const rank = storageService.saveScore({
        score: finalScore,
        lines: finalLines,
        level: finalLevel
      });
      setNewRank(rank);
    }

    // Submit to backend (online or offline)
    apiService.submitScore(finalScore, finalLines, finalLevel, duration)
      .then(() => refreshLeaderboard())
      .catch(() => refreshLeaderboard());

    setGameState('gameover');
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState === 'menu') return;

      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        e.preventDefault();
        setGameState(prev => (prev === 'playing' ? 'paused' : 'playing'));
        return;
      }

      if (gameState !== 'playing') return;
      
      const piece = currentPieceRef.current;
      const currentBoard = boardRef.current;
      if (!piece) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setCurrentPiece(prev => {
            if (!prev) return prev;
            const moved = movePiece(prev, 'left');
            return checkCollision(currentBoard, moved, moved.position) ? prev : moved;
          });
          break;
        case 'ArrowRight':
          e.preventDefault();
          setCurrentPiece(prev => {
            if (!prev) return prev;
            const moved = movePiece(prev, 'right');
            return checkCollision(currentBoard, moved, moved.position) ? prev : moved;
          });
          break;
        case 'ArrowDown':
          e.preventDefault();
          dropCounterRef.current = 0;
          setCurrentPiece(prev => {
            if (!prev) return prev;
            const dropped = softDrop(prev, currentBoard);
            if (dropped !== prev) {
              setScore(s => s + 1);
            }
            return dropped;
          });
          break;
        case 'ArrowUp':
        case 'x':
        case 'X':
          e.preventDefault();
          setCurrentPiece(prev => {
            if (!prev) return prev;
            return rotatePiece(prev, currentBoard, 'clockwise');
          });
          break;
        case 'z':
        case 'Z':
          e.preventDefault();
          setCurrentPiece(prev => {
            if (!prev) return prev;
            return rotatePiece(prev, currentBoard, 'counterclockwise');
          });
          break;
        case ' ':
          e.preventDefault();
          if (piece) {
            const dropped = hardDrop(piece, currentBoard);
            const cellsDropped = dropped.position[0] - piece.position[0];
            setScore(s => s + cellsDropped * 2);
            setCurrentPiece(null);
            lockCurrentPiece(dropped);
          }
          break;
        case 'Enter':
          if (gameState === 'gameover') {
            handleRestart();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, lockCurrentPiece]);

  const handleSelectLevel = (lvl) => {
    setStartingLevel(lvl);
  };

  const handleStartGame = () => {
    resetRandomBag();
    setBoard(createEmptyBoard());
    setScore(0);
    setLines(0);
    setLevel(startingLevel);
    dropIntervalRef.current = getDropInterval(startingLevel);
    dropCounterRef.current = 0;
    gameStartTimeRef.current = Date.now();

    const firstPiece = getRandomPiece();
    const nextRandomPiece = getRandomPiece();
    setCurrentPiece(spawnPiece(firstPiece));
    setNextPiece(nextRandomPiece);
    setGameState('playing');
  };

  const handleRestart = () => {
    setShowLeaderboard(false);
    setGameState('menu');
  };

  const handleResume = () => {
    setGameState('playing');
  };

  const handleQuitToMenu = () => {
    setGameState('menu');
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    setShowAuth(false);
    refreshLeaderboard();
  };

  const handleLogout = () => {
    apiService.logout();
    setCurrentUser(null);
  };

  // Render
  if (gameState === 'menu') {
    return (
      <div className="game-container">
        <div className="menu-auth-bar">
          {currentUser ? (
            <>
              <span className="menu-auth-user">▶ {currentUser.username}</span>
              <button className="menu-auth-btn signout" onClick={handleLogout}>SIGN OUT</button>
            </>
          ) : (
            <button className="menu-auth-btn" onClick={() => setShowAuth(true)}>SIGN IN / REGISTER</button>
          )}
        </div>
        <div className="menu-layout">
          <LevelSelect
            selectedLevel={startingLevel}
            onSelectLevel={handleSelectLevel}
            onStartGame={handleStartGame}
          />
          <div className="menu-leaderboard">
            <Leaderboard scores={leaderboardScores} />
          </div>
        </div>
        {showAuth && (
          <Auth onLogin={handleLogin} onClose={() => setShowAuth(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <div className="header-top">
          <h1>80'S ARCADE TETRIS</h1>
          <div className="header-status">
            <span className={`status-indicator ${isOnline ? 'online' : 'offline'}`}>
              {isOnline ? '🌐 ONLINE' : '📴 OFFLINE'}
            </span>
            {currentUser && (
              <span className="user-info">👤 {currentUser.username}</span>
            )}
            <button
              className="pause-btn"
              onClick={() => setGameState(prev => prev === 'playing' ? 'paused' : 'playing')}
            >
              {gameState === 'paused' ? '▶ RESUME' : '⏸ PAUSE'}
            </button>
          </div>
        </div>
      </div>

      <div className="game-layout">
        <div className="game-main">
          <TetrisBoard board={board} currentPiece={currentPiece} />
        </div>

        <div className="game-sidebar">
          <ScorePanel score={score} lines={lines} level={level} />
          <NextPiece pieceType={nextPiece} />
        </div>
      </div>

      {gameState === 'paused' && (
        <PauseMenu onResume={handleResume} onQuit={handleQuitToMenu} />
      )}

      {gameState === 'gameover' && !showLeaderboard && (
        <GameOver
          score={score}
          lines={lines}
          level={level}
          onRestart={handleRestart}
          onShowLeaderboard={() => setShowLeaderboard(true)}
          isHighScore={isHighScore}
          rank={newRank}
        />
      )}

      {showLeaderboard && (
        <div className="leaderboard-modal-overlay">
          <div className="leaderboard-modal">
            <Leaderboard
              scores={leaderboardScores}
              onClose={() => setShowLeaderboard(false)}
              title={leaderboardScores.some(s => s.username) ? 'GLOBAL LEADERBOARD' : 'HIGH SCORES'}
            />
          </div>
        </div>
      )}
    </div>
  );
}
