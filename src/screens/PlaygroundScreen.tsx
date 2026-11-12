import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  RefreshControl,
} from 'react-native';
import { COLORS } from '../theme';
import { StudySessionLog, QuizQuestion, TabType, GameMode, RevisionSheet } from '../types';
import {
  generateMemoryRecallSession,
  generateDomainAdaptiveQuizSession,
  generateQuizQuestionsForTopic,
} from '../services/gemini';

interface Props {
  currentSession: StudySessionLog | null;
  customQuestions?: QuizQuestion[] | null;
  onQuizComplete: (score: number) => void;
  onNavigate: (tab: TabType) => void;
}

export default function PlaygroundScreen({
  currentSession,
  customQuestions,
  onQuizComplete,
  onNavigate,
}: Props) {
  // Mode selection & view state
  const [selectedMode, setSelectedMode] = useState<GameMode>('rapid');
  const [questionTargetCount, setQuestionTargetCount] = useState<number>(10);
  const [gameState, setGameState] = useState<'lobby' | 'revision' | 'playing' | 'flashcards' | 'result'>('lobby');

  // Custom topic state
  const [customTopic, setCustomTopic] = useState('');
  const [activeQuizTopic, setActiveQuizTopic] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Revision sheet state
  const [revisionSheet, setRevisionSheet] = useState<RevisionSheet | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Active quiz state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(60);
  const [lives, setLives] = useState(3); // Deathmatch mode lives
  const [streakCount, setStreakCount] = useState(0);

  // Flashcard mode state
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setCustomTopic('');
    setLoadingAi(false);
    setRefreshing(false);
  };

  // Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (gameState === 'playing' && (selectedMode === 'rapid' || selectedMode === 'deathmatch')) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            handleTimeExpired();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, selectedMode]);

  const handleTimeExpired = () => {
    setGameState('result');
    onQuizComplete(score);
  };

  // Launch Session Based on Selected Mode
  const handleStartMode = async (mode: GameMode) => {
    setSelectedMode(mode);
    setScore(0);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setLives(3);
    setStreakCount(0);
    setFlashcardFlipped(false);

    const topic = customTopic.trim() || currentSession?.topic || 'Applied Discipline & Systems Architecture';
    setActiveQuizTopic(topic);

    if (mode === 'memory_recall') {
      setLoadingAi(true);
      try {
        const recallData = await generateMemoryRecallSession(
          topic,
          questionTargetCount,
          currentSession?.notesSummary
        );
        setRevisionSheet(recallData.revisionSheet);
        setQuizQuestions(recallData.questions);
        setGameState('revision'); // First show revision sheet, then user starts quiz!
      } catch {
        const fallback = generateDomainAdaptiveQuizSession(topic, questionTargetCount);
        setRevisionSheet(fallback.revisionSheet);
        setQuizQuestions(fallback.questions);
        setGameState('revision');
      } finally {
        setLoadingAi(false);
      }
    } else if (mode === 'rapid') {
      // 60-second speed test
      setTimer(60);
      setLoadingAi(true);
      try {
        const qs = await generateQuizQuestionsForTopic(topic, 10);
        setQuizQuestions(qs);
      } catch {
        setQuizQuestions(generateDomainAdaptiveQuizSession(topic, 10).questions);
      } finally {
        setLoadingAi(false);
      }
      setGameState('playing');
    } else if (mode === 'deathmatch') {
      // Sudden death (3 lives, 15 seconds per question)
      setTimer(15);
      setLoadingAi(true);
      try {
        const qs = await generateQuizQuestionsForTopic(topic, 15);
        setQuizQuestions(qs);
      } catch {
        setQuizQuestions(generateDomainAdaptiveQuizSession(topic, 15).questions);
      } finally {
        setLoadingAi(false);
      }
      setGameState('playing');
    } else if (mode === 'flashcards') {
      // Interactive flip flashcards
      setLoadingAi(true);
      try {
        const qs = await generateQuizQuestionsForTopic(topic, 10);
        setQuizQuestions(qs);
      } catch {
        setQuizQuestions(generateDomainAdaptiveQuizSession(topic, 10).questions);
      } finally {
        setLoadingAi(false);
      }
      setGameState('flashcards');
    }
  };

  const getFallbackQuestions = (topic: string, count: number): QuizQuestion[] => {
    const list: QuizQuestion[] = [];
    const base = [
      {
        question: `Regarding ${topic}: What represents the primary bottleneck when scaling throughput?`,
        options: ['Memory bandwidth & cache line contention', 'Static typing overhead', 'Over-allocation of swap space', 'Thread context switching'],
        correctIndex: 0,
        explanation: 'Memory bus bandwidth saturation is the dominant physical bottleneck on multi-core compute systems.',
      },
      {
        question: 'Which mechanism provides deterministic O(1) retrieval without hash collisions?',
        options: ['Balanced Red-Black Trees', 'Direct Index Array Addressing', 'Skip-Lists', 'Fibonacci Heaps'],
        correctIndex: 1,
        explanation: 'Direct index addressing maps keys to contiguous memory addresses with zero collision probability.',
      },
      {
        question: 'What occurs if retention tests are failed on consecutive study sessions in GRIDLOCK?',
        options: ['+25% quota added to next session', 'Streak reset and immediate kick', 'Subgroup monitor alerted only', 'No penalty if camera recorded presence'],
        correctIndex: 0,
        explanation: 'Under the penalty escalation engine, missing consecutive retention metrics increases next-day load by 25%.',
      },
      {
        question: 'In low-latency systems, why is dynamic memory allocation avoided in the critical path?',
        options: ['Kernel locks and unbounded allocator latency', 'Compiler rejects dynamic heap in C++', 'Causes CPU core temperature spikes', 'Invalidates hardware instruction pipeline'],
        correctIndex: 0,
        explanation: 'Heap allocation requires mutex locking and buddy allocation traversal which has unbounded latency variance.',
      },
      {
        question: 'What is the primary benefit of spatial cache locality?',
        options: ['Fetches adjacent data words in a single 64-byte line', 'Encrypts registers in hardware', 'Eliminates all cache invalidation messages', 'Enables parallel ALU instruction dispatch'],
        correctIndex: 0,
        explanation: 'CPUs fetch entire 64-byte cache lines; adjacent data is pre-loaded into high-speed L1 cache.',
      },
    ];

    for (let i = 0; i < count; i++) {
      list.push(base[i % base.length]);
    }
    return list;
  };

  const handleSelectOption = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);

    const isCorrect = index === quizQuestions[currentIndex].correctIndex;

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setStreakCount((prev) => prev + 1);
    } else {
      setStreakCount(0);
      if (selectedMode === 'deathmatch') {
        const remaining = lives - 1;
        setLives(remaining);
        if (remaining <= 0) {
          setTimeout(() => {
            setGameState('result');
            onQuizComplete(score);
          }, 800);
          return;
        }
      }
    }

    setTimeout(() => {
      if (currentIndex + 1 < quizQuestions.length) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        if (selectedMode === 'deathmatch') {
          setTimer(15); // Reset per-question countdown
        }
      } else {
        setGameState('result');
        const finalScore = isCorrect ? score + 1 : score;
        onQuizComplete(finalScore);
      }
    }, 1100);
  };

  // -------------------------------------------------------------
  // LOBBY VIEW: Mode & Length Selector
  // -------------------------------------------------------------
  if (gameState === 'lobby') {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.accent}
            colors={[COLORS.accent]}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>AI PLAYGROUND MODES</Text>
          </View>
          <Text style={styles.title}>RETENTION & EXAM DRILLS</Text>
          <Text style={styles.subtitle}>
            Active Topic: {customTopic.trim() || (currentSession ? currentSession.topic : 'General Technical Mastery')}
          </Text>
        </View>

        {/* Custom Quiz Topic Input & Selector (User Requested) */}
        <View style={styles.topicCard}>
          <View style={styles.topicCardHeader}>
            <Text style={styles.topicCardTitle}>🎯 ENTER QUIZ TOPIC</Text>
            <View style={styles.badgePill}>
              <Text style={styles.badgeText}>ANY SUBJECT</Text>
            </View>
          </View>
          <Text style={styles.topicCardDesc}>
            Type any skill, exam, coding language, trading book, or science domain to generate custom precision questions.
          </Text>

          <View style={styles.topicInputRow}>
            <TextInput
              style={styles.topicInput}
              value={customTopic}
              onChangeText={setCustomTopic}
              placeholder="e.g. Trading & Markets, Biomechanics, React Native"
              placeholderTextColor={COLORS.textMuted}
            />
            {customTopic.length > 0 && (
              <TouchableOpacity style={styles.clearBtn} onPress={() => setCustomTopic('')}>
                <Text style={styles.clearBtnText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Preset Chips */}
          <Text style={styles.presetLabel}>POPULAR QUIZ DOMAINS:</Text>
          <View style={styles.chipsRow}>
            {[
              '📈 Trading & Price Action',
              '🧠 Neuroscience & Focus',
              '🏋️ Hypertrophy & Biomechanics',
              '💻 Systems & Algorithms',
              '📐 Calculus & Linear Algebra',
              '⚡ High-Discipline Protocol',
            ].map((t) => {
              const clean = t.replace(/^[^\w]+/, '').trim();
              const isSelected = customTopic.toLowerCase() === clean.toLowerCase();
              return (
                <TouchableOpacity
                  key={t}
                  style={[styles.topicChip, isSelected && styles.topicChipActive]}
                  onPress={() => setCustomTopic(clean)}
                >
                  <Text style={[styles.topicChipText, isSelected && styles.topicChipTextActive]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {loadingAi && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={COLORS.accent} />
            <Text style={styles.loadingText}>SYNTHESIZING QUESTIONS FOR "{customTopic.trim().toUpperCase() || 'MASTERY'}"...</Text>
          </View>
        )}

        {/* Mode 1: Memory Recall (User Requested Feature) */}
        <View style={styles.modeCard}>
          <View style={styles.modeCardHeader}>
            <View style={styles.modeIconCircle}>
              <Text style={{ fontSize: 22 }}>🧠</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.modeTitle}>MEMORY RECALL + REVISION</Text>
                <View style={styles.badgeNew}>
                  <Text style={styles.badgeNewText}>HIGH YIELD</Text>
                </View>
              </View>
              <Text style={styles.modeDesc}>
                Synthesizes a high-yield study sheet, then tests you with a customizable quiz of up to 20 questions.
              </Text>
            </View>
          </View>

          {/* Question Count Selector (5, 10, 15, 20) */}
          <Text style={styles.selectorLabel}>SELECT QUESTION VOLUME:</Text>
          <View style={styles.countRow}>
            {[5, 10, 15, 20].map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.countPill,
                  questionTargetCount === num && styles.countPillActive,
                ]}
                onPress={() => setQuestionTargetCount(num)}
              >
                <Text
                  style={[
                    styles.countPillText,
                    questionTargetCount === num && styles.countPillTextActive,
                  ]}
                >
                  {num} Qs
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.btnLaunch}
            onPress={() => handleStartMode('memory_recall')}
            disabled={loadingAi}
          >
            <Text style={styles.btnLaunchText}>
              GENERATE REVISION SHEET & QUIZ ({questionTargetCount} Qs) →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Mode 2: 60-Second Rapid Fire */}
        <TouchableOpacity style={styles.modeCardCompact} onPress={() => handleStartMode('rapid')}>
          <View style={styles.modeIconCircle}>
            <Text style={{ fontSize: 20 }}>⚡</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.modeTitle}>60-SECOND RAPID BLITZ</Text>
            <Text style={styles.modeDesc}>Speed test against the clock. How many can you answer in 60s?</Text>
          </View>
          <Text style={styles.arrow}>↗</Text>
        </TouchableOpacity>

        {/* Mode 3: Sudden Death Survival */}
        <TouchableOpacity style={styles.modeCardCompact} onPress={() => handleStartMode('deathmatch')}>
          <View style={[styles.modeIconCircle, { borderColor: 'rgba(255, 92, 92, 0.4)' }]}>
            <Text style={{ fontSize: 20 }}>☠️</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.modeTitle, { color: '#FFA8A8' }]}>SUDDEN DEATH DRILL</Text>
            <Text style={styles.modeDesc}>3 lives maximum. 15 seconds per question. One mistake costs a life.</Text>
          </View>
          <Text style={styles.arrow}>↗</Text>
        </TouchableOpacity>

        {/* Mode 4: Interactive Flashcards */}
        <TouchableOpacity style={styles.modeCardCompact} onPress={() => handleStartMode('flashcards')}>
          <View style={[styles.modeIconCircle, { borderColor: 'rgba(192, 132, 252, 0.4)' }]}>
            <Text style={{ fontSize: 20 }}>🗂</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.modeTitle}>STUDY FLASHCARDS</Text>
            <Text style={styles.modeDesc}>Tap to flip between prompt questions and detailed technical explanations.</Text>
          </View>
          <Text style={styles.arrow}>↗</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // -------------------------------------------------------------
  // REVISION SHEET VIEW: Read before starting the recall quiz
  // -------------------------------------------------------------
  if (gameState === 'revision' && revisionSheet) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>AI REVISION SHEET</Text>
          </View>
          <Text style={styles.title}>{revisionSheet.title.toUpperCase()}</Text>
          <Text style={styles.subtitle}>
            Review these synthesized principles. Tap 'Begin Recall Quiz' when ready.
          </Text>
        </View>

        {/* Key Concepts */}
        <View style={styles.revisionCard}>
          <Text style={styles.revSectionTitle}>📌 KEY CONCEPTS & DEFINITIONS</Text>
          {revisionSheet.keyConcepts.map((item, i) => (
            <View key={i} style={styles.conceptItem}>
              <Text style={styles.conceptName}>• {item.concept}:</Text>
              <Text style={styles.conceptDef}>{item.definition}</Text>
            </View>
          ))}
        </View>

        {/* Rules & Theorems */}
        <View style={styles.revisionCard}>
          <Text style={styles.revSectionTitle}>📐 CORE THEOREMS & RULES</Text>
          {revisionSheet.formulasOrRules.map((rule, i) => (
            <Text key={i} style={styles.ruleBullet}>
              ✓ {rule}
            </Text>
          ))}
        </View>

        {/* Pitfalls */}
        <View style={[styles.revisionCard, { borderColor: 'rgba(255, 92, 92, 0.3)' }]}>
          <Text style={[styles.revSectionTitle, { color: '#FFA8A8' }]}>⚠️ COMMON PITFALLS & ERRORS</Text>
          {revisionSheet.commonPitfalls.map((pitfall, i) => (
            <Text key={i} style={styles.pitfallBullet}>
              ✕ {pitfall}
            </Text>
          ))}
        </View>

        <TouchableOpacity
          style={styles.btnLaunch}
          onPress={() => {
            setGameState('playing');
          }}
        >
          <Text style={styles.btnLaunchText}>
            START {quizQuestions.length}-QUESTION RECALL TEST NOW →
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // -------------------------------------------------------------
  // FLASHCARD INTERACTIVE VIEW
  // -------------------------------------------------------------
  if (gameState === 'flashcards') {
    const q = quizQuestions[currentIndex];
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.badgeWrap}>
            <View style={styles.badgePill}>
              <Text style={styles.badgeText}>FLASHCARD STUDY DECK</Text>
            </View>
            <Text style={styles.counterText}>
              {currentIndex + 1} / {quizQuestions.length}
            </Text>
          </View>
        </View>

        {/* The Flip Card */}
        <TouchableOpacity
          style={[styles.flashcardBox, flashcardFlipped && styles.flashcardBoxFlipped]}
          onPress={() => setFlashcardFlipped(!flashcardFlipped)}
          activeOpacity={0.9}
        >
          <Text style={styles.flipNotice}>{flashcardFlipped ? '💡 EXPLANATION / ANSWER' : '❓ QUESTION (TAP TO FLIP)'}</Text>
          <Text style={styles.flashcardMainText}>
            {flashcardFlipped
              ? `Correct Answer:\n${q.options[q.correctIndex]}\n\n${q.explanation || ''}`
              : q.question}
          </Text>
          <Text style={styles.tapPrompt}>Tap anywhere on card to flip</Text>
        </TouchableOpacity>

        {/* Navigation Buttons */}
        <View style={styles.navButtonsRow}>
          <TouchableOpacity
            style={[styles.btnPrev, currentIndex === 0 && { opacity: 0.3 }]}
            onPress={() => {
              if (currentIndex > 0) {
                setCurrentIndex(currentIndex - 1);
                setFlashcardFlipped(false);
              }
            }}
            disabled={currentIndex === 0}
          >
            <Text style={styles.btnPrevText}>← PREVIOUS</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnNext}
            onPress={() => {
              if (currentIndex + 1 < quizQuestions.length) {
                setCurrentIndex(currentIndex + 1);
                setFlashcardFlipped(false);
              } else {
                setGameState('result');
              }
            }}
          >
            <Text style={styles.btnNextText}>
              {currentIndex + 1 === quizQuestions.length ? 'COMPLETE DECK ✓' : 'NEXT CARD →'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // -------------------------------------------------------------
  // ACTIVE QUIZ PLAYING VIEW (All Multiple-Choice Modes)
  // -------------------------------------------------------------
  if (gameState === 'playing') {
    const q = quizQuestions[currentIndex];

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header HUD */}
        <View style={styles.hudRow}>
          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>
              {selectedMode === 'deathmatch' ? 'SUDDEN DEATH' : selectedMode === 'memory_recall' ? 'MEMORY RECALL' : 'RAPID BLITZ'}
            </Text>
          </View>

          {/* Mode specific gauges */}
          {selectedMode === 'deathmatch' && (
            <View style={styles.livesRow}>
              {[1, 2, 3].map((l) => (
                <Text key={l} style={{ fontSize: 16, opacity: l <= lives ? 1 : 0.2 }}>
                  ❤️
                </Text>
              ))}
            </View>
          )}

          {(selectedMode === 'rapid' || selectedMode === 'deathmatch') && (
            <View style={[styles.timerPill, timer < 10 && { borderColor: COLORS.crimson }]}>
              <Text style={[styles.timerText, timer < 10 && { color: COLORS.crimson }]}>
                ⏱ {timer}s
              </Text>
            </View>
          )}

          <View style={styles.scorePill}>
            <Text style={styles.scoreLive}>{score} PTS</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.quizProgressBar}>
          <View
            style={[
              styles.quizProgressBarFill,
              { width: `${((currentIndex + 1) / quizQuestions.length) * 100}%` },
            ]}
          />
        </View>

        {/* Question Card */}
        <View style={styles.quizCard}>
          <Text style={styles.questionIndexLabel}>
            QUESTION {currentIndex + 1} OF {quizQuestions.length}
            {streakCount >= 2 && <Text style={{ color: COLORS.accent }}> · 🔥 {streakCount} STREAK</Text>}
          </Text>

          <Text style={styles.questionText}>{q.question}</Text>

          {/* Options */}
          <View style={styles.optionsWrap}>
            {q.options.map((opt, i) => {
              let btnStyle: any = styles.optionBtn;
              let letterStyle: any = styles.optionLetter;

              if (selectedAnswer !== null) {
                if (i === q.correctIndex) {
                  btnStyle = [styles.optionBtn, styles.optionCorrect];
                  letterStyle = [styles.optionLetter, { backgroundColor: COLORS.accent, color: COLORS.primaryText }];
                } else if (i === selectedAnswer) {
                  btnStyle = [styles.optionBtn, styles.optionWrong];
                }
              }

              return (
                <TouchableOpacity
                  key={i}
                  style={btnStyle}
                  onPress={() => handleSelectOption(i)}
                  disabled={selectedAnswer !== null}
                >
                  <Text style={letterStyle}>{String.fromCharCode(65 + i)}</Text>
                  <Text style={styles.optionText}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Real-time explanation shown after picking */}
          {selectedAnswer !== null && q.explanation && (
            <View style={styles.explanationBox}>
              <Text style={styles.explanationTitle}>💡 EXPLANATION</Text>
              <Text style={styles.explanationBody}>{q.explanation}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    );
  }

  // -------------------------------------------------------------
  // RESULTS VIEW: Comprehensive Performance Debrief
  // -------------------------------------------------------------
  const pct = quizQuestions.length > 0 ? Math.round((score / quizQuestions.length) * 100) : 100;
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.resultCard}>
        <Text style={styles.resultTitle}>DRILL DEBRIEF COMPLETE</Text>
        <Text style={styles.resultBigScore}>{score} / {quizQuestions.length}</Text>
        <Text style={styles.resultPct}>{pct}% RETENTION ACCURACY</Text>

        <View style={styles.resultMetricsRow}>
          <View style={styles.resultMetricBox}>
            <Text style={styles.metricLabel}>XP EARNED</Text>
            <Text style={styles.metricVal}>+{score * 25 + 50}</Text>
          </View>
          <View style={styles.resultMetricBox}>
            <Text style={styles.metricLabel}>MASTERY LEVEL</Text>
            <Text style={[styles.metricVal, { color: pct >= 70 ? COLORS.accent : COLORS.crimson }]}>
              {pct >= 85 ? 'APEX' : pct >= 70 ? 'COMPLIANT' : 'DEFICIT'}
            </Text>
          </View>
        </View>

        <Text style={styles.resultSummary}>
          {pct >= 70
            ? 'Gemini validated your retention depth meets the Vanguard cohort quota. Conceptual models locked in.'
            : 'Retention performance fell below cohort baseline. Remediation scheduled.'}
        </Text>

        <View style={{ width: '100%', gap: 10 }}>
          <TouchableOpacity
            style={styles.btnAction}
            onPress={() => {
              setGameState('lobby');
            }}
          >
            <Text style={styles.btnActionText}>PLAY ANOTHER DRILL</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnActionSecondary}
            onPress={() => onNavigate('dashboard')}
          >
            <Text style={styles.btnActionSecondaryText}>RETURN TO HQ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 16 },
  badgePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(229, 169, 60, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  badgeText: { color: COLORS.accent, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  title: { color: '#ffffff', fontSize: 20, fontWeight: '900', letterSpacing: 0.8 },
  subtitle: { color: COLORS.secondary, fontSize: 12, marginTop: 3 },
  badgeWrap: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  counterText: { color: COLORS.secondary, fontSize: 12, fontWeight: '800' },
  loadingBox: {
    backgroundColor: COLORS.bgCard,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.25)',
  },
  loadingText: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 12,
    textAlign: 'center',
    letterSpacing: 0.8,
  },
  modeCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    padding: 18,
    marginBottom: 14,
  },
  modeCardHeader: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  modeIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#161811',
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeTitle: { color: '#fff', fontSize: 13, fontWeight: '900', letterSpacing: 0.8 },
  badgeNew: {
    backgroundColor: 'rgba(229, 169, 60, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  badgeNewText: { color: COLORS.accent, fontSize: 8, fontWeight: '900' },
  modeDesc: { color: COLORS.textDim, fontSize: 11, marginTop: 4, lineHeight: 16 },
  selectorLabel: { color: COLORS.secondary, fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  countRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  countPill: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#161811',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.15)',
    alignItems: 'center',
  },
  countPillActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  countPillText: { color: COLORS.textDim, fontSize: 11, fontWeight: '800' },
  countPillTextActive: { color: COLORS.primaryText, fontWeight: '900' },
  btnLaunch: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  btnLaunchText: { color: COLORS.primaryText, fontSize: 12, fontWeight: '900', letterSpacing: 0.8 },
  modeCardCompact: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.12)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },
  arrow: { color: COLORS.accent, fontSize: 16, fontWeight: '800' },
  revisionCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.15)',
    padding: 16,
    marginBottom: 12,
  },
  revSectionTitle: { color: COLORS.accent, fontSize: 11, fontWeight: '900', letterSpacing: 1, marginBottom: 10 },
  conceptItem: { marginBottom: 10 },
  conceptName: { color: '#ffffff', fontSize: 12, fontWeight: '800' },
  conceptDef: { color: COLORS.textDim, fontSize: 11, lineHeight: 16, marginTop: 2 },
  ruleBullet: { color: '#F4F5F0', fontSize: 12, lineHeight: 20, marginBottom: 4 },
  pitfallBullet: { color: '#FFA8A8', fontSize: 12, lineHeight: 20, marginBottom: 4 },
  flashcardBox: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(229, 169, 60, 0.3)',
    minHeight: 280,
    padding: 24,
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  flashcardBoxFlipped: {
    borderColor: COLORS.accent,
    backgroundColor: '#1E2116',
  },
  flipNotice: { color: COLORS.accent, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  flashcardMainText: { color: '#ffffff', fontSize: 17, fontWeight: '700', lineHeight: 26, marginVertical: 18 },
  tapPrompt: { color: COLORS.secondary, fontSize: 10, textAlign: 'center', fontStyle: 'italic' },
  navButtonsRow: { flexDirection: 'row', gap: 12 },
  btnPrev: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.2)',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnPrevText: { color: COLORS.accent, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  btnNext: {
    flex: 1.5,
    backgroundColor: COLORS.accent,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnNextText: { color: COLORS.primaryText, fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  hudRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  livesRow: { flexDirection: 'row', gap: 4 },
  timerPill: {
    backgroundColor: 'rgba(229, 169, 60, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.4)',
  },
  timerText: { color: COLORS.accent, fontSize: 11, fontWeight: '900', fontFamily: 'Courier' },
  scorePill: {
    backgroundColor: 'rgba(229, 169, 60, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  scoreLive: { color: COLORS.accent, fontSize: 10, fontWeight: '900' },
  quizProgressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    marginBottom: 14,
    overflow: 'hidden',
  },
  quizProgressBarFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
  },
  quizCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.15)',
    padding: 18,
  },
  questionIndexLabel: { color: COLORS.secondary, fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 12 },
  questionText: { color: '#fff', fontSize: 16, fontWeight: '700', lineHeight: 22, marginBottom: 18 },
  optionsWrap: { gap: 10 },
  optionBtn: {
    backgroundColor: COLORS.bgInput,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.15)',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionCorrect: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(229, 169, 60, 0.12)',
  },
  optionWrong: {
    borderColor: COLORS.crimson,
    backgroundColor: 'rgba(255, 92, 92, 0.12)',
  },
  optionLetter: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#1E2018',
    color: COLORS.accent,
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '900',
    fontSize: 12,
  },
  optionText: { color: '#F4F5F0', fontSize: 13, flex: 1, fontWeight: '500' },
  explanationBox: {
    marginTop: 14,
    backgroundColor: '#161811',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.2)',
    padding: 12,
  },
  explanationTitle: { color: COLORS.accent, fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  explanationBody: { color: COLORS.textDim, fontSize: 11, lineHeight: 16 },
  resultCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.25)',
    padding: 24,
    alignItems: 'center',
  },
  resultTitle: { color: COLORS.secondary, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  resultBigScore: {
    fontSize: 52,
    color: '#fff',
    fontWeight: '900',
    fontFamily: 'Courier',
    marginTop: 8,
  },
  resultPct: { color: COLORS.accent, fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 16 },
  resultMetricsRow: { flexDirection: 'row', gap: 12, width: '100%', marginBottom: 16 },
  resultMetricBox: {
    flex: 1,
    backgroundColor: '#161811',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  metricLabel: { color: COLORS.secondary, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  metricVal: { color: '#fff', fontSize: 18, fontWeight: '900', marginTop: 4 },
  resultSummary: { color: COLORS.textDim, fontSize: 12, textAlign: 'center', lineHeight: 18, marginBottom: 20 },
  btnAction: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnActionText: { color: COLORS.primaryText, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  btnActionSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.2)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnActionSecondaryText: { color: COLORS.accent, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  // Topic Input Card
  topicCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.25)',
    padding: 16,
    marginBottom: 16,
  },
  topicCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  topicCardTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
  topicCardDesc: {
    color: COLORS.secondary,
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 12,
  },
  topicInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E0E0E',
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  topicInput: {
    flex: 1,
    color: '#fff',
    fontSize: 13,
    paddingVertical: 10,
    fontWeight: '600',
  },
  clearBtn: {
    padding: 6,
  },
  clearBtnText: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: '700',
  },
  presetLabel: {
    color: COLORS.secondary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  topicChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  topicChipActive: {
    backgroundColor: 'rgba(229, 169, 60, 0.15)',
    borderColor: COLORS.accent,
  },
  topicChipText: {
    color: COLORS.secondary,
    fontSize: 10,
    fontWeight: '700',
  },
  topicChipTextActive: {
    color: COLORS.accent,
    fontWeight: '900',
  },
});
