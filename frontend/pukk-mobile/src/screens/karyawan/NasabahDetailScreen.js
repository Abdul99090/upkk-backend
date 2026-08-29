import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import api from '../../services/api';

const NasabahDetailScreen = ({ route }) => {
  const { nasabahId } = route.params || {};
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!nasabahId) {
      Alert.alert('Error', 'Nasabah tidak ditemukan');
      setLoading(false);
      return;
    }

    fetchDetail();
  }, [nasabahId]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/nasabah/${nasabahId}`);
      setData(response.data.data || null);
    } catch (error) {
      Alert.alert('Error', 'Gagal memuat detail nasabah');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.empty}>Detail nasabah tidak tersedia</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        {data.profilePhoto ? (
          <Image source={{ uri: data.profilePhoto }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}><Text style={styles.avatarText}>N</Text></View>
        )}
        <Text style={styles.name}>{data.name}</Text>
        <Text style={styles.subtle}>NIK: {data.nik}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.field}>Telepon: {data.phone || '-'}</Text>
        <Text style={styles.field}>Email: {data.email || '-'}</Text>
        <Text style={styles.field}>Alamat: {data.address || '-'}</Text>
        <Text style={styles.field}>Kota: {data.city || '-'}</Text>
        <Text style={styles.field}>Pekerjaan: {data.occupancy || '-'}</Text>
        <Text style={styles.field}>Penghasilan: Rp {Number(data.monthlyIncome || 0).toLocaleString('id-ID')}</Text>
        <Text style={styles.field}>Bank: {data.bankName || '-'}</Text>
        <Text style={styles.field}>Rekening: {data.bankAccount || '-'}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { padding: 16 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
  empty: { color: '#7f8c8d', fontSize: 14 },
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 12 },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#dfeaf8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 28, color: '#3498db', fontWeight: '700' },
  name: { fontSize: 20, fontWeight: '700', color: '#2c3e50' },
  subtle: { marginTop: 4, color: '#7f8c8d', fontSize: 12 },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  field: { fontSize: 14, color: '#2c3e50', marginBottom: 8 },
});

export default NasabahDetailScreen;
