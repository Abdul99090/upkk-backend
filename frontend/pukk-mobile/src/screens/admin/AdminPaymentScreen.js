import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const payments = [
  { title: 'Pembayaran harian', amount: 'Rp 1.200.000', status: 'Terkonfirmasi' },
  { title: 'Pembayaran mingguan', amount: 'Rp 2.800.000', status: 'Menunggu' },
  { title: 'Transfer qris', amount: 'Rp 950.000', status: 'Sukses' },
];

export default function AdminPaymentScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pembayaran</Text>
        <Text style={styles.subtitle}>Status transaksi terkini</Text>
      </View>

      {payments.map((item) => (
        <View key={item.title} style={styles.card}>
          <Text style={styles.titleItem}>{item.title}</Text>
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
  titleItem: { fontWeight: '700', color: '#111827', fontSize: 16 },
  amount: { color: '#2c3e50', fontSize: 18, fontWeight: '700', marginTop: 6 },
  status: { marginTop: 8, color: '#0f766e', fontWeight: '700' },
});
