import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function AdminDashboard() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Dashboard Admin</Text>
        <Text style={styles.subtitle}>Sistem PUKK siap digunakan.</Text>
      </View>
      <View style={styles.grid}>
        <View style={styles.tile}><Text style={styles.tileTitle}>Karyawan</Text><Text style={styles.tileValue}>0</Text></View>
        <View style={styles.tile}><Text style={styles.tileTitle}>Nasabah</Text><Text style={styles.tileValue}>0</Text></View>
        <View style={styles.tile}><Text style={styles.tileTitle}>Pembayaran</Text><Text style={styles.tileValue}>0</Text></View>
        <View style={styles.tile}><Text style={styles.tileTitle}>Penarikan</Text><Text style={styles.tileValue}>0</Text></View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fb', padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 16, elevation: 2 },
  title: { fontSize: 22, fontWeight: '700', color: '#1f2937' },
  subtitle: { marginTop: 8, color: '#6b7280', fontSize: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  tile: { width: '48%', backgroundColor: '#fff', borderRadius: 12, padding: 18, marginBottom: 12, elevation: 2 },
  tileTitle: { color: '#6b7280', fontSize: 13 },
  tileValue: { marginTop: 8, color: '#111827', fontSize: 24, fontWeight: '700' },
});
