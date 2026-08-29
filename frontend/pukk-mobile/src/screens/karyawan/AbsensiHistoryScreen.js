import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import api from '../../services/api';

const AbsensiHistoryScreen = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/karyawan/absensi/history?page=1&limit=20');
      setItems(response.data.data || []);
    } catch (error) {
      Alert.alert('Error', 'Gagal memuat riwayat absensi');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.LokasiAbsen?.name || 'Lokasi Absen'}</Text>
      <Text style={styles.meta}>Check-in: {item.checkInTime ? new Date(item.checkInTime).toLocaleString('id-ID') : '-'}</Text>
      <Text style={styles.meta}>Check-out: {item.checkOutTime ? new Date(item.checkOutTime).toLocaleString('id-ID') : '-'}</Text>
      <Text style={styles.meta}>Status: {item.status === 'on_time' ? 'Tepat Waktu' : 'Terlambat'}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Belum ada riwayat absensi</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  title: { fontSize: 16, fontWeight: '700', color: '#2c3e50', marginBottom: 6 },
  meta: { fontSize: 12, color: '#6b7280', marginBottom: 2 },
  empty: { textAlign: 'center', color: '#7f8c8d', marginTop: 40 },
});

export default AbsensiHistoryScreen;
