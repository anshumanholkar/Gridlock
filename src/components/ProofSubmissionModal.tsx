import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../theme';
import { TaskItem } from '../types';
import { verifyTaskProof } from '../services/gemini';

interface Props {
  task: TaskItem | null;
  visible: boolean;
  onClose: () => void;
  onProofConfirmed: (updatedTask: TaskItem) => void;
}

export default function ProofSubmissionModal({
  task,
  visible,
  onClose,
  onProofConfirmed,
}: Props) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<{
    verified: boolean;
    confidenceScore: number;
    feedback: string;
  } | null>(null);

  if (!task) return null;

  const handlePickFromGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission Denied', 'Camera roll permissions are required to upload proof.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
      setAuditResult(null);
    }
  };

  const handleTakeCameraPhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission Denied', 'Camera access is required to take proof photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
      setAuditResult(null);
    }
  };

  // Provide a quick simulated sample proof for emulator testing
  const handleUseSampleProof = () => {
    setSelectedImage('https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&auto=format&fit=crop');
    setAuditResult(null);
  };

  const handleRunAiAudit = async () => {
    if (!selectedImage) {
      Alert.alert('Proof Required', 'Please photograph or select documentary proof of your completed task.');
      return;
    }

    setIsAuditing(true);
    try {
      const result = await verifyTaskProof(task.title, selectedImage);
      setAuditResult(result);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleConfirmCompletion = () => {
    if (!auditResult || !auditResult.verified) {
      Alert.alert('Audit Incomplete', 'You must run the AI proof audit to verify documentary evidence before locking in.');
      return;
    }

    const updated: TaskItem = {
      ...task,
      completed: true,
      proofImageUri: selectedImage || undefined,
      proofAiAnalysis: auditResult.feedback,
      proofConfidenceScore: auditResult.confidenceScore,
      proofVerified: auditResult.verified,
      proofSubmittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onProofConfirmed(updated);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <View style={styles.pill}>
                <Text style={styles.pillText}>DISCIPLINE AUDIT ENGINE</Text>
              </View>
              <Text style={styles.title}>SUBMIT TASK PROOF</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Task Banner */}
            <View style={styles.taskCard}>
              <Text style={styles.taskCategory}>{task.category.toUpperCase()} MANDATE</Text>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskEstimate}>⏱ Duration: {task.estimatedMinutes} minutes</Text>
            </View>

            {/* Existing Proof Viewer (if already completed) */}
            {task.proofVerified && task.proofAiAnalysis && (
              <View style={styles.existingProofBox}>
                <View style={styles.verifiedHeader}>
                  <Text style={styles.verifiedIcon}>✓</Text>
                  <Text style={styles.verifiedTitle}>AI AUDIT PASSED ({task.proofConfidenceScore || 95}%)</Text>
                </View>
                <Text style={styles.existingAnalysis}>{task.proofAiAnalysis}</Text>
                {task.proofSubmittedAt && (
                  <Text style={styles.timeLabel}>Verified at: {task.proofSubmittedAt}</Text>
                )}
              </View>
            )}

            {/* Proof Image Upload / Capture Section */}
            <Text style={styles.sectionLabel}>DOCUMENTARY EVIDENCE PHOTO</Text>
            <Text style={styles.sectionSub}>
              Photograph handwritten notes, code screen, gym workout log, or reading progress.
            </Text>

            {selectedImage ? (
              <View style={styles.previewBox}>
                <Image source={{ uri: selectedImage }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.retakeBtn}
                  onPress={() => setSelectedImage(null)}
                >
                  <Text style={styles.retakeBtnText}>RETAKE PHOTO</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.buttonsRow}>
                <TouchableOpacity style={styles.actionBtn} onPress={handleTakeCameraPhoto}>
                  <Text style={styles.btnIcon}>📸</Text>
                  <Text style={styles.btnLabel}>OPEN CAMERA</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={handlePickFromGallery}>
                  <Text style={styles.btnIcon}>🖼️</Text>
                  <Text style={styles.btnLabel}>GALLERY</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={handleUseSampleProof}>
                  <Text style={styles.btnIcon}>⚡</Text>
                  <Text style={styles.btnLabel}>EMULATOR DEMO</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* AI Audit Run Button */}
            {selectedImage && !auditResult && (
              <TouchableOpacity
                style={[styles.btnAudit, isAuditing && { opacity: 0.6 }]}
                onPress={handleRunAiAudit}
                disabled={isAuditing}
              >
                {isAuditing ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ActivityIndicator size="small" color={COLORS.primaryText} />
                    <Text style={styles.btnAuditText}>AUDITING PROOF WITH GEMINI AI...</Text>
                  </View>
                ) : (
                  <Text style={styles.btnAuditText}>🤖 RUN AI PROOF AUDIT & VERIFY →</Text>
                )}
              </TouchableOpacity>
            )}

            {/* AI Audit Feedback Card */}
            {auditResult && (
              <View
                style={[
                  styles.auditResultCard,
                  { borderColor: auditResult.verified ? COLORS.accent : '#EF4444' },
                ]}
              >
                <View style={styles.auditStatusRow}>
                  <Text style={{ fontSize: 18 }}>{auditResult.verified ? '✅' : '❌'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.auditStatusTitle, { color: auditResult.verified ? COLORS.accent : '#EF4444' }]}>
                      {auditResult.verified
                        ? `PROOF VERIFIED (${auditResult.confidenceScore}% MATCH)`
                        : 'PROOF REJECTED'}
                    </Text>
                    <Text style={styles.auditFeedbackText}>{auditResult.feedback}</Text>
                  </View>
                </View>

                {auditResult.verified && (
                  <TouchableOpacity
                    style={styles.btnConfirmLock}
                    onPress={handleConfirmCompletion}
                  >
                    <Text style={styles.btnConfirmLockText}>LOCK IN COMPLETED MANDATE ✓</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.bgCardSolid,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.25)',
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(229, 169, 60, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4,
  },
  pillText: {
    color: COLORS.accent,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#24271D',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.2)',
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  taskCard: {
    backgroundColor: '#161911',
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.15)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  taskCategory: {
    color: COLORS.accent,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  taskTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    marginVertical: 4,
  },
  taskEstimate: {
    color: COLORS.textDim,
    fontSize: 11,
  },
  existingProofBox: {
    backgroundColor: 'rgba(229, 169, 60, 0.08)',
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  verifiedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  verifiedIcon: {
    color: COLORS.accent,
    fontWeight: '900',
    fontSize: 14,
  },
  verifiedTitle: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  existingAnalysis: {
    color: '#E4E7D8',
    fontSize: 11,
    lineHeight: 16,
  },
  timeLabel: {
    color: COLORS.secondary,
    fontSize: 9,
    marginTop: 4,
  },
  sectionLabel: {
    color: COLORS.secondary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  sectionSub: {
    color: COLORS.textDim,
    fontSize: 11,
    marginTop: 2,
    marginBottom: 12,
    lineHeight: 15,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#1E2117',
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.2)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  btnLabel: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  previewBox: {
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.3)',
  },
  retakeBtn: {
    backgroundColor: '#24271D',
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.2)',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  retakeBtnText: {
    color: COLORS.secondary,
    fontSize: 10,
    fontWeight: '800',
  },
  btnAudit: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  btnAuditText: {
    color: COLORS.primaryText,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  auditResultCard: {
    backgroundColor: '#181B13',
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  auditStatusRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  auditStatusTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  auditFeedbackText: {
    color: '#F4F5F0',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
  btnConfirmLock: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 12,
  },
  btnConfirmLockText: {
    color: COLORS.primaryText,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
