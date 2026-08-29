import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

const NasabahListScreen = ({ navigation }) => {
  const [nasabahs, setNasabahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchNasabahs();
  }, []);

  const fetchNasabahs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/nasabah');
      setNasabahs(response.data.data || []);
    } catch (error) {
      Alert.alert('Error', 'Gagal memuat daftar nasabah');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNasabahs();
    setRefreshing(false);
  };

  const filteredNasabahs = nasabahs.filter(
    (nasabah) =>
      nasabah.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nasabah.nik.includes(searchTerm)
  );

  const renderNasabahCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        navigation.navigate('NasabahDetail', { nasabahId: item.id });
      }}
    >
      <View style={styles.cardHeader}>
        {item.profilePhoto ? (
          <Image
            source={{ uri: item.profilePhoto }}
            style={styles.profilePhoto}
          />
        ) : (
          <View style={[styles.profilePhoto, styles.placeholderPhoto]}>
            <Ionicons name="person" size={30} color="#bdc3c7" />
          </View>
        )}
        <View style={styles.cardInfo}>
          <Text style={styles.nasabahName}>{item.name}</Text>
          <Text style={styles.nasabahNik}>NIK: {item.nik}</Text>
          <Text style={styles.nasabahPhone}>{item.phone}</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#95a5a6" />
      </View>
      <View style={styles.cardFooter}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.occupancy || 'Belum ada'}</Text>
        </View>
        <Text style={styles.income}>Penghasilan: Rp {item.monthlyIncome?.toLocaleString('id-ID')}</Text>
      </View>
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
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#95a5a6" style={styles.searchIcon} />
        <input
          style={styles.searchInput}
          placeholder="Cari nama atau NIK..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      <FlatList
        data={filteredNasabahs}
        renderItem={renderNasabahCard}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="person-circle-outline" size={64} color="#bdc3c7" />
            <Text style={styles.emptyText}>Belum ada nasabah</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddNasabahModal')}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Tambah Nasabah</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddNasabahModal')}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 8,
    paddingHorizontal: 10,
    borderColor: '#ecf0f1',
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#2c3e50',
  },
  listContainer: {
    paddingHorizontal: 10,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 8,
    marginHorizontal: 5,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profilePhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#ecf0f1',
  },
  placeholderPhoto: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  nasabahName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 3,
  },
  nasabahNik: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  nasabahPhone: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    paddingTop: 8,
  },
  statusBadge: {
    backgroundColor: '#e8f4f8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 5,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 11,
    color: '#3498db',
    fontWeight: '600',
  },
  income: {
    fontSize: 12,
    color: '#27ae60',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 12,
    marginBottom: 20,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
});

export default NasabahListScreen;
