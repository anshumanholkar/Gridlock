import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { COLORS } from '../theme';
import { TabType, UserProfile } from '../types';

interface Props {
  user: UserProfile;
  onNavigate: (tab: TabType) => void;
  onResetCompleted: () => void;
}

export default function SundayResetScreen({ user, onNavigate, onResetCompleted }: Props) {
  const [checklist, setChecklist] = useState([
    { id: '1', title: 'Weekly Physique Scan Uploaded (Front + Legs)', completed: false, tab: 'physique' as TabType },
    { id: '2', title: 'Week\'s Missed Topics Reviewed & Retested', completed: false, tab: 'playground' as TabType },
    { id: '3', title: 'Upcoming 7-Day Curriculum & Quotas Locked', completed: false, tab: 'goals' as TabType },
    { id: '4', title: 'Subgroup Weekly Meeting Attendance Confirmed', completed: false },
    { id: '5', title: 'Clean Workspace & Device Distraction Audit', completed: false },
  ]);

  const toggleCheck = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const allCompleted = checklist.every((c) => c.completed);

  const handleFinishReset = () => {
    if (!allCompleted) {
      Alert.alert('Incomplete Reset', 'You must execute all 5 Sunday Reset protocols before locking in your next week.');
      return;
    }
    Alert.alert('Protocol Complete', 'Sunday Reset executed. Your quota penalty is wiped clean and next week\'s multiplier is set to 1.0x.');
    onResetCompleted();
    onNavigate('dashboard');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.badgePill}>
          <Text style={styles.badgeText}>SUNDAY SYSTEM RESET</Text>
        </View>
        <Text style={styles.title}>ZERO-BASE AUDIT</Text>
        <Text style={styles.subtitle}>
          Every Sunday before 23:59: Complete these 5 rituals to clear penalties and claim the weekly Monitor role.
        </Text>
      </View>

      {/* Progress Status */}
      <View style={styles.progressCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.progressTitle}>RESET PROGRESS</Text>
          <Text style={styles.progressPct}>
            {checklist.filter((c) => c.completed).length} / {checklist.length}
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${(checklist.filter((c) => c.completed).length / checklist.length) * 100}%` },
            ]}
          />
        </View>
      </View>

      {/* Checklist */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>MANDATORY SUNDAY PROTOCOLS</Text>
        {checklist.map((item) => (
          <View key={item.id} style={styles.checkRow}>
            <TouchableOpacity
              style={[styles.checkbox, item.completed && styles.checkboxActive]}
              onPress={() => toggleCheck(item.id)}
            >
              {item.completed && <Text style={styles.checkMark}>✓</Text>}
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={[styles.checkTitle, item.completed && styles.checkTitleDone]}>
                {item.title}
              </Text>
              {item.tab && !item.completed && (
                <TouchableOpacity onPress={() => onNavigate(item.tab)}>
                  <Text style={styles.quickLink}>Launch Protocol Screen →</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.btnLock, !allCompleted && styles.btnDisabled]}
        onPress={handleFinishReset}
      >
        <Text style={styles.btnLockText}>LOCK IN NEXT WEEK'S SLATE</Text>
      </TouchableOpacity>
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
  subtitle: { color: COLORS.secondary, fontSize: 12, marginTop: 4, lineHeight: 17 },
  progressCard: { backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(229, 169, 60, 0.15)', marginBottom: 16 },
  progressTitle: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  progressPct: { color: COLORS.accent, fontSize: 13, fontWeight: '900' },
  progressBar: { height: 6, backgroundColor: '#10110D', borderRadius: 3, marginTop: 10, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: COLORS.accent, borderRadius: 3 },
  card: { backgroundColor: COLORS.bgCard, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(229, 169, 60, 0.15)', padding: 16, marginBottom: 20 },
  cardHeader: { color: COLORS.secondary, fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 14 },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: COLORS.secondary, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  checkboxActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  checkMark: { color: COLORS.primaryText, fontSize: 12, fontWeight: '900' },
  checkTitle: { color: '#fff', fontSize: 13, fontWeight: '600', lineHeight: 18 },
  checkTitleDone: { color: COLORS.textMuted, textDecorationLine: 'line-through' },
  quickLink: { color: COLORS.accent, fontSize: 11, fontWeight: '800', marginTop: 3 },
  btnLock: { backgroundColor: COLORS.accent, borderRadius: 14, padding: 16, alignItems: 'center' },
  btnDisabled: { opacity: 0.4 },
  btnLockText: { color: COLORS.primaryText, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
});
