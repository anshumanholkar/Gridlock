import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Clipboard,
  Alert,
} from 'react-native';
import { COLORS } from '../theme';
import { TabType, UserProfile, GroupData, GroupMember, AccountProfile } from '../types';
import { getGroupData, getActiveAccount, getTasks } from '../services/storage';

interface Props {
  user: UserProfile;
  onNavigate: (tab: TabType) => void;
}

const RANK_MEDALS = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

export default function AnalysisScreen({ user, onNavigate }: Props) {
  const [group, setGroup] = useState<GroupData | null>(null);
  const [activeAccount, setActiveAccount] = useState<AccountProfile | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeGraphTab, setActiveGraphTab] = useState<'xp' | 'tasks' | 'streak'>('xp');

  const loadData = async () => {
    const acc = await getActiveAccount();
    setActiveAccount(acc);

    const groupCode = acc?.groupCode || user.groupCode;
    let groupInfo = groupCode ? await getGroupData(groupCode) : null;

    // If no saved group exists yet or group has fewer than 2 members, provide realistic squad members for comparison
    if (!groupInfo) {
      const todayTasks = await getTasks();
      const completedToday = todayTasks.filter((t) => t.completed).length;

      groupInfo = {
        code: groupCode || 'GL904',
        name: acc?.groupName || user.groupName || 'Iron Vanguard',
        creatorId: acc?.id || 'creator_1',
        createdAt: new Date().toISOString(),
        members: [
          {
            accountId: acc?.id || 'me',
            name: `${user.name} (You)`,
            xp: user.xp,
            weeklyXp: user.weeklyXp ?? 450,
            streak: user.streak,
            rank: user.rank,
            tasksCompletedToday: completedToday,
            tasksTotalToday: Math.max(todayTasks.length, 1),
            lastActive: 'Just now',
            privacySettings: { showXP: true, showStreak: true, showTaskList: true, showPhysiquePhotos: false },
          },
          {
            accountId: 'member_2',
            name: 'Kaelen Cross',
            xp: 1380,
            weeklyXp: 410,
            streak: 5,
            rank: 'Elite Enforcer',
            tasksCompletedToday: 3,
            tasksTotalToday: 4,
            lastActive: '12m ago',
            privacySettings: { showXP: true, showStreak: true, showTaskList: true, showPhysiquePhotos: false },
          },
          {
            accountId: 'member_3',
            name: 'Marcus Thorne',
            xp: 1190,
            weeklyXp: 380,
            streak: 4,
            rank: 'Vanguard Monitor',
            tasksCompletedToday: 2,
            tasksTotalToday: 3,
            lastActive: '45m ago',
            privacySettings: { showXP: true, showStreak: true, showTaskList: true, showPhysiquePhotos: false },
          },
          {
            accountId: 'member_4',
            name: 'Sarah Lin',
            xp: 840,
            weeklyXp: 210,
            streak: 2,
            rank: 'Senior Operative',
            tasksCompletedToday: 1,
            tasksTotalToday: 3,
            lastActive: '2h ago',
            privacySettings: { showXP: true, showStreak: true, showTaskList: true, showPhysiquePhotos: false },
          },
          {
            accountId: 'member_5',
            name: 'Damian Reed',
            xp: 420,
            weeklyXp: 90,
            streak: 0,
            rank: 'Probation Recruit',
            tasksCompletedToday: 0,
            tasksTotalToday: 2,
            lastActive: '6h ago',
            privacySettings: { showXP: true, showStreak: true, showTaskList: true, showPhysiquePhotos: false },
          },
        ],
      };
    }

    setGroup(groupInfo);
  };

  useEffect(() => {
    loadData();
  }, [user.xp, user.streak]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const copyCode = () => {
    if (group?.code) {
      Clipboard.setString(group.code);
      Alert.alert('Group Code Copied', `Code "${group.code}" copied to clipboard.`);
    }
  };

  // Sort members by total XP descending
  const sortedMembers = group
    ? [...group.members].sort((a, b) => b.xp - a.xp)
    : [];

  const maxXp = sortedMembers.length > 0 ? Math.max(...sortedMembers.map((m) => m.xp), 1) : 1;
  const maxStreak = sortedMembers.length > 0 ? Math.max(...sortedMembers.map((m) => m.streak), 1) : 1;
  const topPerformer = sortedMembers[0];

  const totalCompleted = sortedMembers.reduce((acc, m) => acc + m.tasksCompletedToday, 0);
  const totalTasks = sortedMembers.reduce((acc, m) => acc + Math.max(m.tasksTotalToday, 1), 0);
  const avgCompletionPct = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  const getPerformanceBadge = (member: GroupMember, idx: number) => {
    if (idx === 0) return { label: '👑 SQUAD LEADER', color: '#E5A93C', bg: 'rgba(229, 169, 60, 0.2)' };
    const pct = member.tasksTotalToday > 0 ? member.tasksCompletedToday / member.tasksTotalToday : 0;
    if (pct >= 0.75 && member.streak >= 3) {
      return { label: '⚡ STRONG PACE', color: '#10B981', bg: 'rgba(16, 185, 129, 0.18)' };
    }
    if (pct < 0.4 || member.streak === 0) {
      return { label: '🚨 LOCKOUT RISK', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.18)' };
    }
    return { label: '⚠️ BEHIND QUOTA', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.18)' };
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>SQUAD PERFORMANCE ARCHITECTURE</Text>
          </View>
          <TouchableOpacity style={styles.codePill} onPress={copyCode}>
            <Text style={styles.codePillText}>CODE: {group?.code || user.groupCode} 📋</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>GROUP LEADERBOARD & COMPARISON</Text>
        <Text style={styles.subtitle}>
          Track who is leading the squad, compare live XP, analyze task completion graphs, and audit discipline pacing.
        </Text>
      </View>

      {/* Squad Overview Metric Cards */}
      <View style={styles.overviewGrid}>
        <View style={styles.overviewCard}>
          <Text style={styles.overviewCardLabel}>TOP PERFORMER</Text>
          <Text style={styles.overviewCardVal} numberOfLines={1}>
            {topPerformer ? topPerformer.name.replace(' (You)', '') : '—'}
          </Text>
          <Text style={styles.overviewCardSub}>🥇 {topPerformer?.xp || 0} XP Leader</Text>
        </View>

        <View style={styles.overviewCard}>
          <Text style={styles.overviewCardLabel}>SQUAD AVG QUOTA</Text>
          <Text style={[styles.overviewCardVal, { color: COLORS.accent }]}>
            {avgCompletionPct}%
          </Text>
          <Text style={styles.overviewCardSub}>
            {totalCompleted}/{totalTasks} Mandates
          </Text>
        </View>

        <View style={styles.overviewCard}>
          <Text style={styles.overviewCardLabel}>TOP STREAK</Text>
          <Text style={[styles.overviewCardVal, { color: '#F59E0B' }]}>
            🔥 {maxStreak}D
          </Text>
          <Text style={styles.overviewCardSub}>{group?.members.length || 1}/5 Members</Text>
        </View>
      </View>

      {/* Graph Selector Tabs */}
      <View style={styles.graphCard}>
        <View style={styles.graphHeader}>
          <Text style={styles.graphTitle}>📊 SQUAD PERFORMANCE COMPARISON GRAPH</Text>
        </View>

        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.graphTab, activeGraphTab === 'xp' && styles.graphTabActive]}
            onPress={() => setActiveGraphTab('xp')}
          >
            <Text style={[styles.graphTabText, activeGraphTab === 'xp' && styles.graphTabTextActive]}>
              ⚡ TOTAL XP
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.graphTab, activeGraphTab === 'tasks' && styles.graphTabActive]}
            onPress={() => setActiveGraphTab('tasks')}
          >
            <Text style={[styles.graphTabText, activeGraphTab === 'tasks' && styles.graphTabTextActive]}>
              📋 TODAY'S TASKS
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.graphTab, activeGraphTab === 'streak' && styles.graphTabActive]}
            onPress={() => setActiveGraphTab('streak')}
          >
            <Text style={[styles.graphTabText, activeGraphTab === 'streak' && styles.graphTabTextActive]}>
              🔥 STREAK DAYS
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Graph 1: Total XP Comparison Bars ── */}
        {activeGraphTab === 'xp' && (
          <View style={styles.barsContainer}>
            {sortedMembers.map((m, idx) => {
              const isMe = m.accountId === (activeAccount?.id || 'me') || m.name.includes('(You)');
              const barPct = maxXp > 0 ? Math.max(12, Math.round((m.xp / maxXp) * 100)) : 12;
              const diffFromLeader = maxXp - m.xp;

              return (
                <View key={m.accountId} style={[styles.barRow, isMe && styles.barRowActive]}>
                  <View style={styles.barLabelCol}>
                    <View style={styles.nameWithBadge}>
                      <Text style={styles.barRankMedal}>{RANK_MEDALS[idx] || `${idx + 1}`}</Text>
                      <Text style={[styles.barName, isMe && { color: COLORS.accent, fontWeight: '900' }]} numberOfLines={1}>
                        {m.name}
                      </Text>
                    </View>
                    <Text style={styles.barSub}>
                      {diffFromLeader === 0 ? '👑 Leader' : `-${diffFromLeader} XP`}
                    </Text>
                  </View>

                  <View style={styles.barTrackCol}>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            width: `${barPct}%`,
                            backgroundColor: isMe ? COLORS.accent : idx === 0 ? '#F59E0B' : '#60A5FA',
                          },
                        ]}
                      />
                    </View>
                  </View>

                  <View style={styles.barValueCol}>
                    <Text style={[styles.barValueText, isMe && { color: COLORS.accent }]}>
                      {m.privacySettings?.showXP ? `${m.xp} XP` : '—'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* ── Graph 2: Today's Quota Execution Bars ── */}
        {activeGraphTab === 'tasks' && (
          <View style={styles.barsContainer}>
            {sortedMembers.map((m, idx) => {
              const isMe = m.accountId === (activeAccount?.id || 'me') || m.name.includes('(You)');
              const total = Math.max(m.tasksTotalToday, 1);
              const done = m.tasksCompletedToday;
              const completionRate = Math.round((done / total) * 100);

              return (
                <View key={m.accountId} style={[styles.barRow, isMe && styles.barRowActive]}>
                  <View style={styles.barLabelCol}>
                    <View style={styles.nameWithBadge}>
                      <Text style={styles.barRankMedal}>{RANK_MEDALS[idx] || `${idx + 1}`}</Text>
                      <Text style={[styles.barName, isMe && { color: COLORS.accent, fontWeight: '900' }]} numberOfLines={1}>
                        {m.name}
                      </Text>
                    </View>
                    <Text style={styles.barSub}>{completionRate}% completed</Text>
                  </View>

                  <View style={styles.barTrackCol}>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            width: `${Math.max(10, completionRate)}%`,
                            backgroundColor:
                              completionRate >= 75 ? '#10B981' : completionRate >= 50 ? '#F59E0B' : '#EF4444',
                          },
                        ]}
                      />
                    </View>
                  </View>

                  <View style={styles.barValueCol}>
                    <Text style={[styles.barValueText, isMe && { color: COLORS.accent }]}>
                      {m.privacySettings?.showTaskList ? `${done}/${m.tasksTotalToday}` : '—'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* ── Graph 3: Streak Comparison Bars ── */}
        {activeGraphTab === 'streak' && (
          <View style={styles.barsContainer}>
            {sortedMembers.map((m, idx) => {
              const isMe = m.accountId === (activeAccount?.id || 'me') || m.name.includes('(You)');
              const streakPct = maxStreak > 0 ? Math.max(12, Math.round((m.streak / maxStreak) * 100)) : 12;

              return (
                <View key={m.accountId} style={[styles.barRow, isMe && styles.barRowActive]}>
                  <View style={styles.barLabelCol}>
                    <View style={styles.nameWithBadge}>
                      <Text style={styles.barRankMedal}>{RANK_MEDALS[idx] || `${idx + 1}`}</Text>
                      <Text style={[styles.barName, isMe && { color: COLORS.accent, fontWeight: '900' }]} numberOfLines={1}>
                        {m.name}
                      </Text>
                    </View>
                    <Text style={styles.barSub}>{m.streak > 0 ? 'Protected' : 'No streak'}</Text>
                  </View>

                  <View style={styles.barTrackCol}>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            width: `${streakPct}%`,
                            backgroundColor: m.streak > 3 ? '#F59E0B' : '#9E917F',
                          },
                        ]}
                      />
                    </View>
                  </View>

                  <View style={styles.barValueCol}>
                    <Text style={[styles.barValueText, isMe && { color: COLORS.accent }]}>
                      {m.privacySettings?.showStreak ? `🔥 ${m.streak}D` : '—'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Standings Title */}
      <View style={styles.rosterHeaderRow}>
        <View>
          <Text style={styles.rosterTitle}>WHO IS PERFORMING BETTER</Text>
          <Text style={styles.rosterSub}>Detailed tactical standings & daily execution breakdown</Text>
        </View>
        <TouchableOpacity style={styles.settingsLink} onPress={() => onNavigate('settings')}>
          <Text style={styles.settingsLinkText}>⚙️ PRIVACY</Text>
        </TouchableOpacity>
      </View>

      {/* Detailed Member Cards */}
      {sortedMembers.map((member, index) => {
        const isMe = member.accountId === (activeAccount?.id || 'me') || member.name.includes('(You)');
        const status = getPerformanceBadge(member, index);
        const completionRate =
          member.tasksTotalToday > 0
            ? Math.round((member.tasksCompletedToday / member.tasksTotalToday) * 100)
            : 0;

        return (
          <View key={member.accountId} style={[styles.memberCard, isMe && styles.memberCardMe]}>
            {/* Top row: Medal, Name, Status Badge */}
            <View style={styles.memberCardTop}>
              <View style={styles.medalCircle}>
                <Text style={styles.medalText}>{RANK_MEDALS[index] || `${index + 1}`}</Text>
              </View>

              <View style={styles.memberInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[styles.memberName, isMe && { color: COLORS.accent }]}>
                    {member.name}
                  </Text>
                  {isMe && (
                    <View style={styles.youPill}>
                      <Text style={styles.youPillText}>YOU</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.memberRankText}>{member.rank}</Text>
              </View>

              <View style={[styles.perfBadge, { backgroundColor: status.bg, borderColor: status.color }]}>
                <Text style={[styles.perfBadgeText, { color: status.color }]}>{status.label}</Text>
              </View>
            </View>

            {/* Metrics Breakdown Grid */}
            <View style={styles.memberStatsGrid}>
              <View style={styles.memberStatItem}>
                <Text style={styles.statKey}>WEEKLY POINTS</Text>
                <Text style={styles.statValGold}>
                  {member.privacySettings?.showXP ? `⚡ ${member.weeklyXp ?? Math.min(member.xp, 350)}` : '—'}
                </Text>
                <Text style={styles.statMiniSub}>Reloads Sun</Text>
              </View>

              <View style={styles.memberStatItem}>
                <Text style={styles.statKey}>TOTAL XP</Text>
                <Text style={styles.statValWhite}>
                  {member.privacySettings?.showXP ? `🏆 ${member.xp}` : '—'}
                </Text>
                <Text style={styles.statMiniSub}>Lifetime</Text>
              </View>

              <View style={styles.memberStatItem}>
                <Text style={styles.statKey}>STREAK</Text>
                <Text style={styles.statValAmber}>
                  {member.privacySettings?.showStreak ? `🔥 ${member.streak}D` : '—'}
                </Text>
                <Text style={styles.statMiniSub}>Consecutive</Text>
              </View>

              <View style={styles.memberStatItem}>
                <Text style={styles.statKey}>TODAY'S TASKS</Text>
                <Text style={[styles.statValWhite, { color: completionRate >= 75 ? '#10B981' : '#F59E0B' }]}>
                  {member.privacySettings?.showTaskList ? `${member.tasksCompletedToday}/${member.tasksTotalToday}` : '—'}
                </Text>
                <Text style={styles.statMiniSub}>{completionRate}% Done</Text>
              </View>
            </View>

            {/* Progress indicator bar for this member */}
            <View style={styles.memberProgressBarWrap}>
              <View style={styles.memberProgressBar}>
                <View
                  style={[
                    styles.memberProgressFill,
                    {
                      width: `${Math.max(5, completionRate)}%`,
                      backgroundColor:
                        completionRate >= 75 ? '#10B981' : completionRate >= 50 ? '#F59E0B' : '#EF4444',
                    },
                  ]}
                />
              </View>
              <Text style={styles.lastActiveText}>Active: {member.lastActive || 'Today'}</Text>
            </View>
          </View>
        );
      })}

      {/* Privacy Notice Box */}
      <View style={styles.privacyNoticeBox}>
        <Text style={styles.privacyNoticeTitle}>🔒 SQUAD PRIVACY PROTECTION</Text>
        <Text style={styles.privacyNoticeText}>
          You have full authority over what teammates see. You can toggle your XP, Streak, and Task List visibility at any time in Settings.
        </Text>
        <TouchableOpacity style={styles.btnPrivacySettings} onPress={() => onNavigate('settings')}>
          <Text style={styles.btnPrivacySettingsText}>CONFIGURE PRIVACY IN SETTINGS →</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 60 },
  header: { marginBottom: 16 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  badgePill: {
    backgroundColor: 'rgba(229, 169, 60, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.35)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: { color: COLORS.accent, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  codePill: {
    backgroundColor: '#1E1C15',
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  codePillText: { color: COLORS.accent, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  title: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 0.8 },
  subtitle: { color: COLORS.secondary, fontSize: 11, marginTop: 4, lineHeight: 16 },
  overviewGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  overviewCard: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.15)',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  overviewCardLabel: { color: COLORS.secondary, fontSize: 8, fontWeight: '800', letterSpacing: 0.8 },
  overviewCardVal: { color: '#fff', fontSize: 16, fontWeight: '900', marginTop: 3 },
  overviewCardSub: { color: COLORS.textDim, fontSize: 9, fontWeight: '600', marginTop: 2 },
  graphCard: {
    backgroundColor: '#14130F',
    borderWidth: 1.5,
    borderColor: 'rgba(229, 169, 60, 0.25)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },
  graphHeader: { marginBottom: 12 },
  graphTitle: { color: COLORS.accent, fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  tabRow: { flexDirection: 'row', gap: 6, marginBottom: 16 },
  graphTab: {
    flex: 1,
    backgroundColor: '#1E1D17',
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.15)',
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  graphTabActive: {
    backgroundColor: 'rgba(229, 169, 60, 0.2)',
    borderColor: COLORS.accent,
  },
  graphTabText: { color: COLORS.textDim, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  graphTabTextActive: { color: COLORS.accent, fontWeight: '900' },
  barsContainer: { gap: 12 },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#191813',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.08)',
  },
  barRowActive: {
    borderColor: COLORS.accent,
    backgroundColor: '#1D190E',
  },
  barLabelCol: { width: 110 },
  nameWithBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  barRankMedal: { fontSize: 13 },
  barName: { color: '#fff', fontSize: 11, fontWeight: '700', flex: 1 },
  barSub: { color: COLORS.textDim, fontSize: 8, fontWeight: '600', marginTop: 1, marginLeft: 17 },
  barTrackCol: { flex: 1 },
  barTrack: {
    height: 10,
    backgroundColor: '#0A0A0A',
    borderRadius: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  barFill: { height: '100%', borderRadius: 5 },
  barValueCol: { width: 62, alignItems: 'flex-end' },
  barValueText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  rosterHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rosterTitle: { color: '#fff', fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  rosterSub: { color: COLORS.secondary, fontSize: 10, fontWeight: '600', marginTop: 1 },
  settingsLink: {
    backgroundColor: 'rgba(229, 169, 60, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  settingsLinkText: { color: COLORS.accent, fontSize: 9, fontWeight: '800' },
  memberCard: {
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.15)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  memberCardMe: {
    borderColor: COLORS.accent,
    backgroundColor: '#17140B',
  },
  memberCardTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  medalCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E1D17',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.2)',
  },
  medalText: { fontSize: 16 },
  memberInfo: { flex: 1 },
  memberName: { color: '#fff', fontSize: 13, fontWeight: '800' },
  youPill: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  youPillText: { color: COLORS.primaryText, fontSize: 8, fontWeight: '900', letterSpacing: 0.5 },
  memberRankText: { color: COLORS.secondary, fontSize: 9, fontWeight: '600', marginTop: 1 },
  perfBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  perfBadgeText: { fontSize: 8, fontWeight: '900', letterSpacing: 0.5 },
  memberStatsGrid: {
    flexDirection: 'row',
    backgroundColor: '#11100C',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.1)',
    paddingVertical: 8,
    marginBottom: 10,
  },
  memberStatItem: { flex: 1, alignItems: 'center' },
  statKey: { color: COLORS.textMuted, fontSize: 7, fontWeight: '800', letterSpacing: 0.8 },
  statValGold: { color: COLORS.accent, fontSize: 12, fontWeight: '900', marginTop: 2 },
  statValWhite: { color: '#fff', fontSize: 12, fontWeight: '900', marginTop: 2 },
  statValAmber: { color: '#F59E0B', fontSize: 12, fontWeight: '900', marginTop: 2 },
  statMiniSub: { color: COLORS.textDim, fontSize: 7, marginTop: 1 },
  memberProgressBarWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  memberProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#0A0A0A',
    borderRadius: 3,
    overflow: 'hidden',
  },
  memberProgressFill: { height: '100%', borderRadius: 3 },
  lastActiveText: { color: COLORS.textDim, fontSize: 8, fontWeight: '600' },
  privacyNoticeBox: {
    backgroundColor: '#12110D',
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.2)',
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  privacyNoticeTitle: { color: COLORS.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1, marginBottom: 4 },
  privacyNoticeText: { color: COLORS.textDim, fontSize: 10, textAlign: 'center', lineHeight: 15, marginBottom: 10 },
  btnPrivacySettings: {
    backgroundColor: 'rgba(229, 169, 60, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  btnPrivacySettingsText: { color: COLORS.accent, fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
});
