import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { COLORS } from '../theme';
import { TabType, TaskItem } from '../types';
import { getTasks, saveTasks } from '../services/storage';

interface Template {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  tasks: { title: string; minutes: number; category: 'Study' | 'Fitness' | 'Mindset' | 'Skill' }[];
}

interface Props {
  onNavigate: (tab: TabType) => void;
}

export default function HabitTemplatesScreen({ onNavigate }: Props) {
  const templates: Template[] = [
    {
      id: 'exam_warrior',
      name: 'EXAM WARRIOR PROTOCOL',
      category: 'Academic Peak',
      icon: '📚',
      description: 'Built for intense finals, engineering exams, and medical board preparation.',
      tasks: [
        { title: '2.5h Deep Work: Core Engineering Block', minutes: 150, category: 'Study' },
        { title: 'Playground 20Q Memory Recall Exam', minutes: 25, category: 'Skill' },
        { title: '45m High-Volume Cardio & Sweat Session', minutes: 45, category: 'Fitness' },
        { title: '15m Nightly Formulas & Theorems Review', minutes: 15, category: 'Study' },
      ],
    },
    {
      id: 'physique_heavy',
      name: 'ATHLETIC BODY COMPOSITION',
      category: 'Hypertrophy & Cut',
      icon: '🏋',
      description: 'Targeted quad overload, upper chest priority, and strict caloric discipline.',
      tasks: [
        { title: 'Heavy Quad Overload: Bulgarian Split Squats', minutes: 60, category: 'Fitness' },
        { title: '4.5L Water Intake & Sodium Regulation', minutes: 5, category: 'Fitness' },
        { title: 'Sunday Shirtless & Legs Biometric Scan', minutes: 10, category: 'Fitness' },
        { title: '1.5h Focus Session on Technical Specialty', minutes: 90, category: 'Study' },
      ],
    },
    {
      id: 'iron_monk',
      name: 'THE MONK MODE SLATE',
      category: 'High Dopamine Detox',
      icon: '🧘',
      description: 'Zero social media, cold showers, rigorous reading, and early wakeups.',
      tasks: [
        { title: 'Zero Social Media / Screen Lockout', minutes: 1, category: 'Mindset' },
        { title: 'Cold Shower & 20m Morning Meditation', minutes: 25, category: 'Mindset' },
        { title: '3h Uninterrupted Deep Focus Block', minutes: 180, category: 'Study' },
        { title: '15m Daily Gratitude to God & Journaling', minutes: 15, category: 'Mindset' },
      ],
    },
  ];

  const handleApplyTemplate = async (template: Template) => {
    const existing = await getTasks();
    const newTasks: TaskItem[] = template.tasks.map((t, idx) => ({
      id: `t_${Date.now()}_${idx}`,
      title: t.title,
      category: t.category,
      priority: 'High',
      estimatedMinutes: t.minutes,
      completed: false,
      dueDate: 'Today',
      calendarSynced: false,
    }));

    await saveTasks([...existing, ...newTasks]);
    Alert.alert('Routine Activated', `Imported ${newTasks.length} tasks from ${template.name}.`);
    onNavigate('dashboard');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.badgePill}>
          <Text style={styles.badgeText}>BATTLE-TESTED SLATES</Text>
        </View>
        <Text style={styles.title}>HABIT ROUTINE TEMPLATES</Text>
        <Text style={styles.subtitle}>
          One-tap load turnkey discipline routines designed for students and athletes.
        </Text>
      </View>

      {templates.map((tpl) => (
        <View key={tpl.id} style={styles.card}>
          <View style={styles.cardTop}>
            <View style={styles.iconCircle}>
              <Text style={{ fontSize: 24 }}>{tpl.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{tpl.name}</Text>
              <Text style={styles.cardCategory}>{tpl.category.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.desc}>{tpl.description}</Text>

          <View style={styles.taskPreviewBox}>
            <Text style={styles.taskPreviewHeader}>INCLUDES {tpl.tasks.length} MANDATORY DRILLS:</Text>
            {tpl.tasks.map((t, i) => (
              <Text key={i} style={styles.taskBullet}>
                • {t.title} ({t.minutes}m)
              </Text>
            ))}
          </View>

          <TouchableOpacity style={styles.btnApply} onPress={() => handleApplyTemplate(tpl)}>
            <Text style={styles.btnApplyText}>APPLY THIS ROUTINE →</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 16 },
  badgePill: { alignSelf: 'flex-start', backgroundColor: 'rgba(229, 169, 60, 0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginBottom: 6 },
  badgeText: { color: COLORS.accent, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  title: { color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: 0.8 },
  subtitle: { color: COLORS.secondary, fontSize: 12, marginTop: 4, lineHeight: 16 },
  card: { backgroundColor: COLORS.bgCard, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: 'rgba(229, 169, 60, 0.18)', marginBottom: 16 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  iconCircle: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#161811', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(229, 169, 60, 0.25)' },
  cardTitle: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 0.8 },
  cardCategory: { color: COLORS.accent, fontSize: 9, fontWeight: '800', letterSpacing: 1, marginTop: 2 },
  desc: { color: COLORS.textDim, fontSize: 12, lineHeight: 17, marginBottom: 14 },
  taskPreviewBox: { backgroundColor: '#131510', padding: 12, borderRadius: 12, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(229, 169, 60, 0.08)' },
  taskPreviewHeader: { color: COLORS.secondary, fontSize: 9, fontWeight: '800', letterSpacing: 1, marginBottom: 6 },
  taskBullet: { color: '#E2E8F0', fontSize: 11, lineHeight: 18 },
  btnApply: { backgroundColor: COLORS.accent, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnApplyText: { color: COLORS.primaryText, fontSize: 11, fontWeight: '900', letterSpacing: 1 },
});
