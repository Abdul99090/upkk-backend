import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

export const KaryawanHomeScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [balance, setBalance] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBalance = async () => {
    try {
      const response = await api.get('/payment/balance/karyawan');
      setBalance(response.data);
    } catch (error) {
      console.log('Error fetching balance:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/report/karyawan/personal-report');
      setStats(response.data);
    } catch (error) {
      console.log('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      setLoading(true);
      await Promise.all([fetchBalance(), fetchStats()]);
      setLoading(false);
    });

    return unsubscribe;
  }, [navigation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchBalance(), fetchStats()]);
    setRefreshing(false);
  };

  const MenuCard = ({ title, icon, color, onPress }) => (
    <TouchableOpacity style={[styles.card, { borderLeftColor: color }]} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Halo, {user?.name || 'Karyawan'}!</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Saldo Anda</Text>
        <Text style={styles.balanceAmount}>
          Rp {(balance?.availableBalance || 0).toLocaleString('id-ID')}
        </Text>
        <View style={styles.balanceDetails}>
          <View style={styles.balanceDetail}>
            <Text style={styles.detailLabel}>Total Pendapatan</Text>
            <Text style={styles.detailAmount}>
              Rp {(balance?.totalEarnings || 0).toLocaleString('id-ID')}
            </Text>
          </View>
          <View style={styles.balanceDetail}>
            <Text style={styles.detailLabel}>Sudah Ditarik</Text>
            <Text style={styles.detailAmount}>
              Rp {(balance?.totalWithdrawals || 0).toLocaleString('id-ID')}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{stats?.nasabahCount || 0}</Text>
          <Text style={styles.statLabel}>Nasabah</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{stats?.attendanceThisMonth?.total || 0}</Text>
          <Text style={styles.statLabel}>Kehadiran Bulan Ini</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{stats?.attendanceThisMonth?.rate || 'N/A'}</Text>
          <Text style={styles.statLabel}>Tingkat Kehadiran</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Menu Utama</Text>
      <View style={styles.menuContainer}>
        <MenuCard
          title="Absensi"
          icon="📍"
          color="#2ecc71"
          onPress={() => navigation.navigate('Absensi')}
        />
        <MenuCard
          title="Nasabah"
          icon="👥"
          color="#3498db"
          onPress={() => navigation.navigate('NasabahList')}
        />
        <MenuCard
          title="Pembayaran"
          icon="💳"
          color="#e74c3c"
          onPress={() => navigation.navigate('Payment')}
        />
        <MenuCard
          title="Penarikan"
          icon="💰"
          color="#f39c12"
          onPress={() => navigation.navigate('Withdrawal')}
        />
        <MenuCard
          title="Laporan"
          icon="📊"
          color="#9b59b6"
          onPress={() => navigation.navigate('Report')}
        />
        <MenuCard
          title="Profil"
          icon="⚙️"
          color="#34495e"
          onPress={() => navigation.navigate('Profile')}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2c3e50',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    color: '#fff',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#ecf0f1',
    marginBottom: 10,
  },
  balanceCard: {
    backgroundColor: '#3498db',
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  balanceLabel: {
    color: '#ecf0f1',
    fontSize: 12,
    marginBottom: 8,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  balanceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceDetail: {
    flex: 1,
  },
  detailLabel: {
    color: '#ecf0f1',
    fontSize: 12,
    marginBottom: 4,
  },
  detailAmount: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  menuContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
});
