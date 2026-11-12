import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { COLORS, THEME_PALETTES, applyTheme, getAppTheme } from './src/theme';
import { TabType, UserProfile, StudySessionLog, QuizQuestion, AccountProfile } from './src/types';
import {
  getUser,
  saveUser,
  isOnboardingComplete,
  getActiveAccount,
  getAllAccounts,
  setActiveAccountId,
} from './src/services/storage';
import { initSupabase, syncSessionToCloud } from './src/services/backend';

// Onboarding screens
import WelcomeScreen from './src/screens/onboarding/WelcomeScreen';
import AuthScreen from './src/screens/onboarding/AuthScreen';
import OnboardingFlow from './src/screens/onboarding/OnboardingFlow';

// Main screens
import DashboardScreen from './src/screens/DashboardScreen';
import SuggestorScreen from './src/screens/SuggestorScreen';
import TrainingHubScreen from './src/screens/TrainingHubScreen';
import AnalysisScreen from './src/screens/AnalysisScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Sub-Screens & Protocols
import StudyScreen from './src/screens/StudyScreen';
import PlaygroundScreen from './src/screens/PlaygroundScreen';
import FocusModeScreen from './src/screens/FocusModeScreen';
import PhysiqueScreen from './src/screens/PhysiqueScreen';
import TokenScreen from './src/screens/TokenScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import GroupLeaderboardScreen from './src/screens/GroupLeaderboardScreen';
import GoalBreakdownScreen from './src/screens/GoalBreakdownScreen';
import CoachScreen from './src/screens/CoachScreen';
import SundayResetScreen from './src/screens/SundayResetScreen';
import HabitTemplatesScreen from './src/screens/HabitTemplatesScreen';
import MonthlyWrappedScreen from './src/screens/MonthlyWrappedScreen';

// Auth gate states
type AppState = 'loading' | 'welcome' | 'auth' | 'onboarding' | 'app';

