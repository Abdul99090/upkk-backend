import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const employees = [
  { name: 'Rina Paramita', role: 'Sales Officer', status: 'Aktif' },
  { name: 'Budi Hartono', role: 'Collector', status: 'Aktif' },
  { name: 'Sari Wulandari', role: 'Marketing', status: 'Menunggu' },
];

export default function AdminKaryawanScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Manajemen Karyawan</Text>
        <Text style={styles.subtitle}>3 pegawai terdaftar</Text>
      </View>

      {employees.map((employee) => (
        <View key={employee.name} style={styles.card}>
          <Text style={styles.name}>{employee.name}</Text>
          <Text style={styles.role}>{employee.role}</Text>
          <View style={styles.statusWrap}>
            <Text style={styles.status}>{employee.status}</Text>
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
  role: { color: '#6b7280', marginTop: 4 },
  statusWrap: { marginTop: 10, alignSelf: 'flex-start', backgroundColor: '#e0f2fe', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 },
  status: { color: '#0369a1', fontWeight: '700', fontSize: 12 },
});
