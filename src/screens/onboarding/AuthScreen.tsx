import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { COLORS } from '../../theme';
import { AccountProfile } from '../../types';

interface Props {
  accounts: AccountProfile[];
  onSelectAccount: (account: AccountProfile) => void;
  onAddAccount: () => void;
}

const RANK_COLORS: Record<string, string> = {
  Monitor: '#E5A93C',
  Enforcer: '#EF4444',
  Recruit: '#9E917F',
};

export default function AuthScreen({ accounts, onSelectAccount, onAddAccount }: Props) {
  const canAdd = accounts.length < 3;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.hexLogo}>
          <Text style={styles.hexText}>G</Text>
        </View>
        <Text style={styles.title}>CHOOSE OPERATIVE</Text>
        <Text style={styles.subtitle}>Select your account to continue</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {accounts.map((acc) => (
          <TouchableOpacity
            key={acc.id}
            style={styles.card}
            onPress={() => onSelectAccount(acc)}
            activeOpacity={0.8}
          >
            <View style={styles.cardLeft}>
              <View style={[styles.avatar, { borderColor: RANK_COLORS[acc.role] || COLORS.accent }]}>
                <Text style={[styles.avatarLetter, { color: RANK_COLORS[acc.role] || COLORS.accent }]}>
                  {acc.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.accountName}>{acc.name}</Text>
                <Text style={styles.groupLabel}>
                  {acc.groupName || 'No Group'} · {acc.groupCode || '—'}
                </Text>
                <View style={styles.statRow}>
                  <Text style={styles.stat}>⚡ {acc.xp} XP</Text>
                  <Text style={styles.statDot}>·</Text>
                  <Text style={styles.stat}>🔥 {acc.streak}d</Text>
                  <Text style={styles.statDot}>·</Text>
                  <View style={[styles.roleBadge, { borderColor: RANK_COLORS[acc.role] || COLORS.accent }]}>
                    <Text style={[styles.roleText, { color: RANK_COLORS[acc.role] || COLORS.accent }]}>
                      {acc.role.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.addBtn, !canAdd && styles.addBtnDisabled]}
          onPress={() => {
            if (!canAdd) {
              Alert.alert('Account Limit', 'Maximum 3 accounts allowed per device.\nDelete an account first from Settings.');
              return;
            }
            onAddAccount();
          }}
          activeOpacity={0.8}
        >
          <Text style={[styles.addBtnText, !canAdd && { color: COLORS.textMuted }]}>
            {canAdd ? '＋  ADD ANOTHER ACCOUNT' : '⛔  MAX 3 ACCOUNTS REACHED'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.slotNote}>{accounts.length} / 3 slots used</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 28,
    borderBottomWidth: 1,
    borderColor: 'rgba(229,169,60,0.15)',
  },
  hexLogo: {
    width: 56,
    height: 56,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.accent,
    backgroundColor: '#1C1914',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  hexText: {
    color: COLORS.accent,
    fontSize: 26,
    fontWeight: '900',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 4,
  },
  subtitle: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: '600',
  },
  list: {
    padding: 20,
    gap: 12,
  },
  card: {
    backgroundColor: '#111009',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(229,169,60,0.2)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    backgroundColor: '#1C1914',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    fontSize: 22,
    fontWeight: '900',
  },
  cardInfo: {
    flex: 1,
    gap: 3,
  },
  accountName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  groupLabel: {
    color: COLORS.secondary,
    fontSize: 11,
    fontWeight: '600',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  stat: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  statDot: {
    color: COLORS.textMuted,
    fontSize: 10,
  },
  roleBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  roleText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  arrow: {
    color: COLORS.accent,
    fontSize: 24,
    fontWeight: '300',
    marginLeft: 8,
  },
  addBtn: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    borderStyle: 'dashed',
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  addBtnDisabled: {
    borderColor: 'rgba(255,255,255,0.1)',
  },
  addBtnText: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  slotNote: {
    color: COLORS.textMuted,
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 4,
  },
});
