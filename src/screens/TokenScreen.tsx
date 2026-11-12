import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../theme';
import { UserProfile } from '../types';
import { auditEmergencyTokenProof, EmergencyTokenAuditResult } from '../services/gemini';

interface Props {
  user: UserProfile;
  onTokenConsumed: () => void;
}

export default function TokenScreen({ user, onTokenConsumed }: Props) {
  const [reason, setReason] = useState('');
  const [proofUri, setProofUri] = useState<string | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [verdict, setVerdict] = useState<EmergencyTokenAuditResult | null>(null);

  const pickProofPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProofUri(result.assets[0].uri);
    }
  };

  const handleClaimToken = async () => {
    if (user.emergencyTokens <= 0) {
      Alert.alert('Quota Depleted', 'You have already exhausted your 1x Emergency Token for this calendar month.');
      return;
    }
    if (!reason.trim()) {
      Alert.alert('Statement Required', 'You must detail the nature of the emergency for audit.');
      return;
    }
    if (!proofUri) {
      Alert.alert('Proof Image Required', 'You must attach clear documentary evidence (hospital discharge, travel ticket, power outage notice, etc).');
      return;
    }

    setEvaluating(true);
    try {
      const result = await auditEmergencyTokenProof(reason, proofUri);
      setVerdict(result);
      if (result.status === 'approved') {
        onTokenConsumed();
      }
    } catch (err) {
      Alert.alert('Audit Error', 'Automated token arbitrator unavailable. Verify network connection.');
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.badgePill}>
          <Text style={styles.badgeText}>EMERGENCY PROTOCOL</Text>
        </View>
        <Text style={styles.title}>1X MONTHLY OVERRIDE</Text>
        <Text style={styles.subtitle}>
          One exemption permitted per 30 days. Hard automated audit prevents streak loss under verified severe disruption.
        </Text>
      </View>

      <View style={styles.quotaCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.quotaTitle}>AVAILABLE OVERRIDES</Text>
          <Text style={styles.quotaSub}>Resets on 1st of every calendar month</Text>
        </View>
        <Text style={[styles.quotaNumber, user.emergencyTokens === 0 && { color: COLORS.secondary }]}>
          {user.emergencyTokens} / 1
        </Text>
      </View>

      {/* Form */}
      <View style={styles.formCard}>
        <Text style={styles.label}>NATURE OF EMERGENCY</Text>
        <TextInput
          style={styles.textArea}
          value={reason}
          onChangeText={setReason}
          placeholder="State explicitly what occurred today (e.g. Hospitalization, urgent travel, electrical infrastructure failure)..."
          placeholderTextColor={COLORS.textMuted}
          multiline
          numberOfLines={4}
        />

        <Text style={[styles.label, { marginTop: 14 }]}>DOCUMENTARY PROOF</Text>
        <TouchableOpacity style={styles.uploadBox} onPress={pickProofPhoto}>
          {proofUri ? (
            <Image source={{ uri: proofUri }} style={styles.proofImg} />
          ) : (
            <View style={{ alignItems: 'center' }}>
              <View style={styles.iconCircle}>
                <Text style={{ fontSize: 20 }}>📑</Text>
              </View>
              <Text style={styles.uploadText}>ATTACH PHOTO OF DOCUMENT</Text>
              <Text style={styles.uploadSub}>Must show clear date and official letterhead</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btnClaim, user.emergencyTokens === 0 && styles.btnDisabled]}
          onPress={handleClaimToken}
          disabled={evaluating || user.emergencyTokens === 0}
        >
          {evaluating ? (
            <ActivityIndicator color={COLORS.primaryText} />
          ) : (
            <Text style={styles.btnClaimText}>EXECUTE EMERGENCY OVERRIDE</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Verdict Card */}
      {verdict && (
        <View style={[styles.verdictCard, { borderColor: verdict.status === 'approved' ? COLORS.accent : COLORS.crimson }]}>
          <Text style={[styles.verdictTitle, { color: verdict.status === 'approved' ? COLORS.accent : COLORS.crimson }]}>
            {verdict.status === 'approved' ? '✓ OVERRIDE APPROVED' : '✕ OVERRIDE REJECTED'}
          </Text>
          <Text style={styles.verdictBody}>{verdict.reason}</Text>
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
  quotaCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.15)',
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  quotaTitle: { color: COLORS.text, fontSize: 13, fontWeight: '800', letterSpacing: 1 },
  quotaSub: { color: COLORS.secondary, fontSize: 11, marginTop: 2 },
  quotaNumber: { color: COLORS.accent, fontSize: 26, fontWeight: '900', fontFamily: 'Courier' },
  formCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.12)',
    padding: 18,
  },
  label: { color: COLORS.secondary, fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 6 },
  textArea: {
    backgroundColor: COLORS.bgInput,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.15)',
    borderRadius: 12,
    color: '#fff',
    padding: 14,
    fontSize: 13,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  uploadBox: {
    height: 180,
    backgroundColor: COLORS.bgInput,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(229, 169, 60, 0.25)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 16,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#161811',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  proofImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  uploadText: { color: '#ffffff', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  uploadSub: { color: COLORS.textMuted, fontSize: 10, marginTop: 3 },
  btnClaim: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.3 },
  btnClaimText: { color: COLORS.primaryText, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  verdictCard: {
    marginTop: 16,
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
  },
  verdictTitle: { fontSize: 12, fontWeight: '900', letterSpacing: 1.2, marginBottom: 6 },
  verdictBody: { color: COLORS.textDim, fontSize: 12, lineHeight: 18 },
});
