import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const stats = [
  { label: 'Karyawan', value: '12', change: '+2 bulan ini' },
  { label: 'Nasabah', value: '84', change: '+9 hari ini' },
  { label: 'Pinjaman', value: '26', change: '5 menunggu' },
  { label: 'Penarikan', value: '7', change: '2 perlu review' },
];

const activities = [
  { title: 'Pembayaran harian masuk', detail: '12 transaksi masuk hari ini' },
  { title: 'Pinjaman baru', detail: '3 permohonan menunggu approval' },
  { title: 'Target minggu', detail: 'Rp 18.400.000 tercapai 78%' },
];

export default function AdminDashboard() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.cardHeader}>
        <Text style={styles.title}>Dashboard Admin</Text>
        <Text style={styles.subtitle}>Ringkasan operasional PUKK hari ini</Text>
      </View>

      <View style={styles.grid}>
        {stats.map((item) => (
          <View key={item.label} style={styles.tile}>
            <Text style={styles.tileTitle}>{item.label}</Text>
            <Text style={styles.tileValue}>{item.value}</Text>
            <Text style={styles.tileChange}>{item.change}</Text>
          </View>
        ))}
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Aktivitas terbaru</Text>
        {activities.map((item) => (
          <View key={item.title} style={styles.activityRow}>
            <View style={styles.dot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.activityTitle}>{item.title}</Text>
              <Text style={styles.activityDetail}>{item.detail}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fb', padding: 16 },
  cardHeader: { backgroundColor: '#2c3e50', borderRadius: 16, padding: 20, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#fff' },
  subtitle: { marginTop: 8, color: '#dfe6e9', fontSize: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  tile: { width: '48%', backgroundColor: '#fff', borderRadius: 14, padding: 18, marginBottom: 12, elevation: 2 },
  tileTitle: { color: '#6b7280', fontSize: 13 },
  tileValue: { marginTop: 8, color: '#111827', fontSize: 26, fontWeight: '700' },
  tileChange: { marginTop: 6, color: '#059669', fontSize: 12 },
  panel: { backgroundColor: '#fff', borderRadius: 14, padding: 18, marginBottom: 20, elevation: 2 },
  panelTitle: { color: '#1f2937', fontSize: 18, fontWeight: '700', marginBottom: 12 },
  activityRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#3498db', marginRight: 12 },
  activityTitle: { color: '#111827', fontSize: 15, fontWeight: '600' },
  activityDetail: { color: '#6b7280', fontSize: 12, marginTop: 3 },
});
