import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  Picker,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api from '../../services/api';

const AddNasabahScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    nik: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    province: '',
    occupancy: '',
    maritalStatus: 'single',
    monthlyIncome: '',
    bankName: '',
    bankAccount: '',
  });

  const [photos, setPhotos] = useState({
    ktpPhoto: null,
    profilePhoto: null,
  });

  const [loading, setLoading] = useState(false);
  const [previewModal, setPreviewModal] = useState({
    visible: false,
    type: null,
  });

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const pickImage = async (type) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.cancelled) {
        setPhotos({
          ...photos,
          [type]: {
            uri: result.uri,
            type: 'image/jpeg',
            name: `${type}-${Date.now()}.jpg`,
          },
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal memilih gambar');
      console.error(error);
    }
  };

  const takePhoto = async (type) => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.cancelled) {
        setPhotos({
          ...photos,
          [type]: {
            uri: result.uri,
            type: 'image/jpeg',
            name: `${type}-${Date.now()}.jpg`,
          },
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal mengambil foto');
      console.error(error);
    }
  };

  const showPhotoOptions = (type) => {
    Alert.alert(
      'Pilih Foto',
      `Pilih foto untuk ${type === 'ktpPhoto' ? 'KTP' : 'Profil'}`,
      [
        {
          text: 'Ambil Foto',
          onPress: () => takePhoto(type),
        },
        {
          text: 'Pilih dari Galeri',
          onPress: () => pickImage(type),
        },
        {
          text: 'Batal',
          onPress: () => {},
          style: 'cancel',
        },
      ]
    );
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || !formData.nik || !formData.phone) {
      Alert.alert('Error', 'Nama, NIK, dan nomor telepon harus diisi');
      return;
    }

    if (!photos.ktpPhoto || !photos.profilePhoto) {
      Alert.alert('Error', 'Foto KTP dan foto profil harus dipilih');
      return;
    }

    try {
      setLoading(true);

      // Create FormData for multipart upload
      const formDataToSend = new FormData();
      
      // Add form fields
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      // Add photos
      if (photos.ktpPhoto) {
        formDataToSend.append('ktpPhoto', {
          uri: photos.ktpPhoto.uri,
          type: photos.ktpPhoto.type,
          name: photos.ktpPhoto.name,
        });
      }

      if (photos.profilePhoto) {
        formDataToSend.append('profilePhoto', {
          uri: photos.profilePhoto.uri,
          type: photos.profilePhoto.type,
          name: photos.profilePhoto.name,
        });
      }

      // Call API
      const response = await api.post('/nasabah/create', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Sukses', 'Nasabah berhasil ditambahkan');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error?.message || 'Gagal menambahkan nasabah');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informasi Pribadi</Text>

        <View style={styles.photoGrid}>
          <TouchableOpacity
            style={styles.photoBox}
            onPress={() => showPhotoOptions('ktpPhoto')}
          >
            {photos.ktpPhoto ? (
              <Image source={{ uri: photos.ktpPhoto.uri }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="id-card" size={40} color="#bdc3c7" />
                <Text style={styles.photoLabel}>Foto KTP</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.photoBox}
            onPress={() => showPhotoOptions('profilePhoto')}
          >
            {photos.profilePhoto ? (
              <Image source={{ uri: photos.profilePhoto.uri }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="person" size={40} color="#bdc3c7" />
                <Text style={styles.photoLabel}>Foto Profil</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Nama Lengkap"
          value={formData.name}
          onChangeText={(value) => handleInputChange('name', value)}
          placeholderTextColor="#95a5a6"
        />

        <TextInput
          style={styles.input}
          placeholder="NIK"
          value={formData.nik}
          onChangeText={(value) => handleInputChange('nik', value)}
          keyboardType="numeric"
          maxLength={16}
          placeholderTextColor="#95a5a6"
        />

        <TextInput
          style={styles.input}
          placeholder="Nomor Telepon"
          value={formData.phone}
          onChangeText={(value) => handleInputChange('phone', value)}
          keyboardType="phone-pad"
          placeholderTextColor="#95a5a6"
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          keyboardType="email-address"
          placeholderTextColor="#95a5a6"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alamat</Text>

        <TextInput
          style={styles.input}
          placeholder="Alamat Lengkap"
          value={formData.address}
          onChangeText={(value) => handleInputChange('address', value)}
          multiline
          numberOfLines={3}
          placeholderTextColor="#95a5a6"
        />

        <TextInput
          style={styles.input}
          placeholder="Kota"
          value={formData.city}
          onChangeText={(value) => handleInputChange('city', value)}
          placeholderTextColor="#95a5a6"
        />

        <TextInput
          style={styles.input}
          placeholder="Provinsi"
          value={formData.province}
          onChangeText={(value) => handleInputChange('province', value)}
          placeholderTextColor="#95a5a6"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informasi Keuangan</Text>

        <TextInput
          style={styles.input}
          placeholder="Penghasilan Bulanan (Rp)"
          value={formData.monthlyIncome}
          onChangeText={(value) => handleInputChange('monthlyIncome', value)}
          keyboardType="numeric"
          placeholderTextColor="#95a5a6"
        />

        <TextInput
          style={styles.input}
          placeholder="Nama Bank"
          value={formData.bankName}
          onChangeText={(value) => handleInputChange('bankName', value)}
          placeholderTextColor="#95a5a6"
        />

        <TextInput
          style={styles.input}
          placeholder="Nomor Rekening"
          value={formData.bankAccount}
          onChangeText={(value) => handleInputChange('bankAccount', value)}
          placeholderTextColor="#95a5a6"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informasi Tambahan</Text>

        <TextInput
          style={styles.input}
          placeholder="Pekerjaan"
          value={formData.occupancy}
          onChangeText={(value) => handleInputChange('occupancy', value)}
          placeholderTextColor="#95a5a6"
        />

        <Text style={styles.label}>Status Perkawinan</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.maritalStatus}
            onValueChange={(value) => handleInputChange('maritalStatus', value)}
            style={styles.picker}
          >
            <Picker.Item label="Lajang" value="single" />
            <Picker.Item label="Menikah" value="married" />
            <Picker.Item label="Cerai" value="divorced" />
            <Picker.Item label="Janda/Duda" value="widowed" />
          </Picker>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.submitButtonText}>Tambah Nasabah</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 10,
  },
  section: {
    backgroundColor: '#fff',
    marginVertical: 5,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginHorizontal: 10,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  photoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  photoBox: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#ecf0f1',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  photoLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ecf0f1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    fontSize: 14,
    color: '#2c3e50',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ecf0f1',
    borderRadius: 6,
    marginBottom: 10,
  },
  picker: {
    height: 40,
    color: '#2c3e50',
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#3498db',
    marginHorizontal: 10,
    marginVertical: 15,
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default AddNasabahScreen;
