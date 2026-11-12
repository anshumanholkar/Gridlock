import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { COLORS } from '../theme';
import { GoalItem, TabType } from '../types';
import { getGoals, saveGoals, getGeminiKey } from '../services/storage';

interface Props {
  onNavigate: (tab: TabType) => void;
}

export default function GoalBreakdownScreen({ onNavigate }: Props) {
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDate, setNewGoalDate] = useState('Dec 15');
  const [isDecomposing, setIsDecomposing] = useState(false);

  useEffect(() => {
    getGoals().then(setGoals);
  }, []);

  const handleToggleSubTask = async (goalId: string, subTaskId: string) => {
    const updated = goals.map((g) => {
      if (g.id === goalId) {
        const subTasks = g.subTasks.map((st) => (st.id === subTaskId ? { ...st, completed: !st.completed } : st));
        const done = subTasks.filter((st) => st.completed).length;
        const progressPct = Math.round((done / subTasks.length) * 100);
        return { ...g, subTasks, progressPct };
      }
      return g;
    });
    setGoals(updated);
    await saveGoals(updated);
  };

  const handleAiDecomposeGoal = async () => {
    if (!newGoalTitle.trim()) {
      Alert.alert('Goal Required', 'Please enter a goal you want to achieve.');
      return;
    }

    setIsDecomposing(true);
    const apiKey = await getGeminiKey();

    let subTasks = [
      { id: `st_${Date.now()}_1`, title: 'Define foundation benchmarks and baseline constraints', completed: false },
      { id: `st_${Date.now()}_2`, title: 'Execute deliberate practice drill blocks (Daily non-negotiable)', completed: false },
      { id: `st_${Date.now()}_3`, title: 'Milestone retention review & speed audit', completed: false },
      { id: `st_${Date.now()}_4`, title: 'Final mastery stress test under simulated exam conditions', completed: false },
    ];
    let aiAdvice = `AI Coach Breakdown for: ${newGoalTitle}. Focus on micro-progress consistency over erratic bursts. Keep daily accountability logs.`;

    if (apiKey) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const prompt = `
You are the elite Goal Strategist for GRIDLOCK discipline system.
Decompose this ambitious student goal: "${newGoalTitle}" with target date: "${newGoalDate}".
Break it down into 4 actionable, sequential, high-leverage micro-tasks and 1 strategic coaching tip.

Return strict JSON:
{
  "subTasks": ["Task 1", "Task 2", "Task 3", "Task 4"],
  "advice": "1-2 sentences of ruthless strategic execution advice"
}
Only return JSON.
`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, responseMimeType: 'application/json' },
          }),
        });
        const data = await res.json();
        const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (raw) {
          const parsed = JSON.parse(raw.replace(/```json/g, '').replace(/```/g, '').trim());
          if (parsed.subTasks && parsed.subTasks.length > 0) {
            subTasks = parsed.subTasks.map((t: string, idx: number) => ({
              id: `st_${Date.now()}_${idx}`,
              title: t,
              completed: false,
            }));
            aiAdvice = parsed.advice || aiAdvice;
          }
        }
      } catch (err) {
        console.warn('AI decomposition fallback:', err);
      }
    }

    const newGoal: GoalItem = {
      id: `g_${Date.now()}`,
      title: newGoalTitle.trim(),
      targetDate: newGoalDate,
      progressPct: 0,
      subTasks,
      aiBreakdownAdvice: aiAdvice,
    };

    const updated = [newGoal, ...goals];
    setGoals(updated);
    await saveGoals(updated);
    setNewGoalTitle('');
    setIsDecomposing(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.badgePill}>
          <Text style={styles.badgeText}>FEATURE · GOAL DECOMPOSITION</Text>
        </View>
        <Text style={styles.title}>HIGH-LEVERAGE GOAL BREAKDOWN</Text>
        <Text style={styles.subtitle}>
          Deconstruct massive targets into relentless micro-milestones with Gemini AI.
        </Text>
      </View>

      {/* New Goal Creator */}
      <View style={styles.creatorCard}>
        <Text style={styles.sectionHeader}>🎯 DECOMPOSE NEW AMBITIOUS TARGET</Text>
        <TextInput
          style={styles.input}
          value={newGoalTitle}
          onChangeText={setNewGoalTitle}
          placeholder="e.g. Master Linear Algebra, Publish Research Paper, Sub-12% Body Fat..."
          placeholderTextColor={COLORS.textMuted}
        />
        <View style={styles.dateRow}>
          <Text style={styles.dateLabel}>DEADLINE TARGET:</Text>
          <TextInput
            style={styles.dateInput}
            value={newGoalDate}
            onChangeText={setNewGoalDate}
            placeholder="Target Date"
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        <TouchableOpacity style={styles.btnBreakdown} onPress={handleAiDecomposeGoal} disabled={isDecomposing}>
          {isDecomposing ? (
            <ActivityIndicator color={COLORS.primaryText} />
          ) : (
            <Text style={styles.btnBreakdownText}>⚡ AI BREAKDOWN INTO ACTION STEPS</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Existing Goals List */}
      <Text style={styles.listHeader}>ACTIVE HIGH-STAKES GOALS ({goals.length})</Text>

      {goals.map((goal) => (
        <View key={goal.id} style={styles.goalCard}>
          <View style={styles.goalTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.goalTitle}>{goal.title}</Text>
              <Text style={styles.goalDate}>TARGET DEADLINE: {goal.targetDate.toUpperCase()}</Text>
            </View>
            <View style={styles.progressCircle}>
              <Text style={styles.progressText}>{goal.progressPct}%</Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${goal.progressPct}%` }]} />
          </View>

          {/* AI Strategy Advice */}
          {goal.aiBreakdownAdvice && (
            <View style={styles.adviceBox}>
              <Text style={styles.adviceHeader}>🤖 STRATEGIC DIRECTIVE</Text>
              <Text style={styles.adviceBody}>{goal.aiBreakdownAdvice}</Text>
            </View>
          )}

          {/* Subtasks */}
          <Text style={styles.subtasksHeader}>ACTIONABLE MILESTONES:</Text>
          <View style={styles.subtaskList}>
            {goal.subTasks.map((st) => (
              <TouchableOpacity
                key={st.id}
                style={[styles.subtaskRow, st.completed && styles.subtaskRowDone]}
                onPress={() => handleToggleSubTask(goal.id, st.id)}
              >
                <View style={[styles.checkbox, st.completed && styles.checkboxDone]}>
                  {st.completed && <Text style={styles.checkMark}>✓</Text>}
                </View>
                <Text style={[styles.subtaskTitle, st.completed && styles.subtaskTitleDone]}>
                  {st.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
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
  title: { color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: 0.8 },
  subtitle: { color: COLORS.textDim, fontSize: 12, marginTop: 4, lineHeight: 16 },
  creatorCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.25)',
    padding: 16,
    marginBottom: 20,
  },
  sectionHeader: { color: COLORS.accent, fontSize: 11, fontWeight: '900', letterSpacing: 1, marginBottom: 10 },
  input: {
    backgroundColor: COLORS.bgInput,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.15)',
    borderRadius: 12,
    color: '#fff',
    padding: 14,
    fontSize: 13,
  },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 12 },
  dateLabel: { color: COLORS.secondary, fontSize: 10, fontWeight: '800' },
  dateInput: {
    backgroundColor: COLORS.bgInput,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.15)',
    borderRadius: 8,
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 12,
    width: 110,
  },
  btnBreakdown: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  btnBreakdownText: { color: COLORS.primaryText, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  listHeader: { color: '#fff', fontSize: 12, fontWeight: '900', letterSpacing: 1, marginBottom: 12 },
  goalCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.15)',
    padding: 18,
    marginBottom: 14,
  },
  goalTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  goalTitle: { color: '#fff', fontSize: 15, fontWeight: '800', lineHeight: 20 },
  goalDate: { color: COLORS.secondary, fontSize: 10, fontWeight: '700', marginTop: 4 },
  progressCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#161811',
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: { color: COLORS.accent, fontSize: 11, fontWeight: '900' },
  progressBar: {
    height: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 3,
    marginVertical: 12,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: COLORS.accent },
  adviceBox: {
    backgroundColor: '#161811',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.18)',
    marginBottom: 14,
  },
  adviceHeader: { color: COLORS.accent, fontSize: 9, fontWeight: '900', letterSpacing: 1, marginBottom: 4 },
  adviceBody: { color: COLORS.textDim, fontSize: 11, lineHeight: 16 },
  subtasksHeader: { color: COLORS.secondary, fontSize: 10, fontWeight: '800', letterSpacing: 0.8, marginBottom: 8 },
  subtaskList: { gap: 8 },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.bgInput,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.08)',
  },
  subtaskRowDone: {
    opacity: 0.6,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: 'rgba(229, 169, 60, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxDone: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  checkMark: { color: COLORS.primaryText, fontSize: 12, fontWeight: '900' },
  subtaskTitle: { color: '#F4F5F0', fontSize: 12, flex: 1, fontWeight: '500' },
  subtaskTitleDone: { textDecorationLine: 'line-through', color: COLORS.textMuted },
});
