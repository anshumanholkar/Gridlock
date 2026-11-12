import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Clipboard,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS } from '../../theme';
import { AccountProfile, GroupData, TaskItem } from '../../types';
import {
  generateId,
  generateGroupCode,
  createAccount,
  setActiveAccountId,
  setOnboardingComplete,
  getGroupData,
  saveGroupData,
  saveAccountTasks,
  saveAccountGoals,
} from '../../services/storage';
import { generatePersonalizedPlan } from '../../services/gemini';

const PRESET_CATEGORIES = [
  { icon: '📚', label: 'Academics / Study' },
  { icon: '🏋️', label: 'Fitness & Physique' },
  { icon: '🧘', label: 'Mindset & Mental Health' },
  { icon: '💰', label: 'Finance & Trading' },
  { icon: '💻', label: 'Technical Skills / Coding' },
  { icon: '📖', label: 'Reading & Knowledge' },
  { icon: '🎯', label: 'Career & Productivity' },
];

const TIME_OPTIONS = [
  { key: 'morning', label: '🌅 Morning', sub: '6 – 10 AM' },
  { key: 'afternoon', label: '☀️ Afternoon', sub: '12 – 4 PM' },
  { key: 'evening', label: '🌆 Evening', sub: '5 – 9 PM' },
  { key: 'night', label: '🌙 Night', sub: '9 PM+' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MINUTE_OPTS = [15, 30, 45, 60, 90];

interface Props {
  onComplete: (account: AccountProfile) => void;
}

export default function OnboardingFlow({ onComplete }: Props) {
  const [step, setStep] = useState(1);

  // Step 1
  const [name, setName] = useState('');

  // Step 2
  const [groupMode, setGroupMode] = useState<'create' | 'join' | null>(null);
  const [groupName, setGroupName] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [groupData, setGroupDataState] = useState<GroupData | null>(null);
  const [groupError, setGroupError] = useState('');

  // Step 3
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [customGoal, setCustomGoal] = useState('');
  const [customGoals, setCustomGoals] = useState<string[]>([]);

  // Step 4
  const [preferredTime, setPreferredTime] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('evening');
  const [restDay, setRestDay] = useState('Sun');
  const [minuteMap, setMinuteMap] = useState<Record<string, number>>({});

  // Step 5
  const [generating, setGenerating] = useState(false);
  const [planResult, setPlanResult] = useState<{ planSummary: string; dailyTasks: TaskItem[]; weeklyGoals: string[] } | null>(null);

  // Step 6
  const [finalCode, setFinalCode] = useState('');

  const progressAnim = useRef(new Animated.Value(1 / 6)).current;

  const goStep = (s: number) => {
    setStep(s);
    Animated.timing(progressAnim, {
      toValue: s / 6,
      duration: 350,
      useNativeDriver: false,
    }).start();
  };

  // ── Step 2 handlers ────────────────────────────────────────────────────────

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setGroupError('Enter a group name');
      return;
    }
    const code = generateGroupCode();
    setGeneratedCode(code);
    setGroupError('');
  };

  const handleJoinGroup = async () => {
    setGroupError('');
    const code = joinCode.trim().toUpperCase();
    if (code.length < 4) {
      setGroupError('Enter a valid group code');
      return;
    }
    const existing = await getGroupData(code);
    if (!existing) {
      setGroupError('Group not found. Check the code and try again.');
      return;
    }
    if (existing.members.length >= 5) {
      setGroupError('This group is full (max 5 members).');
      return;
    }
    setGroupDataState(existing);
    setGroupName(existing.name);
    setGroupError('');
  };

  // ── Step 4 helpers ─────────────────────────────────────────────────────────

  const setMinutes = (cat: string, mins: number) => {
    setMinuteMap((prev) => ({ ...prev, [cat]: mins }));
  };

  // ── Step 5: Generate plan ──────────────────────────────────────────────────

  const handleGeneratePlan = async () => {
    setGenerating(true);
    const allCategories = [...selectedCategories];
    const dailyMinutes = allCategories.map((c) => ({ category: c, minutes: minuteMap[c] || 30 }));
    try {
      const result = await generatePersonalizedPlan(
        name,
        allCategories,
        customGoals,
        dailyMinutes,
        preferredTime,
        restDay
      );
      setPlanResult(result);
    } catch {
      setPlanResult({
        planSummary: `${name}'s personalized protocol activated. Focus areas: ${allCategories.join(', ')}.`,
        dailyTasks: [],
        weeklyGoals: allCategories.map((c) => `Consistent daily effort in ${c}`),
      });
    } finally {
      setGenerating(false);
    }
  };

  // ── Finish onboarding ──────────────────────────────────────────────────────

  const handleFinish = async () => {
    const id = generateId();
    const code = groupMode === 'create' ? generatedCode : joinCode.trim().toUpperCase();
    const gName = groupName.trim() || 'Solo Operative';

    const allCategories = [...selectedCategories, ...customGoals];
    const dailyMinutes = allCategories.map((c) => ({ category: c, minutesPerDay: minuteMap[c] || 30 }));

    const account: AccountProfile = {
      id,
      name: name.trim(),
      groupCode: code,
      groupName: gName,
      isGroupCreator: groupMode === 'create',
      role: 'Recruit',
      xp: 0,
      streak: 0,
      rank: 'Raw Recruit',
      emergencyTokens: 1,
      penaltyMultiplier: 1.0,
      lastMissedDays: 0,
      theme: 'amber_gold',
      offlineMode: false,
      smartRemindersEnabled: true,
      selectedCategories,
      customGoals,
      dailyTimeCommitments: dailyMinutes,
      preferredStudyTime: preferredTime,
      weeklyRestDay: restDay,
      aiPersonalizedPlan: planResult?.planSummary,
      privacySettings: {
        showXP: true,
        showStreak: true,
        showTaskList: false,
        showPhysiquePhotos: false,
      },
      createdAt: new Date().toISOString(),
    };

    const success = await createAccount(account);
    if (!success) {
      Alert.alert('Account Limit', 'Maximum 3 accounts allowed. Delete one first.');
      return;
    }

    await setActiveAccountId(id);

    // Save initial tasks from AI plan
    if (planResult?.dailyTasks && planResult.dailyTasks.length > 0) {
      await saveAccountTasks(id, planResult.dailyTasks);
    }

    // Handle group membership
    if (groupMode === 'create' && generatedCode) {
      const newGroup: GroupData = {
        code: generatedCode,
        name: gName,
        creatorId: id,
        members: [
          {
            accountId: id,
            name: name.trim(),
            xp: 0,
            streak: 0,
            rank: 'Raw Recruit',
            tasksCompletedToday: 0,
            tasksTotalToday: planResult?.dailyTasks?.length || 0,
            lastActive: new Date().toISOString(),
            privacySettings: account.privacySettings,
          },
        ],
        createdAt: new Date().toISOString(),
      };
      await saveGroupData(newGroup);
    } else if (groupMode === 'join' && groupData) {
      const updated: GroupData = {
        ...groupData,
        members: [
          ...groupData.members,
          {
            accountId: id,
            name: name.trim(),
            xp: 0,
            streak: 0,
            rank: 'Raw Recruit',
            tasksCompletedToday: 0,
            tasksTotalToday: planResult?.dailyTasks?.length || 0,
            lastActive: new Date().toISOString(),
            privacySettings: account.privacySettings,
          },
        ],
      };
      await saveGroupData(updated);
    }

    await setOnboardingComplete();
    setFinalCode(code);
    onComplete(account);
  };

  // ── Render steps ───────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Progress bar */}
      <View style={styles.progressBar}>
        <Animated.View
          style={[
            styles.progressFill,
            { width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
          ]}
        />
      </View>

      <View style={styles.stepLabel}>
        <Text style={styles.stepText}>STEP {step} OF 6</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

        {/* ── STEP 1: Name ─────────────────────────────────────────────── */}
        {step === 1 && (
          <View style={styles.stepWrap}>
            <Text style={styles.stepTitle}>WHO ARE YOU,{'\n'}OPERATIVE?</Text>
            <Text style={styles.stepSub}>Enter your name. This is your identity in the system.</Text>
            <TextInput
              style={styles.input}
              placeholder="Your name..."
              placeholderTextColor={COLORS.textMuted}
              value={name}
              onChangeText={setName}
              autoFocus
              maxLength={30}
            />
            <TouchableOpacity
              style={[styles.nextBtn, !name.trim() && styles.disabled]}
              onPress={() => { if (name.trim()) goStep(2); }}
              disabled={!name.trim()}
            >
              <Text style={styles.nextBtnText}>CONTINUE →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── STEP 2: Group ────────────────────────────────────────────── */}
        {step === 2 && (
          <View style={styles.stepWrap}>
            <Text style={styles.stepTitle}>JOIN THE{'\n'}UNIT</Text>
            <Text style={styles.stepSub}>Create or join an accountability group (max 5 members).</Text>

            <View style={styles.modeRow}>
              <TouchableOpacity
                style={[styles.modeBtn, groupMode === 'create' && styles.modeBtnActive]}
                onPress={() => { setGroupMode('create'); setGroupError(''); setGeneratedCode(''); }}
              >
                <Text style={[styles.modeBtnText, groupMode === 'create' && { color: '#000' }]}>⚡ CREATE GROUP</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeBtn, groupMode === 'join' && styles.modeBtnActive]}
                onPress={() => { setGroupMode('join'); setGroupError(''); }}
              >
                <Text style={[styles.modeBtnText, groupMode === 'join' && { color: '#000' }]}>🤝 JOIN GROUP</Text>
              </TouchableOpacity>
            </View>

            {groupMode === 'create' && (
              <View style={styles.groupBox}>
                <TextInput
                  style={styles.input}
                  placeholder="Group name (e.g. Iron Vanguard)"
                  placeholderTextColor={COLORS.textMuted}
                  value={groupName}
                  onChangeText={setGroupName}
                />
                <TouchableOpacity style={styles.actionBtn} onPress={handleCreateGroup}>
                  <Text style={styles.actionBtnText}>GENERATE CODE</Text>
                </TouchableOpacity>
                {generatedCode !== '' && (
                  <View style={styles.codeCard}>
                    <Text style={styles.codeLabel}>YOUR GROUP CODE</Text>
                    <Text style={styles.codeValue}>{generatedCode}</Text>
                    <Text style={styles.codeHint}>Share this with your group members</Text>
                    <TouchableOpacity onPress={() => Clipboard.setString(generatedCode)}>
                      <Text style={styles.copyLink}>📋 COPY CODE</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {groupMode === 'join' && (
              <View style={styles.groupBox}>
                <TextInput
                  style={[styles.input, { textTransform: 'uppercase' }]}
                  placeholder="Enter group code (e.g. GL9X4A)"
                  placeholderTextColor={COLORS.textMuted}
                  value={joinCode}
                  onChangeText={(t) => setJoinCode(t.toUpperCase())}
                  maxLength={8}
                />
                <TouchableOpacity style={styles.actionBtn} onPress={handleJoinGroup}>
                  <Text style={styles.actionBtnText}>FIND GROUP</Text>
                </TouchableOpacity>
                {groupData && (
                  <View style={styles.codeCard}>
                    <Text style={styles.codeLabel}>GROUP FOUND ✓</Text>
                    <Text style={styles.codeValue}>{groupData.name}</Text>
                    <Text style={styles.codeHint}>{groupData.members.length} / 5 members</Text>
                  </View>
                )}
              </View>
            )}

            {groupError !== '' && <Text style={styles.errorText}>{groupError}</Text>}

            <View style={styles.skipNote}>
              <TouchableOpacity onPress={() => { setGroupMode(null); goStep(3); }}>
                <Text style={styles.skipText}>Skip for now (Solo Mode)</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.nextBtn, !canProceedStep2() && styles.disabled]}
              onPress={() => { if (canProceedStep2()) goStep(3); }}
              disabled={!canProceedStep2()}
            >
              <Text style={styles.nextBtnText}>CONTINUE →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── STEP 3: Category Picker ──────────────────────────────────── */}
        {step === 3 && (
          <View style={styles.stepWrap}>
            <Text style={styles.stepTitle}>WHAT DO YOU{'\n'}WANT TO MASTER?</Text>
            <Text style={styles.stepSub}>Select all areas you want to improve. Minimum 1.</Text>

            <View style={styles.catGrid}>
              {PRESET_CATEGORIES.map((c) => {
                const sel = selectedCategories.includes(c.label);
                return (
                  <TouchableOpacity
                    key={c.label}
                    style={[styles.catCard, sel && styles.catCardActive]}
                    onPress={() =>
                      setSelectedCategories((prev) =>
                        sel ? prev.filter((x) => x !== c.label) : [...prev, c.label]
                      )
                    }
                  >
                    <Text style={styles.catIcon}>{c.icon}</Text>
                    <Text style={[styles.catLabel, sel && { color: '#000' }]}>{c.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.customLabel}>ADD YOUR OWN GOAL</Text>
            <View style={styles.customRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="e.g. Trading, Piano, Spanish..."
                placeholderTextColor={COLORS.textMuted}
                value={customGoal}
                onChangeText={setCustomGoal}
              />
              <TouchableOpacity
                style={styles.addCustomBtn}
                onPress={() => {
                  if (customGoal.trim()) {
                    setCustomGoals((prev) => [...prev, customGoal.trim()]);
                    setCustomGoal('');
                  }
                }}
              >
                <Text style={styles.addCustomBtnText}>＋</Text>
              </TouchableOpacity>
            </View>

            {customGoals.length > 0 && (
              <View style={styles.tagRow}>
                {customGoals.map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={styles.customTag}
                    onPress={() => setCustomGoals((prev) => prev.filter((x) => x !== g))}
                  >
                    <Text style={styles.customTagText}>{g} ✕</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={[styles.nextBtn, selectedCategories.length === 0 && customGoals.length === 0 && styles.disabled]}
              onPress={() => { if (selectedCategories.length > 0 || customGoals.length > 0) goStep(4); }}
            >
              <Text style={styles.nextBtnText}>CONTINUE →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── STEP 4: Time Prefs ───────────────────────────────────────── */}
        {step === 4 && (
          <View style={styles.stepWrap}>
            <Text style={styles.stepTitle}>BUILD YOUR{'\n'}SCHEDULE</Text>
            <Text style={styles.stepSub}>Tell the AI your availability so it can build you a custom protocol.</Text>

            <Text style={styles.sectionHead}>PEAK ACTIVE TIME</Text>
            <View style={styles.timeRow}>
              {TIME_OPTIONS.map((t) => (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.timeCard, preferredTime === t.key && styles.timeCardActive]}
                  onPress={() => setPreferredTime(t.key as typeof preferredTime)}
                >
                  <Text style={styles.timeLabel}>{t.label}</Text>
                  <Text style={[styles.timeSub, preferredTime === t.key && { color: '#000' }]}>{t.sub}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionHead}>REST DAY</Text>
            <View style={styles.dayRow}>
              {DAYS.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.dayPill, restDay === d && styles.dayPillActive]}
                  onPress={() => setRestDay(d)}
                >
                  <Text style={[styles.dayText, restDay === d && { color: '#000' }]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionHead}>TIME PER CATEGORY (MIN/DAY)</Text>
            {[...selectedCategories, ...customGoals].map((cat) => (
              <View key={cat} style={styles.minRow}>
                <Text style={styles.minCatLabel}>{cat}</Text>
                <View style={styles.minBtns}>
                  {MINUTE_OPTS.map((m) => (
                    <TouchableOpacity
                      key={m}
                      style={[styles.minBtn, (minuteMap[cat] || 30) === m && styles.minBtnActive]}
                      onPress={() => setMinutes(cat, m)}
                    >
                      <Text style={[styles.minBtnText, (minuteMap[cat] || 30) === m && { color: '#000' }]}>{m}m</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}

            <TouchableOpacity style={styles.nextBtn} onPress={() => { goStep(5); handleGeneratePlan(); }}>
              <Text style={styles.nextBtnText}>GENERATE MY PLAN →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── STEP 5: AI Plan ──────────────────────────────────────────── */}
        {step === 5 && (
          <View style={styles.stepWrap}>
            <Text style={styles.stepTitle}>YOUR PERSONAL{'\n'}PROTOCOL</Text>
            <Text style={styles.stepSub}>AI Coach Vance has built your custom accountability plan.</Text>

            {generating ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color={COLORS.accent} />
                <Text style={styles.loadingText}>COACH VANCE IS ANALYZING YOUR PROFILE...</Text>
              </View>
            ) : planResult ? (
              <>
                <View style={styles.planCard}>
                  <Text style={styles.planTitle}>⚡ PLAN SUMMARY</Text>
                  <Text style={styles.planText}>{planResult.planSummary}</Text>
                </View>

                {planResult.dailyTasks.length > 0 && (
                  <View style={styles.planSection}>
                    <Text style={styles.planSectionTitle}>📋 DAILY MANDATES</Text>
                    {planResult.dailyTasks.map((t, i) => (
                      <View key={i} style={styles.planTask}>
                        <Text style={styles.planTaskDot}>▸</Text>
                        <Text style={styles.planTaskText}>{t.title} ({t.estimatedMinutes}m)</Text>
                      </View>
                    ))}
                  </View>
                )}

                {planResult.weeklyGoals.length > 0 && (
                  <View style={styles.planSection}>
                    <Text style={styles.planSectionTitle}>🎯 WEEKLY OBJECTIVES</Text>
                    {planResult.weeklyGoals.map((g, i) => (
                      <View key={i} style={styles.planTask}>
                        <Text style={styles.planTaskDot}>›</Text>
                        <Text style={styles.planTaskText}>{g}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.btnRow}>
                  <TouchableOpacity style={styles.regenBtn} onPress={handleGeneratePlan}>
                    <Text style={styles.regenBtnText}>↻ REGENERATE</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.lockBtn} onPress={() => goStep(6)}>
                    <Text style={styles.lockBtnText}>🔒 LOCK IN PLAN</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : null}
          </View>
        )}

        {/* ── STEP 6: Ready ────────────────────────────────────────────── */}
        {step === 6 && (
          <View style={styles.stepWrap}>
            <View style={styles.readyLogo}>
              <Text style={styles.readyLogoText}>G</Text>
            </View>
            <Text style={styles.stepTitle}>WELCOME TO{'\n'}THE ARENA</Text>
            <Text style={styles.stepSub}>Your protocol is locked in. The clock starts now.</Text>

            {(groupMode === 'create' && generatedCode) ? (
              <View style={styles.codeCard}>
                <Text style={styles.codeLabel}>YOUR GROUP CODE</Text>
                <Text style={styles.codeValue}>{generatedCode}</Text>
                <Text style={styles.codeHint}>Share with your squad (max 5 members)</Text>
                <TouchableOpacity onPress={() => Clipboard.setString(generatedCode)}>
                  <Text style={styles.copyLink}>📋 COPY CODE</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <View style={styles.readyStats}>
              <View style={styles.readyStat}><Text style={styles.readyStatVal}>0</Text><Text style={styles.readyStatLabel}>XP</Text></View>
              <View style={styles.readyStat}><Text style={styles.readyStatVal}>0</Text><Text style={styles.readyStatLabel}>STREAK</Text></View>
              <View style={styles.readyStat}><Text style={styles.readyStatVal}>{(planResult?.dailyTasks?.length || 0)}</Text><Text style={styles.readyStatLabel}>TASKS</Text></View>
            </View>

            <TouchableOpacity style={styles.arenaBtn} onPress={handleFinish}>
              <Text style={styles.arenaBtnText}>ENTER THE ARENA →</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>

      {/* Back button */}
      {step > 1 && (
        <TouchableOpacity style={styles.backBtn} onPress={() => goStep(step - 1)}>
          <Text style={styles.backBtnText}>← BACK</Text>
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );

  function canProceedStep2() {
    if (groupMode === null) return false;
    if (groupMode === 'create') return generatedCode !== '';
    if (groupMode === 'join') return groupData !== null;
    return false;
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(229,169,60,0.15)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 2,
  },
  stepLabel: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 4,
  },
  stepText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 100 },
  stepWrap: { paddingTop: 20, gap: 16 },
  stepTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1,
    lineHeight: 36,
  },
  stepSub: {
    color: COLORS.secondary,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
  },
  input: {
    backgroundColor: '#111009',
    borderWidth: 1,
    borderColor: 'rgba(229,169,60,0.3)',
    borderRadius: 10,
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 4,
  },
  nextBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  disabled: { opacity: 0.4 },
  nextBtnText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  modeRow: { flexDirection: 'row', gap: 10 },
  modeBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  modeBtnActive: { backgroundColor: COLORS.accent },
  modeBtnText: { color: COLORS.accent, fontSize: 12, fontWeight: '900', letterSpacing: 0.5 },
  groupBox: { gap: 10 },
  actionBtn: {
    backgroundColor: 'rgba(229,169,60,0.15)',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229,169,60,0.3)',
  },
  actionBtnText: { color: COLORS.accent, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  codeCard: {
    backgroundColor: '#111009',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.accent,
    padding: 18,
    alignItems: 'center',
    gap: 6,
  },
  codeLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  codeValue: { color: COLORS.accent, fontSize: 28, fontWeight: '900', letterSpacing: 6 },
  codeHint: { color: COLORS.secondary, fontSize: 11, fontWeight: '600' },
  copyLink: { color: COLORS.accent, fontSize: 11, fontWeight: '800', marginTop: 4 },
  errorText: { color: '#EF4444', fontSize: 12, fontWeight: '700' },
  skipNote: { alignItems: 'center' },
  skipText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600', textDecorationLine: 'underline' },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catCard: {
    width: '47%',
    backgroundColor: '#111009',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(229,169,60,0.2)',
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  catCardActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  catIcon: { fontSize: 24 },
  catLabel: { color: COLORS.secondary, fontSize: 11, fontWeight: '700', textAlign: 'center' },
  customLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 2, marginTop: 4 },
  customRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  addCustomBtn: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCustomBtnText: { color: '#000', fontSize: 20, fontWeight: '900' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  customTag: {
    backgroundColor: 'rgba(229,169,60,0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.accent,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  customTagText: { color: COLORS.accent, fontSize: 11, fontWeight: '700' },
  sectionHead: { color: COLORS.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 2, marginTop: 6 },
  timeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  timeCard: {
    width: '47%',
    backgroundColor: '#111009',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(229,169,60,0.2)',
    padding: 12,
  },
  timeCardActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  timeLabel: { color: '#fff', fontSize: 13, fontWeight: '800' },
  timeSub: { color: COLORS.secondary, fontSize: 10, fontWeight: '600', marginTop: 2 },
  dayRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dayPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(229,169,60,0.3)',
    backgroundColor: '#111009',
  },
  dayPillActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  dayText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  minRow: { gap: 6 },
  minCatLabel: { color: COLORS.secondary, fontSize: 11, fontWeight: '700' },
  minBtns: { flexDirection: 'row', gap: 8 },
  minBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(229,169,60,0.3)',
    backgroundColor: '#111009',
  },
  minBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  minBtnText: { color: COLORS.secondary, fontSize: 11, fontWeight: '700' },
  loadingBox: { alignItems: 'center', paddingVertical: 40, gap: 16 },
  loadingText: { color: COLORS.secondary, fontSize: 11, fontWeight: '800', letterSpacing: 1.5, textAlign: 'center' },
  planCard: {
    backgroundColor: '#111009',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(229,169,60,0.3)',
    padding: 16,
    gap: 8,
  },
  planTitle: { color: COLORS.accent, fontSize: 11, fontWeight: '900', letterSpacing: 1.5 },
  planText: { color: '#fff', fontSize: 13, fontWeight: '600', lineHeight: 20 },
  planSection: {
    backgroundColor: '#0D0C0A',
    borderRadius: 10,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  planSectionTitle: { color: COLORS.secondary, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  planTask: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  planTaskDot: { color: COLORS.accent, fontSize: 12, fontWeight: '900', marginTop: 1 },
  planTaskText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600', flex: 1, lineHeight: 18 },
  btnRow: { flexDirection: 'row', gap: 10 },
  regenBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  regenBtnText: { color: COLORS.accent, fontSize: 12, fontWeight: '800' },
  lockBtn: {
    flex: 1,
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  lockBtnText: { color: '#000', fontSize: 12, fontWeight: '900' },
  readyLogo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#1C1914',
    borderWidth: 2,
    borderColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 8,
  },
  readyLogoText: { color: COLORS.accent, fontSize: 36, fontWeight: '900' },
  readyStats: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 16 },
  readyStat: { alignItems: 'center', gap: 4 },
  readyStatVal: { color: COLORS.accent, fontSize: 28, fontWeight: '900' },
  readyStatLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  arenaBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  arenaBtnText: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 2 },
  backBtn: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    backgroundColor: 'rgba(229,169,60,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(229,169,60,0.3)',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  backBtnText: { color: COLORS.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
});
