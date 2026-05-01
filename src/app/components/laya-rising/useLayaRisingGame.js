import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  getCueStartTime,
  getCueAudio as createCueAudio,
  stopCueNodes as stopAudioCueNodes,
  stopDrone as stopAudioDrone,
  stopDrum as stopAudioDrum,
  startDrum as startAudioDrum,
  startDrone as startAudioDrone,
  playCue as playAudioCue,
  playResultTone as playAudioResultTone,
} from './audio';
import {
  LANE_NAMES,
  SVARA_X,
  SVARA_SIZE,
  WALL_W,
  FINISH_LINE_W,
  INITIAL_OBSTACLE_COUNT,
  VISIBLE_TUTORIAL_COUNT,
  SPEED,
  BEAT_SECONDS,
  CUE_END_BEFORE_IMPACT_SECONDS,
  CUE_SECONDS,
  BAR_SECONDS,
  LEVELS_PER_STAGE,
  HIDDEN_OBSTACLES_TO_COMPLETE,
  DEFAULT_SYNTH,
  DEFAULT_MIXER,
  CRASH_TONE_SECONDS,
} from './constants';
import { GAME_MODES } from './gameModes';
import { LEVELS } from './levels';

function shuffle(values) {
  const next = [...values];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function pickSafeLane(history, zoneCount) {
  const recent = history.slice(-3);
  const repeatedTooMuch = recent.length === 3 && recent.every((lane) => lane === recent[0]);
  const options = Array.from({ length: zoneCount }, (_, lane) => lane)
    .filter((lane) => !repeatedTooMuch || lane !== recent[0]);
  return options[Math.floor(Math.random() * options.length)];
}

function makeOpeningSafeLanes(zoneCount) {
  const lanes = shuffle(Array.from({ length: zoneCount }, (_, lane) => lane));

  while (lanes.length < VISIBLE_TUTORIAL_COUNT) {
    lanes.push(pickSafeLane(lanes, zoneCount));
  }

  return lanes;
}

function makeObstacle(id, x, safeLane, hidden = true, impactTime = null) {
  return {
    id,
    x,
    impactTime,
    safeLane,
    hidden,
    cued: false,
    revealed: !hidden,
    resolved: false,
    vanish: false,
  };
}

function makeFinishLine(x, impactTime = null) {
  return {
    x,
    impactTime,
    resolved: false,
  };
}

function getCueTiming(level, mode) {
  if (level.cueType === 'tempo-pair') {
    const modeTiming = level.modeCueTimings?.[mode.id];
    if (modeTiming) {
      const secondStartBeatsAfterFirst = modeTiming.secondStartBeatsAfterFirst ?? modeTiming.segmentBeats;
      return {
        cueStartBeats: modeTiming.firstStartBeatsBeforeImpact,
        cueDurationSeconds: modeTiming.firstStartBeatsBeforeImpact * BEAT_SECONDS,
        cueChangeSeconds: secondStartBeatsAfterFirst * BEAT_SECONDS,
        obstacleSpacingSeconds: modeTiming.obstacleSpacingBeats
          ? modeTiming.obstacleSpacingBeats * BEAT_SECONDS
          : mode.obstacleSpacingBars * BAR_SECONDS,
      };
    }
  }

  const cueStartBeats = level.cueType === 'single-note'
    ? mode.singleNoteCueStartBeats || mode.cueStartBeats
    : mode.cueStartBeats;

  return {
    cueStartBeats,
    cueDurationSeconds: cueStartBeats * BEAT_SECONDS - CUE_END_BEFORE_IMPACT_SECONDS,
    cueChangeSeconds: null,
    obstacleSpacingSeconds: mode.obstacleSpacingBars * BAR_SECONDS,
  };
}

export default function useSvaraRisingGame() {
  const fieldRef = useRef(null);
  const rafRef = useRef(null);
  const updateGameRef = useRef(null);
  const crashTimeoutRef = useRef(null);
  const lifeFlashTimeoutRef = useRef(null);
  const lastFrameRef = useRef(0);
  const nextIdRef = useRef(3);
  const obstaclesRef = useRef([]);
  const finishLineRef = useRef(null);
  const hiddenObstacleCountRef = useRef(0);
  const laneRef = useRef(1);
  const scoreRef = useRef(0);
  const livesRef = useRef(GAME_MODES[0].lives);
  const cueAudioRef = useRef(null);
  const cueNodesRef = useRef([]);
  const droneNodesRef = useRef([]);
  const droneDryGainRef = useRef(null);
  const droneWetGainRef = useRef(null);
  const mixerRef = useRef(DEFAULT_MIXER);
  const drumTimerRef = useRef(null);
  const drumNodesRef = useRef([]);
  const drumStartTimeRef = useRef(0);
  const drumNextBeatTimeRef = useRef(0);
  const drumBeatIndexRef = useRef(0);

  const [selectedLevel, setSelectedLevel] = useState(LEVELS[0]);
  const [selectedStage, setSelectedStage] = useState(0);
  const [selectedModeId, setSelectedModeId] = useState(GAME_MODES[0].id);
  const [showLevelSelector, setShowLevelSelector] = useState(true);
  const [running, setRunning] = useState(false);
  const [crashed, setCrashed] = useState(false);
  const [crashPending, setCrashPending] = useState(false);
  const [lane, setLane] = useState(1);
  const [obstacles, setObstacles] = useState([]);
  const [finishLine, setFinishLine] = useState(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(GAME_MODES[0].lives);
  const [lifeFlash, setLifeFlash] = useState(false);
  const [completedLevels, setCompletedLevels] = useState({});
  const [levelComplete, setLevelComplete] = useState(false);
  const [showObstacles, setShowObstacles] = useState(false);
  const [showObstaclesUsed, setShowObstaclesUsed] = useState(false);

  const synth = DEFAULT_SYNTH;
  const activeLevel = selectedLevel;
  const activeMode = GAME_MODES.find((mode) => mode.id === selectedModeId) || GAME_MODES[0];
  const cueTiming = getCueTiming(activeLevel, activeMode);
  const cueStartBeats = cueTiming.cueStartBeats;
  const cueLeadSeconds = cueStartBeats * BEAT_SECONDS;
  const cueSeconds = cueTiming.cueDurationSeconds;
  const cueChangeSeconds = cueTiming.cueChangeSeconds;
  const obstacleSpacingSeconds = cueTiming.obstacleSpacingSeconds;
  const cueNoteChangeSeconds = (activeMode.noteChangeBeats || 2) * BEAT_SECONDS;
  const zoneCount = activeLevel.zoneCount || 2;
  const laneNames = LANE_NAMES[zoneCount];
  const laneLabels = activeLevel.laneLabels || laneNames;
  const laneLabel = laneNames[lane];
  const nextLevel = LEVELS.find((level) => level.id === activeLevel.id + 1) || null;

  const audioRefs = useMemo(() => ({
    cueAudioRef,
    cueNodesRef,
    droneNodesRef,
    droneDryGainRef,
    droneWetGainRef,
    mixerRef,
    drumTimerRef,
    drumNodesRef,
    drumStartTimeRef,
    drumNextBeatTimeRef,
    drumBeatIndexRef,
  }), []);

  const getCueAudio = useCallback(() => createCueAudio(cueAudioRef), []);
  const stopCueNodes = useCallback(() => stopAudioCueNodes(cueNodesRef), []);
  const stopDrone = useCallback(() => stopAudioDrone(audioRefs), [audioRefs]);
  const stopDrum = useCallback(() => stopAudioDrum(audioRefs), [audioRefs]);
  const startDrum = useCallback((level) => startAudioDrum(level, audioRefs), [audioRefs]);
  const startDrone = useCallback((level) => startAudioDrone(level, audioRefs), [audioRefs]);

  const flashLifeLoss = useCallback(() => {
    clearTimeout(lifeFlashTimeoutRef.current);
    setLifeFlash(false);
    requestAnimationFrame(() => {
      setLifeFlash(true);
      lifeFlashTimeoutRef.current = setTimeout(() => setLifeFlash(false), 420);
    });
  }, []);

  const playCue = useCallback((safeLane, level, alignToDrum = false, scheduledStart = null, duration = CUE_SECONDS) => {
    playAudioCue(safeLane, level, {
      ...audioRefs,
      alignToDrum,
      scheduledStart,
      duration,
      cueChangeSeconds,
      noteChangeSeconds: cueNoteChangeSeconds,
      synth,
    });
  }, [audioRefs, cueChangeSeconds, cueNoteChangeSeconds, synth]);

  const playResultTone = useCallback((success) => {
    playAudioResultTone(success, audioRefs);
  }, [audioRefs]);

  const resetObstacles = useCallback((level = selectedLevel, audioStartTime = null) => {
    const width = fieldRef.current?.clientWidth || 760;
    const currentZoneCount = level.zoneCount || 2;
    const safeLaneHistory = makeOpeningSafeLanes(currentZoneCount);
    const svaraRight = SVARA_X + SVARA_SIZE / 2;
    const visibleLeadDistance = Math.max(0, width - WALL_W - svaraRight);
    const maxVisibleBars = Math.max(1, Math.floor(visibleLeadDistance / (SPEED * BAR_SECONDS)));
    const firstLeadBars = Math.min(3, maxVisibleBars);
    const firstImpactTime = audioStartTime === null
      ? null
      : audioStartTime + firstLeadBars * BAR_SECONDS;
    let impactTime = firstImpactTime;
    let x = audioStartTime === null
      ? width - WALL_W
      : svaraRight + SPEED * (impactTime - audioStartTime);
    const openingObstacles = [];

    for (let i = 0; i < INITIAL_OBSTACLE_COUNT; i += 1) {
      if (i >= safeLaneHistory.length) {
        safeLaneHistory.push(pickSafeLane(safeLaneHistory, currentZoneCount));
      }

      openingObstacles.push(makeObstacle(
        i,
        x,
        safeLaneHistory[i],
        i >= VISIBLE_TUTORIAL_COUNT,
        impactTime,
      ));
      if (impactTime !== null) {
        impactTime += obstacleSpacingSeconds;
        x = svaraRight + SPEED * (impactTime - audioStartTime);
      } else {
        x += SPEED * obstacleSpacingSeconds;
      }
    }

    nextIdRef.current = INITIAL_OBSTACLE_COUNT;
    hiddenObstacleCountRef.current = openingObstacles.filter((obstacle) => obstacle.hidden).length;
    obstaclesRef.current = openingObstacles;
    finishLineRef.current = null;
    setObstacles(obstaclesRef.current);
    setFinishLine(null);
  }, [obstacleSpacingSeconds, selectedLevel]);

  const chooseLevel = useCallback((level) => {
    setSelectedLevel(level);
    setShowLevelSelector(false);
    setCrashed(false);
    setCrashPending(false);
    setLevelComplete(false);
    setScore(0);
    scoreRef.current = 0;
    laneRef.current = Math.min(1, (level.zoneCount || 2) - 1);
    setLane(laneRef.current);
    resetObstacles(level);
  }, [resetObstacles]);

  const closeLevelSelector = useCallback(() => {
    setShowLevelSelector(false);
    setCrashed(false);
    setCrashPending(false);
    setLevelComplete(false);
    resetObstacles(activeLevel);
  }, [activeLevel, resetObstacles]);

  const moveToLane = useCallback((nextLane) => {
    const maxLane = (selectedLevel.zoneCount || 2) - 1;
    const clampedLane = Math.max(0, Math.min(maxLane, nextLane));
    laneRef.current = clampedLane;
    setLane(clampedLane);
  }, [selectedLevel]);

  const moveToTappedLane = useCallback((event) => {
    if (showLevelSelector) return;
    const field = fieldRef.current;
    if (!field) return;

    const rect = field.getBoundingClientRect();
    const tapY = event.clientY - rect.top;
    const tappedLane = Math.floor((tapY / rect.height) * zoneCount);
    moveToLane(tappedLane);
  }, [moveToLane, showLevelSelector, zoneCount]);

  const startRun = useCallback((level = activeLevel) => {
    const wasRunning = running;
    cancelAnimationFrame(rafRef.current);
    clearTimeout(crashTimeoutRef.current);
    stopCueNodes();
    stopDrone();
    const audio = getCueAudio();
    startDrum(level);
    startDrone(level);
    setSelectedLevel(level);
    const startLane = Math.min(1, (level.zoneCount || 2) - 1);
    laneRef.current = startLane;
    setLane(startLane);
    setCrashed(false);
    setCrashPending(false);
    setLevelComplete(false);
    setShowObstaclesUsed(showObstacles);
    setLifeFlash(false);
    setScore(0);
    scoreRef.current = 0;
    setLives(activeMode.lives);
    livesRef.current = activeMode.lives;
    lastFrameRef.current = 0;
    resetObstacles(level, drumStartTimeRef.current || audio.currentTime);
    setRunning(true);
    if (wasRunning) {
      rafRef.current = requestAnimationFrame((time) => updateGameRef.current?.(time));
    }
  }, [activeLevel, activeMode.lives, getCueAudio, resetObstacles, running, showObstacles, startDrone, startDrum, stopCueNodes, stopDrone]);

  const toggleShowObstacles = useCallback(() => {
    if (running || crashPending) return;
    setShowObstacles((current) => {
      return !current;
    });
  }, [crashPending, running]);

  const openLevelSelector = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    clearTimeout(crashTimeoutRef.current);
    stopCueNodes();
    stopDrone();
    stopDrum();
    setRunning(false);
    setCrashed(false);
    setCrashPending(false);
    setLevelComplete(false);
    setShowLevelSelector(true);
    setLifeFlash(false);
    setSelectedStage(Math.floor((activeLevel.id - 1) / LEVELS_PER_STAGE));
    setScore(0);
    scoreRef.current = 0;
    setLives(activeMode.lives);
    livesRef.current = activeMode.lives;
    resetObstacles();
  }, [activeLevel.id, activeMode.lives, resetObstacles, stopCueNodes, stopDrone, stopDrum]);

  const completeLevel = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    stopCueNodes();
    stopDrone();
    stopDrum();
    if (activeMode.successTone !== false) {
      playResultTone(true);
    }
    setRunning(false);
    setCrashPending(false);
    setCrashed(false);
    setLevelComplete(true);
    if (!showObstaclesUsed) {
      setCompletedLevels((current) => ({
        ...current,
        [activeLevel.id]: true,
      }));
    }
  }, [activeLevel.id, activeMode.successTone, playResultTone, showObstaclesUsed, stopCueNodes, stopDrone, stopDrum]);

  const goToNextLevel = useCallback(() => {
    if (!nextLevel) return;
    setSelectedStage(Math.floor((nextLevel.id - 1) / LEVELS_PER_STAGE));
    chooseLevel(nextLevel);
  }, [chooseLevel, nextLevel]);

  const updateGame = useCallback((time) => {
    if (!lastFrameRef.current) lastFrameRef.current = time;
    const dt = Math.min(0.032, (time - lastFrameRef.current) / 1000);
    lastFrameRef.current = time;

    const fieldWidth = fieldRef.current?.clientWidth || 760;
    const audio = cueAudioRef.current;
    const audioNow = audio?.currentTime ?? 0;
    const svaraLeft = SVARA_X - SVARA_SIZE / 2;
    const svaraRight = SVARA_X + SVARA_SIZE / 2;
    let nextScore = scoreRef.current;
    let hit = false;
    let finished = false;
    let nextObstacles = obstaclesRef.current.map((obstacle) => {
      const nextX = obstacle.impactTime === null
        ? obstacle.x - SPEED * dt
        : svaraRight + (obstacle.impactTime - audioNow) * SPEED;
      const timeToCollision = obstacle.impactTime === null
        ? (nextX - svaraRight) / SPEED
        : obstacle.impactTime - audioNow;
      const cueStartTime = obstacle.impactTime === null ? null : getCueStartTime(obstacle.impactTime, cueStartBeats);
      const shouldCue = !obstacle.cued && timeToCollision > 0 && (
        activeLevel.id >= 3 && cueStartTime !== null
          ? audioNow >= cueStartTime - 0.04
          : timeToCollision <= cueLeadSeconds
      );
      const touched = !obstacle.resolved && svaraRight > nextX && svaraLeft < nextX + WALL_W;
      const safeLane = obstacle.safeLane;
      const safeTouch = touched && laneRef.current === safeLane;
      const crashTouch = touched && laneRef.current !== safeLane;

      if (shouldCue) {
        playCue(safeLane, activeLevel, false, activeLevel.id >= 3 ? cueStartTime : null, cueSeconds);
      }

      if (safeTouch) {
        if (obstacle.hidden) {
          nextScore += 1;
          if (activeMode.successTone !== false) {
            playResultTone(true);
          }
        }
      }

      if (crashTouch) {
        hit = true;
      }

      return {
        ...obstacle,
        x: nextX,
        cued: obstacle.cued || shouldCue,
        revealed: obstacle.revealed || touched,
        resolved: obstacle.resolved || touched,
        vanish: obstacle.vanish || safeTouch,
      };
    });

    let nextFinishLine = finishLineRef.current
      ? {
          ...finishLineRef.current,
          x: finishLineRef.current.impactTime === null
            ? finishLineRef.current.x - SPEED * dt
            : svaraRight + (finishLineRef.current.impactTime - audioNow) * SPEED,
        }
      : null;

    if (nextFinishLine && !nextFinishLine.resolved) {
      const finishTouched = svaraRight > nextFinishLine.x && svaraLeft < nextFinishLine.x + FINISH_LINE_W;
      if (finishTouched) {
        finished = true;
        nextFinishLine = {
          ...nextFinishLine,
          resolved: true,
        };
      }
    }

    const lastObstacle = nextObstacles[nextObstacles.length - 1];
    if (
      lastObstacle
      && !nextFinishLine
      && hiddenObstacleCountRef.current < HIDDEN_OBSTACLES_TO_COMPLETE
      && lastObstacle.x < fieldWidth + SPEED * obstacleSpacingSeconds
    ) {
      const history = nextObstacles.map((obstacle) => obstacle.safeLane);
      const safeLane = pickSafeLane(history, zoneCount);
      const impactTime = lastObstacle.impactTime === null
        ? null
        : lastObstacle.impactTime + obstacleSpacingSeconds;
      const nextObstacle = makeObstacle(
        nextIdRef.current,
        impactTime === null
          ? lastObstacle.x + SPEED * obstacleSpacingSeconds
          : svaraRight + (impactTime - audioNow) * SPEED,
        safeLane,
        true,
        impactTime,
      );
      nextObstacles.push(nextObstacle);
      hiddenObstacleCountRef.current += 1;
      nextIdRef.current += 1;

      if (hiddenObstacleCountRef.current >= HIDDEN_OBSTACLES_TO_COMPLETE) {
        const finishImpactTime = impactTime === null
          ? null
          : impactTime + obstacleSpacingSeconds;
        nextFinishLine = makeFinishLine(
          finishImpactTime === null
            ? nextObstacle.x + SPEED * obstacleSpacingSeconds
            : svaraRight + (finishImpactTime - audioNow) * SPEED,
          finishImpactTime,
        );
      }
    } else if (
      lastObstacle
      && !nextFinishLine
      && hiddenObstacleCountRef.current >= HIDDEN_OBSTACLES_TO_COMPLETE
    ) {
      const finishImpactTime = lastObstacle.impactTime === null
        ? null
        : lastObstacle.impactTime + obstacleSpacingSeconds;
      nextFinishLine = makeFinishLine(
        finishImpactTime === null
          ? lastObstacle.x + SPEED * obstacleSpacingSeconds
          : svaraRight + (finishImpactTime - audioNow) * SPEED,
        finishImpactTime,
      );
    }

    nextObstacles = nextObstacles.filter((obstacle) => obstacle.x > -WALL_W - 20);
    if (nextFinishLine && nextFinishLine.x <= -FINISH_LINE_W - 20) {
      nextFinishLine = null;
    }

    scoreRef.current = nextScore;
    setScore(nextScore);

    obstaclesRef.current = nextObstacles;
    setObstacles(nextObstacles);
    finishLineRef.current = nextFinishLine;
    setFinishLine(nextFinishLine);

    if (!hit && finished) {
      completeLevel();
      return;
    }

    if (hit && livesRef.current > 1) {
      const nextLives = livesRef.current - 1;
      livesRef.current = nextLives;
      setLives(nextLives);
      flashLifeLoss();
      playResultTone(false);
      hit = false;
    }

    if (hit) {
      cancelAnimationFrame(rafRef.current);
      stopCueNodes();
      stopDrone();
      stopDrum();
      playResultTone(false);
      setRunning(false);
      setCrashPending(true);
      setLevelComplete(false);
      livesRef.current = 0;
      setLives(0);
      crashTimeoutRef.current = setTimeout(() => {
        setCrashPending(false);
        setCrashed(true);
      }, CRASH_TONE_SECONDS * 1000);
      return;
    }

    rafRef.current = requestAnimationFrame((nextTime) => updateGameRef.current?.(nextTime));
  }, [activeLevel, activeMode.successTone, completeLevel, cueLeadSeconds, cueSeconds, cueStartBeats, flashLifeLoss, obstacleSpacingSeconds, playCue, playResultTone, stopCueNodes, stopDrone, stopDrum, zoneCount]);

  useEffect(() => {
    updateGameRef.current = updateGame;
  }, [updateGame]);

  useEffect(() => {
    if (!running) return undefined;
    rafRef.current = requestAnimationFrame((time) => updateGameRef.current?.(time));
    return () => cancelAnimationFrame(rafRef.current);
  }, [running]);

  useEffect(() => {
    resetObstacles();
  }, [resetObstacles]);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.defaultPrevented || showLevelSelector) return;

      if (event.key === 'ArrowUp' || event.key.toLowerCase() === 'w') {
        event.preventDefault();
        moveToLane(laneRef.current - 1);
      }
      if (event.key === 'ArrowDown' || event.key.toLowerCase() === 's') {
        event.preventDefault();
        moveToLane(laneRef.current + 1);
      }
      if (/^[1-8]$/.test(event.key)) {
        const numberLane = Number(event.key) - 1;
        if (numberLane < zoneCount) {
          event.preventDefault();
          moveToLane(zoneCount - 1 - numberLane);
        }
      }
      if (event.key === ' ' && event.shiftKey && running) {
        event.preventDefault();
        startRun(activeLevel);
      } else if ((event.key === ' ' || event.key === 'Enter') && !running) {
        event.preventDefault();
        if (levelComplete && !showObstaclesUsed && nextLevel) {
          goToNextLevel();
        } else {
          startRun();
        }
      }
      if (event.key.toLowerCase() === 'l') {
        event.preventDefault();
        openLevelSelector();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeLevel, goToNextLevel, levelComplete, moveToLane, nextLevel, openLevelSelector, running, showLevelSelector, showObstaclesUsed, startRun, zoneCount]);

  useEffect(() => () => {
    clearTimeout(crashTimeoutRef.current);
    clearTimeout(lifeFlashTimeoutRef.current);
    stopCueNodes();
    stopDrone();
    stopDrum();
    cueAudioRef.current?.close().catch(() => {});
  }, [stopCueNodes, stopDrone, stopDrum]);

  return {
    activeLevel,
    activeMode,
    completedLevels,
    crashPending,
    crashed,
    lane,
    levelComplete,
    lifeFlash,
    lives,
    nextLevel,
    running,
    score,
    showLevelSelector,
    showObstacles,
    showObstaclesUsed,
    zoneCount,
    levelSelectorProps: {
      showLevelSelector,
      selectedStage,
      setSelectedStage,
      selectedLevel,
      selectedModeId,
      setSelectedModeId,
      livesRef,
      setLives,
      chooseLevel,
      closeLevelSelector,
      completedLevels,
    },
    hudProps: {
      activeLevel,
      activeMode,
      score,
      lives,
      targetScore: HIDDEN_OBSTACLES_TO_COMPLETE,
      showObstacles,
      toggleShowObstacles,
      modeSwitchDisabled: running || crashPending,
      openLevelSelector,
      startRun,
      running,
      crashed,
      levelComplete,
    },
    playFieldProps: {
      fieldRef,
      moveToTappedLane,
      laneNames,
      laneLabels,
      obstacles,
      finishLine,
      lane,
      laneLabel,
      activeLevel,
      running,
      crashPending,
      crashed,
      levelComplete,
      showObstacles,
      showObstaclesUsed,
      score,
      targetScore: HIDDEN_OBSTACLES_TO_COMPLETE,
      startRun,
      goToNextLevel,
      nextLevel,
      moveToLane,
    },
  };
}
