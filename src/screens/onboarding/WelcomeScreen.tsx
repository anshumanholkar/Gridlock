import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { COLORS } from '../../theme';

const { width } = Dimensions.get('window');

interface Props {
  onCreateAccount: () => void;
  onSignIn: () => void;
}

export default function WelcomeScreen({ onCreateAccount, onSignIn }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 60, friction: 8 }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Background grid lines */}
      <View style={styles.gridOverlay} pointerEvents="none">
        {[...Array(6)].map((_, i) => (
          <View key={i} style={[styles.gridLine, { left: (width / 6) * i }]} />
        ))}
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Logo */}
        <Animated.View style={[styles.logoWrap, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.hexOuter}>
            <View style={styles.hexInner}>
              <Text style={styles.hexLetter}>G</Text>
            </View>
          </View>
        </Animated.View>

        <Text style={styles.brandName}>GRIDLOCK</Text>
        <Text style={styles.tagline}>PLAN. FOCUS. GROW.</Text>

        <View style={styles.divider} />

        <Text style={styles.subtitle}>
          The elite accountability system for{'\n'}high-performance individuals.
        </Text>

        <View style={styles.pillRow}>
          {['🔥 Streaks', '⚡ XP System', '🤝 Groups', '🤖 AI Coach'].map((p) => (
            <View key={p} style={styles.pill}>
              <Text style={styles.pillText}>{p}</Text>
            </View>
          ))}
        </View>

        <View style={styles.btnWrap}>
          <TouchableOpacity style={styles.primaryBtn} onPress={onCreateAccount} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>⚡ CREATE NEW ACCOUNT</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={onSignIn} activeOpacity={0.85}>
            <Text style={styles.secondaryBtnText}>SIGN IN TO EXISTING ACCOUNT</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footNote}>Max 3 accounts per device</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  gridLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(229,169,60,0.05)',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 28,
    width: '100%',
  },
  logoWrap: {
    marginBottom: 20,
  },
  hexOuter: {
    width: 90,
    height: 90,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(229,169,60,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hexInner: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: '#1C1914',
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hexLetter: {
    color: COLORS.accent,
    fontSize: 32,
    fontWeight: '900',
  },
  brandName: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 6,
    marginBottom: 4,
  },
  tagline: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 4,
    marginBottom: 20,
  },
  divider: {
    width: 60,
    height: 2,
    backgroundColor: COLORS.accent,
    borderRadius: 2,
    marginBottom: 18,
    opacity: 0.6,
  },
  subtitle: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 36,
  },
  pill: {
    backgroundColor: 'rgba(229,169,60,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(229,169,60,0.3)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  pillText: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: '700',
  },
  btnWrap: {
    width: '100%',
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  footNote: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 16,
    fontWeight: '600',
  },
});
