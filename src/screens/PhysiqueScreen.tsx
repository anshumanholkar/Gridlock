import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../theme';
import { analyzeWeeklyPhysique, PhysiqueAiResult } from '../services/gemini';

export default function PhysiqueScreen() {
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [legsImage, setLegsImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState<PhysiqueAiResult | null>(null);

  const pickImage = async (type: 'front' | 'legs') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      if (type === 'front') setFrontImage(result.assets[0].uri);
      else setLegsImage(result.assets[0].uri);
    }
  };

  const handleRunAudit = async () => {
    if (!frontImage || !legsImage) {
      Alert.alert('Missing Views', 'You must supply both Front Physique and Lower Body / Legs scans for full audit.');
      return;
    }

    setAnalyzing(true);
    try {
      const result = await analyzeWeeklyPhysique(frontImage, legsImage);
      setAiReport(result);
    } catch (err) {
      Alert.alert('Evaluation Error', 'Failed to reach Gemini Vision. Check your network or API key.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.badgePill}>
          <Text style={styles.badgeText}>WEEKLY AUDIT</Text>
        </View>
        <Text style={styles.title}>PHYSIQUE PROGRESSION</Text>
        <Text style={styles.subtitle}>
          Mandatory weekly shirtless & legs scan. Evaluated for physical progression & symmetry.
        </Text>
      </View>

      {/* Dual Upload Cards */}
      <View style={styles.uploadRow}>
        {/* Front Photo */}
        <TouchableOpacity style={styles.slotCard} onPress={() => pickImage('front')}>
          {frontImage ? (
            <Image source={{ uri: frontImage }} style={styles.slotImage} />
          ) : (
            <View style={styles.slotPlaceholder}>
              <View style={styles.iconCircle}>
                <Text style={styles.slotIcon}>📸</Text>
              </View>
              <Text style={styles.slotTitle}>FRONT TORSO</Text>
              <Text style={styles.slotSub}>Shirtless front double biceps or relaxed</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Legs Photo */}
        <TouchableOpacity style={styles.slotCard} onPress={() => pickImage('legs')}>
          {legsImage ? (
            <Image source={{ uri: legsImage }} style={styles.slotImage} />
          ) : (
            <View style={styles.slotPlaceholder}>
              <View style={styles.iconCircle}>
                <Text style={styles.slotIcon}>🦵</Text>
              </View>
              <Text style={styles.slotTitle}>LOWER BODY</Text>
              <Text style={styles.slotSub}>Quads, adductors & calves flexed</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.btnAudit, (!frontImage || !legsImage) && styles.btnAuditDisabled]}
        onPress={handleRunAudit}
        disabled={analyzing}
      >
        {analyzing ? (
          <ActivityIndicator color={COLORS.primaryText} />
        ) : (
          <Text style={styles.btnAuditText}>RUN GEMINI SPORTS SCIENCE AUDIT</Text>
        )}
      </TouchableOpacity>

      {/* AI Feedback Report Card */}
      {aiReport && (
        <View style={styles.reportCard}>
          <View style={styles.reportHeader}>
            <Text style={styles.reportBadge}>EVALUATION COMPLETE</Text>
            <View style={styles.compliantPill}>
              <Text style={styles.compliantText}>COMPLIANT</Text>
            </View>
          </View>

          <View style={styles.metricRow}>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>EST. BODY FAT</Text>
              <Text style={styles.metricValue}>{aiReport.estimatedBf}</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>WATER RETENTION</Text>
              <Text style={[styles.metricValue, { color: COLORS.accent }]}>EVALUATED</Text>
            </View>
          </View>

          <View style={styles.analysisSection}>
            <Text style={styles.sectionHeader}>HYDRATION & SYMMETRY</Text>
            <Text style={styles.sectionBody}>{aiReport.waterRetention}</Text>
          </View>

          <View style={styles.analysisSection}>
            <Text style={styles.sectionHeader}>LAGGING VECTOR</Text>
            <Text style={styles.sectionBody}>{aiReport.laggingAreas}</Text>
          </View>

          <View style={styles.analysisSection}>
            <Text style={styles.sectionHeader}>PRESCRIPTION FOR NEXT 7 DAYS</Text>
            {aiReport.actionPlan.map((step: string, i: number) => (
              <Text key={i} style={styles.bulletText}>
                • {step}
              </Text>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 16 },
  badgePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(229, 169, 60, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  badgeText: { color: COLORS.accent, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  title: { color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: 0.8 },
  subtitle: { color: COLORS.textDim, fontSize: 12, marginTop: 4, lineHeight: 16 },
  uploadRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  slotCard: {
    flex: 1,
    height: 220,
    backgroundColor: COLORS.bgCard,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(229, 169, 60, 0.25)',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  slotImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  slotPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#161811',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  slotIcon: { fontSize: 22 },
  slotTitle: { color: '#ffffff', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  slotSub: { color: COLORS.textMuted, fontSize: 10, textAlign: 'center', marginTop: 4 },
  btnAudit: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  btnAuditDisabled: { opacity: 0.4 },
  btnAuditText: { color: COLORS.primaryText, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  reportCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.2)',
    padding: 18,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  reportBadge: { color: COLORS.accent, fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  compliantPill: {
    backgroundColor: 'rgba(229, 169, 60, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  compliantText: { color: COLORS.accent, fontSize: 9, fontWeight: '900' },
  metricRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  metricBox: {
    flex: 1,
    backgroundColor: '#161811',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.1)',
  },
  metricLabel: { color: COLORS.secondary, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  metricValue: { color: '#fff', fontSize: 16, fontWeight: '900', marginTop: 4 },
  analysisSection: { marginBottom: 14 },
  sectionHeader: { color: COLORS.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1, marginBottom: 4 },
  sectionBody: { color: COLORS.textDim, fontSize: 12, lineHeight: 18 },
  bulletText: { color: '#F4F5F0', fontSize: 12, lineHeight: 20 },
});
