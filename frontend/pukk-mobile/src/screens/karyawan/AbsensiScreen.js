import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import api from '../../services/api';

export const AbsensiScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [todayAbsensi, setTodayAbsensi] = useState(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      await fetchLocations();
      await fetchTodayAbsensi();
      await getCurrentLocation();
      requestCameraPermission();
    });

    return unsubscribe;
  }, [navigation]);

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera permission is required for attendance');
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
    } catch (error) {
      Alert.alert('Error', 'Failed to get location: ' + error.message);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await api.get('/admin/lokasi-absen');
      setLocations(response.data.data || []);
    } catch (error) {
      console.log('Error fetching locations:', error);
    }
  };

  const fetchTodayAbsensi = async () => {
    try {
      const response = await api.get('/karyawan/absensi/today');
      setTodayAbsensi(response.data.data);
    } catch (error) {
      console.log('Error fetching absensi:', error);
    }
  };

  const takePhoto = async () => {
    try {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          base64: false,
        });
        setPhoto(photo);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleCheckIn = async () => {
    if (!location) {
      Alert.alert('Error', 'Location not available');
      return;
    }

    if (!selectedLocation) {
      Alert.alert('Error', 'Please select a location first');
      return;
    }

    if (!photo) {
      Alert.alert('Error', 'Please take a photo');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('lokasiAbsenId', selectedLocation.id);
      formData.append('latitude', location.latitude);
      formData.append('longitude', location.longitude);
      formData.append('photo', {
        uri: photo.uri,
        type: 'image/jpeg',
        name: `photo-${Date.now()}.jpg`,
      });

      const response = await api.post('/karyawan/absensi/check-in', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('Success', 'Check-in successful', [
        {
          text: 'OK',
          onPress: () => {
            setPhoto(null);
            fetchTodayAbsensi();
          },
        },
      ]);
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to check-in'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!todayAbsensi) {
      Alert.alert('Error', 'No check-in record for today');
      return;
    }

    if (!photo) {
      Alert.alert('Error', 'Please take a photo');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('absensiId', todayAbsensi.id);
      formData.append('latitude', location.latitude);
      formData.append('longitude', location.longitude);
      formData.append('photo', {
        uri: photo.uri,
        type: 'image/jpeg',
        name: `photo-${Date.now()}.jpg`,
      });

      await api.post('/karyawan/absensi/check-out', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('Success', 'Check-out successful', [
        {
          text: 'OK',
          onPress: () => {
            setPhoto(null);
            fetchTodayAbsensi();
          },
        },
      ]);
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to check-out'
      );
    } finally {
      setLoading(false);
    }
  };

  const isCheckedIn = todayAbsensi && todayAbsensi.checkInTime;
  const isCheckedOut = isCheckedIn && todayAbsensi.checkOutTime;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          {isCheckedOut ? '✓ Sudah Absen (Check-out)' : isCheckedIn ? 'Sudah Absen (Check-in)' : 'Belum Absen'}
        </Text>

        {!isCheckedIn && (
          <>
            <Text style={styles.sectionTitle}>Pilih Lokasi Absen</Text>
            <View style={styles.locationContainer}>
              {locations.map((loc) => (
                <TouchableOpacity
                  key={loc.id}
                  style={[
                    styles.locationCard,
                    selectedLocation?.id === loc.id && styles.locationCardSelected,
                  ]}
                  onPress={() => setSelectedLocation(loc)}
                >
                  <Text style={styles.locationName}>{loc.name}</Text>
                  <Text style={styles.locationAddress}>{loc.address}</Text>
                  <Text style={styles.locationRadius}>Radius: {loc.radius}m</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {todayAbsensi && (
          <View style={styles.absensiInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Check-in:</Text>
              <Text style={styles.infoValue}>
                {new Date(todayAbsensi.checkInTime).toLocaleTimeString('id-ID')}
              </Text>
            </View>
            {todayAbsensi.checkOutTime && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Check-out:</Text>
                <Text style={styles.infoValue}>
                  {new Date(todayAbsensi.checkOutTime).toLocaleTimeString('id-ID')}
                </Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status:</Text>
              <Text style={[styles.infoValue, todayAbsensi.status === 'on_time' ? styles.statusOnTime : styles.statusLate]}>
                {todayAbsensi.status === 'on_time' ? 'Tepat Waktu' : 'Terlambat'}
              </Text>
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>Ambil Foto</Text>
        {photo ? (
          <View>
            <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={() => setPhoto(null)}
            >
              <Text style={styles.retakeButtonText}>Ambil Foto Lagi</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={takePhoto}
          >
            <Text style={styles.cameraButtonText}>📷 Ambil Foto</Text>
          </TouchableOpacity>
        )}

        {!isCheckedOut && (
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={isCheckedIn ? handleCheckOut : handleCheckIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isCheckedIn ? 'Check-out' : 'Check-in'}
              </Text>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => navigation.navigate('AbsensiHistory')}
        >
          <Text style={styles.historyButtonText}>Lihat Riwayat Absensi</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 12,
  },
  locationContainer: {
    marginBottom: 16,
  },
  locationCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  locationCardSelected: {
    borderColor: '#2ecc71',
    backgroundColor: '#f0fff4',
  },
  locationName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  locationRadius: {
    fontSize: 11,
    color: '#95a5a6',
  },
  absensiInfo: {
    backgroundColor: '#e8f8f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2ecc71',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 12,
    color: '#2c3e50',
    fontWeight: '600',
  },
  statusOnTime: {
    color: '#2ecc71',
  },
  statusLate: {
    color: '#e74c3c',
  },
  photoPreview: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 12,
  },
  cameraButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  cameraButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  retakeButton: {
    backgroundColor: '#f39c12',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  retakeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#2ecc71',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  historyButton: {
    backgroundColor: '#95a5a6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  historyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
