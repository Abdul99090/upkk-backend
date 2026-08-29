import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

const screenWidth = Dimensions.get('window').width;

const ReportScreen = ({ navigation }) => {
  const [reports, setReports] = useState({
    personal: null,
    attendance: null,
    transactions: null,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('attendance');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      // Fetch personal report
      const personalRes = await api.get('/report/karyawan/personal-report');
      
      // Fetch attendance
      const attendanceRes = await api.get('/report/absensi-daily');
      
      setReports({
        personal: personalRes.data.data,
        attendance: attendanceRes.data.data,
        transactions: null,
      });
    } catch (error) {
      Alert.alert('Error', 'Gagal memuat laporan');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  const renderStatCard = ({ icon, label, value, color = '#3498db' }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statIcon}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Personal Stats */}
      {reports.personal && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistik Pribadi</Text>
          
          {renderStatCard({
            icon: 'briefcase',
            label: 'Total Penghasilan',
            value: `Rp ${reports.personal.totalEarnings?.toLocaleString('id-ID') || 0}`,
            color: '#27ae60',
          })}

          {renderStatCard({
            icon: 'cash-outline',
            label: 'Total Penarikan',
            value: `Rp ${reports.personal.totalWithdrawals?.toLocaleString('id-ID') || 0}`,
            color: '#e74c3c',
          })}

          {renderStatCard({
            icon: 'people',
            label: 'Total Nasabah',
            value: `${reports.personal.totalNasabah || 0}`,
            color: '#3498db',
          })}

          {renderStatCard({
            icon: 'trending-up',
            label: 'Saldo Saat Ini',
            value: `Rp ${reports.personal.currentBalance?.toLocaleString('id-ID') || 0}`,
            color: '#f39c12',
          })}
        </View>
      )}

      {/* Attendance Stats */}
      {reports.attendance && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistik Kehadiran</Text>
          
          {renderStatCard({
            icon: 'checkmark-circle',
            label: 'Hadir Tepat Waktu',
            value: `${reports.attendance.onTime || 0} hari`,
            color: '#27ae60',
          })}

          {renderStatCard({
            icon: 'alert-circle',
            label: 'Hadir Terlambat',
            value: `${reports.attendance.late || 0} hari`,
            color: '#f39c12',
          })}

          {renderStatCard({
            icon: 'close-circle',
            label: 'Absen',
            value: `${reports.attendance.absent || 0} hari`,
            color: '#e74c3c',
          })}

          {renderStatCard({
            icon: 'percent',
            label: 'Tingkat Kehadiran',
            value: `${reports.attendance.attendanceRate || 0}%`,
            color: '#3498db',
          })}
        </View>
      )}

      {/* Monthly Performance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performa Bulanan</Text>
        <View style={styles.chartPlaceholder}>
          <Ionicons name="bar-chart" size={40} color="#bdc3c7" />
          <Text style={styles.chartText}>Grafik performa akan ditampilkan di sini</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aksi Cepat</Text>
        <View style={styles.actionGrid}>
          <View style={styles.actionCard}>
            <Ionicons name="download" size={24} color="#3498db" />
            <Text style={styles.actionText}>Export PDF</Text>
          </View>
          <View style={styles.actionCard}>
            <Ionicons name="share-social" size={24} color="#27ae60" />
            <Text style={styles.actionText}>Bagikan</Text>
          </View>
        </View>
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  statCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    alignItems: 'center',
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f3f7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  chartPlaceholder: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 40,
    alignItems: 'center',
  },
  chartText: {
    fontSize: 13,
    color: '#7f8c8d',
    marginTop: 10,
    textAlign: 'center',
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 20,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  actionText: {
    fontSize: 12,
    color: '#2c3e50',
    marginTop: 8,
    fontWeight: '600',
  },
});

export default ReportScreen;
