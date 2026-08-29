import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import api from '../../services/api';

export const PaymentScreen = ({ navigation }) => {
  const [nasabahs, setNasabahs] = useState([]);
  const [selectedNasabah, setSelectedNasabah] = useState(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [qrisModal, setQrisModal] = useState(false);
  const [qrisData, setQrisData] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchNasabahs();
  }, [page]);

  const fetchNasabahs = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/karyawan/nasabah?page=${page}&limit=10`);
      if (page === 1) {
        setNasabahs(response.data.data || []);
      } else {
        setNasabahs([...nasabahs, ...response.data.data]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch nasabahs');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQRIS = async () => {
    if (!selectedNasabah) {
      Alert.alert('Error', 'Please select a nasabah');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setGenerating(true);
    try {
      const response = await api.post('/payment/qris/generate', {
        nasabahId: selectedNasabah.id,
        amount: parseFloat(amount),
        description: description || 'Payment',
      });

      setQrisData(response.data.data);
      setQrisModal(true);
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to generate QRIS'
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!qrisData) return;

    try {
      const response = await api.post('/payment/qris/confirm', {
        paymentId: qrisData.paymentId,
      });

      Alert.alert('Success', 'Payment confirmed successfully', [
        {
          text: 'OK',
          onPress: () => {
            setQrisModal(false);
            setQrisData(null);
            setSelectedNasabah(null);
            setAmount('');
            setDescription('');
          },
        },
      ]);
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to confirm payment'
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Buat Pembayaran</Text>

        <Text style={styles.sectionTitle}>Pilih Nasabah</Text>
        <View style={styles.nasabahList}>
          {nasabahs.map((nasabah) => (
            <TouchableOpacity
              key={nasabah.id}
              style={[
                styles.nasabahCard,
                selectedNasabah?.id === nasabah.id && styles.nasabahCardSelected,
              ]}
              onPress={() => setSelectedNasabah(nasabah)}
            >
              <Text style={styles.nasabahName}>{nasabah.name}</Text>
              <Text style={styles.nasabahNIK}>NIK: {nasabah.nik}</Text>
              <Text style={styles.nasabahPhone}>{nasabah.phone}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedNasabah && (
          <View style={styles.selectedInfo}>
            <Text style={styles.selectedLabel}>Nasabah Terpilih:</Text>
            <Text style={styles.selectedName}>{selectedNasabah.name}</Text>
            <Text style={styles.selectedNIK}>{selectedNasabah.nik}</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Detail Pembayaran</Text>
        <TextInput
          style={styles.input}
          placeholder="Jumlah Pembayaran (Rp)"
          placeholderTextColor="#999"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          editable={!generating}
        />

        <TextInput
          style={styles.input}
          placeholder="Deskripsi (opsional)"
          placeholderTextColor="#999"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          editable={!generating}
        />

        <TouchableOpacity
          style={[styles.generateButton, (!selectedNasabah || !amount || generating) && styles.generateButtonDisabled]}
          onPress={handleGenerateQRIS}
          disabled={!selectedNasabah || !amount || generating}
        >
          {generating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.generateButtonText}>Generate QRIS</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => navigation.navigate('PaymentHistory')}
        >
          <Text style={styles.historyButtonText}>Lihat Riwayat Pembayaran</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={qrisModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>QR Code Pembayaran</Text>

            {qrisData && (
              <View style={styles.qrisInfo}>
                <Text style={styles.qrisLabel}>Nasabah: {selectedNasabah?.name}</Text>
                <Text style={styles.qrisAmount}>
                  Rp {parseFloat(qrisData.amount).toLocaleString('id-ID')}
                </Text>
                <Text style={styles.qrisExpiry}>
                  Berlaku hingga: {new Date(qrisData.expiresAt).toLocaleTimeString('id-ID')}
                </Text>

                {qrisData.qrImage && (
                  <Image
                    source={{ uri: qrisData.qrImage }}
                    style={styles.qrCodeImage}
                  />
                )}

                <Text style={styles.qrisInstructions}>
                  Instruksi:
                  {'\n'}1. Beri QR Code ini ke nasabah
                  {'\n'}2. Nasabah scan dan bayar melalui aplikasi QRIS mereka
                  {'\n'}3. Setelah pembayaran selesai, klik tombol "Bayar" di bawah
                </Text>

                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleConfirmPayment}
                >
                  <Text style={styles.confirmButtonText}>Pembayaran Sudah Masuk</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setQrisModal(false);
                setQrisData(null);
              }}
            >
              <Text style={styles.closeButtonText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 12,
  },
  nasabahList: {
    marginBottom: 16,
  },
  nasabahCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  nasabahCardSelected: {
    borderColor: '#3498db',
    backgroundColor: '#ebf5fb',
  },
  nasabahName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  nasabahNIK: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  nasabahPhone: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  selectedInfo: {
    backgroundColor: '#d5f4e6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2ecc71',
  },
  selectedLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  selectedName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginBottom: 4,
  },
  selectedNIK: {
    fontSize: 12,
    color: '#27ae60',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 14,
  },
  generateButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  historyButton: {
    backgroundColor: '#95a5a6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  historyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  qrisInfo: {
    alignItems: 'center',
  },
  qrisLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  qrisAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginBottom: 8,
  },
  qrisExpiry: {
    fontSize: 12,
    color: '#e74c3c',
    marginBottom: 16,
  },
  qrCodeImage: {
    width: 250,
    height: 250,
    marginBottom: 16,
  },
  qrisInstructions: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 16,
    lineHeight: 20,
  },
  confirmButton: {
    backgroundColor: '#2ecc71',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#bdc3c7',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
