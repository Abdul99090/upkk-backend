import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const customers = [
  { name: 'Budi Santoso', type: 'Harian', status: 'Aktif' },
  { name: 'Siti Aminah', type: 'Mingguan', status: 'Aktif' },
  { name: 'Andi Wijaya', type: 'Harian', status: 'Baru' },
];

export default function AdminNasabahScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Manajemen Nasabah</Text>
        <Text style={styles.subtitle}>84 nasabah aktif</Text>
      </View>

      {customers.map((customer) => (
        <View key={customer.name} style={styles.card}>
          <Text style={styles.name}>{customer.name}</Text>
          <Text style={styles.type}>{customer.type}</Text>
          <View style={styles.statusWrap}>
            <Text style={styles.status}>{customer.status}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fb', padding: 16 },
  header: { marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827' },
  subtitle: { color: '#6b7280', marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  name: { fontSize: 17, fontWeight: '700', color: '#111827' },
  type: { color: '#6b7280', marginTop: 4 },
  statusWrap: { marginTop: 10, alignSelf: 'flex-start', backgroundColor: '#dcfce7', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 },
  status: { color: '#166534', fontWeight: '700', fontSize: 12 },
});
