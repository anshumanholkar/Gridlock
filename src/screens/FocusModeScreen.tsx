import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme';
import { TabType } from '../types';

interface Props {
  onExit: () => void;
}

export default function FocusModeScreen({ onExit }: Props) {
  const [seconds, setSeconds] = useState(25 * 60); // 25m Pomodoro default
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTimer = (total: number) => {
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.badgePill}>
        <Text style={styles.badgeText}>DO NOT DISTURB · LOCKOUT ACTIVE</Text>
      </View>

      <Text style={styles.timer}>{formatTimer(seconds)}</Text>
      <Text style={styles.subtext}>ALL SOCIAL MEDIA & DISTRACTIONS SHUT DOWN</Text>

      <View style={styles.quoteBox}>
        <Text style={styles.quote}>"Discipline is choosing between what you want now and what you want most."</Text>
      </View>

      <View style={styles.controlsRow}>
        <TouchableOpacity style={styles.btnToggle} onPress={() => setIsRunning(!isRunning)}>
          <Text style={styles.btnToggleText}>{isRunning ? 'PAUSE' : 'RESUME'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnExit} onPress={onExit}>
          <Text style={styles.btnExitText}>END FOCUS SESSION</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090A07', justifyContent: 'center', alignItems: 'center', padding: 24 },
  badgePill: { backgroundColor: 'rgba(229, 169, 60, 0.15)', borderWidth: 1, borderColor: COLORS.accent, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginBottom: 20 },
  badgeText: { color: COLORS.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  timer: { fontSize: 72, fontWeight: '900', color: '#fff', fontFamily: 'Courier', letterSpacing: 4 },
  subtext: { color: COLORS.secondary, fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginTop: 12 },
  quoteBox: { marginTop: 40, paddingHorizontal: 20 },
  quote: { color: COLORS.textDim, fontSize: 13, fontStyle: 'italic', textAlign: 'center', lineHeight: 20 },
  controlsRow: { flexDirection: 'row', gap: 14, marginTop: 50 },
  btnToggle: { backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: 'rgba(229, 169, 60, 0.3)', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
  btnToggleText: { color: COLORS.accent, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  btnExit: { backgroundColor: COLORS.accent, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
  btnExitText: { color: COLORS.primaryText, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
});
