import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { getAppTheme } from '../theme';
import { TaskItem, UserProfile, CoachDiagnosis, TabType } from '../types';
import { analyzeDailyPerformanceAndGiveSolutions } from '../services/gemini';

interface Props {
  user: UserProfile;
  tasks: TaskItem[];
  timeLeftHours: number;
  onNavigate: (tab: TabType) => void;
}

export default function TopCoachWidget({ user, tasks, timeLeftHours, onNavigate }: Props) {
  const theme = getAppTheme(user.theme);
  const [diagnosis, setDiagnosis] = useState<CoachDiagnosis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Run initial auto-analysis
  useEffect(() => {
    analyzeDailyPerformanceAndGiveSolutions(tasks, user.streak, timeLeftHours).then(setDiagnosis);
  }, [tasks.length, tasks.filter((t) => t.completed).length, timeLeftHours]);

  const handleDeepAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const res = await analyzeDailyPerformanceAndGiveSolutions(tasks, user.streak, timeLeftHours);
      setDiagnosis(res);
      setIsExpanded(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const completed = tasks.filter((t) => t.completed).length;
  const total = tasks.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const getStatusColor = (status?: string) => {
    if (status === 'CRITICAL LOCKOUT RISK') return '#EF4444';
    if (status === 'BEHIND SCHEDULE') return '#F59E0B';
    return theme.accent;
  };

  const statusColor = getStatusColor(diagnosis?.status);

  return (
    <View
      style={[
        styles.widgetBox,
        {
          backgroundColor: theme.bgCard,
          borderColor: `${theme.accent}35`,
        },
      ]}
    >
      {/* Top Banner Row */}
      <View style={styles.topRow}>
        <View style={styles.coachBadge}>
          <View style={[styles.liveDot, { backgroundColor: statusColor }]} />
          <Text style={styles.coachTitle}>AI COACH VANCE</Text>
          <View
            style={[
              styles.statusPill,
              { backgroundColor: `${statusColor}18`, borderColor: `${statusColor}60` },
            ]}
          >
            <Text style={[styles.statusPillText, { color: statusColor }]}>
              {diagnosis?.status || 'TACTICAL ACTIVE'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.expandToggle}
          onPress={() => setIsExpanded(!isExpanded)}
          activeOpacity={0.7}
        >
          <Text style={[styles.expandToggleText, { color: theme.secondary }]}>
            {isExpanded ? 'LESS ▲' : 'TACTICAL ADVICE ▼'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Diagnosis Summary */}
      <Text style={styles.diagnosisText}>
        {total === 0
          ? "Protocol initialized. No daily mandates scheduled yet. Add your targets to begin today's discipline tracking."
          : diagnosis?.analysis ||
            `Current pace: ${completed}/${total} mandates (${pct}%). Cutoff deadline is 00:00.`}
      </Text>

      {/* Immediate Next Action Banner */}
      {total > 0 && diagnosis?.immediateAction && (
        <View
          style={[
            styles.immediateBox,
            {
              backgroundColor: theme.accentTint,
              borderColor: theme.accent,
            },
          ]}
        >
          <Text style={[styles.immediateLabel, { color: theme.accent }]}>
            NEXT MANDATE DIRECTIVE:
          </Text>
          <Text style={styles.immediateText}>⚡ {diagnosis.immediateAction}</Text>
        </View>
      )}

      {/* Direct Quick Action Buttons - Always Visible & Fully Unlocked */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[
            styles.btnFocus,
            {
              backgroundColor: theme.accentTint,
              borderColor: `${theme.accent}60`,
            },
          ]}
          onPress={() => onNavigate('focus_mode')}
          activeOpacity={0.8}
        >
          <Text style={[styles.btnFocusText, { color: theme.accent }]}>
            🎯 START FOCUS LOCKOUT
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.btnChat,
            {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.12)',
            },
          ]}
          onPress={() => onNavigate('coach')}
          activeOpacity={0.8}
        >
          <Text style={styles.btnChatText}>💬 CHAT WITH COACH</Text>
        </TouchableOpacity>
      </View>

      {/* Expanded Solutions View */}
      {isExpanded && diagnosis?.solutions && (
        <View style={[styles.solutionsContainer, { borderColor: `${theme.accent}20` }]}>
          <Text style={[styles.solutionsHeader, { color: theme.secondary }]}>
            TACTICAL SOLUTIONS TO BEAT THE CUTOFF:
          </Text>
          {diagnosis.solutions.map((sol, idx) => (
            <View key={idx} style={styles.solutionItem}>
              <View
                style={[
                  styles.solNumBadge,
                  { backgroundColor: theme.accentTint, borderColor: theme.accent },
                ]}
              >
                <Text style={[styles.solNumText, { color: theme.accent }]}>{idx + 1}</Text>
              </View>
              <Text style={styles.solDesc}>{sol}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Footer Analyze & Solve Button */}
      <TouchableOpacity
        style={[
          styles.btnAnalyze,
          { backgroundColor: theme.accent },
          isAnalyzing && { opacity: 0.7 },
        ]}
        onPress={handleDeepAnalyze}
        disabled={isAnalyzing}
        activeOpacity={0.85}
      >
        {isAnalyzing ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ActivityIndicator size="small" color="#08080B" />
            <Text style={styles.btnAnalyzeText}>ANALYZING PERFORMANCE FRICTION...</Text>
          </View>
        ) : (
          <Text style={styles.btnAnalyzeText}>⚡ DEEP AI ANALYSIS & TACTICAL SOLUTIONS</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  widgetBox: {
    borderRadius: 22,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  coachBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  coachTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  statusPill: {
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  expandToggle: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  expandToggleText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  diagnosisText: {
    color: '#E5E7EB',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
  immediateBox: {
    borderLeftWidth: 3,
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  immediateLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  immediateText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  solutionsContainer: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  solutionsHeader: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  solutionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  solNumBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  solNumText: {
    fontSize: 10,
    fontWeight: '900',
  },
  solDesc: {
    flex: 1,
    color: '#D1D5DB',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  btnFocus: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
  },
  btnFocusText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  btnChat: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
  },
  btnChatText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  btnAnalyze: {
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  btnAnalyzeText: {
    color: '#08080B',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
