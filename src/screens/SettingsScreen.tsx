import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { COLORS, THEME_PALETTES, applyTheme, getAppTheme } from '../theme';
import { ThemeKey, UserProfile, AccountProfile } from '../types';
import {
  getGeminiKey,
  saveGeminiKey,
  getUser,
  saveUser,
  getAllAccounts,
  getActiveAccountId,
  setActiveAccountId,
  updateAccount,
  deleteAccount,
} from '../services/storage';
import { setSupabaseConfig } from '../services/backend';

interface Props {
  onBack: () => void;
  onUserUpdated?: (user: UserProfile) => void;
  onSwitchAccount?: () => void;
}

export default function SettingsScreen({ onBack, onUserUpdated, onSwitchAccount }: Props) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  // Settings State
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey>('amber_gold');
  const [smartReminders, setSmartReminders] = useState(true);
  const [cutoffWarning, setCutoffWarning] = useState(true);
  const [morningBriefing, setMorningBriefing] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);

  // Account management
  const [accounts, setAccounts] = useState<AccountProfile[]>([]);
  const [activeAccountId, setActiveAccountIdState] = useState<string | null>(null);

  // Privacy toggles (for active account)
  const [showXP, setShowXP] = useState(true);
  const [showStreak, setShowStreak] = useState(true);
  const [showTaskList, setShowTaskList] = useState(false);
  const [showPhysiquePhotos, setShowPhysiquePhotos] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const theme = getAppTheme(selectedTheme);

  useEffect(() => {
    getUser().then((u) => {
      setUser(u);
      setSelectedTheme(u.theme || 'amber_gold');
      applyTheme(u.theme || 'amber_gold');
      setSmartReminders(u.smartRemindersEnabled ?? true);
      setOfflineMode(u.offlineMode ?? false);
    });

    getGeminiKey().then((key) => {
      if (key) setApiKey(key);
    });

    loadAccounts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    const u = await getUser();
    setUser(u);
    setSelectedTheme(u.theme || 'amber_gold');
    applyTheme(u.theme || 'amber_gold');
    await loadAccounts();
    setRefreshing(false);
  };

  const handleThemeSelect = async (key: ThemeKey) => {
    setSelectedTheme(key);
    applyTheme(key);
    if (user) {
      const updatedUser: UserProfile = {
        ...user,
        theme: key,
      };
      setUser(updatedUser);
      await saveUser(updatedUser);
      if (activeAccountId) {
        await updateAccount(activeAccountId, { theme: key });
      }
      if (onUserUpdated) {
        onUserUpdated(updatedUser);
      }
    }
    const palette = THEME_PALETTES[key] || THEME_PALETTES.amber_gold;
    setSavedStatus(`✓ Theme switched to ${palette.name}!`);
    setTimeout(() => setSavedStatus(null), 3000);
  };

  const loadAccounts = async () => {
    const all = await getAllAccounts();
    const activeId = await getActiveAccountId();
    setAccounts(all);
    setActiveAccountIdState(activeId);
    const active = all.find((a) => a.id === activeId);
    if (active?.privacySettings) {
      setShowXP(active.privacySettings.showXP);
      setShowStreak(active.privacySettings.showStreak);
      setShowTaskList(active.privacySettings.showTaskList);
      setShowPhysiquePhotos(active.privacySettings.showPhysiquePhotos);
    }
  };

  const handleSwitchAccount = async (id: string) => {
    await setActiveAccountId(id);
    if (onSwitchAccount) onSwitchAccount();
  };

  const handleDeleteAccount = (id: string, name: string) => {
    Alert.alert(
      'Delete Account',
      `Delete "${name}"? All data for this account will be permanently removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'DELETE',
          style: 'destructive',
          onPress: async () => {
            await deleteAccount(id);
            await loadAccounts();
            if (id === activeAccountId && onSwitchAccount) {
              onSwitchAccount();
            }
          },
        },
      ]
    );
  };

  const handleSavePrivacy = async () => {
    if (!activeAccountId) return;
    await updateAccount(activeAccountId, {
      privacySettings: {
        showXP,
        showStreak,
        showTaskList,
        showPhysiquePhotos,
      },
    });
    setSavedStatus('✓ Privacy settings saved.');
  };

  const handleSaveSettings = async () => {
    if (!user) return;

    if (apiKey.trim()) {
      await saveGeminiKey(apiKey.trim());
    }
    if (supabaseUrl.trim() && supabaseKey.trim()) {
      await setSupabaseConfig(supabaseUrl.trim(), supabaseKey.trim());
    }

    const updatedUser: UserProfile = {
      ...user,
      theme: selectedTheme,
      smartRemindersEnabled: smartReminders,
      offlineMode: offlineMode,
    };

    await saveUser(updatedUser);
    setUser(updatedUser);
    if (onUserUpdated) {
      onUserUpdated(updatedUser);
    }

    setSavedStatus('✓ Configuration & preferences saved into local hardware keychain.');
    Alert.alert('Settings Locked', 'Theme, Smart Reminders, Offline Mode, and API configurations updated.');
  };

  const themeList: { key: ThemeKey; label: string; hex: string; desc: string }[] = [
    { key: 'amber_gold', label: 'Obsidian × Amber Gold', hex: '#E5A93C', desc: 'Luxury high-performance gold (Default)' },
    { key: 'acid_lime', label: 'Midnight × Acid Lime', hex: '#D7F45B', desc: 'Sporty military neon' },
    { key: 'electric_blue', label: 'Electric Blue', hex: '#3B82F6', desc: 'Focus-inducing sapphire glow' },
    { key: 'cyber_cyan', label: 'Cyber Cyan', hex: '#06B6D4', desc: 'High-tech terminal aesthetic' },
    { key: 'crimson_fury', label: 'Crimson Fury', hex: '#EF4444', desc: 'High-alert intensity' },
    { key: 'monochrome', label: 'Stealth Monochrome', hex: '#FFFFFF', desc: 'Zero distraction minimalist' },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.accent}
          colors={[theme.accent]}
        />
      }
    >
      <View style={styles.header}>
        <TouchableOpacity style={[styles.backBtn, { borderColor: theme.accent, backgroundColor: theme.accentTint }]} onPress={onBack}>
          <Text style={[styles.backBtnText, { color: theme.accent }]}>← BACK TO HQ</Text>
        </TouchableOpacity>
        <Text style={styles.title}>SETTINGS & CONFIGURATION</Text>
        <Text style={[styles.subtitle, { color: theme.secondary }]}>
          Personalize visual themes, smart reminder triggers, and offline resilience.
        </Text>
      </View>

      {/* Saved Status Banner */}
      {savedStatus && (
        <View style={[styles.statusToast, { borderColor: theme.accent, backgroundColor: theme.accentTint }]}>
          <Text style={[styles.statusToastText, { color: theme.accent }]}>{savedStatus}</Text>
        </View>
      )}

      {/* 1. Custom Themes Selection */}
      <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: `${theme.accent}25` }]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>🎨 CUSTOM ACCENT THEMES</Text>
          <View style={[styles.pillActive, { backgroundColor: theme.accentTint, borderColor: theme.accent }]}>
            <Text style={[styles.pillText, { color: theme.accent }]}>SELECT ACTIVE</Text>
          </View>
        </View>
        <Text style={[styles.cardDesc, { color: theme.secondary }]}>
          Choose your tactical accent color. Applies across gauges, buttons, progress tracks, and widgets.
        </Text>

        <View style={styles.themeGrid}>
          {themeList.map((t) => {
            const isSelected = selectedTheme === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                style={[
                  styles.themeCard,
                  { backgroundColor: theme.bgCardElevated, borderColor: isSelected ? t.hex : `${theme.accent}20` },
                  isSelected && { borderColor: t.hex, backgroundColor: `${t.hex}18` },
                ]}
                onPress={() => handleThemeSelect(t.key)}
              >
                <View style={[styles.swatchCircle, { backgroundColor: t.hex }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.themeLabel, isSelected && { color: t.hex }]}>
                    {t.label}
                  </Text>
                  <Text style={[styles.themeDesc, { color: theme.textMuted }]}>{t.desc}</Text>
                </View>
                {isSelected && (
                  <View style={[styles.checkCircle, { backgroundColor: t.hex }]}>
                    <Text style={{ color: '#10110D', fontWeight: '900', fontSize: 10 }}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 2. Smart Reminders Section */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>🔔 SMART REMINDERS & NOTIFICATIONS</Text>
          <View style={styles.pillActive}>
            <Text style={styles.pillText}>PREFERENCES</Text>
          </View>
        </View>
        <Text style={styles.cardDesc}>
          Time-based discipline triggers calibrated to keep you ahead of the 00:00 lockout.
        </Text>

        {/* Master Toggle */}
        <TouchableOpacity
          style={styles.toggleRow}
          onPress={() => setSmartReminders(!smartReminders)}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleTitle}>Smart Reminders Master</Text>
            <Text style={styles.toggleSub}>Enable automatic notifications based on user schedule</Text>
          </View>
          <View style={[styles.toggleTrack, smartReminders && styles.toggleTrackActive]}>
            <View style={[styles.toggleThumb, smartReminders && styles.toggleThumbActive]} />
          </View>
        </TouchableOpacity>

        {/* Sub-toggle: Cutoff Warning */}
        <TouchableOpacity
          style={styles.toggleRow}
          onPress={() => setCutoffWarning(!cutoffWarning)}
          disabled={!smartReminders}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.toggleTitle, !smartReminders && { opacity: 0.4 }]}>
              23:00 Cutoff Alert
            </Text>
            <Text style={styles.toggleSub}>60-minute warning before daily quotas lock out</Text>
          </View>
          <View
            style={[
              styles.toggleTrack,
              cutoffWarning && smartReminders && styles.toggleTrackActive,
              !smartReminders && { opacity: 0.4 },
            ]}
          >
            <View
              style={[
                styles.toggleThumb,
                cutoffWarning && smartReminders && styles.toggleThumbActive,
              ]}
            />
          </View>
        </TouchableOpacity>

        {/* Sub-toggle: Morning Tactical Briefing */}
        <TouchableOpacity
          style={styles.toggleRow}
          onPress={() => setMorningBriefing(!morningBriefing)}
          disabled={!smartReminders}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.toggleTitle, !smartReminders && { opacity: 0.4 }]}>
              08:30 Morning Briefing
            </Text>
            <Text style={styles.toggleSub}>Daily quota preview and today's planned schedule</Text>
          </View>
          <View
            style={[
              styles.toggleTrack,
              morningBriefing && smartReminders && styles.toggleTrackActive,
              !smartReminders && { opacity: 0.4 },
            ]}
          >
            <View
              style={[
                styles.toggleThumb,
                morningBriefing && smartReminders && styles.toggleThumbActive,
              ]}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* 3. Offline Mode Section */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>📶 OFFLINE MODE</Text>
          <View style={styles.pillMuted}>
            <Text style={styles.pillMutedText}>LOCAL STORAGE</Text>
          </View>
        </View>
        <Text style={styles.cardDesc}>
          Allow task tracking, camera presence timers, and quiz playgrounds without internet access.
        </Text>

        <TouchableOpacity
          style={styles.toggleRow}
          onPress={() => setOfflineMode(!offlineMode)}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleTitle}>Enforce Local-Only Mode</Text>
            <Text style={styles.toggleSub}>
              {offlineMode
                ? 'All operations cached locally via AsyncStorage. Cloud sync paused.'
                : 'Cloud sync active when network is detected.'}
            </Text>
          </View>
          <View style={[styles.toggleTrack, offlineMode && styles.toggleTrackActive]}>
            <View style={[styles.toggleThumb, offlineMode && styles.toggleThumbActive]} />
          </View>
        </TouchableOpacity>
      </View>

      {/* 4. Gemini AI API Box */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>🤖 GOOGLE GEMINI AI KEY</Text>
          <View style={styles.pillActive}>
            <Text style={styles.pillText}>MULTIMODAL ACTIVE</Text>
          </View>
        </View>
        <Text style={styles.cardDesc}>
          Powers handwritten study note scanning, timed quiz questions, weekly physique audit, and emergency token verification.
        </Text>

        <Text style={styles.label}>AI STUDIO API KEY (AIza...)</Text>
        <TextInput
          style={styles.input}
          value={apiKey}
          onChangeText={setApiKey}
          placeholder="Paste AIzaSy... key here"
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry
        />
      </View>

      {/* 5. Supabase Cloud Sync Box */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>☁️ SUPABASE CLOUD SYNC (OPTIONAL)</Text>
          <View style={styles.pillMuted}>
            <Text style={styles.pillMutedText}>MULTI-PHONE</Text>
          </View>
        </View>
        <Text style={styles.cardDesc}>
          Connect multiple teammates to the same live subgroup leaderboard and sync photo proofs across devices.
        </Text>

        <Text style={styles.label}>SUPABASE PROJECT URL</Text>
        <TextInput
          style={styles.input}
          value={supabaseUrl}
          onChangeText={setSupabaseUrl}
          placeholder="https://xyz.supabase.co"
          placeholderTextColor={COLORS.textMuted}
        />

        <Text style={[styles.label, { marginTop: 12 }]}>SUPABASE ANON KEY</Text>
        <TextInput
          style={styles.input}
          value={supabaseKey}
          onChangeText={setSupabaseKey}
          placeholder="eyJhbGciOi..."
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry
        />
      </View>

      {/* 6. Account Management */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>👤 ACCOUNT MANAGEMENT</Text>
          <View style={styles.pillActive}>
            <Text style={styles.pillText}>MAX 3</Text>
          </View>
        </View>
        <Text style={styles.cardDesc}>
          Switch between accounts or delete one. Each account has isolated data, XP, and group membership.
        </Text>

        {accounts.map((acc) => {
          const isActive = acc.id === activeAccountId;
          return (
            <View key={acc.id} style={[accStyles.row, isActive && accStyles.rowActive]}>
              <View style={accStyles.avatar}>
                <Text style={[accStyles.avatarLetter, isActive && { color: COLORS.accent }]}>
                  {acc.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={accStyles.name}>{acc.name} {isActive && '✓'}</Text>
                <Text style={accStyles.sub}>{acc.groupName} · {acc.role}</Text>
              </View>
              {!isActive && (
                <TouchableOpacity
                  style={accStyles.switchBtn}
                  onPress={() => handleSwitchAccount(acc.id)}
                >
                  <Text style={accStyles.switchBtnText}>SWITCH</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={accStyles.delBtn}
                onPress={() => handleDeleteAccount(acc.id, acc.name)}
              >
                <Text style={accStyles.delBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          );
        })}

        {accounts.length < 3 && onSwitchAccount && (
          <TouchableOpacity style={accStyles.addBtn} onPress={onSwitchAccount}>
            <Text style={accStyles.addBtnText}>＋ ADD ACCOUNT</Text>
          </TouchableOpacity>
        )}
        <Text style={accStyles.slotNote}>{accounts.length} / 3 slots used</Text>
      </View>

      {/* 7. Privacy Settings */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>🔒 GROUP LEADERBOARD PRIVACY</Text>
          <View style={styles.pillMuted}>
            <Text style={styles.pillMutedText}>VISIBILITY</Text>
          </View>
        </View>
        <Text style={styles.cardDesc}>
          Control what your group members can see on the leaderboard.
        </Text>

        {[
          { label: 'Show My XP', sub: 'Group can see your XP points', val: showXP, set: setShowXP },
          { label: 'Show My Streak', sub: 'Group can see your daily streak', val: showStreak, set: setShowStreak },
          { label: 'Show My Task List', sub: 'Group can see tasks completed today', val: showTaskList, set: setShowTaskList },
          { label: 'Show Physique Photos', sub: 'Group can see your physique check-in photos', val: showPhysiquePhotos, set: setShowPhysiquePhotos },
        ].map((item) => (
          <TouchableOpacity key={item.label} style={styles.toggleRow} onPress={() => item.set(!item.val)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleTitle}>{item.label}</Text>
              <Text style={styles.toggleSub}>{item.sub}</Text>
            </View>
            <View style={[styles.toggleTrack, item.val && styles.toggleTrackActive]}>
              <View style={[styles.toggleThumb, item.val && styles.toggleThumbActive]} />
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={[styles.btnSave, { marginTop: 12 }]} onPress={handleSavePrivacy}>
          <Text style={styles.btnSaveText}>SAVE PRIVACY SETTINGS</Text>
        </TouchableOpacity>
      </View>

      {savedStatus && <Text style={styles.statusSuccess}>{savedStatus}</Text>}

      <TouchableOpacity style={styles.btnSave} onPress={handleSaveSettings}>
        <Text style={styles.btnSaveText}>SAVE SYSTEM CONFIGURATION</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 50 },
  header: { marginBottom: 16 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 10 },
  backBtnText: { color: COLORS.accent, fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  title: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 0.8 },
  subtitle: { color: COLORS.textDim, fontSize: 12, marginTop: 4, lineHeight: 16 },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.15)',
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: { color: '#fff', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  pillActive: {
    backgroundColor: 'rgba(229, 169, 60, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pillText: { color: COLORS.accent, fontSize: 8, fontWeight: '900' },
  pillMuted: {
    backgroundColor: 'rgba(158, 145, 127, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pillMutedText: { color: COLORS.secondary, fontSize: 8, fontWeight: '800' },
  cardDesc: { color: COLORS.textDim, fontSize: 11, lineHeight: 16, marginBottom: 14 },
  themeGrid: {
    gap: 8,
  },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161511',
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.12)',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  swatchCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  themeLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  themeDesc: {
    color: COLORS.textDim,
    fontSize: 10,
    marginTop: 2,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.08)',
  },
  toggleTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  toggleSub: {
    color: COLORS.textDim,
    fontSize: 10,
    marginTop: 2,
  },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#24211A',
    padding: 2,
    justifyContent: 'center',
  },
  toggleTrackActive: {
    backgroundColor: COLORS.accent,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#9E917F',
  },
  toggleThumbActive: {
    backgroundColor: '#0A0A0A',
    alignSelf: 'flex-end',
  },
  label: { color: COLORS.secondary, fontSize: 9, fontWeight: '800', letterSpacing: 1, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.bgInput,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.12)',
    borderRadius: 10,
    color: '#fff',
    padding: 12,
    fontSize: 13,
  },
  statusSuccess: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  btnSave: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  btnSaveText: { color: COLORS.primaryText, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  statusToast: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
    alignItems: 'center',
  },
  statusToastText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

const accStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: 'rgba(229,169,60,0.08)',
  },
  rowActive: {
    borderBottomColor: 'rgba(229,169,60,0.2)',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1C1914',
    borderWidth: 1,
    borderColor: 'rgba(229,169,60,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    color: COLORS.secondary,
    fontSize: 16,
    fontWeight: '900',
  },
  name: { color: '#fff', fontSize: 13, fontWeight: '800' },
  sub: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600', marginTop: 1 },
  switchBtn: {
    backgroundColor: 'rgba(229,169,60,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(229,169,60,0.3)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  switchBtnText: { color: COLORS.accent, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  delBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  delBtnText: { color: '#EF4444', fontSize: 11, fontWeight: '900' },
  addBtn: {
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    borderStyle: 'dashed',
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  addBtnText: { color: COLORS.accent, fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  slotNote: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600', textAlign: 'center', marginTop: 8 },
});
