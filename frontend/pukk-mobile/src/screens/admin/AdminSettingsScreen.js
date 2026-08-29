import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const settings = [
  'Notifikasi harian',
  'Sinkronisasi pinjaman',
  'Keamanan login admin',
  'Backup data otomatis',
];

export default function AdminSettingsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pengaturan Sistem</Text>
        <Text style={styles.subtitle}>Konfigurasi operasional aplikasi</Text>
      </View>

      {settings.map((item) => (
        <View key={item} style={styles.item}>
          <Text style={styles.itemText}>{item}</Text>
          <Text style={styles.switch}>ON</Text>
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
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 10, elevation: 2 },
  itemText: { color: '#111827', fontSize: 15, fontWeight: '600' },
  switch: { color: '#059669', fontWeight: '700' },
});