export default function App() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeAccount, setActiveAccountState] = useState<AccountProfile | null>(null);
  const [accounts, setAccountsState] = useState<AccountProfile[]>([]);
  const [currentSession, setCurrentSession] = useState<StudySessionLog | null>(null);
  const [activeQuizQuestions, setActiveQuizQuestions] = useState<QuizQuestion[] | null>(null);
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  useEffect(() => {
    checkAuthState();
    initSupabase();
  }, []);

  const checkAuthState = async () => {
    const onboarded = await isOnboardingComplete();
    const allAccounts = await getAllAccounts();
    setAccountsState(allAccounts);

    if (!onboarded || allAccounts.length === 0) {
      // Fresh install
      setAppState('welcome');
      return;
    }

    const acc = await getActiveAccount();
    if (acc) {
      setActiveAccountState(acc);
      // Build a compatible UserProfile from AccountProfile
      const u = accountToUserProfile(acc);
      applyTheme(u.theme || 'amber_gold');
      setUser(u);
      setAppState('app');
    } else {
      // Has accounts but no active — show account selector
      setAppState('auth');
    }
  };

  const accountToUserProfile = (acc: AccountProfile): UserProfile => ({
    name: acc.name,
    groupCode: acc.groupCode,
    groupName: acc.groupName,
    role: acc.role,
    xp: acc.xp,
    weeklyXp: acc.weeklyXp ?? 0,
    streak: acc.streak,
    rank: acc.rank,
    emergencyTokens: acc.emergencyTokens,
    penaltyMultiplier: acc.penaltyMultiplier,
    lastMissedDays: acc.lastMissedDays,
    theme: acc.theme,
    offlineMode: acc.offlineMode,
    smartRemindersEnabled: acc.smartRemindersEnabled,
  });

  const handleSelectAccount = (acc: AccountProfile) => {
    setActiveAccountState(acc);
    const u = accountToUserProfile(acc);
    applyTheme(u.theme || 'amber_gold');
    setUser(u);
    setActiveTab('dashboard');
    setAppState('app');
  };

  const handleQuickSwitch = async (acc: AccountProfile) => {
    await setActiveAccountId(acc.id);
    setActiveAccountState(acc);
    const u = accountToUserProfile(acc);
    applyTheme(u.theme || 'amber_gold');
    setUser(u);
    setProfileModalVisible(false);
  };

  const handleUserUpdated = (u: UserProfile) => {
    applyTheme(u.theme || 'amber_gold');
    setUser(u);
  };

  const handleOnboardingComplete = (acc: AccountProfile) => {
    setActiveAccountState(acc);
    setUser(accountToUserProfile(acc));
    setActiveTab('dashboard');
    setAppState('app');
  };

  const handleSwitchAccount = async () => {
    setProfileModalVisible(false);
    const all = await getAllAccounts();
    setAccountsState(all);
    if (all.length === 0) {
      setAppState('welcome');
    } else {
      setAppState('auth');
    }
  };

  const handleSessionComplete = (session: StudySessionLog, generatedQuestions?: QuizQuestion[]) => {
    setCurrentSession(session);
    if (generatedQuestions) {
      setActiveQuizQuestions(generatedQuestions);
    }
    if (user && !user.offlineMode) {
      syncSessionToCloud(session, user);
    }
  };

  const handleQuizComplete = async (score: number) => {
    if (!user) return;
    const earnedXp = score * 50 + 50;
    const updated = {
      ...user,
      xp: user.xp + earnedXp,
      weeklyXp: (user.weeklyXp ?? 0) + earnedXp,
      streak: user.streak + 1,
    };
    setUser(updated);
    await saveUser(updated);
  };

  const handleTokenConsumed = async () => {
    if (!user) return;
    const updated = {
      ...user,
      emergencyTokens: Math.max(0, user.emergencyTokens - 1),
    };
    setUser(updated);
    await saveUser(updated);
  };

  const handleResetCompleted = async () => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      penaltyMultiplier: 1.0,
      lastMissedDays: 0,
      xp: user.xp + 250,
      weeklyXp: (user.weeklyXp ?? 0) + 250,
    };
    setUser(updated);
    await saveUser(updated);
    setActiveTab('dashboard');
  };

  // ── Auth gate rendering ────────────────────────────────────────────────────

  if (appState === 'loading') {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: COLORS.accent, fontWeight: '800', fontSize: 13, letterSpacing: 2 }}>
          LOADING GRIDLOCK PROTOCOL...
        </Text>
      </View>
    );
  }

  if (appState === 'welcome') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <WelcomeScreen
          onCreateAccount={() => setAppState('onboarding')}
          onSignIn={() => {
            if (accounts.length > 0) {
              setAppState('auth');
            } else {
              setAppState('onboarding');
            }
          }}
        />
      </SafeAreaView>
    );
  }

  if (appState === 'auth') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <AuthScreen
          accounts={accounts}
          onSelectAccount={handleSelectAccount}
          onAddAccount={() => setAppState('onboarding')}
        />
      </SafeAreaView>
    );
  }

  if (appState === 'onboarding') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      </SafeAreaView>
    );
  }

  // ── Main app ───────────────────────────────────────────────────────────────

  if (!user) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: COLORS.accent, fontWeight: '800' }}>LOADING GRIDLOCK PROTOCOL...</Text>
      </View>
    );
  }

  const activeTheme = getAppTheme(user.theme);
  const isFocusScreen = activeTab === 'focus_mode';

  // Subscreen Back Button helper
  const isSubScreen = [
    'settings',
    'study',
    'playground',
    'physique',
    'token',
    'leaderboard',
    'goals',
    'coach',
    'sunday_reset',
    'templates',
    'monthly_wrapped',
    'group_leaderboard',
  ].includes(activeTab);

  const renderScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardScreen
            user={user}
            onNavigate={setActiveTab}
            onUserUpdated={handleUserUpdated}
          />
        );
      case 'suggestor':
        return <SuggestorScreen onNavigate={setActiveTab} />;
      case 'training':
        return <TrainingHubScreen onNavigate={setActiveTab} />;
      case 'analysis':
        return <AnalysisScreen user={user} onNavigate={setActiveTab} />;
      case 'settings':
        return (
          <SettingsScreen
            onBack={() => setActiveTab('dashboard')}
            onUserUpdated={handleUserUpdated}
            onSwitchAccount={handleSwitchAccount}
          />
        );
      case 'study':
        return (
          <StudyScreen
            onSessionComplete={handleSessionComplete}
            onNavigate={setActiveTab}
          />
        );
      case 'playground':
        return (
          <PlaygroundScreen
            onQuizComplete={handleQuizComplete}
            onNavigate={setActiveTab}
            currentSession={currentSession}
            customQuestions={activeQuizQuestions}
          />
        );
      case 'physique':
        return <PhysiqueScreen />;
      case 'token':
        return (
          <TokenScreen
            user={user}
            onTokenConsumed={handleTokenConsumed}
          />
        );
      case 'leaderboard':
        return <LeaderboardScreen user={user} />;
      case 'group_leaderboard':
        return <GroupLeaderboardScreen onBack={() => setActiveTab('analysis')} />;
      case 'goals':
        return <GoalBreakdownScreen onNavigate={setActiveTab} />;
      case 'coach':
        return <CoachScreen user={user} onNavigate={setActiveTab} />;
      case 'sunday_reset':
        return (
          <SundayResetScreen
            user={user}
            onNavigate={setActiveTab}
            onResetCompleted={handleResetCompleted}
          />
        );
      case 'templates':
        return <HabitTemplatesScreen onNavigate={setActiveTab} />;
      case 'monthly_wrapped':
        return <MonthlyWrappedScreen user={user} onNavigate={setActiveTab} />;
      case 'focus_mode':
        return <FocusModeScreen onExit={() => setActiveTab('training')} />;
      default:
        return <DashboardScreen user={user} onNavigate={setActiveTab} />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: activeTheme.bg }]}>
      <StatusBar style="light" />

      {/* Top Bar - Hidden during distraction-free Focus Mode */}
      {!isFocusScreen && (
        <View style={[styles.topbar, { backgroundColor: activeTheme.bgCardSolid, borderColor: `${activeTheme.accent}25` }]}>
          <TouchableOpacity
            style={styles.brandContainer}
            onPress={() => setActiveTab('dashboard')}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              {/* Golden Hexagon Logo */}
              <View style={[styles.hexLogo, { borderColor: activeTheme.accent, backgroundColor: activeTheme.bgCardElevated }]}>
                <Text style={[styles.hexLogoText, { color: activeTheme.accent }]}>G</Text>
              </View>

              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.brandTitle}>GRIDLOCK</Text>
                  {user.offlineMode && (
                    <View style={styles.offlineBadge}>
                      <Text style={styles.offlineBadgeText}>OFFLINE</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.brandSub, { color: activeTheme.secondary }]}>
                  PLAN. FOCUS. GROW. · {user.groupName.toUpperCase()}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Back pill for sub-screens, Profile avatar & badge with Settings for main screens */}
          {isSubScreen ? (
            <TouchableOpacity
              style={[styles.backPill, { borderColor: activeTheme.accent, backgroundColor: activeTheme.accentTint }]}
              onPress={() => {
                if (['study', 'focus_mode', 'templates', 'sunday_reset'].includes(activeTab)) {
                  setActiveTab('training');
                } else if (['group_leaderboard'].includes(activeTab)) {
                  setActiveTab('analysis');
                } else {
                  setActiveTab('dashboard');
                }
              }}
            >
              <Text style={[styles.backPillText, { color: activeTheme.accent }]}>← BACK TO HQ</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.topRightRow}>
              {/* Settings Top Button near Profile */}
              <TouchableOpacity
                style={[
                  styles.settingsTopBtn,
                  { borderColor: `${activeTheme.accent}40`, backgroundColor: activeTheme.accentTint },
                ]}
                onPress={() => setActiveTab('settings')}
                activeOpacity={0.7}
              >
                <Text style={styles.settingsTopBtnIcon}>⚙️</Text>
              </TouchableOpacity>

              {/* Profile Avatar Button */}
              <TouchableOpacity
                style={styles.profileBtn}
                onPress={async () => {
                  const all = await getAllAccounts();
                  setAccountsState(all);
                  setProfileModalVisible(true);
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.avatarCircle, { borderColor: activeTheme.accent, backgroundColor: activeTheme.accentTint }]}>
                  <Text style={[styles.avatarLetter, { color: activeTheme.accent }]}>
                    {user.name.charAt(0).toUpperCase()}
                  </Text>
                  <View style={[styles.avatarOnlineDot, { backgroundColor: activeTheme.accent }]} />
                </View>
                <View style={styles.userBadge}>
                  <Text style={styles.userName}>{user.name.toUpperCase()}</Text>
                  <View style={[styles.rolePill, { borderColor: `${activeTheme.accent}50`, backgroundColor: activeTheme.accentTint }]}>
                    <Text style={[styles.userRank, { color: activeTheme.accent }]}>
                      {user.rank.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Screen content */}
      <View style={styles.screenContainer}>{renderScreen()}</View>

      {/* Bottom Navigation - 4 Focused Protocol Pillars (Settings moved to top right) */}
      {!isFocusScreen && !isSubScreen && (
        <View style={[styles.navBar, { backgroundColor: activeTheme.bgCardSolid, borderColor: `${activeTheme.accent}20` }]}>
          {/* 1. HQ Tab */}
          <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('dashboard')}>
            <View style={[styles.iconWrap, activeTab === 'dashboard' && { backgroundColor: `${activeTheme.accent}25` }]}>
              <Text style={[styles.navIcon, activeTab === 'dashboard' && { color: activeTheme.accent }]}>⚡</Text>
            </View>
            <Text style={[styles.navLabel, activeTab === 'dashboard' && { color: activeTheme.accent, fontWeight: '900' }]}>HQ</Text>
          </TouchableOpacity>

          {/* 2. Suggestor Tab */}
          <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('suggestor')}>
            <View style={[styles.iconWrap, activeTab === 'suggestor' && { backgroundColor: `${activeTheme.accent}25` }]}>
              <Text style={[styles.navIcon, activeTab === 'suggestor' && { color: activeTheme.accent }]}>🧭</Text>
            </View>
            <Text style={[styles.navLabel, activeTab === 'suggestor' && { color: activeTheme.accent, fontWeight: '900' }]}>Suggest</Text>
          </TouchableOpacity>

          {/* 3. Training Tab */}
          <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('training')}>
            <View
              style={[
                styles.iconWrap,
                ['training', 'study', 'playground', 'focus_mode', 'templates', 'sunday_reset'].includes(activeTab) && {
                  backgroundColor: `${activeTheme.accent}25`,
                },
              ]}
            >
              <Text
                style={[
                  styles.navIcon,
                  ['training', 'study', 'playground', 'focus_mode', 'templates', 'sunday_reset'].includes(activeTab) && {
                    color: activeTheme.accent,
                  },
                ]}
              >
                ⏱️
              </Text>
            </View>
            <Text
              style={[
                styles.navLabel,
                ['training', 'study', 'playground', 'focus_mode', 'templates', 'sunday_reset'].includes(activeTab) && {
                  color: activeTheme.accent,
                  fontWeight: '900',
                },
              ]}
            >
              Train
            </Text>
          </TouchableOpacity>

          {/* 4. Analysis & Solutions Hub Tab */}
          <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('analysis')}>
            <View
              style={[
                styles.iconWrap,
                ['analysis', 'physique', 'token', 'leaderboard', 'group_leaderboard', 'goals', 'monthly_wrapped'].includes(activeTab) && {
                  backgroundColor: `${activeTheme.accent}25`,
                },
              ]}
            >
              <Text
                style={[
                  styles.navIcon,
                  ['analysis', 'physique', 'token', 'leaderboard', 'group_leaderboard', 'goals', 'monthly_wrapped'].includes(activeTab) && {
                    color: activeTheme.accent,
                  },
                ]}
              >
                📊
              </Text>
            </View>
            <Text
              style={[
                styles.navLabel,
                ['analysis', 'physique', 'token', 'leaderboard', 'group_leaderboard', 'goals', 'monthly_wrapped'].includes(activeTab) && {
                  color: activeTheme.accent,
                  fontWeight: '900',
                },
              ]}
            >
              Analyze
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Operative Profile Modal */}
      <Modal
        visible={profileModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View style={styles.profileModalBackdrop}>
          <View style={[styles.profileModalBox, { backgroundColor: activeTheme.bgCard, borderColor: `${activeTheme.accent}35` }]}>
            {/* Header */}
            <View style={styles.profileModalHeader}>
              <View>
                <Text style={[styles.profileModalPreTitle, { color: activeTheme.secondary }]}>OPERATIVE PROFILE</Text>
                <Text style={styles.profileModalTitle}>MY PROFILE</Text>
              </View>
              <TouchableOpacity
                style={styles.profileModalClose}
                onPress={() => setProfileModalVisible(false)}
              >
                <Text style={styles.profileModalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
              {/* User Hero Avatar Card */}
              <View style={[styles.profileHeroCard, { backgroundColor: activeTheme.bgCardElevated, borderColor: `${activeTheme.accent}20` }]}>
                <View style={[styles.heroAvatar, { borderColor: activeTheme.accent, backgroundColor: activeTheme.accentTint }]}>
                  <Text style={[styles.heroAvatarLetter, { color: activeTheme.accent }]}>
                    {user.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.heroName}>{user.name}</Text>
                <View
                  style={[
                    styles.heroRankPill,
                    { borderColor: activeTheme.accent, backgroundColor: activeTheme.accentTint },
                  ]}
                >
                  <Text style={[styles.heroRankText, { color: activeTheme.accent }]}>
                    ⚡ LEVEL {Math.max(1, Math.floor(user.xp / 250))} · {user.xp} XP
                  </Text>
                </View>
                <Text style={[styles.heroGroupText, { color: activeTheme.secondary }]}>
                  SQUAD: {user.groupName.toUpperCase()} · #{user.groupCode}
                </Text>
              </View>

              {/* Weekly XP vs Lifetime Points Showcase */}
              <View style={styles.pointsGrid}>
                {/* 1. This Week's Points (Reloads from 0 every week) */}
                <View style={[styles.pointBox, { borderColor: activeTheme.accent, backgroundColor: activeTheme.bgCardElevated }]}>
                  <Text style={[styles.pointBoxHeader, { color: activeTheme.secondary }]}>THIS WEEK'S POINTS</Text>
                  <Text style={[styles.pointBoxBigVal, { color: activeTheme.accent }]}>
                    ⚡ {user.weeklyXp ?? 0}
                  </Text>
                  <Text style={[styles.pointBoxSub, { color: activeTheme.textMuted }]}>Reloads from 0 every week</Text>
                  <View style={[styles.reloadBadge, { backgroundColor: activeTheme.accentTint }]}>
                    <Text style={[styles.reloadBadgeText, { color: activeTheme.accent }]}>RESET EVERY MON 00:00</Text>
                  </View>
                </View>

                {/* 2. Lifetime XP */}
                <View style={[styles.pointBox, { borderColor: '#60A5FA', backgroundColor: activeTheme.bgCardElevated }]}>
                  <Text style={[styles.pointBoxHeader, { color: activeTheme.secondary }]}>TOTAL LIFETIME XP</Text>
                  <Text style={[styles.pointBoxBigVal, { color: '#60A5FA' }]}>
                    🏆 {user.xp}
                  </Text>
                  <Text style={[styles.pointBoxSub, { color: activeTheme.textMuted }]}>Lifetime accumulated score</Text>
                  <View style={[styles.reloadBadge, { backgroundColor: 'rgba(96, 165, 250, 0.15)' }]}>
                    <Text style={[styles.reloadBadgeText, { color: '#60A5FA' }]}>PERMANENT CAREER</Text>
                  </View>
                </View>
              </View>

              {/* Secondary Stats: Streak & Emergency Tokens */}
              <View style={styles.secondaryStatsRow}>
                <View style={[styles.secStatPill, { backgroundColor: activeTheme.bgCardElevated, borderColor: `${activeTheme.accent}20` }]}>
                  <Text style={styles.secStatIcon}>🔥</Text>
                  <View>
                    <Text style={styles.secStatVal}>{user.streak} DAYS</Text>
                    <Text style={[styles.secStatLabel, { color: activeTheme.secondary }]}>ACTIVE STREAK</Text>
                  </View>
                </View>
                <View style={[styles.secStatPill, { backgroundColor: activeTheme.bgCardElevated, borderColor: `${activeTheme.accent}20` }]}>
                  <Text style={styles.secStatIcon}>🛡️</Text>
                  <View>
                    <Text style={styles.secStatVal}>{user.emergencyTokens} TOKENS</Text>
                    <Text style={[styles.secStatLabel, { color: activeTheme.secondary }]}>EMERGENCY PASS</Text>
                  </View>
                </View>
              </View>

              {/* "Your Growth" Chart (from Mockup Screen 5) */}
              <View style={[styles.growthCard, { backgroundColor: activeTheme.bgCardElevated, borderColor: `${activeTheme.accent}25` }]}>
                <View style={styles.growthHeaderRow}>
                  <Text style={[styles.growthTitle, { color: '#FFFFFF' }]}>Your Growth</Text>
                  <Text style={[styles.growthSub, { color: activeTheme.accent }]}>+24% this week</Text>
                </View>
                <View style={styles.sparklineBarsRow}>
                  {[
                    { day: 'Mon', val: 40 },
                    { day: 'Tue', val: 65 },
                    { day: 'Wed', val: 80 },
                    { day: 'Thu', val: 60 },
                    { day: 'Fri', val: 90 },
                    { day: 'Sat', val: 85 },
                    { day: 'Sun', val: 100 },
                  ].map((item, idx) => (
                    <View key={idx} style={styles.sparkCol}>
                      <View style={styles.sparkBarWrap}>
                        <View
                          style={[
                            styles.sparkBar,
                            {
                              height: `${item.val}%`,
                              backgroundColor: activeTheme.accent,
                              opacity: idx === 6 ? 1 : 0.4 + idx * 0.08,
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.sparkDayText, { color: activeTheme.textMuted }]}>{item.day}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Achievements Badges (from Mockup Screen 5) */}
              <View style={styles.achieveSection}>
                <Text style={[styles.achieveSectionTitle, { color: activeTheme.secondary }]}>ACHIEVEMENTS</Text>
                <View style={styles.achieveList}>
                  <View style={[styles.achieveItem, { backgroundColor: activeTheme.bgCardElevated, borderColor: `${activeTheme.accent}20` }]}>
                    <Text style={styles.achieveIcon}>👑</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.achieveName}>Consistency King</Text>
                      <Text style={[styles.achieveSub, { color: activeTheme.secondary }]}>Kept your {user.streak} day streak!</Text>
                    </View>
                    <View style={[styles.achievePill, { backgroundColor: activeTheme.accentTint }]}>
                      <Text style={[styles.achievePillText, { color: activeTheme.accent }]}>ACTIVE</Text>
                    </View>
                  </View>

                  <View style={[styles.achieveItem, { backgroundColor: activeTheme.bgCardElevated, borderColor: `${activeTheme.accent}20` }]}>
                    <Text style={styles.achieveIcon}>🎯</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.achieveName}>Goal Crusher</Text>
                      <Text style={[styles.achieveSub, { color: activeTheme.secondary }]}>Completed 5 major goals</Text>
                    </View>
                    <View style={[styles.achievePill, { backgroundColor: activeTheme.accentTint }]}>
                      <Text style={[styles.achievePillText, { color: activeTheme.accent }]}>5/5</Text>
                    </View>
                  </View>

                  <View style={[styles.achieveItem, { backgroundColor: activeTheme.bgCardElevated, borderColor: `${activeTheme.accent}20` }]}>
                    <Text style={styles.achieveIcon}>🧘</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.achieveName}>Focus Master</Text>
                      <Text style={[styles.achieveSub, { color: activeTheme.secondary }]}>Achieved 50 focus sessions</Text>
                    </View>
                    <View style={[styles.achievePill, { backgroundColor: activeTheme.accentTint }]}>
                      <Text style={[styles.achievePillText, { color: activeTheme.accent }]}>GOLD</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Multi-Account Operative Switcher (Max 3) */}
              <View style={styles.accountsSection}>
                <View style={styles.accountsHeaderRow}>
                  <Text style={[styles.accountsSectionTitle, { color: activeTheme.secondary }]}>
                    OPERATIVE ACCOUNTS ({accounts.length}/3)
                  </Text>
                  {accounts.length < 3 && (
                    <TouchableOpacity
                      style={[styles.btnAddAccSmall, { backgroundColor: activeTheme.accentTint, borderColor: activeTheme.accent }]}
                      onPress={() => {
                        setProfileModalVisible(false);
                        setAppState('onboarding');
                      }}
                    >
                      <Text style={[styles.btnAddAccSmallText, { color: activeTheme.accent }]}>+ NEW</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {accounts.map((acc) => {
                  const isActive = acc.name === user.name && acc.groupCode === user.groupCode;
                  return (
                    <TouchableOpacity
                      key={acc.id}
                      style={[
                        styles.accountRowItem,
                        { backgroundColor: activeTheme.bgCardElevated, borderColor: `${activeTheme.accent}20` },
                        isActive && { borderColor: activeTheme.accent, backgroundColor: activeTheme.accentTint },
                      ]}
                      onPress={() => !isActive && handleQuickSwitch(acc)}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={[styles.miniAvatar, { borderColor: `${activeTheme.accent}60`, backgroundColor: activeTheme.bgCard }, isActive && { borderColor: activeTheme.accent }]}>
                          <Text style={[styles.miniAvatarText, { color: activeTheme.accent }]}>
                            {acc.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View>
                          <Text style={[styles.accRowName, isActive && { color: activeTheme.accent }]}>
                            {acc.name} {isActive ? '(ACTIVE)' : ''}
                          </Text>
                          <Text style={[styles.accRowSub, { color: activeTheme.secondary }]}>
                            {acc.groupName} · {acc.weeklyXp ?? 0} wk XP · {acc.xp} total XP
                          </Text>
                        </View>
                      </View>
                      {isActive ? (
                        <View style={[styles.activeAccDot, { backgroundColor: activeTheme.accent }]} />
                      ) : (
                        <Text style={[styles.switchTapText, { color: activeTheme.accent }]}>SWITCH →</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActionButtons}>
                <TouchableOpacity
                  style={[styles.btnOpenSettings, { borderColor: activeTheme.accent, backgroundColor: activeTheme.accentTint }]}
                  onPress={() => {
                    setProfileModalVisible(false);
                    setActiveTab('settings');
                  }}
                >
                  <Text style={[styles.btnOpenSettingsText, { color: activeTheme.accent }]}>
                    ⚙️ OPEN SETTINGS
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnSwitchMain}
                  onPress={handleSwitchAccount}
                >
                  <Text style={styles.btnSwitchMainText}>
                    🔄 MANAGE / CHANGE ACCOUNTS
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  topbar: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight ? RNStatusBar.currentHeight + 8 : 36) : 12,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.15)',
    backgroundColor: COLORS.bgCardSolid,
  },
  brandContainer: {
    justifyContent: 'center',
  },
  hexLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#1C1914',
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hexLogoText: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: '900',
  },
  brandTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  offlineBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  offlineBadgeText: {
    color: '#EF4444',
    fontSize: 8,
    fontWeight: '900',
  },
  brandSub: {
    color: COLORS.secondary,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },
  userBadge: {
    alignItems: 'flex-end',
  },
  userName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  rolePill: {
    backgroundColor: 'rgba(229, 169, 60, 0.15)',
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
  },
  userRank: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  backPill: {
    backgroundColor: 'rgba(229, 169, 60, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.accent,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  backPillText: {
    color: COLORS.accent,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  screenContainer: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#0F0E0C',
    borderTopWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.15)',
    paddingVertical: 8,
    paddingBottom: 14,
    paddingHorizontal: 6,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  navIcon: {
    fontSize: 15,
    color: COLORS.textMuted,
  },
  navLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  // Top Right Actions Row (Settings + Profile)
  topRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingsTopBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsTopBtnIcon: {
    fontSize: 16,
  },
  // Profile Button in Top Bar
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1C1914',
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarLetter: {
    fontSize: 13,
    fontWeight: '900',
  },
  avatarOnlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#0A0A0A',
  },
  // Profile Modal Styles
  profileModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  profileModalBox: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    backgroundColor: '#10110D',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.3)',
    padding: 20,
  },
  profileModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  profileModalPreTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.accent,
    letterSpacing: 1.5,
  },
  profileModalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
  },
  profileModalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileModalCloseText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  profileHeroCard: {
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  heroAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    backgroundColor: '#1C1914',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroAvatarLetter: {
    fontSize: 26,
    fontWeight: '900',
  },
  heroName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
  heroRankPill: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 4,
  },
  heroRankText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  heroGroupText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  pointsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  pointBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  pointBoxHeader: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.secondary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  pointBoxBigVal: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 2,
  },
  pointBoxSub: {
    fontSize: 9,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  reloadBadge: {
    marginTop: 6,
    backgroundColor: 'rgba(229, 169, 60, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  reloadBadgeText: {
    fontSize: 7,
    fontWeight: '900',
    color: COLORS.accent,
    letterSpacing: 0.5,
  },
  secondaryStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  secStatPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  secStatIcon: {
    fontSize: 18,
  },
  secStatVal: {
    fontSize: 13,
    fontWeight: '900',
    color: '#fff',
  },
  secStatLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  // "Your Growth" area chart styles (from Mockup Screen 5)
  growthCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  growthHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  growthTitle: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  growthSub: {
    fontSize: 11,
    fontWeight: '800',
  },
  sparklineBarsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 65,
    paddingHorizontal: 4,
  },
  sparkCol: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  sparkBarWrap: {
    height: 48,
    width: 14,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  sparkBar: {
    width: 8,
    borderRadius: 4,
    minHeight: 8,
  },
  sparkDayText: {
    fontSize: 8,
    fontWeight: '800',
  },
  // Achievements styles (from Mockup Screen 5)
  achieveSection: {
    marginBottom: 16,
  },
  achieveSectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 10,
  },
  achieveList: {
    gap: 8,
  },
  achieveItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
  },
  achieveIcon: {
    fontSize: 20,
  },
  achieveName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  achieveSub: {
    fontSize: 9,
    marginTop: 1,
  },
  achievePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  achievePillText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  accountsSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 16,
  },
  accountsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  accountsSectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.secondary,
    letterSpacing: 1,
  },
  btnAddAccSmall: {
    backgroundColor: 'rgba(229, 169, 60, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  btnAddAccSmallText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.accent,
  },
  accountRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 6,
    backgroundColor: '#131410',
  },
  miniAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: '#1C1914',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniAvatarText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#fff',
  },
  accRowName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fff',
  },
  accRowSub: {
    fontSize: 9,
    color: COLORS.secondary,
  },
  activeAccDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  switchTapText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.accent,
  },
  modalActionButtons: {
    gap: 8,
  },
  btnOpenSettings: {
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(229, 169, 60, 0.08)',
  },
  btnOpenSettingsText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  btnSwitchMain: {
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  btnSwitchMainText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.secondary,
  },
});
