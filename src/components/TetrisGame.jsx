import React, { useState, useEffect, useCallback, useRef } from 'react';
import TetrisBoard from './TetrisBoard';
import NextPiece from './NextPiece';
import ScorePanel from './ScorePanel';
import LevelSelect from './LevelSelect';
import GameOver from './GameOver';
import PauseMenu from './PauseMenu';
import Leaderboard from './Leaderboard';
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
import apiService from '../services/apiService';

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
  const [highScores, setHighScores] = useState([]);
  const [isHighScore, setIsHighScore] = useState(false);
  const [newRank, setNewRank] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isOnline, setIsOnline] = useState(apiService.isOnline());
  const [currentUser, setCurrentUser] = useState(null);
  const [gameDuration, setGameDuration] = useState(0);
  const gameStartTimeRef = useRef(null);

  // Refs for game loop
  const gameLoopRef = useRef(null);
  const dropCounterRef = useRef(0);
  const dropIntervalRef = useRef(getDropInterval(0));

  // Load high scores on mount
  useEffect(() => {
    // Load local scores
    setHighScores(storageService.getScores());
    
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

    gameLoopRef.current = setInterval(() => {
      dropCounterRef.current += 16; // ~60 FPS

      if (dropCounterRef.current >= dropIntervalRef.current) {
        dropCounterRef.current = 0;
        handleAutoDrop();
      }
    }, 16);

    return () => clearInterval(gameLoopRef.current);
  }, [gameState, currentPiece, level]);

  const handleAutoDrop = useCallback(() => {
    setCurrentPiece(prev => {
      if (!prev) return prev;

      const newPos = [prev.position[0] + 1, prev.position[1]];

      if (checkCollision(board, prev, newPos)) {
        // Piece locked
        handleLockPiece(prev);
        return null;
      }

      return { ...prev, position: newPos };
    });
  }, [board]);

  const handleLockPiece = useCallback((piece) => {
    const newBoard = lockPiece(board, piece, piece.position);
    const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);

    let newScore = score;
    let newLines = lines + linesCleared;
    let newLevel = calculateLevel(startingLevel, newLines);

    if (linesCleared > 0) {
      newScore += calculateScore(linesCleared, level);
    }

    setBoard(clearedBoard);
    setLines(newLines);
    setScore(newScore);
    setLevel(newLevel);

    // Update drop interval based on new level
    dropIntervalRef.current = getDropInterval(newLevel);

    // Check game over
    if (isGameOver(clearedBoard)) {
      handleGameOver(newScore, newLines, newLevel);
    } else {
      // Spawn next piece
      const newNextPiece = getRandomPiece();
      setCurrentPiece(spawnPiece(nextPiece || newNextPiece));
      setNextPiece(newNextPiece);
      dropCounterRef.current = 0;
    }
  }, [board, score, lines, level, startingLevel, nextPiece]);

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
      setHighScores(storageService.getScores());
    }

    // Submit to backend (online or offline)
    apiService.submitScore(finalScore, finalLines, finalLevel, duration)
      .then(result => {
        console.log('✅ Score submitted', result);
      })
      .catch(err => {
        console.error('⚠️ Score saved locally, will sync when online:', err);
      });

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

      if (gameState !== 'playing' || !currentPiece) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setCurrentPiece(prev => {
            const moved = movePiece(prev, 'left');
            return checkCollision(board, moved, moved.position) ? prev : moved;
          });
          break;
        case 'ArrowRight':
          e.preventDefault();
          setCurrentPiece(prev => {
            const moved = movePiece(prev, 'right');
            return checkCollision(board, moved, moved.position) ? prev : moved;
          });
          break;
        case 'ArrowDown':
          e.preventDefault();
          dropCounterRef.current = 0;
          setCurrentPiece(prev => {
            const dropped = softDrop(prev, board);
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
          setCurrentPiece(prev => rotatePiece(prev, board, 'clockwise'));
          break;
        case 'z':
        case 'Z':
          e.preventDefault();
          setCurrentPiece(prev => rotatePiece(prev, board, 'counterclockwise'));
          break;
        case ' ':
          e.preventDefault();
          setCurrentPiece(prev => {
            const dropped = hardDrop(prev, board);
            const cellsDropped = dropped.position[0] - prev.position[0];
            setScore(s => s + cellsDropped * 2);
            handleLockPiece(dropped);
            return null;
          });
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
  }, [gameState, currentPiece, board, handleLockPiece]);

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

  // Render
  if (gameState === 'menu') {
    return (
      <div className="game-container">
        <LevelSelect
          selectedLevel={startingLevel}
          onSelectLevel={handleSelectLevel}
          onStartGame={handleStartGame}
        />
        {highScores.length > 0 && (
          <div className="menu-leaderboard">
            <Leaderboard scores={highScores} />
          </div>
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

      {gameState === 'gameover' && (
        <GameOver
          score={score}
          lines={lines}
          level={level}
          onRestart={handleRestart}
          isHighScore={isHighScore}
          rank={newRank}
        />
      )}

      {showLeaderboard && (
        <div className="leaderboard-modal-overlay">
          <div className="leaderboard-modal">
            <Leaderboard scores={highScores} onClose={() => setShowLeaderboard(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
