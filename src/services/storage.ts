import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, StudySessionLog, TaskItem, GoalItem, AccountProfile, GroupData } from '../types';

// ─── Legacy keys ─────────────────────────────────────────────────────────────
const USER_KEY = '@gridlock_user';
const SESSIONS_KEY = '@gridlock_sessions';
const TASKS_KEY = '@gridlock_tasks';
const GOALS_KEY = '@gridlock_goals';
const API_KEY_STORAGE = '@gridlock_gemini_key';

// ─── Multi-Account keys ───────────────────────────────────────────────────────
const ACCOUNTS_KEY = '@gridlock_accounts';
const ACTIVE_ACCOUNT_KEY = '@gridlock_active_account_id';
const GROUPS_KEY = '@gridlock_groups';
const ONBOARDING_DONE_KEY = '@gridlock_onboarding_complete';

// ─── Namespaced keys per account ──────────────────────────────────────────────
const accountTasksKey = (id: string) => `@gridlock_tasks_${id}`;
const accountGoalsKey = (id: string) => `@gridlock_goals_${id}`;
const accountSessionsKey = (id: string) => `@gridlock_sessions_${id}`;

export function getWeekIdentifier(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo}`;
}

export const defaultUser: UserProfile = {
  name: 'Alex Vance',
  groupCode: 'GL904',
  groupName: 'Iron Vanguard',
  role: 'Monitor',
  xp: 1450,
  weeklyXp: 450,
  weeklyResetDate: getWeekIdentifier(),
  streak: 6,
  rank: 'Apex Enforcer',
  emergencyTokens: 1,
  penaltyMultiplier: 1.0,
  lastMissedDays: 0,
  theme: 'amber_gold',
  offlineMode: false,
  smartRemindersEnabled: true,
};

export const defaultTasks: TaskItem[] = [
  {
    id: 't1',
    title: 'Complete 2h Virtual Memory OS Study',
    category: 'Study',
    priority: 'High',
    estimatedMinutes: 120,
    completed: true,
    dueDate: 'Today',
    calendarSynced: true,
    proofImageUri: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&auto=format&fit=crop',
    proofAiAnalysis: 'Verified handwritten notes on Virtual Memory, TLB miss latencies, and page table walks. High conceptual fidelity.',
    proofConfidenceScore: 96,
    proofVerified: true,
    proofSubmittedAt: '14:20 PM',
  },
  { id: 't2', title: 'Bulgarian Split Squats + Core Workout', category: 'Fitness', priority: 'High', estimatedMinutes: 50, completed: false, dueDate: 'Today', calendarSynced: false },
  { id: 't3', title: '15m Daily Gratitude & Mindset Journal', category: 'Mindset', priority: 'Medium', estimatedMinutes: 15, completed: false, dueDate: 'Today', calendarSynced: false },
  { id: 't4', title: 'Algorithm Complexity Review on LeetCode', category: 'Skill', priority: 'Medium', estimatedMinutes: 45, completed: false, dueDate: 'Tomorrow', calendarSynced: false },
];

export const defaultGoals: GoalItem[] = [
  {
    id: 'g1',
    title: 'Master Operating Systems Kernel & Paging',
    targetDate: 'Nov 15',
    progressPct: 65,
    subTasks: [
      { id: 'st1', title: 'Read Virtual Memory Paging chapters', completed: true },
      { id: 'st2', title: 'Implement Page Replacement Algorithm (LRU)', completed: true },
      { id: 'st3', title: 'Score 100% on 20Q Memory Recall Exam', completed: false },
      { id: 'st4', title: 'Simulate TLB cache miss latencies', completed: false },
    ],
    aiBreakdownAdvice: 'Focus next 3 days purely on TLB buffer misses and page table walk cost.',
  },
  {
    id: 'g2',
    title: 'Drop Body Fat to 12% with Quad Symmetry',
    targetDate: 'Nov 30',
    progressPct: 40,
    subTasks: [
      { id: 'st5', title: 'Weekly Sunday shirtless & legs scan', completed: true },
      { id: 'st6', title: 'Maintain 2,450 kcal clean surplus baseline', completed: false },
      { id: 'st7', title: '2x weekly eccentric quad overload', completed: false },
    ],
    aiBreakdownAdvice: 'Progressive overload on Vastus Medialis. Keep daily sodium consistent.',
  },
];

// ─── Utility ──────────────────────────────────────────────────────────────────

export function generateGroupCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'GL';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ─── Onboarding state ─────────────────────────────────────────────────────────

export async function isOnboardingComplete(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(ONBOARDING_DONE_KEY);
    return val === 'true';
  } catch {
    return false;
  }
}

export async function setOnboardingComplete(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_DONE_KEY, 'true');
  } catch (e) {
    console.error('Failed to set onboarding complete', e);
  }
}

// ─── Multi-Account ────────────────────────────────────────────────────────────

export async function getAllAccounts(): Promise<AccountProfile[]> {
  try {
    const raw = await AsyncStorage.getItem(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveAllAccounts(accounts: AccountProfile[]): Promise<void> {
  try {
    await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to save accounts', e);
  }
}

export async function getActiveAccountId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(ACTIVE_ACCOUNT_KEY);
  } catch {
    return null;
  }
}

export async function setActiveAccountId(id: string): Promise<void> {
  try {
    await AsyncStorage.setItem(ACTIVE_ACCOUNT_KEY, id);
  } catch (e) {
    console.error('Failed to set active account id', e);
  }
}

export async function getActiveAccount(): Promise<AccountProfile | null> {
  try {
    const id = await getActiveAccountId();
    if (!id) return null;
    const accounts = await getAllAccounts();
    return accounts.find((a) => a.id === id) || null;
  } catch {
    return null;
  }
}

export async function createAccount(profile: AccountProfile): Promise<boolean> {
  try {
    const accounts = await getAllAccounts();
    if (accounts.length >= 3) return false; // max 3 accounts
    accounts.push(profile);
    await saveAllAccounts(accounts);
    return true;
  } catch {
    return false;
  }
}

export async function updateAccount(id: string, partial: Partial<AccountProfile>): Promise<void> {
  try {
    const accounts = await getAllAccounts();
    const idx = accounts.findIndex((a) => a.id === id);
    if (idx !== -1) {
      accounts[idx] = { ...accounts[idx], ...partial };
      await saveAllAccounts(accounts);
    }
  } catch (e) {
    console.error('Failed to update account', e);
  }
}

export async function deleteAccount(id: string): Promise<void> {
  try {
    const accounts = await getAllAccounts();
    const filtered = accounts.filter((a) => a.id !== id);
    await saveAllAccounts(filtered);
    // Clear account-namespaced data
    await AsyncStorage.multiRemove([
      accountTasksKey(id),
      accountGoalsKey(id),
      accountSessionsKey(id),
    ]);
  } catch (e) {
    console.error('Failed to delete account', e);
  }
}

// ─── Account-namespaced Tasks/Goals/Sessions ──────────────────────────────────

export async function getAccountTasks(accountId: string): Promise<TaskItem[]> {
  try {
    const raw = await AsyncStorage.getItem(accountTasksKey(accountId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveAccountTasks(accountId: string, tasks: TaskItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(accountTasksKey(accountId), JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save account tasks', e);
  }
}

export async function getAccountGoals(accountId: string): Promise<GoalItem[]> {
  try {
    const raw = await AsyncStorage.getItem(accountGoalsKey(accountId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveAccountGoals(accountId: string, goals: GoalItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(accountGoalsKey(accountId), JSON.stringify(goals));
  } catch (e) {
    console.error('Failed to save account goals', e);
  }
}

// ─── Group Data ───────────────────────────────────────────────────────────────

export async function getAllGroups(): Promise<GroupData[]> {
  try {
    const raw = await AsyncStorage.getItem(GROUPS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function getGroupData(code: string): Promise<GroupData | null> {
  try {
    const groups = await getAllGroups();
    return groups.find((g) => g.code === code) || null;
  } catch {
    return null;
  }
}

export async function saveGroupData(group: GroupData): Promise<void> {
  try {
    const groups = await getAllGroups();
    const idx = groups.findIndex((g) => g.code === group.code);
    if (idx !== -1) {
      groups[idx] = group;
    } else {
      groups.push(group);
    }
    await AsyncStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
  } catch (e) {
    console.error('Failed to save group data', e);
  }
}

// ─── Legacy API (for backward compatibility & active account sync) ───────────

export async function getUser(): Promise<UserProfile> {
  try {
    const active = await getActiveAccount();
    const currentWeek = getWeekIdentifier();
    if (active) {
      let weeklyXp = active.weeklyXp ?? 0;
      let resetDate = active.weeklyResetDate ?? currentWeek;
      if (resetDate !== currentWeek) {
        weeklyXp = 0;
        resetDate = currentWeek;
        await updateAccount(active.id, { weeklyXp: 0, weeklyResetDate: currentWeek });
      }

      return {
        name: active.name,
        groupCode: active.groupCode,
        groupName: active.groupName,
        role: active.role,
        xp: active.xp,
        weeklyXp,
        weeklyResetDate: resetDate,
        streak: active.streak,
        rank: active.rank,
        emergencyTokens: active.emergencyTokens,
        penaltyMultiplier: active.penaltyMultiplier,
        lastMissedDays: active.lastMissedDays,
        theme: active.theme,
        offlineMode: active.offlineMode,
        smartRemindersEnabled: active.smartRemindersEnabled,
      };
    }
    const raw = await AsyncStorage.getItem(USER_KEY);
    if (raw) {
      const u: UserProfile = JSON.parse(raw);
      if (u.weeklyResetDate !== currentWeek) {
        u.weeklyXp = 0;
        u.weeklyResetDate = currentWeek;
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(u));
      }
      return u;
    }
    return defaultUser;
  } catch (e) {
    return defaultUser;
  }
}

export async function saveUser(user: UserProfile): Promise<void> {
  try {
    const currentWeek = getWeekIdentifier();
    const userToSave: UserProfile = {
      ...user,
      weeklyResetDate: user.weeklyResetDate || currentWeek,
      weeklyXp: user.weeklyXp !== undefined ? user.weeklyXp : Math.min(user.xp, 350),
    };

    await AsyncStorage.setItem(USER_KEY, JSON.stringify(userToSave));
    const activeId = await getActiveAccountId();
    if (activeId) {
      await updateAccount(activeId, {
        name: userToSave.name,
        groupCode: userToSave.groupCode,
        groupName: userToSave.groupName,
        role: userToSave.role,
        xp: userToSave.xp,
        weeklyXp: userToSave.weeklyXp,
        weeklyResetDate: userToSave.weeklyResetDate,
        streak: userToSave.streak,
        rank: userToSave.rank,
        emergencyTokens: userToSave.emergencyTokens,
        penaltyMultiplier: userToSave.penaltyMultiplier,
        lastMissedDays: userToSave.lastMissedDays,
        theme: userToSave.theme,
        offlineMode: userToSave.offlineMode,
        smartRemindersEnabled: userToSave.smartRemindersEnabled,
      });

      if (userToSave.groupCode) {
        const group = await getGroupData(userToSave.groupCode);
        if (group) {
          const mIdx = group.members.findIndex((m) => m.accountId === activeId);
          if (mIdx !== -1) {
            group.members[mIdx] = {
              ...group.members[mIdx],
              name: userToSave.name,
              xp: userToSave.xp,
              weeklyXp: userToSave.weeklyXp,
              streak: userToSave.streak,
              rank: userToSave.rank,
              lastActive: new Date().toISOString(),
            };
            await saveGroupData(group);
          }
        }
      }
    }
  } catch (e) {
    console.error('Failed to save user', e);
  }
}

export async function getTasks(): Promise<TaskItem[]> {
  try {
    const activeId = await getActiveAccountId();
    if (activeId) {
      const raw = await AsyncStorage.getItem(accountTasksKey(activeId));
      if (raw !== null) {
        return JSON.parse(raw);
      }
      return [];
    }
    const raw = await AsyncStorage.getItem(TASKS_KEY);
    return raw ? JSON.parse(raw) : defaultTasks;
  } catch (e) {
    return defaultTasks;
  }
}

export async function saveTasks(tasks: TaskItem[]): Promise<void> {
  try {
    const activeId = await getActiveAccountId();
    if (activeId) {
      await AsyncStorage.setItem(accountTasksKey(activeId), JSON.stringify(tasks));
      const active = await getActiveAccount();
      if (active?.groupCode) {
        const group = await getGroupData(active.groupCode);
        if (group) {
          const mIdx = group.members.findIndex((m) => m.accountId === activeId);
          if (mIdx !== -1) {
            const completedCount = tasks.filter((t) => t.completed).length;
            group.members[mIdx].tasksCompletedToday = completedCount;
            group.members[mIdx].tasksTotalToday = tasks.length;
            await saveGroupData(group);
          }
        }
      }
    } else {
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    }
  } catch (e) {
    console.error('Failed to save tasks', e);
  }
}

export async function getGoals(): Promise<GoalItem[]> {
  try {
    const activeId = await getActiveAccountId();
    if (activeId) {
      const raw = await AsyncStorage.getItem(accountGoalsKey(activeId));
      if (raw !== null) {
        return JSON.parse(raw);
      }
      return [];
    }
    const raw = await AsyncStorage.getItem(GOALS_KEY);
    return raw ? JSON.parse(raw) : defaultGoals;
  } catch (e) {
    return defaultGoals;
  }
}

export async function saveGoals(goals: GoalItem[]): Promise<void> {
  try {
    const activeId = await getActiveAccountId();
    if (activeId) {
      await AsyncStorage.setItem(accountGoalsKey(activeId), JSON.stringify(goals));
    } else {
      await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(goals));
    }
  } catch (e) {
    console.error('Failed to save goals', e);
  }
}

export async function getSessions(): Promise<StudySessionLog[]> {
  try {
    const raw = await AsyncStorage.getItem(SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export async function saveSession(session: StudySessionLog): Promise<void> {
  try {
    const sessions = await getSessions();
    sessions.unshift(session);
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save session', e);
  }
}

export async function getGeminiKey(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(API_KEY_STORAGE);
  } catch (e) {
    return null;
  }
}

export async function saveGeminiKey(key: string): Promise<void> {
  try {
    await AsyncStorage.setItem(API_KEY_STORAGE, key);
  } catch (e) {
    console.error('Failed to save gemini key', e);
  }
}
