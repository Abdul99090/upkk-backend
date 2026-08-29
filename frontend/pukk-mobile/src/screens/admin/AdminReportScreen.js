import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AdminReportScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Laporan & Analytics</Text>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f7fb' }, text: { fontSize: 18, fontWeight: '600', color: '#111827' } });
