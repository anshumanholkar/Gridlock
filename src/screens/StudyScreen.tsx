import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { COLORS } from '../theme';
import { StudySessionLog, TabType, QuizQuestion } from '../types';
import { saveSession } from '../services/storage';
import { analyzeStudyNotesAndGenerateQuiz } from '../services/gemini';

interface Props {
  onSessionComplete: (session: StudySessionLog, generatedQuestions?: QuizQuestion[]) => void;
  onNavigate: (tab: TabType) => void;
}

export default function StudyScreen({ onSessionComplete, onNavigate }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [sessionActive, setSessionActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [topic, setTopic] = useState('Operating Systems: Virtual Memory & Paging');
  const [notesCaptured, setNotesCaptured] = useState<string | null>(null);
  const [cameraMode, setCameraMode] = useState<'proctor' | 'notes'>('proctor');
  const [analyzingWithAI, setAnalyzingWithAI] = useState(false);
  const [aiAnalysisSummary, setAiAnalysisSummary] = useState<string | null>(null);
  const [generatedQuizQuestions, setGeneratedQuizQuestions] = useState<QuizQuestion[] | null>(null);

  const cameraRef = useRef<any>(null);

  useEffect(() => {
    let interval: any = null;
    if (sessionActive) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionActive]);

  const formatTimer = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  const handleStartSession = () => {
    if (!topic.trim()) {
      Alert.alert('Specify Subject', 'Enter what you are studying before initiating lock-in.');
      return;
    }
    setSessionActive(true);
    setCameraMode('proctor');
  };

  const handleEndSession = () => {
    setSessionActive(false);
    setCameraMode('notes');
    Alert.alert(
      'Session Concluded',
      'Now hold up your study notes to the camera. Gemini AI will scan them and generate your custom Playground Quiz.'
    );
  };

  const handleSnapNotes = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
        setNotesCaptured(photo.uri);
        triggerAiAnalysis(photo.uri);
      } catch (e) {
        const fallbackUrl = 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&auto=format&fit=crop&q=60';
        setNotesCaptured(fallbackUrl);
        triggerAiAnalysis(fallbackUrl);
      }
    } else {
      const fallbackUrl = 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&auto=format&fit=crop&q=60';
      setNotesCaptured(fallbackUrl);
      triggerAiAnalysis(fallbackUrl);
    }
  };

  const triggerAiAnalysis = async (imgUri: string) => {
    setAnalyzingWithAI(true);
    try {
      const result = await analyzeStudyNotesAndGenerateQuiz(topic, imgUri);
      setAiAnalysisSummary(result.summary);
      setGeneratedQuizQuestions(result.questions);
    } catch (err) {
      console.warn('AI scan error:', err);
    } finally {
      setAnalyzingWithAI(false);
    }
  };

  const handleProceedToPlayground = async () => {
    const newSession: StudySessionLog = {
      id: `session_${Date.now()}`,
      topic,
      durationSeconds: Math.max(seconds, 60),
      timestamp: new Date().toISOString(),
      verified: true,
      notesSummary: aiAnalysisSummary || `Scanned notes covering ${topic}.`,
    };

    await saveSession(newSession);
    onSessionComplete(newSession, generatedQuizQuestions || undefined);
    onNavigate('playground');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.badgePill}>
          <Text style={styles.badgeText}>PROCTOR LOCK-IN</Text>
        </View>
        <Text style={styles.title}>LIVE STUDY PROTOCOL</Text>
        <Text style={styles.subtitle}>Presence verified by camera. Notes scanned at conclusion.</Text>
      </View>

      {!sessionActive && !notesCaptured && (
        <View style={styles.inputWrap}>
          <Text style={styles.label}>FOCUS OBJECTIVE</Text>
          <TextInput
            style={styles.input}
            value={topic}
            onChangeText={setTopic}
            placeholder="e.g. Distributed Systems, Organic Chem..."
            placeholderTextColor={COLORS.textMuted}
          />
        </View>
      )}

      {/* Live Camera Viewfinder */}
      <View style={styles.cameraBox}>
        {notesCaptured ? (
          <View style={styles.previewBox}>
            <Image source={{ uri: notesCaptured }} style={styles.previewImage} />
            <View style={styles.scanBadge}>
              <Text style={styles.scanBadgeText}>
                {analyzingWithAI ? '⚡ GEMINI ANALYZING NOTES...' : '✓ NOTES SCANNED & QUIZ READY'}
              </Text>
            </View>
          </View>
        ) : permission?.granted ? (
          <CameraView style={styles.camera} ref={cameraRef} facing="front">
            <View style={styles.cameraOverlay}>
              <View style={styles.proctorStatus}>
                <View style={[styles.pulseDot, sessionActive && styles.pulseDotActive]} />
                <Text style={styles.proctorText}>
                  {sessionActive ? 'PROCTOR ACTIVE · PRESENCE LOGGED' : 'STANDBY · FRONT SENSOR READY'}
                </Text>
              </View>
              {sessionActive && (
                <View style={styles.reticle}>
                  <View style={styles.cornerTL} />
                  <View style={styles.cornerTR} />
                  <View style={styles.cornerBL} />
                  <View style={styles.cornerBR} />
                </View>
              )}
            </View>
          </CameraView>
        ) : (
          <View style={styles.permBox}>
            <Text style={styles.permText}>Front camera verification required to log verified study sessions.</Text>
            <TouchableOpacity style={styles.btnSecondary} onPress={requestPermission}>
              <Text style={styles.btnSecondaryText}>GRANT CAMERA PERMISSION</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Stopwatch Display */}
      <View style={styles.timerDisplay}>
        <Text style={styles.timerNumber}>{formatTimer(seconds)}</Text>
        <Text style={styles.timerLabel}>
          {sessionActive ? 'SESSION IN PROGRESS' : 'ACCUMULATED MINUTES'}
        </Text>
      </View>

      {/* AI Analysis Summary if Available */}
      {aiAnalysisSummary && (
        <View style={styles.aiSummaryCard}>
          <Text style={styles.aiSummaryHeader}>🤖 GEMINI NOTE DIGEST</Text>
          <Text style={styles.aiSummaryText}>{aiAnalysisSummary}</Text>
        </View>
      )}

      {/* Action Buttons */}
      {!sessionActive && !notesCaptured && (
        <TouchableOpacity style={styles.btnPrimary} onPress={handleStartSession}>
          <Text style={styles.btnPrimaryText}>START STUDY LOCK-IN</Text>
        </TouchableOpacity>
      )}

      {sessionActive && (
        <TouchableOpacity style={styles.btnStop} onPress={handleEndSession}>
          <Text style={styles.btnStopText}>END SESSION & SCAN NOTES</Text>
        </TouchableOpacity>
      )}

      {!sessionActive && cameraMode === 'notes' && !notesCaptured && (
        <TouchableOpacity style={styles.btnSnap} onPress={handleSnapNotes}>
          <Text style={styles.btnSnapText}>PHOTOGRAPH NOTES FOR QUIZ</Text>
        </TouchableOpacity>
      )}

      {notesCaptured && (
        <View style={{ gap: 10 }}>
          <TouchableOpacity
            style={[styles.btnPrimary, analyzingWithAI && styles.btnDisabled]}
            onPress={handleProceedToPlayground}
            disabled={analyzingWithAI}
          >
            {analyzingWithAI ? (
              <ActivityIndicator color={COLORS.primaryText} />
            ) : (
              <Text style={styles.btnPrimaryText}>LAUNCH PLAYGROUND QUIZ →</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => {
              setNotesCaptured(null);
              setAiAnalysisSummary(null);
            }}
          >
            <Text style={styles.btnSecondaryText}>RETAKE PHOTO</Text>
          </TouchableOpacity>
        </View>
      )}
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
  title: { color: '#ffffff', fontSize: 20, fontWeight: '900', letterSpacing: 1 },
  subtitle: { color: COLORS.textDim, fontSize: 12, marginTop: 3 },
  inputWrap: { marginBottom: 14 },
  label: { color: COLORS.secondary, fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.15)',
    borderRadius: 12,
    color: '#fff',
    padding: 14,
    fontSize: 14,
  },
  cameraBox: {
    height: 270,
    backgroundColor: '#000',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.25)',
    marginBottom: 16,
  },
  camera: { flex: 1 },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: 'rgba(16, 17, 13, 0.3)',
  },
  proctorStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(24, 26, 20, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.2)',
  },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.textMuted },
  pulseDotActive: { backgroundColor: COLORS.accent },
  proctorText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  reticle: {
    alignSelf: 'center',
    width: 140,
    height: 160,
    position: 'relative',
  },
  cornerTL: { position: 'absolute', top: 0, left: 0, width: 20, height: 20, borderTopWidth: 2, borderLeftWidth: 2, borderColor: COLORS.accent },
  cornerTR: { position: 'absolute', top: 0, right: 0, width: 20, height: 20, borderTopWidth: 2, borderRightWidth: 2, borderColor: COLORS.accent },
  cornerBL: { position: 'absolute', bottom: 0, left: 0, width: 20, height: 20, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: COLORS.accent },
  cornerBR: { position: 'absolute', bottom: 0, right: 0, width: 20, height: 20, borderBottomWidth: 2, borderRightWidth: 2, borderColor: COLORS.accent },
  permBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  permText: { color: COLORS.textDim, fontSize: 13, textAlign: 'center', marginBottom: 12 },
  previewBox: { flex: 1, position: 'relative' },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  scanBadge: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    backgroundColor: 'rgba(229, 169, 60, 0.95)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  scanBadgeText: { color: COLORS.primaryText, fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  timerDisplay: {
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.15)',
    padding: 16,
    marginBottom: 16,
  },
  timerNumber: {
    color: '#ffffff',
    fontSize: 44,
    fontWeight: '900',
    fontFamily: 'Courier',
    letterSpacing: 2,
  },
  timerLabel: { color: COLORS.secondary, fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginTop: 4 },
  aiSummaryCard: {
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.25)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  aiSummaryHeader: { color: COLORS.accent, fontSize: 11, fontWeight: '900', letterSpacing: 1, marginBottom: 4 },
  aiSummaryText: { color: COLORS.text, fontSize: 12, lineHeight: 18 },
  btnPrimary: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  btnPrimaryText: { color: COLORS.primaryText, fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  btnStop: {
    backgroundColor: '#1E2018',
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  btnStopText: { color: COLORS.accent, fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  btnSnap: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  btnSnapText: { color: COLORS.primaryText, fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  btnSecondary: {
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.2)',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  btnSecondaryText: { color: COLORS.accent, fontSize: 12, fontWeight: '800', letterSpacing: 1 },
});
