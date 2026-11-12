import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS } from '../theme';
import { TabType, UserProfile, TaskItem } from '../types';
import { getGeminiKey, getTasks } from '../services/storage';

interface Message {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string;
}

interface Props {
  user: UserProfile;
  onNavigate: (tab: TabType) => void;
}

export default function CoachScreen({ user, onNavigate }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'coach',
      text: `Listen up, ${user.name}. You are on day ${user.streak} of your streak with ${user.xp} Total XP (${user.weeklyXp ?? 0} XP this week). What is the friction holding you back right now?`,
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollViewRef = useRef<any>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isThinking]);

  const generateSmartCoachReply = (
    input: string,
    allTasks: TaskItem[]
  ): string => {
    const lower = input.toLowerCase();
    const pendingList = allTasks.filter((t) => !t.completed);
    const topMandate =
      pendingList.find((t) => t.priority === 'High')?.title ||
      pendingList[0]?.title ||
      'your next priority mandate';

    // 1. Fatigue / Exhaustion / Low Energy
    if (
      lower.includes('tired') ||
      lower.includes('exhausted') ||
      lower.includes('sleepy') ||
      lower.includes('fatigue') ||
      lower.includes('no energy') ||
      lower.includes('drained')
    ) {
      return (
        `DIAGNOSIS: Your dopamine and central nervous system are fatigued, not your biological capacity.\n\n` +
        `IMMEDIATE PROTOCOL:\n` +
        `1. Splash cold water on your eyes and face for 30 seconds.\n` +
        `2. Drink 500ml cold water with a pinch of salt.\n` +
        `3. Do not attempt all ${pendingList.length} mandates at once. Attack ONLY: "${topMandate}" for a timed 15-minute sprint.\n\n` +
        `CIRCUIT-BREAKER: Momentum cures fatigue. Once the 15-minute timer rings, decide whether to continue. 90% of the time, the resistance disappears.`
      );
    }

    // 2. Distraction / Phone / Social Media / Reels
    if (
      lower.includes('distract') ||
      lower.includes('phone') ||
      lower.includes('scroll') ||
      lower.includes('instagram') ||
      lower.includes('reels') ||
      lower.includes('youtube') ||
      lower.includes('tiktok') ||
      lower.includes('x') ||
      lower.includes('twitter')
    ) {
      return (
        `DIAGNOSIS: Cheap algorithmically engineered dopamine is siphoning your executive focus.\n\n` +
        `TACTICAL COUNTERMEASURE:\n` +
        `1. Physically place your phone in another room or inside a drawer.\n` +
        `2. Tap 'START FOCUS LOCKOUT' in the HQ widget to lock down distractions.\n` +
        `3. Open your workspace and execute: "${topMandate}".\n\n` +
        `HARD RULE: Every minute spent scrolling is stolen from your future autonomy. Cut the feed now.`
      );
    }

    // 3. Procrastination / Don't feel like it / Lazy / Lack of Motivation
    if (
      lower.includes('procrastinat') ||
      lower.includes('lazy') ||
      lower.includes('motivation') ||
      lower.includes('feel like') ||
      lower.includes('delay') ||
      lower.includes('tomorrow') ||
      lower.includes('later')
    ) {
      return (
        `DIAGNOSIS: Motivation is an emotional trap. High performers operate on discipline systems, never transient feelings.\n\n` +
        `EXECUTION DIRECTIVE:\n` +
        `1. Lower the barrier to entry to zero: Commit to doing just 3 minutes of work on "${topMandate}".\n` +
        `2. Count down 5-4-3-2-1 and touch the physical tool (keyboard, barbell, book) before your brain manufactures another excuse.\n` +
        `3. You have ${pendingList.length} unverified mandates pending before the 00:00 cutoff. Missing today escalates tomorrow's penalty by +25%.\n\n` +
        `LOCK IN: Start right now.`
      );
    }

    // 4. Trading / Losses / Market Tilt / Panic
    if (
      lower.includes('trade') ||
      lower.includes('trading') ||
      lower.includes('market') ||
      lower.includes('loss') ||
      lower.includes('lost money') ||
      lower.includes('fomo') ||
      lower.includes('pnl')
    ) {
      return (
        `DIAGNOSIS: You are experiencing tilt and emotional friction from financial variance.\n\n` +
        `SYSTEMATIC PROTOCOL:\n` +
        `1. Close your broker terminal immediately. Walk away from all price action screens for at least 60 minutes.\n` +
        `2. Review your risk-of-ruin formula: A single trade must never exceed 1% of equity. If you broke this, accept the lesson.\n` +
        `3. Do NOT revenge trade. The market is not personal; it is a probability machine.\n\n` +
        `NON-NEGOTIABLE: Log the loss in your trade journal, note the exact entry invalidation mistake, and lock out trading for the day.`
      );
    }

    // 5. Study / Retention / Forgetting / Exam Anxiety
    if (
      lower.includes('study') ||
      lower.includes('exam') ||
      lower.includes('retain') ||
      lower.includes('memor') ||
      lower.includes('forget') ||
      lower.includes('understand') ||
      lower.includes('confused')
    ) {
      return (
        `DIAGNOSIS: Passive reading produces an illusion of competence. Only active retrieval creates enduring neural pathways.\n\n` +
        `COGNITIVE PROTOCOL:\n` +
        `1. Close your notes. Take a blank sheet of paper and write out everything you know from memory (Feynman Technique).\n` +
        `2. Jump into the 'Train' tab -> 'Playground Quiz' to test recall under timer pressure.\n` +
        `3. Focus 80% of your remaining study time on testing yourself, only 20% on re-reading.\n\n` +
        `DIRECTIVE: Target your next study mandate: "${topMandate}". Execute one Pomodoro cycle.`
      );
    }

    // 6. Fitness / Soreness / Skipping Gym / Nutrition
    if (
      lower.includes('workout') ||
      lower.includes('gym') ||
      lower.includes('sore') ||
      lower.includes('exercise') ||
      lower.includes('diet') ||
      lower.includes('eat') ||
      lower.includes('protein') ||
      lower.includes('lift')
    ) {
      return (
        `DIAGNOSIS: Distinguish between systemic fatigue, normal DOMS (soreness), and acute joint pain.\n\n` +
        `PHYSICAL PROTOCOL:\n` +
        `1. If simply sore: Put on workout clothes and do 5 minutes of dynamic mobility. Soreness dissipates once blood pools in the muscle.\n` +
        `2. If exhausted: Perform a recovery session (brisk 30-min walk, foam rolling, 1.8g/kg protein intake).\n` +
        `3. Never skip the discipline habit. Showing up for 20 minutes is 1000% better than staying on the couch.\n\n` +
        `ACTION: Complete today's physical quota and log proof.`
      );
    }

    // 7. Time Pressure / Overwhelm / "I don't have enough time"
    if (
      lower.includes('time') ||
      lower.includes('busy') ||
      lower.includes('too much') ||
      lower.includes('overwhelm') ||
      lower.includes('deadline') ||
      lower.includes('running out')
    ) {
      return (
        `DIAGNOSIS: Overwhelm occurs when you treat multiple tasks as simultaneous emergencies. Execution is strictly sequential.\n\n` +
        `TRIAGE PROTOCOL:\n` +
        `1. Ruthlessly archive secondary tasks. Only 1 task exists in your reality right now: "${topMandate}".\n` +
        `2. Set a 25-minute countdown timer. Full immersion.\n` +
        `3. You have plenty of time until the 00:00 midnight lockout if you eliminate micro-distractions.\n\n` +
        `RULE: Protect your streak of ${user.streak} days. Win the hour, win the day.`
      );
    }

    // 8. Positive Check-in / "I did it" / "Finished task"
    if (
      lower.includes('done') ||
      lower.includes('finished') ||
      lower.includes('completed') ||
      lower.includes('did it') ||
      lower.includes('crushed it')
    ) {
      return (
        `OUTCOME ACKNOWLEDGED: Good execution, Operative ${user.name}.\n\n` +
        `NEXT VECTOR:\n` +
        `1. Open HQ and tap 'SUBMIT PROOF' to lock in your verified audit and claim your +100 XP.\n` +
        `2. Do not celebrate prematurely or drop your guard. Total XP is ${user.xp}; your weekly score is ${user.weeklyXp ?? 0} XP.\n` +
        `3. Immediate next target: "${pendingList[1]?.title || 'Review daily quota'}". Maintain forward velocity.`
      );
    }

    // 9. Conversational Context-Aware General Problem Solver
    return (
      `OPERATIVE ANALYSIS FOR: "${input}"\n\n` +
      `TACTICAL BREAKDOWN:\n` +
      `1. Root Cause: Friction arises when your mental model resists the required physical effort.\n` +
      `2. Immediate Action: Prioritize mandate "${topMandate}". Give it 20 minutes of uninterrupted focus.\n` +
      `3. Accountability Standard: You are on day ${user.streak} of your streak with ${user.weeklyXp ?? 0} Weekly Points. Zero unverified quotas before 00:00.\n\n` +
      `Execute your next micro-mandate and report back when finished.`
    );
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    const userMsg: Message = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: 'Now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    try {
      const apiKey = await getGeminiKey();
      const currentTasks = await getTasks();
      const pendingList = currentTasks.filter((t) => !t.completed);
      const topMandate =
        pendingList.find((t) => t.priority === 'High')?.title ||
        pendingList[0]?.title ||
        'primary task';

      if (!apiKey) {
        setTimeout(() => {
          setIsThinking(false);
          const reply = generateSmartCoachReply(userText, currentTasks);
          setMessages((prev) => [
            ...prev,
            {
              id: `c_${Date.now()}`,
              sender: 'coach',
              text: reply,
              timestamp: 'Now',
            },
          ]);
        }, 600);
        return;
      }

      // Live Gemini API with conversation history & problem-understanding instructions
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const chatParts = messages.slice(-4).map((m) => ({
        text: `${m.sender === 'user' ? 'Operative' : 'Coach Vance'}: ${m.text}`,
      }));
      chatParts.push({
        text: `Operative: ${userText}\n\n[Context: Operative ${user.name}, Streak ${user.streak}D, Top Mandate: "${topMandate}", Pending: ${pendingList.length} tasks].
Respond as Coach Vance. Understand their EXACT problem, give a blunt root cause diagnosis, and prescribe a concrete 3-step action plan to execute right now. Format with headers DIAGNOSIS, PROTOCOL, RULE.`,
      });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: chatParts }],
          generationConfig: { temperature: 0.5, maxOutputTokens: 500 },
        }),
      });

      const data = await response.json();
      const reply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        generateSmartCoachReply(userText, currentTasks);

      setMessages((prev) => [
        ...prev,
        {
          id: `c_${Date.now()}`,
          sender: 'coach',
          text: reply,
          timestamp: 'Now',
        },
      ]);
    } catch {
      const currentTasks = await getTasks();
      const reply = generateSmartCoachReply(userText, currentTasks);

      setMessages((prev) => [
        ...prev,
        {
          id: `c_${Date.now()}`,
          sender: 'coach',
          text: reply,
          timestamp: 'Now',
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 85}
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => onNavigate('dashboard')}>
            <Text style={styles.backBtnText}>← BACK TO HQ</Text>
          </TouchableOpacity>
          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>AI DISCIPLINE ENFORCER</Text>
          </View>
        </View>
        <Text style={styles.title}>COACH VANCE CHAT</Text>
        <Text style={styles.subtitle}>Direct, ruthless tactical guidance calibrated to your performance.</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.chatArea}
        contentContainerStyle={{ paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <View
              key={m.id}
              style={[
                styles.bubbleWrap,
                isUser ? styles.bubbleWrapUser : styles.bubbleWrapCoach,
              ]}
            >
              <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleCoach]}>
                <Text style={styles.bubbleSender}>{isUser ? 'YOU' : 'COACH VANCE'}</Text>
                <Text style={[styles.bubbleText, isUser && { color: '#040711' }]}>{m.text}</Text>
              </View>
            </View>
          );
        })}
        {isThinking && (
          <View style={styles.thinkingBox}>
            <ActivityIndicator size="small" color={COLORS.accent} />
            <Text style={styles.thinkingText}>Coach Vance is analyzing your discipline vectors...</Text>
          </View>
        )}
      </ScrollView>

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="State your fatigue, excuse, or friction..."
          placeholderTextColor={COLORS.textMuted}
          onSubmitEditing={handleSendMessage}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.btnSend, !inputText.trim() && { opacity: 0.5 }]}
          onPress={handleSendMessage}
          disabled={isThinking || !inputText.trim()}
        >
          <Text style={styles.btnSendText}>SEND</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { padding: 16, borderBottomWidth: 1, borderColor: 'rgba(229, 169, 60, 0.12)' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  backBtn: {
    backgroundColor: 'rgba(229, 169, 60, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  backBtnText: { color: COLORS.accent, fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  badgePill: {
    backgroundColor: 'rgba(229, 169, 60, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: { color: COLORS.accent, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  title: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 0.8 },
  subtitle: { color: COLORS.secondary, fontSize: 11, marginTop: 2 },
  chatArea: { flex: 1, padding: 16 },
  bubbleWrap: { marginVertical: 6, flexDirection: 'row' },
  bubbleWrapUser: { justifyContent: 'flex-end' },
  bubbleWrapCoach: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '85%', padding: 14, borderRadius: 16 },
  bubbleCoach: { backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: 'rgba(229, 169, 60, 0.2)' },
  bubbleUser: { backgroundColor: COLORS.accent },
  bubbleSender: { fontSize: 8, fontWeight: '900', letterSpacing: 1, marginBottom: 4, color: COLORS.secondary },
  bubbleText: { color: '#F4F5F0', fontSize: 13, lineHeight: 19, fontWeight: '600' },
  thinkingBox: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8 },
  thinkingText: { color: COLORS.textDim, fontSize: 11, fontStyle: 'italic' },
  inputBar: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.15)',
    backgroundColor: COLORS.bgCardSolid,
    gap: 10,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.bgInput,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 13,
  },
  btnSend: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 18,
    paddingVertical: 12,
    justifyContent: 'center',
    borderRadius: 12,
  },
  btnSendText: { color: COLORS.primaryText, fontSize: 11, fontWeight: '900', letterSpacing: 1 },
});
