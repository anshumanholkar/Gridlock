import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { COLORS } from '../theme';
import { TabType, LearningRoadmap, TaskItem } from '../types';
import { generateLearningPath } from '../services/gemini';
import { getTasks, saveTasks } from '../services/storage';

interface Props {
  onNavigate: (tab: TabType) => void;
  onTasksAdded?: () => void;
}

export default function SuggestorScreen({ onNavigate, onTasksAdded }: Props) {
  const [topicInput, setTopicInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTopicInput('');
    setRoadmap(null);
    setRefreshing(false);
  };

  const sampleTopics = [
    'Trading & Price Action',
    'Fullstack AI Systems',
    'Foreign Language Fluency',
    'Quad Hypertrophy & Biomechanics',
    'Calculus & Linear Algebra',
    'Piano & Ear Training',
  ];

  const handleGenerate = async (topicToUse?: string) => {
    const query = topicToUse || topicInput;
    if (!query.trim()) {
      Alert.alert('Topic Required', 'Please enter a skill, subject, or technology you want to learn.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await generateLearningPath(query.trim());
      setRoadmap(res);
    } catch (err) {
      Alert.alert('Generation Error', 'Failed to generate roadmap. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTasksToHq = async () => {
    if (!roadmap || !roadmap.suggestedDailyTasks || roadmap.suggestedDailyTasks.length === 0) return;

    const existing = await getTasks();
    const newItems: TaskItem[] = roadmap.suggestedDailyTasks.map((title, idx) => ({
      id: `task_suggest_${Date.now()}_${idx}`,
      title,
      category: 'Study',
      priority: idx === 0 ? 'High' : 'Medium',
      estimatedMinutes: 60,
      completed: false,
      dueDate: 'Today',
      calendarSynced: true,
    }));

    await saveTasks([...newItems, ...existing]);
    if (onTasksAdded) onTasksAdded();
    Alert.alert(
      'Locked into HQ Quota',
      `Imported ${newItems.length} curated roadmap tasks directly into your daily HQ To-Do list!`
    );
    onNavigate('dashboard');
  };

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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badgePill}>
          <Text style={styles.badgeText}>AI CURRICULUM ARCHITECT</Text>
        </View>
        <Text style={styles.title}>LEARNING ROADMAP SUGGESTOR</Text>
        <Text style={styles.subtitle}>
          Confused how to master a topic? Get a battle-tested step-by-step roadmap, curated authoritative sources, and 1-tap daily tasks.
        </Text>
      </View>

      {/* Input Card */}
      <View style={styles.card}>
        <Text style={styles.fieldLabel}>WHAT DO YOU WANT TO MASTER?</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={topicInput}
            onChangeText={setTopicInput}
            placeholder="e.g. Distributed Systems, Biomechanics, Rust"
            placeholderTextColor={COLORS.textMuted}
          />
          <TouchableOpacity
            style={[styles.btnGenerate, isLoading && { opacity: 0.6 }]}
            onPress={() => handleGenerate()}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.primaryText} />
            ) : (
              <Text style={styles.btnGenerateText}>GENERATE →</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Quick Sample Chips */}
        <Text style={styles.chipsLabel}>POPULAR MASTERY VECTORS:</Text>
        <View style={styles.chipsRow}>
          {sampleTopics.map((t) => (
            <TouchableOpacity
              key={t}
              style={styles.chip}
              onPress={() => {
                setTopicInput(t);
                handleGenerate(t);
              }}
            >
              <Text style={styles.chipText}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Loading Banner */}
      {isLoading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingTitle}>CURATING ZERO-FLUFF ROADMAP & SOURCES...</Text>
          <Text style={styles.loadingSub}>Synthesizing phases, authoritative texts, and deliverables.</Text>
        </View>
      )}

      {/* Generated Roadmap Result */}
      {roadmap && !isLoading && (
        <View style={styles.resultContainer}>
          {/* Overview Banner */}
          <View style={styles.overviewCard}>
            <View style={styles.overviewTop}>
              <Text style={styles.overviewTopic}>{roadmap.topic.toUpperCase()}</Text>
              <View style={styles.levelPill}>
                <Text style={styles.levelText}>{roadmap.level.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.overviewText}>{roadmap.overview}</Text>
          </View>

          {/* 1. Step-by-Step Learning Phases */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>STEP-BY-STEP EXECUTION ROADMAP</Text>
            <Text style={styles.sectionSub}>{roadmap.phases.length} PROGRESSIVE PHASES</Text>
          </View>

          {roadmap.phases.map((phase) => (
            <View key={phase.stepNumber} style={styles.phaseCard}>
              <View style={styles.phaseHeader}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>PHASE {phase.stepNumber}</Text>
                </View>
                <Text style={styles.phaseDays}>⏱ {phase.estimatedDays} DAYS</Text>
              </View>

              <Text style={styles.phaseTitle}>{phase.title}</Text>
              <Text style={styles.phaseFocus}>{phase.focus}</Text>

              <View style={styles.deliverableBox}>
                <Text style={styles.deliverableLabel}>MANDATORY DELIVERABLE:</Text>
                <Text style={styles.deliverableText}>🎯 {phase.deliverable}</Text>
              </View>
            </View>
          ))}

          {/* 2. Curated Authoritative Sources */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>CURATED HIGH-YIELD SOURCES</Text>
            <Text style={styles.sectionSub}>ZERO SECONDARY FLUFF</Text>
          </View>

          {roadmap.curatedSources.map((source, i) => (
            <View key={i} style={styles.sourceCard}>
              <View style={styles.sourceHeader}>
                <View style={styles.sourceTypeBadge}>
                  <Text style={styles.sourceTypeText}>{source.type.toUpperCase()}</Text>
                </View>
                <Text style={styles.sourceAuthor}>{source.urlOrAuthor}</Text>
              </View>
              <Text style={styles.sourceTitle}>{source.title}</Text>
              <Text style={styles.sourceDesc}>{source.description}</Text>
            </View>
          ))}

          {/* 3. 1-Tap Daily Tasks Import */}
          {roadmap.suggestedDailyTasks && roadmap.suggestedDailyTasks.length > 0 && (
            <View style={styles.importCard}>
              <Text style={styles.importHeader}>ACTIONABLE DAILY DRILLS:</Text>
              {roadmap.suggestedDailyTasks.map((taskStr, idx) => (
                <View key={idx} style={styles.taskPreviewRow}>
                  <Text style={styles.taskPreviewBullet}>•</Text>
                  <Text style={styles.taskPreviewText}>{taskStr}</Text>
                </View>
              ))}

              <TouchableOpacity style={styles.btnImport} onPress={handleAddTasksToHq}>
                <Text style={styles.btnImportText}>+ LOCK ALL INTO DAILY HQ QUOTA →</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 60 },
  header: { marginBottom: 16 },
  badgePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(229, 169, 60, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.35)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  badgeText: { color: COLORS.accent, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  title: { color: COLORS.text, fontSize: 20, fontWeight: '900', letterSpacing: 0.8 },
  subtitle: { color: COLORS.secondary, fontSize: 12, marginTop: 4, lineHeight: 16 },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.18)',
    padding: 16,
    marginBottom: 16,
  },
  fieldLabel: { color: COLORS.secondary, fontSize: 9, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  input: {
    flex: 1,
    backgroundColor: COLORS.bgInput,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.15)',
    borderRadius: 12,
    color: '#fff',
    paddingHorizontal: 14,
    fontSize: 13,
  },
  btnGenerate: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnGenerateText: { color: COLORS.primaryText, fontSize: 11, fontWeight: '900', letterSpacing: 0.8 },
  chipsLabel: { color: COLORS.textMuted, fontSize: 8, fontWeight: '800', letterSpacing: 0.8, marginBottom: 6 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    backgroundColor: '#191814',
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  chipText: { color: COLORS.textDim, fontSize: 10, fontWeight: '700' },
  loadingBox: {
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.2)',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingTitle: { color: COLORS.accent, fontSize: 12, fontWeight: '900', letterSpacing: 1, marginTop: 12 },
  loadingSub: { color: COLORS.textDim, fontSize: 10, marginTop: 4 },
  resultContainer: { marginTop: 4 },
  overviewCard: {
    backgroundColor: '#171510',
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  overviewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  overviewTopic: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 0.8 },
  levelPill: {
    backgroundColor: 'rgba(229, 169, 60, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  levelText: { color: COLORS.accent, fontSize: 8, fontWeight: '900' },
  overviewText: { color: '#E4DFD5', fontSize: 12, lineHeight: 17 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 10 },
  sectionTitle: { color: '#fff', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  sectionSub: { color: COLORS.secondary, fontSize: 9, fontWeight: '800' },
  phaseCard: {
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.15)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  phaseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  stepBadge: {
    backgroundColor: 'rgba(229, 169, 60, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stepBadgeText: { color: COLORS.accent, fontSize: 9, fontWeight: '900' },
  phaseDays: { color: COLORS.secondary, fontSize: 10, fontWeight: '700' },
  phaseTitle: { color: '#fff', fontSize: 13, fontWeight: '900', marginBottom: 3 },
  phaseFocus: { color: COLORS.textDim, fontSize: 11, lineHeight: 16, marginBottom: 8 },
  deliverableBox: {
    backgroundColor: '#0F0E0C',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.1)',
  },
  deliverableLabel: { color: COLORS.accent, fontSize: 8, fontWeight: '800', letterSpacing: 0.8 },
  deliverableText: { color: '#FDFCF7', fontSize: 10, fontWeight: '700', marginTop: 2 },
  sourceCard: {
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.15)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  sourceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  sourceTypeBadge: {
    backgroundColor: '#1F1C16',
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sourceTypeText: { color: COLORS.accent, fontSize: 8, fontWeight: '900' },
  sourceAuthor: { color: COLORS.secondary, fontSize: 10, fontWeight: '600' },
  sourceTitle: { color: '#fff', fontSize: 13, fontWeight: '800', marginBottom: 3 },
  sourceDesc: { color: COLORS.textDim, fontSize: 11, lineHeight: 15 },
  importCard: {
    backgroundColor: '#171510',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(229, 169, 60, 0.3)',
    padding: 16,
    marginTop: 10,
    marginBottom: 20,
  },
  importHeader: { color: COLORS.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1, marginBottom: 8 },
  taskPreviewRow: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  taskPreviewBullet: { color: COLORS.accent, fontSize: 12 },
  taskPreviewText: { color: '#F4F5F0', fontSize: 11, flex: 1 },
  btnImport: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  btnImportText: { color: COLORS.primaryText, fontSize: 11, fontWeight: '900', letterSpacing: 0.8 },
});
