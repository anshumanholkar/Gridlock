import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { COLORS } from '../theme';
import { TaskItem } from '../types';
import { getTasks, saveTasks } from '../services/storage';

interface Props {
  visible: boolean;
  onClose: () => void;
  onTaskCreated: (task: TaskItem) => void;
}

export default function QuickAddModal({ visible, onClose, onTaskCreated }: Props) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Study' | 'Fitness' | 'Mindset' | 'Skill'>('Study');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [minutes, setMinutes] = useState(45);
  const [calendarSync, setCalendarSync] = useState(true);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [waveformFrame, setWaveformFrame] = useState(0);

  // Simulated Voice Task recognition samples
  const voiceSamples = [
    'Complete 2h Compiler Design Lexical Analysis',
    'Heavy Squats: 4 sets of 8 reps progressive overload',
    'Solve 3 Dynamic Programming problems on LeetCode',
    'Review Sunday Physique composition audit notes',
    'Read 30 pages of Distributed Systems architecture',
  ];

  const handleStartVoice = () => {
    setIsVoiceRecording(true);
    let frame = 0;
    const waveInterval = setInterval(() => {
      frame = (frame + 1) % 4;
      setWaveformFrame(frame);
    }, 250);

    // Simulate speech-to-text dictation completing after 1.8 seconds
    setTimeout(() => {
      clearInterval(waveInterval);
      const randomSample = voiceSamples[Math.floor(Math.random() * voiceSamples.length)];
      setTitle(randomSample);
      setIsVoiceRecording(false);
      Alert.alert('Voice Transcribed', `Recognized: "${randomSample}"`);
    }, 1800);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Task Title Required', 'Please enter or dictate a task description.');
      return;
    }

    const newTask: TaskItem = {
      id: `task_${Date.now()}`,
      title: title.trim(),
      category,
      priority,
      estimatedMinutes: minutes,
      completed: false,
      dueDate: 'Today',
      calendarSynced: calendarSync,
    };

    const existing = await getTasks();
    await saveTasks([newTask, ...existing]);
    onTaskCreated(newTask);
    setTitle('');
    onClose();

    if (calendarSync) {
      Alert.alert(
        'Task Added & Calendar Synced',
        `"${newTask.title}" added to your daily quota and synced to your device calendar.`
      );
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.modalSheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <View style={styles.badgePill}>
                <Text style={styles.badgeText}>INSTANT CAPTURE</Text>
              </View>
              <Text style={styles.title}>QUICK ADD TASK</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Voice Dictation Button */}
            <TouchableOpacity
              style={[styles.voiceBtn, isVoiceRecording && styles.voiceBtnActive]}
              onPress={handleStartVoice}
              disabled={isVoiceRecording}
            >
              <Text style={styles.voiceIcon}>{isVoiceRecording ? '🎙️' : '🎤'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.voiceTitle}>
                  {isVoiceRecording ? 'LISTENING TO SPEECH...' : 'VOICE TASK ENTRY'}
                </Text>
                <Text style={styles.voiceSub}>
                  {isVoiceRecording
                    ? `Transcribing waveform ${'▮'.repeat(waveformFrame + 2)}...`
                    : 'Tap to speak your task naturally'}
                </Text>
              </View>
              {isVoiceRecording && (
                <View style={styles.recordingPulse}>
                  <Text style={styles.pulseText}>REC</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Task Title Input */}
            <Text style={styles.fieldLabel}>TASK DESCRIPTION</Text>
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. 90m Calculus Problem Set or 5km run"
              placeholderTextColor={COLORS.textMuted}
            />

            {/* Category Selector */}
            <Text style={styles.fieldLabel}>CATEGORY</Text>
            <View style={styles.pillRow}>
              {(['Study', 'Fitness', 'Mindset', 'Skill'] as const).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryPill, category === cat && styles.categoryPillActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryPillText,
                      category === cat && styles.categoryPillTextActive,
                    ]}
                  >
                    {cat === 'Study' ? '📚 ' : cat === 'Fitness' ? '🏋️ ' : cat === 'Mindset' ? '🧘 ' : '💻 '}
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Priority Selector */}
            <Text style={styles.fieldLabel}>PRIORITY MANDATE</Text>
            <View style={styles.pillRow}>
              {(['High', 'Medium', 'Low'] as const).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.priorityPill, priority === p && styles.priorityPillActive]}
                  onPress={() => setPriority(p)}
                >
                  <Text
                    style={[
                      styles.priorityPillText,
                      priority === p && styles.priorityPillTextActive,
                    ]}
                  >
                    {p === 'High' ? '🔥 HIGH' : p === 'Medium' ? '⚡ MEDIUM' : '⏳ LOW'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Estimated Duration */}
            <Text style={styles.fieldLabel}>ESTIMATED DURATION (MINUTES)</Text>
            <View style={styles.pillRow}>
              {[15, 30, 45, 60, 90, 120].map((dur) => (
                <TouchableOpacity
                  key={dur}
                  style={[styles.durPill, minutes === dur && styles.durPillActive]}
                  onPress={() => setMinutes(dur)}
                >
                  <Text style={[styles.durPillText, minutes === dur && styles.durPillTextActive]}>
                    {dur}m
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Calendar Sync Toggle */}
            <TouchableOpacity
              style={styles.syncBox}
              onPress={() => setCalendarSync(!calendarSync)}
            >
              <View style={styles.syncLeft}>
                <Text style={{ fontSize: 20 }}>📅</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.syncTitle}>CALENDAR SYNC</Text>
                  <Text style={styles.syncDesc}>
                    Push to device calendar & lock in reminder notification
                  </Text>
                </View>
              </View>
              <View style={[styles.toggleTrack, calendarSync && styles.toggleTrackActive]}>
                <View style={[styles.toggleThumb, calendarSync && styles.toggleThumbActive]} />
              </View>
            </TouchableOpacity>

            {/* Lock In Submit Button */}
            <TouchableOpacity style={styles.submitBtn} onPress={handleSave}>
              <Text style={styles.submitBtnText}>LOCK IN TASK TO QUOTA →</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.bgCardSolid,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.25)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  badgePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(229, 169, 60, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4,
  },
  badgeText: {
    color: COLORS.accent,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#24271D',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.2)',
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  voiceBtn: {
    backgroundColor: '#1B1E16',
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.25)',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  voiceBtnActive: {
    borderColor: COLORS.accent,
    backgroundColor: '#24281B',
  },
  voiceIcon: {
    fontSize: 24,
  },
  voiceTitle: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  voiceSub: {
    color: COLORS.textDim,
    fontSize: 10,
    marginTop: 2,
  },
  recordingPulse: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pulseText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
  },
  fieldLabel: {
    color: COLORS.secondary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 10,
  },
  textInput: {
    backgroundColor: COLORS.bgInput,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.15)',
    borderRadius: 12,
    color: '#fff',
    padding: 12,
    fontSize: 13,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryPill: {
    backgroundColor: '#1E2118',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.12)',
  },
  categoryPillActive: {
    backgroundColor: 'rgba(229, 169, 60, 0.18)',
    borderColor: COLORS.accent,
  },
  categoryPillText: {
    color: COLORS.textDim,
    fontSize: 11,
    fontWeight: '700',
  },
  categoryPillTextActive: {
    color: COLORS.accent,
    fontWeight: '900',
  },
  priorityPill: {
    flex: 1,
    backgroundColor: '#1E2118',
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.12)',
  },
  priorityPillActive: {
    backgroundColor: 'rgba(229, 169, 60, 0.2)',
    borderColor: COLORS.accent,
  },
  priorityPillText: {
    color: COLORS.textDim,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  priorityPillTextActive: {
    color: COLORS.accent,
    fontWeight: '900',
  },
  durPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#1E2118',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.12)',
  },
  durPillActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  durPillText: {
    color: COLORS.textDim,
    fontSize: 11,
    fontWeight: '700',
  },
  durPillTextActive: {
    color: COLORS.primaryText,
    fontWeight: '900',
  },
  syncBox: {
    backgroundColor: '#181A14',
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.15)',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 20,
  },
  syncLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 10,
  },
  syncTitle: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  syncDesc: {
    color: COLORS.textDim,
    fontSize: 9,
    marginTop: 2,
  },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2A2E22',
    padding: 2,
    justifyContent: 'center',
  },
  toggleTrackActive: {
    backgroundColor: COLORS.accent,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#858C65',
  },
  toggleThumbActive: {
    backgroundColor: '#10110D',
    alignSelf: 'flex-end',
  },
  submitBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 24,
  },
  submitBtnText: {
    color: COLORS.primaryText,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
