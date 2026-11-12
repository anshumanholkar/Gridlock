import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { getAppTheme } from '../theme';
import { UserProfile, TabType, TaskItem } from '../types';
import { getTasks, saveTasks, saveUser, getUser } from '../services/storage';
import TopCoachWidget from '../components/TopCoachWidget';
import ProofSubmissionModal from '../components/ProofSubmissionModal';
import QuickAddModal from '../components/QuickAddModal';

interface Props {
  user: UserProfile;
  onNavigate: (tab: TabType) => void;
  onUserUpdated?: (user: UserProfile) => void;
}

export default function DashboardScreen({ user, onNavigate, onUserUpdated }: Props) {
  const theme = getAppTheme(user.theme);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [filterTab, setFilterTab] = useState<'all' | 'completed' | 'pending'>('all');
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [activeProofTask, setActiveProofTask] = useState<TaskItem | null>(null);
  const [proofModalVisible, setProofModalVisible] = useState(false);
  const [quickAddVisible, setQuickAddVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    const [freshTasks, freshUser] = await Promise.all([getTasks(), getUser()]);
    setTasks(freshTasks);
    if (onUserUpdated) onUserUpdated(freshUser);
    setRefreshing(false);
  };

  useEffect(() => {
    getTasks().then(setTasks);

    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(23, 59, 59, 999);
      const diff = Math.max(0, midnight.getTime() - now.getTime());

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const format2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const hoursFraction = timeLeft.hours + timeLeft.minutes / 60;

  const handleOpenProofModal = (task: TaskItem) => {
    setActiveProofTask(task);
    setProofModalVisible(true);
  };

  const handleProofConfirmed = async (updatedTask: TaskItem) => {
    const wasAlreadyCompleted = tasks.find((t) => t.id === updatedTask.id)?.completed;
    const updatedList = tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
    setTasks(updatedList);
    await saveTasks(updatedList);

    if (!wasAlreadyCompleted && updatedTask.completed) {
      const earnedXp = 100;
      const updatedUser: UserProfile = {
        ...user,
        xp: user.xp + earnedXp,
        weeklyXp: (user.weeklyXp ?? 0) + earnedXp,
      };
      await saveUser(updatedUser);
      onUserUpdated?.(updatedUser);
    }
  };

  const handleTaskCreated = async (newTask: TaskItem) => {
    const updated = [newTask, ...tasks];
    setTasks(updated);
    await saveTasks(updated);
  };

  // Filtered task lists
  const completedTasks = tasks.filter((t) => t.completed);
  const pendingTasks = tasks.filter((t) => !t.completed);

  const displayedTasks =
    filterTab === 'all'
      ? tasks
      : filterTab === 'completed'
      ? completedTasks
      : pendingTasks;

  const completedPct = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  // "Today's Top 3" from Mockup: picks high priority or pending tasks
  const top3Tasks = tasks
    .slice()
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (a.priority === 'High' && b.priority !== 'High') return -1;
      if (b.priority === 'High' && a.priority !== 'High') return 1;
      return 0;
    })
    .slice(0, 3);

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.accent}
            colors={[theme.accent]}
          />
        }
      >
        {/* Top Assistant Coach Vance Widget */}
        <TopCoachWidget
          user={user}
          tasks={tasks}
          timeLeftHours={hoursFraction}
          onNavigate={onNavigate}
        />

        {/* 1. HERO GREETING & PROGRESS CARD (Matching Mockup Screen 1) */}
        <View
          style={[
            styles.progressCard,
            {
              backgroundColor: theme.bgCard,
              borderColor: `${theme.accent}30`,
            },
          ]}
        >
          {/* Header Row: Good Morning + Countdown Lockout */}
          <View style={styles.progressTopRow}>
            <View>
              <Text style={[styles.greetingSmall, { color: theme.secondary }]}>Good morning,</Text>
              <Text style={styles.greetingTitle}>{user.name}.</Text>
              <Text style={[styles.greetingSub, { color: theme.secondary }]}>
                Stay focused. You've got this.
              </Text>
            </View>

            <View
              style={[
                styles.cutoffPill,
                {
                  backgroundColor: theme.accentTint,
                  borderColor: `${theme.accent}50`,
                },
              ]}
            >
              <View style={[styles.liveDot, { backgroundColor: theme.accent }]} />
              <Text style={[styles.cutoffPillText, { color: theme.accent }]}>
                LOCKOUT: {format2(timeLeft.hours)}:{format2(timeLeft.minutes)}:{format2(timeLeft.seconds)}
              </Text>
            </View>
          </View>

          {/* Progress Circular Simulation & Metrics Row */}
          <View style={styles.metricsRow}>
            {/* Glowing Circular Gauge (from Mockup: 78% Daily Progress 7/9 Tasks) */}
            <View
              style={[
                styles.circleGauge,
                {
                  borderColor: theme.accent,
                  borderTopColor: `${theme.accent}50`,
                  backgroundColor: theme.bgCardElevated,
                },
              ]}
            >
              <Text style={styles.gaugePct}>{completedPct}%</Text>
              <Text style={[styles.gaugeLabel, { color: theme.secondary }]}>Daily Progress</Text>
              <Text style={[styles.gaugeSub, { color: theme.textMuted }]}>
                {completedTasks.length}/{tasks.length} Tasks
              </Text>
            </View>

            {/* Quick Stat Blocks */}
            <View style={styles.statsCol}>
              <View
                style={[
                  styles.statBox,
                  {
                    backgroundColor: theme.bgCardElevated,
                    borderColor: `${theme.accent}20`,
                  },
                ]}
              >
                <Text style={[styles.statLabel, { color: theme.secondary }]}>COMPLETED VS NOT</Text>
                <Text style={styles.statVal}>
                  {tasks.length === 0 ? (
                    <Text style={{ color: theme.secondary }}>0 MANDATES SET</Text>
                  ) : (
                    <>
                      {completedTasks.length} <Text style={{ color: theme.accent }}>DONE</Text> / {pendingTasks.length} PENDING
                    </>
                  )}
                </Text>
              </View>

              <View style={styles.statBoxSmallRow}>
                <View
                  style={[
                    styles.miniStatBox,
                    {
                      backgroundColor: theme.bgCardElevated,
                      borderColor: `${theme.accent}20`,
                    },
                  ]}
                >
                  <Text style={[styles.miniStatLabel, { color: theme.secondary }]}>THIS WEEK</Text>
                  <Text style={[styles.miniStatVal, { color: theme.accent }]}>
                    ⚡ {user.weeklyXp ?? 0}
                  </Text>
                </View>

                <View
                  style={[
                    styles.miniStatBox,
                    {
                      backgroundColor: theme.bgCardElevated,
                      borderColor: `${theme.accent}20`,
                    },
                  ]}
                >
                  <Text style={[styles.miniStatLabel, { color: theme.secondary }]}>TOTAL XP</Text>
                  <Text style={[styles.miniStatVal, { color: '#60A5FA' }]}>
                    🏆 {user.xp}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 2. TODAY'S TOP 3 SECTION (Directly from Mockup Screen 1) */}
        {top3Tasks.length > 0 && (
          <View
            style={[
              styles.top3Card,
              {
                backgroundColor: theme.bgCard,
                borderColor: `${theme.accent}25`,
              },
            ]}
          >
            <View style={styles.top3HeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.top3Title, { color: '#FFFFFF' }]}>Today's Top 3</Text>
                <View style={[styles.pillSmall, { backgroundColor: theme.accentTint }]}>
                  <Text style={[styles.pillSmallText, { color: theme.accent }]}>PRIORITY</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setFilterTab('all')}
                activeOpacity={0.7}
              >
                <Text style={[styles.seeAllText, { color: theme.accent }]}>See all →</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.top3List}>
              {top3Tasks.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={[
                    styles.top3Item,
                    t.completed && { opacity: 0.6 },
                  ]}
                  onPress={() => handleOpenProofModal(t)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.top3Checkbox,
                      {
                        borderColor: t.completed ? theme.accent : `${theme.accent}60`,
                        backgroundColor: t.completed ? theme.accent : 'transparent',
                      },
                    ]}
                  >
                    {t.completed && <Text style={styles.top3CheckMark}>✓</Text>}
                  </View>
                  <Text
                    style={[
                      styles.top3TaskTitle,
                      t.completed && { textDecorationLine: 'line-through', color: theme.textMuted },
                    ]}
                    numberOfLines={1}
                  >
                    {t.title}
                  </Text>
                  {t.priority === 'High' && (
                    <View style={[styles.top3Badge, { backgroundColor: theme.accentTint, borderColor: theme.accent }]}>
                      <Text style={[styles.top3BadgeText, { color: theme.accent }]}>High</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* 3. QUICK STATS ROW (3 sleek cards from Mockup Screen 1) */}
        <View style={styles.quickStatsRow}>
          {/* Streak */}
          <View
            style={[
              styles.quickStatCard,
              {
                backgroundColor: theme.bgCard,
                borderColor: `${theme.accent}20`,
              },
            ]}
          >
            <Text style={styles.quickStatIcon}>🔥</Text>
            <Text style={styles.quickStatVal}>{user.streak} Day Streak</Text>
            <Text style={[styles.quickStatSub, { color: theme.secondary }]}>Consistency active</Text>
          </View>

          {/* Focus Time */}
          <View
            style={[
              styles.quickStatCard,
              {
                backgroundColor: theme.bgCard,
                borderColor: `${theme.accent}20`,
              },
            ]}
          >
            <Text style={styles.quickStatIcon}>⏱️</Text>
            <Text style={[styles.quickStatVal, { color: theme.accent }]}>2h 15m</Text>
            <Text style={[styles.quickStatSub, { color: theme.secondary }]}>Focus Time</Text>
          </View>

          {/* Next Deadline */}
          <View
            style={[
              styles.quickStatCard,
              {
                backgroundColor: theme.bgCard,
                borderColor: `${theme.accent}20`,
              },
            ]}
          >
            <Text style={styles.quickStatIcon}>📅</Text>
            <Text style={styles.quickStatVal}>11:59 PM</Text>
            <Text style={[styles.quickStatSub, { color: theme.secondary }]}>Lockout Cutoff</Text>
          </View>
        </View>

        {/* 4. "+ ADD TASK" FULL WIDTH BUTTON (Directly from Mockup Screen 1) */}
        <TouchableOpacity
          style={[
            styles.btnAddTaskFull,
            {
              backgroundColor: theme.accentTint,
              borderColor: theme.accent,
            },
          ]}
          onPress={() => setQuickAddVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={[styles.btnAddTaskFullText, { color: theme.accent }]}>+ ADD TASK</Text>
        </TouchableOpacity>

        {/* 5. FILTER PILLS: What Did vs What Not */}
        <View style={styles.filterSection}>
          <View
            style={[
              styles.filterTabsRow,
              {
                backgroundColor: theme.bgCardElevated,
                borderColor: `${theme.accent}20`,
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.filterTab,
                filterTab === 'all' && [styles.filterTabActive, { backgroundColor: theme.accent }],
              ]}
              onPress={() => setFilterTab('all')}
            >
              <Text
                style={[
                  styles.filterTabText,
                  { color: filterTab === 'all' ? '#08080B' : theme.textMuted },
                ]}
              >
                ALL ({tasks.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterTab,
                filterTab === 'completed' && [styles.filterTabActive, { backgroundColor: theme.accent }],
              ]}
              onPress={() => setFilterTab('completed')}
            >
              <Text
                style={[
                  styles.filterTabText,
                  { color: filterTab === 'completed' ? '#08080B' : theme.textMuted },
                ]}
              >
                ✓ WHAT I DID ({completedTasks.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterTab,
                filterTab === 'pending' && [styles.filterTabActive, { backgroundColor: theme.accent }],
              ]}
              onPress={() => setFilterTab('pending')}
            >
              <Text
                style={[
                  styles.filterTabText,
                  { color: filterTab === 'pending' ? '#08080B' : theme.textMuted },
                ]}
              >
                ⚠️ WHAT NOT ({pendingTasks.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section Header with Add Task */}
        <View style={styles.tasksHeaderRow}>
          <View>
            <Text style={styles.tasksSectionTitle}>DAILY DISCIPLINE TO-DO</Text>
            <Text style={[styles.tasksSectionSub, { color: theme.secondary }]}>
              Proof required for every completed task · AI audited
            </Text>
          </View>
        </View>

        {/* Tasks List */}
        <View style={styles.taskList}>
          {displayedTasks.length === 0 ? (
            <View
              style={[
                styles.emptyCard,
                {
                  backgroundColor: theme.bgCard,
                  borderColor: `${theme.accent}20`,
                },
              ]}
            >
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>NO TASKS IN THIS FILTER</Text>
              <Text style={[styles.emptySub, { color: theme.secondary }]}>
                Tap "+ ADD TASK" to log your daily quota mandate.
              </Text>
            </View>
          ) : (
            displayedTasks.map((task) => {
              return (
                <View
                  key={task.id}
                  style={[
                    styles.taskCard,
                    {
                      backgroundColor: theme.bgCard,
                      borderColor: task.completed ? `${theme.accent}40` : `${theme.accent}20`,
                    },
                  ]}
                >
                  {/* Task Top Row */}
                  <View style={styles.taskCardHeader}>
                    <View style={styles.taskTitleRow}>
                      <TouchableOpacity
                        style={[
                          styles.checkIndicator,
                          {
                            borderColor: task.completed ? theme.accent : `${theme.accent}60`,
                            backgroundColor: task.completed ? theme.accent : 'transparent',
                          },
                        ]}
                        onPress={() => handleOpenProofModal(task)}
                      >
                        <Text
                          style={[
                            styles.checkIndicatorText,
                            { color: task.completed ? '#08080B' : theme.secondary },
                          ]}
                        >
                          {task.completed ? '✓' : '○'}
                        </Text>
                      </TouchableOpacity>

                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.taskTitleText,
                            task.completed && { color: '#E5E7EB', textDecorationLine: 'none' },
                          ]}
                        >
                          {task.title}
                        </Text>
                        <View style={styles.taskBadgesRow}>
                          <View
                            style={[
                              styles.categoryBadge,
                              { backgroundColor: theme.accentTint, borderColor: `${theme.accent}40` },
                            ]}
                          >
                            <Text style={[styles.categoryBadgeText, { color: theme.accent }]}>
                              {task.category.toUpperCase()}
                            </Text>
                          </View>
                          <Text style={[styles.taskMetaText, { color: theme.secondary }]}>
                            ⏱ {task.estimatedMinutes}m
                          </Text>
                          {task.priority === 'High' && (
                            <View style={styles.priorityHighBadge}>
                              <Text style={styles.priorityHighText}>HIGH</Text>
                            </View>
                          )}
                          {task.priority === 'Medium' && (
                            <View
                              style={[
                                styles.priorityHighBadge,
                                { backgroundColor: theme.accentTint },
                              ]}
                            >
                              <Text style={[styles.priorityHighText, { color: theme.accent }]}>
                                MEDIUM
                              </Text>
                            </View>
                          )}
                          {task.calendarSynced && (
                            <Text style={styles.syncedText}>📅 Synced</Text>
                          )}
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* PROOF SECTION: Displayed For Completed Tasks */}
                  {task.completed ? (
                    <View
                      style={[
                        styles.proofVerifiedBox,
                        {
                          backgroundColor: theme.bgCardElevated,
                          borderColor: `${theme.accent}30`,
                        },
                      ]}
                    >
                      <View style={styles.proofVerifiedHeader}>
                        <View
                          style={[
                            styles.verifiedTag,
                            { backgroundColor: theme.accentTint },
                          ]}
                        >
                          <Text style={[styles.verifiedTagText, { color: theme.accent }]}>
                            ✓ AI PROOF VERIFIED
                          </Text>
                        </View>
                        {task.proofConfidenceScore && (
                          <Text style={[styles.confidenceScoreText, { color: theme.secondary }]}>
                            {task.proofConfidenceScore}% Confidence
                          </Text>
                        )}
                      </View>

                      {task.proofAiAnalysis && (
                        <Text style={styles.proofAnalysisText}>
                          🤖 {task.proofAiAnalysis}
                        </Text>
                      )}

                      {task.proofImageUri && (
                        <View style={styles.proofThumbRow}>
                          <Image
                            source={{ uri: task.proofImageUri }}
                            style={[styles.proofThumb, { borderColor: `${theme.accent}40` }]}
                          />
                          <TouchableOpacity
                            style={[
                              styles.btnViewProof,
                              { backgroundColor: theme.accentTint, borderColor: theme.accent },
                            ]}
                            onPress={() => handleOpenProofModal(task)}
                          >
                            <Text style={[styles.btnViewProofText, { color: theme.accent }]}>
                              INSPECT PROOF ↗
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  ) : (
                    /* ACTION BUTTON: Submit Proof to Complete */
                    <View style={styles.proofPendingBox}>
                      <View style={styles.proofPendingHeader}>
                        <Text style={styles.proofRequiredNotice}>
                          ⚠️ PROOF MANDATORY BEFORE LOCKOUT
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={[styles.btnSubmitProof, { backgroundColor: theme.accent }]}
                        onPress={() => handleOpenProofModal(task)}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.btnSubmitProofText}>
                          📸 SUBMIT PROOF & COMPLETE TASK →
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button for Quick Add (from Mockup Screen 2) */}
      <TouchableOpacity
        style={[
          styles.fabBtn,
          {
            backgroundColor: theme.accent,
            shadowColor: theme.accent,
          },
        ]}
        onPress={() => setQuickAddVisible(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Proof Submission & Verification Modal */}
      <ProofSubmissionModal
        task={activeProofTask}
        visible={proofModalVisible}
        onClose={() => setProofModalVisible(false)}
        onProofConfirmed={handleProofConfirmed}
      />

      {/* Quick Add Modal */}
      <QuickAddModal
        visible={quickAddVisible}
        onClose={() => setQuickAddVisible(false)}
        onTaskCreated={handleTaskCreated}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  progressCard: {
    borderWidth: 1.5,
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 5,
  },
  progressTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  greetingSmall: {
    fontSize: 13,
    fontWeight: '500',
  },
  greetingTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0.3,
    marginTop: 1,
  },
  greetingSub: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  cutoffPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  cutoffPillText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  circleGauge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gaugePct: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  gaugeLabel: {
    fontSize: 8,
    fontWeight: '700',
    marginTop: 1,
  },
  gaugeSub: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 1,
  },
  statsCol: {
    flex: 1,
    gap: 8,
  },
  statBox: {
    borderRadius: 12,
    padding: 9,
    borderWidth: 1,
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  statVal: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 2,
  },
  statBoxSmallRow: {
    flexDirection: 'row',
    gap: 8,
  },
  miniStatBox: {
    flex: 1,
    borderRadius: 10,
    padding: 7,
    borderWidth: 1,
  },
  miniStatLabel: {
    fontSize: 8,
    fontWeight: '800',
  },
  miniStatVal: {
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },
  // Top 3 section styles (from Mockup Screen 1)
  top3Card: {
    borderRadius: 20,
    borderWidth: 1.2,
    padding: 14,
    marginBottom: 16,
  },
  top3HeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  top3Title: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  pillSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pillSmallText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  seeAllText: {
    fontSize: 11,
    fontWeight: '800',
  },
  top3List: {
    gap: 8,
  },
  top3Item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  top3Checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  top3CheckMark: {
    color: '#08080B',
    fontSize: 11,
    fontWeight: '900',
  },
  top3TaskTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  top3Badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  top3BadgeText: {
    fontSize: 9,
    fontWeight: '900',
  },
  // Quick stats row (from Mockup Screen 1)
  quickStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  quickStatCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
  },
  quickStatIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  quickStatVal: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
  },
  quickStatSub: {
    fontSize: 8,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },
  // Full width add task button (from Mockup Screen 1)
  btnAddTaskFull: {
    borderWidth: 1.5,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  btnAddTaskFullText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  // Filter tabs
  filterSection: {
    marginBottom: 14,
  },
  filterTabsRow: {
    flexDirection: 'row',
    borderRadius: 999,
    padding: 4,
    borderWidth: 1,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 999,
  },
  filterTabActive: {},
  filterTabText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  tasksHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tasksSectionTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  tasksSectionSub: {
    fontSize: 9,
    marginTop: 2,
  },
  taskList: {
    gap: 12,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  emptySub: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  taskCard: {
    borderWidth: 1.2,
    borderRadius: 18,
    padding: 14,
  },
  taskCardHeader: {
    marginBottom: 8,
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  checkIndicator: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  checkIndicatorText: {
    fontSize: 11,
    fontWeight: '900',
  },
  taskTitleText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  taskBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 8,
    fontWeight: '900',
  },
  taskMetaText: {
    fontSize: 9,
    fontWeight: '700',
  },
  priorityHighBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priorityHighText: {
    color: '#F87171',
    fontSize: 8,
    fontWeight: '900',
  },
  syncedText: {
    color: '#60A5FA',
    fontSize: 9,
    fontWeight: '700',
  },
  proofVerifiedBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginTop: 6,
  },
  proofVerifiedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  verifiedTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedTagText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  confidenceScoreText: {
    fontSize: 9,
    fontWeight: '800',
  },
  proofAnalysisText: {
    color: '#D1D5DB',
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 8,
  },
  proofThumbRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  proofThumb: {
    width: 60,
    height: 40,
    borderRadius: 6,
    borderWidth: 1,
  },
  btnViewProof: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  btnViewProofText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  proofPendingBox: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  proofPendingHeader: {
    marginBottom: 6,
  },
  proofRequiredNotice: {
    color: '#F59E0B',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  btnSubmitProof: {
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  btnSubmitProofText: {
    color: '#08080B',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  fabBtn: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: '#08080B',
    fontWeight: '900',
    lineHeight: 34,
  },
});
