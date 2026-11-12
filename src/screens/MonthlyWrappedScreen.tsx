import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme';
import { TabType, UserProfile } from '../types';

interface Props {
  user: UserProfile;
  onNavigate: (tab: TabType) => void;
}

export default function MonthlyWrappedScreen({ user, onNavigate }: Props) {
  // Synthesized monthly metrics
  const wrappedData = {
    month: 'OCTOBER 2026',
    totalStudyHours: 58.5,
    quizzesCompleted: 42,
    averageRecallScore: 88,
    longestStreak: 21,
    physiqueCheckins: 4,
    xpEarned: user.xp || 3450,
    cohortRankTitle: 'TOP 4% VANGUARD ENFORCER',
    mostStudiedTopic: 'Operating Systems & Distributed Architecture',
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.badgePill}>
          <Text style={styles.badgeText}>ANNUAL ARCHIVE</Text>
        </View>
        <Text style={styles.title}>GRIDLOCK WRAPPED: {wrappedData.month}</Text>
        <Text style={styles.subtitle}>
          Visual summary of your monthly output, anti-cheat study sessions, and physical audits.
        </Text>
      </View>

      {/* Hero Badge Banner */}
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>MONTHLY CLASSIFICATION</Text>
        <Text style={styles.heroRank}>{wrappedData.cohortRankTitle}</Text>
        <Text style={styles.heroSub}>Zero missed cutoffs · 100% verified camera presence</Text>
      </View>

      {/* Grid of Key Performance Indicators */}
      <View style={styles.gridRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricIcon}>⏱</Text>
          <Text style={styles.metricNum}>{wrappedData.totalStudyHours}h</Text>
          <Text style={styles.metricTitle}>VERIFIED DEEP WORK</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricIcon}>🎯</Text>
          <Text style={styles.metricNum}>{wrappedData.averageRecallScore}%</Text>
          <Text style={styles.metricTitle}>RECALL ACCURACY</Text>
        </View>
      </View>

      <View style={styles.gridRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricIcon}>🔥</Text>
          <Text style={styles.metricNum}>{wrappedData.longestStreak} DAYS</Text>
          <Text style={styles.metricTitle}>LONGEST STREAK</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricIcon}>⚡</Text>
          <Text style={styles.metricNum}>+{wrappedData.xpEarned}</Text>
          <Text style={styles.metricTitle}>TOTAL XP EARNED</Text>
        </View>
      </View>

      {/* Highlight Box */}
      <View style={styles.highlightCard}>
        <Text style={styles.highlightHeader}>PRIMARY TECHNICAL VECTOR</Text>
        <Text style={styles.highlightTopic}>{wrappedData.mostStudiedTopic}</Text>
        <Text style={styles.highlightDesc}>
          Across 42 sessions, you answered 126 Gemini Playground quiz questions with an 88% first-pass retention rate.
        </Text>
      </View>

      <TouchableOpacity style={styles.btnAction} onPress={() => onNavigate('dashboard')}>
        <Text style={styles.btnActionText}>RETURN TO DASHBOARD</Text>
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
  subtitle: { color: COLORS.secondary, fontSize: 12, marginTop: 4, lineHeight: 16 },
  heroCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  heroLabel: { color: COLORS.secondary, fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  heroRank: { color: COLORS.accent, fontSize: 18, fontWeight: '900', letterSpacing: 1, marginVertical: 6, textAlign: 'center' },
  heroSub: { color: '#fff', fontSize: 11, fontWeight: '600' },
  gridRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.15)',
    padding: 16,
    alignItems: 'center',
  },
  metricIcon: { fontSize: 22, marginBottom: 4 },
  metricNum: { color: '#fff', fontSize: 22, fontWeight: '900', marginVertical: 4 },
  metricTitle: { color: COLORS.secondary, fontSize: 9, fontWeight: '800', letterSpacing: 1, textAlign: 'center' },
  highlightCard: {
    backgroundColor: '#161811',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.2)',
    padding: 18,
    marginVertical: 10,
  },
  highlightHeader: { color: COLORS.accent, fontSize: 9, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  highlightTopic: { color: '#fff', fontSize: 15, fontWeight: '900', marginBottom: 6 },
  highlightDesc: { color: COLORS.textDim, fontSize: 11, lineHeight: 16 },
  btnAction: { backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 14 },
  btnActionText: { color: COLORS.primaryText, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
});
