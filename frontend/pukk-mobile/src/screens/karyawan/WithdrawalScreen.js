import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

const WithdrawalScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('request'); // 'request' or 'history'
  const [balance, setBalance] = useState(0);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [withdrawals, setWithdrawals] = useState([]);

  useEffect(() => {
    fetchBalance();
    fetchWithdrawalHistory();
  }, []);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      const response = await api.get('/payment/balance/karyawan');
      setBalance(response.data.data.balance || 0);
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWithdrawalHistory = async () => {
    try {
      const response = await api.get('/payment/withdrawals/pending');
      setWithdrawals(response.data.data || []);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    }
  };

  const handleWithdrawalRequest = async () => {
    // Validation
    if (!withdrawalAmount || parseFloat(withdrawalAmount) <= 0) {
      Alert.alert('Error', 'Masukkan jumlah penarikan yang valid');
      return;
    }

    if (parseFloat(withdrawalAmount) > balance) {
      Alert.alert('Error', 'Saldo tidak cukup');
      return;
    }

    const minWithdrawal = 50000; // Minimum withdrawal
    if (parseFloat(withdrawalAmount) < minWithdrawal) {
      Alert.alert('Error', `Minimum penarikan adalah Rp ${minWithdrawal.toLocaleString('id-ID')}`);
      return;
    }

    try {
      setSubmitting(true);

      const response = await api.post('/payment/withdrawal/request', {
        amount: parseFloat(withdrawalAmount),
        notes: notes || null,
      });

      Alert.alert('Sukses', 'Permintaan penarikan sudah dikirim ke admin');
      setWithdrawalAmount('');
      setNotes('');
      
      // Refresh balance and history
      fetchBalance();
      fetchWithdrawalHistory();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error?.message || 'Gagal membuat permintaan');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderWithdrawalCard = ({ item }) => (
    <View style={styles.withdrawalCard}>
      <View style={styles.withdrawalHeader}>
        <View>
          <Text style={styles.withdrawalAmount}>
            Rp {item.amount.toLocaleString('id-ID')}
          </Text>
          <Text style={styles.withdrawalDate}>
            {new Date(item.createdAt).toLocaleDateString('id-ID')}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                item.status === 'approved'
                  ? '#d4edda'
                  : item.status === 'rejected'
                  ? '#f8d7da'
                  : '#fff3cd',
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color:
                  item.status === 'approved'
                    ? '#155724'
                    : item.status === 'rejected'
                    ? '#721c24'
                    : '#856404',
              },
            ]}
          >
            {item.status === 'pending'
              ? 'Menunggu'
              : item.status === 'approved'
              ? 'Disetujui'
              : 'Ditolak'}
          </Text>
        </View>
      </View>
      {item.notes && (
        <Text style={styles.withdrawalNotes}>
          Catatan: {item.notes}
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Saldo Tersedia</Text>
        <Text style={styles.balanceAmount}>
          Rp {balance.toLocaleString('id-ID')}
        </Text>
        <Text style={styles.balanceNote}>
          Minimum penarikan: Rp 50.000
        </Text>
      </View>

      {/* Tab Buttons */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'request' && styles.tabButtonActive]}
          onPress={() => setActiveTab('request')}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'request' && styles.tabButtonTextActive,
            ]}
          >
            Buat Permintaan
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'history' && styles.tabButtonActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'history' && styles.tabButtonTextActive,
            ]}
          >
            Riwayat
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'request' ? (
        <ScrollView style={styles.formContainer}>
          <View style={styles.section}>
            <Text style={styles.label}>Jumlah Penarikan (Rp)</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: 500000"
              value={withdrawalAmount}
              onChangeText={setWithdrawalAmount}
              keyboardType="numeric"
              placeholderTextColor="#95a5a6"
            />
            <Text style={styles.info}>
              Jumlah maksimal: Rp {balance.toLocaleString('id-ID')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Catatan (Opsional)</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Tambahkan catatan jika diperlukan..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              placeholderTextColor="#95a5a6"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.infoText}>
              <Ionicons name="information-circle" size={16} color="#3498db" /> Penarikan akan diproses
              oleh admin dalam 1-2 jam kerja
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleWithdrawalRequest}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="send" size={18} color="#fff" />
                <Text style={styles.submitButtonText}>Kirim Permintaan</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>
      ) : (
        <View style={styles.historyContainer}>
          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#3498db" />
            </View>
          ) : (
            <FlatList
              data={withdrawals}
              renderItem={renderWithdrawalCard}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="cash-outline" size={64} color="#bdc3c7" />
                  <Text style={styles.emptyText}>Belum ada riwayat penarikan</Text>
                </View>
              }
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  balanceCard: {
    backgroundColor: '#3498db',
    marginHorizontal: 15,
    marginVertical: 15,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  balanceNote: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#3498db',
  },
  tabButtonText: {
    fontSize: 14,
    color: '#95a5a6',
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: '#3498db',
  },
  formContainer: {
    flex: 1,
    paddingTop: 15,
  },
  historyContainer: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 8,
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ecf0f1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 8,
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  info: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  infoText: {
    fontSize: 13,
    color: '#3498db',
    lineHeight: 20,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#27ae60',
    marginHorizontal: 15,
    marginVertical: 15,
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  listContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  withdrawalCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 8,
    marginHorizontal: 5,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  withdrawalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  withdrawalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  withdrawalDate: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  withdrawalNotes: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 10,
    fontStyle: 'italic',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 12,
  },
});

export default WithdrawalScreen;
