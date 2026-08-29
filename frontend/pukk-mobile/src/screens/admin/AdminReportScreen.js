import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const reportRows = [
  { label: 'Pendapatan hari ini', value: 'Rp 4.800.000' },
  { label: 'Target mingguan', value: 'Rp 18.400.000' },
  { label: 'Persentase realisasi', value: '78%' },
  { label: 'Kehadiran karyawan', value: '96%' },
];

export default function AdminReportScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Laporan & Analytics</Text>
        <Text style={styles.subtitle}>Ringkasan performa bisnis</Text>
      </View>

      {reportRows.map((row) => (
        <View key={row.label} style={styles.row}>
          <Text style={styles.label}>{row.label}</Text>
          <Text style={styles.value}>{row.value}</Text>
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
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 10, elevation: 2 },
  label: { color: '#4b5563', fontSize: 14 },
  value: { color: '#111827', fontWeight: '700', fontSize: 14 },
});
