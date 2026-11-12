import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../theme';
import { GroupData, GroupMember, AccountProfile } from '../types';
import { getGroupData, getActiveAccount } from '../services/storage';

interface Props {
  onBack: () => void;
}

const RANK_ICONS = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

function CompareBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <View style={barStyles.track}>
      <View style={[barStyles.fill, { width: `${pct}%`, backgroundColor: color }]} />
    </View>
  );
}

const barStyles = StyleSheet.create({
  track: { height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden', flex: 1 },
  fill: { height: '100%', borderRadius: 3 },
});

export default function GroupLeaderboardScreen({ onBack }: Props) {
  const [group, setGroup] = useState<GroupData | null>(null);
  const [activeAccount, setActiveAccount] = useState<AccountProfile | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const acc = await getActiveAccount();
    setActiveAccount(acc);
    if (acc?.groupCode) {
      const g = await getGroupData(acc.groupCode);
      setGroup(g);
    }
  };

  useEffect(() => { load(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const sorted = group
    ? [...group.members].sort((a, b) => b.xp - a.xp)
    : [];

  const maxXp = sorted.length > 0 ? Math.max(...sorted.map((m) => m.xp), 1) : 1;
  const maxStreak = sorted.length > 0 ? Math.max(...sorted.map((m) => m.streak), 1) : 1;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← BACK</Text>
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.title}>GROUP LEADERBOARD</Text>
          {group && <Text style={styles.groupName}>{group.name} · {group.code}</Text>}
        </View>
        <View style={{ width: 60 }} />
      </View>

      {!group ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🤝</Text>
          <Text style={styles.emptyTitle}>NO GROUP JOINED</Text>
          <Text style={styles.emptySub}>Create or join a group during account setup to see group standings here.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
          showsVerticalScrollIndicator={false}
        >
          {/* Summary */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryVal}>{group.members.length}</Text>
              <Text style={styles.summaryLabel}>MEMBERS</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryVal}>{Math.max(...group.members.map(m => m.streak))}</Text>
              <Text style={styles.summaryLabel}>TOP STREAK</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryVal}>{Math.max(...group.members.map(m => m.xp))}</Text>
              <Text style={styles.summaryLabel}>TOP XP</Text>
            </View>
          </View>

          {sorted.map((member, index) => {
            const isMe = member.accountId === activeAccount?.id;
            const tasksCompletionPct =
              member.tasksTotalToday > 0
                ? Math.round((member.tasksCompletedToday / member.tasksTotalToday) * 100)
                : 0;

            return (
              <View key={member.accountId} style={[styles.card, isMe && styles.cardMe]}>
                {/* Rank + name */}
                <View style={styles.cardTop}>
                  <Text style={styles.rankIcon}>{RANK_ICONS[index] || `${index + 1}`}</Text>
                  <View style={styles.nameWrap}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[styles.memberName, isMe && { color: COLORS.accent }]}>
                        {member.name}
                      </Text>
                      {isMe && <Text style={styles.youBadge}>YOU</Text>}
                    </View>
                    <Text style={styles.rankLabel}>{member.rank}</Text>
                  </View>
                  <View style={styles.xpWrap}>
                    {member.privacySettings.showXP ? (
                      <Text style={styles.xpVal}>{member.xp} XP</Text>
                    ) : (
                      <Text style={styles.hiddenVal}>—</Text>
                    )}
                  </View>
                </View>

                {/* Streak */}
                <View style={styles.statLine}>
                  <Text style={styles.statKey}>STREAK</Text>
                  <View style={{ flex: 1, paddingHorizontal: 10 }}>
                    {member.privacySettings.showStreak ? (
                      <CompareBar value={member.streak} max={maxStreak} color="#E5A93C" />
                    ) : (
                      <View style={barStyles.track} />
                    )}
                  </View>
                  <Text style={styles.statVal}>
                    {member.privacySettings.showStreak ? `🔥 ${member.streak}d` : '—'}
                  </Text>
                </View>

                {/* XP bar */}
                <View style={styles.statLine}>
                  <Text style={styles.statKey}>XP</Text>
                  <View style={{ flex: 1, paddingHorizontal: 10 }}>
                    <CompareBar
                      value={member.privacySettings.showXP ? member.xp : 0}
                      max={maxXp}
                      color="#3B82F6"
                    />
                  </View>
                  <Text style={styles.statVal}>
                    {member.privacySettings.showXP ? `⚡ ${member.xp}` : '—'}
                  </Text>
                </View>

                {/* Tasks */}
                <View style={styles.statLine}>
                  <Text style={styles.statKey}>TODAY</Text>
                  <View style={{ flex: 1, paddingHorizontal: 10 }}>
                    <CompareBar
                      value={member.privacySettings.showTaskList ? member.tasksCompletedToday : 0}
                      max={member.privacySettings.showTaskList ? Math.max(member.tasksTotalToday, 1) : 1}
                      color="#10B981"
                    />
                  </View>
                  <Text style={styles.statVal}>
                    {member.privacySettings.showTaskList
                      ? `${member.tasksCompletedToday}/${member.tasksTotalToday}`
                      : '—'}
                  </Text>
                </View>
              </View>
            );
          })}

          <Text style={styles.footNote}>
            🔒 Some stats may be hidden by privacy settings.{'\n'}
            Update your privacy in Config → Account Settings.
          </Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: 'rgba(229,169,60,0.15)',
    backgroundColor: '#0F0E0C',
  },
  backBtn: {
    backgroundColor: 'rgba(229,169,60,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(229,169,60,0.3)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    width: 70,
  },
  backBtnText: { color: COLORS.accent, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  headerTitle: { alignItems: 'center', flex: 1 },
  title: { color: '#fff', fontSize: 13, fontWeight: '900', letterSpacing: 2 },
  groupName: { color: COLORS.secondary, fontSize: 10, fontWeight: '600', marginTop: 2 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 2 },
  emptySub: { color: COLORS.secondary, fontSize: 13, fontWeight: '600', textAlign: 'center', lineHeight: 20 },
  list: { padding: 16, gap: 12, paddingBottom: 40 },
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: '#111009',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(229,169,60,0.2)',
    marginBottom: 4,
  },
  summaryItem: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  summaryVal: { color: COLORS.accent, fontSize: 22, fontWeight: '900' },
  summaryLabel: { color: COLORS.textMuted, fontSize: 9, fontWeight: '800', letterSpacing: 1.5, marginTop: 2 },
  card: {
    backgroundColor: '#111009',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(229,169,60,0.15)',
    padding: 14,
    gap: 10,
  },
  cardMe: {
    borderColor: COLORS.accent,
    backgroundColor: '#141008',
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rankIcon: { fontSize: 24, width: 32, textAlign: 'center' },
  nameWrap: { flex: 1 },
  memberName: { color: '#fff', fontSize: 15, fontWeight: '800' },
  rankLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600', marginTop: 1 },
  youBadge: {
    backgroundColor: COLORS.accent,
    color: '#000',
    fontSize: 7,
    fontWeight: '900',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    letterSpacing: 0.5,
  },
  xpWrap: { alignItems: 'flex-end' },
  xpVal: { color: COLORS.accent, fontSize: 14, fontWeight: '900' },
  hiddenVal: { color: COLORS.textMuted, fontSize: 14, fontWeight: '900' },
  statLine: { flexDirection: 'row', alignItems: 'center' },
  statKey: { color: COLORS.textMuted, fontSize: 9, fontWeight: '800', letterSpacing: 1, width: 44 },
  statVal: { color: COLORS.secondary, fontSize: 10, fontWeight: '700', width: 50, textAlign: 'right' },
  footNote: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
    paddingTop: 8,
  },
});
