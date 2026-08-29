import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const withdrawalList = [
  { name: 'Rina Paramita', amount: 'Rp 700.000', status: 'Menunggu' },
  { name: 'Budi Hartono', amount: 'Rp 1.250.000', status: 'Disetujui' },
];

export default function AdminWithdrawalScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Persetujuan Penarikan</Text>
        <Text style={styles.subtitle}>Daftar pengajuan yang perlu di-review</Text>
      </View>

      {withdrawalList.map((item) => (
        <View key={item.name} style={styles.card}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.amount}>{item.amount}</Text>
          <Text style={styles.status}>{item.status}</Text>
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
  amount: { color: '#2c3e50', fontSize: 18, fontWeight: '700', marginTop: 6 },
  status: { marginTop: 8, fontWeight: '700', color: '#d97706' },
});
