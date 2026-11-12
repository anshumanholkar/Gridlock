import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../theme';
import { UserProfile } from '../types';

interface Props {
  user: UserProfile;
}

export default function LeaderboardScreen({ user }: Props) {
  const members = [
    { rank: 1, name: 'Alex Vance (You)', xp: user.xp, streak: user.streak, status: 'Compliant', multiplier: user.penaltyMultiplier, monitor: true },
    { rank: 2, name: 'Kaelen Cross', xp: 1380, streak: 5, status: 'Compliant', multiplier: 1.0, monitor: false },
    { rank: 3, name: 'Marcus Thorne', xp: 1190, streak: 4, status: 'Compliant', multiplier: 1.0, monitor: false },
    { rank: 4, name: 'Sarah Lin', xp: 840, streak: 1, status: 'Warning · -25% Quota', multiplier: 1.25, monitor: false },
    { rank: 5, name: 'Damian Reed', xp: 420, streak: 0, status: 'CRITICAL · PROBATION', multiplier: 1.5, monitor: false },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.badgePill}>
          <Text style={styles.badgeText}>SUBGROUP STANDINGS</Text>
        </View>
        <Text style={styles.title}>ROSTER & XP RANKING</Text>
        <Text style={styles.subtitle}>
          Rankings driven by consistency, not talent. Slackers receive escalating multipliers.
        </Text>
      </View>

      {/* Rules Banner */}
      <View style={styles.rulesCard}>
        <Text style={styles.rulesTitle}>THE GRIDLOCK PENALTY CLAUSE</Text>
        <Text style={styles.rulesText}>
          • <Text style={{ color: COLORS.accent }}>Low Output:</Text> +25% Quota added to next session.{'\n'}
          • <Text style={{ color: COLORS.crimson }}>2 Consecutive Misses:</Text> -150 XP and demotion to Probation.{'\n'}
          • <Text style={{ color: '#fff' }}>Weekly Peak:</Text> Awarded Subgroup Monitor position.
        </Text>
      </View>

      {/* Roster List */}
      <View style={styles.rosterCard}>
        {members.map((m, i) => {
          const isYou = m.name.includes('(You)');
          const isTop = m.rank === 1;

          return (
            <View key={i} style={[styles.memberRow, isYou && styles.memberRowYou, isTop && styles.memberRowTop]}>
              <View style={[styles.rankBox, isTop && { backgroundColor: COLORS.accent }]}>
                <Text style={[styles.rankText, isTop && { color: COLORS.primaryText }]}>{m.rank}</Text>
              </View>

              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[styles.memberName, isYou && { color: COLORS.accent }]}>{m.name}</Text>
                  {m.monitor && (
                    <View style={styles.monitorPill}>
                      <Text style={styles.monitorBadge}>MONITOR</Text>
                    </View>
                  )}
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.memberMeta}>{m.streak}d streak</Text>
                  <Text style={styles.memberMeta}>·</Text>
                  <Text style={styles.memberMeta}>{m.xp.toLocaleString()} XP</Text>
                  <Text style={styles.memberMeta}>·</Text>
                  <Text style={[styles.memberMeta, m.multiplier > 1.0 && { color: COLORS.accent }]}>
                    {m.multiplier}x Quota
                  </Text>
                </View>

                <Text style={[styles.statusText, m.status.includes('CRITICAL') ? { color: COLORS.crimson } : m.status.includes('Warning') ? { color: COLORS.secondary } : { color: COLORS.accent }]}>
                  {m.status}
                </Text>
              </View>
            </View>
          );
        })}
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
  title: { color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: 0.8 },
  subtitle: { color: COLORS.textDim, fontSize: 12, marginTop: 4, lineHeight: 16 },
  rulesCard: {
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.25)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  rulesTitle: { color: COLORS.accent, fontSize: 11, fontWeight: '900', letterSpacing: 1, marginBottom: 6 },
  rulesText: { color: COLORS.textDim, fontSize: 11, lineHeight: 18 },
  rosterCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.12)',
    padding: 14,
    gap: 10,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: COLORS.bgInput,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.1)',
  },
  memberRowYou: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(229, 169, 60, 0.08)',
  },
  memberRowTop: {
    borderColor: COLORS.accent,
  },
  rankBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#1E2018',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: { color: COLORS.secondary, fontSize: 13, fontWeight: '900' },
  memberName: { color: '#fff', fontSize: 13, fontWeight: '800' },
  monitorPill: {
    backgroundColor: 'rgba(229, 169, 60, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  monitorBadge: {
    color: COLORS.accent,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  metaRow: { flexDirection: 'row', gap: 6, marginVertical: 3 },
  memberMeta: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600' },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
});
