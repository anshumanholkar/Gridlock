import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { COLORS } from '../theme';
import { UserProfile, TaskItem } from '../types';

interface Props {
  user: UserProfile;
  tasks: TaskItem[];
}

export default function PhoneWidgetPreview({ user, tasks }: Props) {
  const [widgetSize, setWidgetSize] = useState<'compact' | 'wide' | 'lockscreen'>('wide');

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = Math.max(tasks.length, 1);
  const completionPct = Math.round((completedCount / totalCount) * 100);
  const nextPendingTask = tasks.find((t) => !t.completed) || tasks[0];

  const handlePinWidget = () => {
    Alert.alert(
      'Widget Ready',
      'Gridlock Widget template compiled. To display on your device home screen:\n\n1. Long-press home screen\n2. Tap "+" or Widgets\n3. Select GRIDLOCK to add this daily progress ring.'
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.badgePill}>
          <Text style={styles.badgeText}>PHONE HOME SCREEN</Text>
        </View>
        {/* Widget Size Selector */}
        <View style={styles.sizeTabs}>
          {(['compact', 'wide', 'lockscreen'] as const).map((size) => (
            <TouchableOpacity
              key={size}
              style={[styles.sizeTab, widgetSize === size && styles.sizeTabActive]}
              onPress={() => setWidgetSize(size)}
            >
              <Text style={[styles.sizeTabText, widgetSize === size && styles.sizeTabTextActive]}>
                {size === 'compact' ? '2x2' : size === 'wide' ? '4x2' : 'LOCK'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={styles.title}>LIVE WIDGET COMPILATION</Text>

      {/* Simulated Phone Widget Frame */}
      <View style={styles.widgetCard}>
        {widgetSize === 'wide' && (
          <View style={styles.wideLayout}>
            {/* Left Gauge Column */}
            <View style={styles.gaugeCol}>
              <View style={styles.circularSim}>
                <Text style={styles.gaugePct}>{completionPct}%</Text>
                <Text style={styles.gaugeSub}>QUOTA</Text>
              </View>
              <View style={styles.streakTag}>
                <Text style={styles.streakText}>🔥 {user.streak}D STREAK</Text>
              </View>
            </View>

            {/* Right Information Column */}
            <View style={styles.infoCol}>
              <View style={styles.widgetHeaderRow}>
                <Text style={styles.widgetBrand}>GRIDLOCK HQ</Text>
                <View style={styles.liveDot} />
                <Text style={styles.cutoffMini}>00:00 CUTOFF</Text>
              </View>

              <Text style={styles.taskLabel}>UP NEXT MANDATE:</Text>
              <Text style={styles.taskTitle} numberOfLines={1}>
                {nextPendingTask ? nextPendingTask.title : 'All Quotas Met'}
              </Text>

              <View style={styles.widgetStatsBar}>
                <View>
                  <Text style={styles.statMiniLabel}>TASKS DONE</Text>
                  <Text style={styles.statMiniVal}>
                    {completedCount}/{totalCount}
                  </Text>
                </View>
                <View style={styles.vDivider} />
                <View>
                  <Text style={styles.statMiniLabel}>XP TODAY</Text>
                  <Text style={styles.statMiniVal}>+{user.xp}</Text>
                </View>
                <View style={styles.vDivider} />
                <View>
                  <Text style={styles.statMiniLabel}>STATUS</Text>
                  <Text style={[styles.statMiniVal, { color: COLORS.accent }]}>PROBATION SAFE</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {widgetSize === 'compact' && (
          <View style={styles.compactLayout}>
            <View style={styles.compactTop}>
              <Text style={styles.widgetBrand}>GRIDLOCK</Text>
              <View style={styles.streakTagSmall}>
                <Text style={styles.streakTextSmall}>🔥 {user.streak}D</Text>
              </View>
            </View>

            <View style={styles.circularSimCompact}>
              <Text style={styles.gaugePctLarge}>{completionPct}%</Text>
              <Text style={styles.gaugeSub}>DONE</Text>
            </View>

            <Text style={styles.compactTask} numberOfLines={1}>
              {nextPendingTask ? nextPendingTask.title : 'Ready'}
            </Text>
          </View>
        )}

        {widgetSize === 'lockscreen' && (
          <View style={styles.lockscreenLayout}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 16 }}>⚡</Text>
              <Text style={styles.lockBrand}>GRIDLOCK</Text>
              <Text style={styles.lockDivider}>|</Text>
              <Text style={styles.lockPct}>{completionPct}% COMPLETE</Text>
            </View>
            <Text style={styles.lockCutoff}>00:00 LOCKOUT</Text>
          </View>
        )}
      </View>

      {/* Button to pin widget */}
      <TouchableOpacity style={styles.btnPin} onPress={handlePinWidget}>
        <Text style={styles.btnPinText}>📱 SYNC WIDGET TO PHONE OS</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bgCardSolid,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.18)',
    padding: 16,
    marginBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgePill: {
    backgroundColor: 'rgba(229, 169, 60, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    color: COLORS.accent,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  sizeTabs: {
    flexDirection: 'row',
    backgroundColor: '#131510',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.12)',
  },
  sizeTab: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sizeTabActive: {
    backgroundColor: COLORS.accent,
  },
  sizeTabText: {
    color: COLORS.textDim,
    fontSize: 9,
    fontWeight: '800',
  },
  sizeTabTextActive: {
    color: COLORS.primaryText,
    fontWeight: '900',
  },
  title: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  widgetCard: {
    backgroundColor: '#12140F',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(229, 169, 60, 0.28)',
    padding: 14,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  wideLayout: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  gaugeCol: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularSim: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 4,
    borderColor: COLORS.accent,
    borderTopColor: 'rgba(229, 169, 60, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#161911',
  },
  gaugePct: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  gaugeSub: {
    color: COLORS.secondary,
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 1,
  },
  streakTag: {
    marginTop: 6,
    backgroundColor: 'rgba(229, 169, 60, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  streakText: {
    color: COLORS.accent,
    fontSize: 9,
    fontWeight: '900',
  },
  infoCol: {
    flex: 1,
  },
  widgetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  widgetBrand: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.accent,
  },
  cutoffMini: {
    color: COLORS.secondary,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  taskLabel: {
    color: COLORS.textMuted,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  taskTitle: {
    color: '#F4F5F0',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 1,
  },
  widgetStatsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.1)',
  },
  statMiniLabel: {
    color: COLORS.textMuted,
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statMiniVal: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    marginTop: 1,
  },
  vDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(229, 169, 60, 0.15)',
  },
  compactLayout: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  compactTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  streakTagSmall: {
    backgroundColor: 'rgba(229, 169, 60, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  streakTextSmall: {
    color: COLORS.accent,
    fontSize: 9,
    fontWeight: '900',
  },
  circularSimCompact: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 4,
    borderColor: COLORS.accent,
    borderLeftColor: 'rgba(229, 169, 60, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
    backgroundColor: '#161911',
  },
  gaugePctLarge: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
  },
  compactTask: {
    color: COLORS.textDim,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'center',
  },
  lockscreenLayout: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  lockBrand: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  lockDivider: {
    color: 'rgba(229, 169, 60, 0.3)',
    fontSize: 11,
  },
  lockPct: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: '900',
  },
  lockCutoff: {
    color: COLORS.secondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  btnPin: {
    marginTop: 10,
    backgroundColor: 'rgba(229, 169, 60, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.25)',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  btnPinText: {
    color: COLORS.accent,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
});
