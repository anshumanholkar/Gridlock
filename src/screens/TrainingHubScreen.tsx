import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { COLORS } from '../theme';
import { TabType } from '../types';

interface Props {
  onNavigate: (tab: TabType) => void;
}

export default function TrainingHubScreen({ onNavigate }: Props) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };
  const trainingProtocols = [
    {
      id: 'study',
      tab: 'study' as TabType,
      title: 'PROCTOR STUDY TIMER & NOTE SCAN',
      icon: '⏱️',
      badge: 'LIVE CAMERA PRESENCE',
      desc: 'Anti-cheat front-camera face presence tracking with automatic timer pause and handwritten notes photo scan.',
      cta: 'START PROCTOR SESSION →',
    },
    {
      id: 'playground',
      tab: 'playground' as TabType,
      title: 'PLAYGROUND QUIZ (MEMORY RECALL & 20Q)',
      icon: '🎯',
      badge: '4 GAME MODES',
      desc: 'Memory Recall with Revision Sheet & up to 20 Questions, 60s Rapid Blitz, Sudden Death 3-lives, and Flashcards.',
      cta: 'ENTER QUIZ PLAYGROUND →',
    },
    {
      id: 'focus_mode',
      tab: 'focus_mode' as TabType,
      title: 'FOCUS MODE POMODORO LOCKOUT',
      icon: '🔒',
      badge: 'ZERO DISTRACTIONS',
      desc: 'Distraction-free Pomodoro lockout timer shutting down app navigation with non-negotiable discipline quotes.',
      cta: 'LOCK IN FOCUS MODE →',
    },
    {
      id: 'sunday_reset',
      tab: 'sunday_reset' as TabType,
      title: 'SUNDAY RESET PROTOCOL',
      icon: '🔄',
      badge: 'WEEKLY 5-STEP AUDIT',
      desc: 'Wipes your quota penalty multiplier clean to 1.0x upon completing the 5 mandatory weekly checklist steps.',
      cta: 'EXECUTE SUNDAY RESET →',
    },
    {
      id: 'templates',
      tab: 'templates' as TabType,
      title: 'HABIT ROUTINE TEMPLATES',
      icon: '📋',
      badge: 'TURNKEY SLATES',
      desc: 'One-tap load battle-tested daily routines: Exam Warrior Protocol, Athletic Body Composition, and The Monk Mode Slate.',
      cta: 'IMPORT ROUTINES →',
    },
  ];

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
          <Text style={styles.badgeText}>EXECUTION BARRACKS</Text>
        </View>
        <Text style={styles.title}>TRAINING & PROTOCOLS</Text>
        <Text style={styles.subtitle}>
          Camera study presence, 20-question retention quizzes, Pomodoro focus mode, and turnkey habit slates.
        </Text>
      </View>

      {trainingProtocols.map((p) => (
        <TouchableOpacity
          key={p.id}
          style={styles.card}
          onPress={() => onNavigate(p.tab)}
          activeOpacity={0.8}
        >
          <View style={styles.cardTop}>
            <View style={styles.iconCircle}>
              <Text style={{ fontSize: 24 }}>{p.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.badgeRow}>
                <View style={styles.itemBadge}>
                  <Text style={styles.itemBadgeText}>{p.badge}</Text>
                </View>
              </View>
              <Text style={styles.cardTitle}>{p.title}</Text>
            </View>
          </View>

          <Text style={styles.cardDesc}>{p.desc}</Text>

          <View style={styles.cardFooter}>
            <Text style={styles.cardCta}>{p.cta}</Text>
            <View style={styles.arrowCircle}>
              <Text style={styles.arrowText}>↗</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
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
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.18)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#191814',
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeRow: { flexDirection: 'row', marginBottom: 3 },
  itemBadge: {
    backgroundColor: 'rgba(229, 169, 60, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  itemBadgeText: { color: COLORS.accent, fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  cardTitle: { color: '#fff', fontSize: 13, fontWeight: '900', letterSpacing: 0.6 },
  cardDesc: { color: COLORS.textDim, fontSize: 11, lineHeight: 16, marginBottom: 14 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.1)',
  },
  cardCta: { color: COLORS.accent, fontSize: 11, fontWeight: '900', letterSpacing: 0.8 },
  arrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(229, 169, 60, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: { color: COLORS.accent, fontSize: 14, fontWeight: '900' },
});
