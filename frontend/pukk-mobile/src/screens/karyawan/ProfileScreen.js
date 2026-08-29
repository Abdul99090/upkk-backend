import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api from '../../services/api';

const ProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    bankName: '',
    bankAccount: '',
  });
  const [profilePhoto, setProfilePhoto] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/karyawan/profile');
      const data = response.data.data;
      setProfile(data);
      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        position: data.position || '',
        bankName: data.bankName || '',
        bankAccount: data.bankAccount || '',
      });
    } catch (error) {
      Alert.alert('Error', 'Gagal memuat profil');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const pickPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.cancelled) {
        setProfilePhoto({
          uri: result.uri,
          type: 'image/jpeg',
          name: `profile-${Date.now()}.jpg`,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal memilih foto');
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);

      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      if (profilePhoto) {
        formDataToSend.append('profilePhoto', {
          uri: profilePhoto.uri,
          type: profilePhoto.type,
          name: profilePhoto.name,
        });
      }

      await api.put('/karyawan/profile', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Sukses', 'Profil berhasil diperbarui');
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      Alert.alert('Error', 'Gagal menyimpan profil');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Photo Section */}
      <View style={styles.photoSection}>
        <TouchableOpacity
          onPress={isEditing ? pickPhoto : undefined}
          disabled={!isEditing}
        >
          {profilePhoto?.uri || profile?.profilePhoto ? (
            <Image
              source={{ uri: profilePhoto?.uri || profile?.profilePhoto }}
              style={styles.profilePhoto}
            />
          ) : (
            <View style={[styles.profilePhoto, styles.placeholder]}>
              <Ionicons name="person" size={60} color="#bdc3c7" />
            </View>
          )}
          {isEditing && (
            <View style={styles.photoOverlay}>
              <Ionicons name="camera" size={24} color="#fff" />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Edit/Save Buttons */}
      <View style={styles.buttonContainer}>
        {!isEditing ? (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <Ionicons name="pencil" size={18} color="#fff" />
            <Text style={styles.buttonText}>Edit Profil</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.editButton, styles.saveButton]}
              onPress={handleSaveProfile}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={18} color="#fff" />
                  <Text style={styles.buttonText}>Simpan</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.editButton, styles.cancelButton]}
              onPress={() => {
                setIsEditing(false);
                setProfilePhoto(null);
                fetchProfile();
              }}
            >
              <Ionicons name="close" size={18} color="#fff" />
              <Text style={styles.buttonText}>Batal</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Personal Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informasi Pribadi</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Nama</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(value) =>
                setFormData({ ...formData, name: value })
              }
              placeholder="Nama lengkap"
              placeholderTextColor="#95a5a6"
            />
          ) : (
            <Text style={styles.value}>{profile?.name || 'N/A'}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{profile?.email || 'N/A'}</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Nomor Telepon</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(value) =>
                setFormData({ ...formData, phone: value })
              }
              placeholder="Nomor telepon"
              keyboardType="phone-pad"
              placeholderTextColor="#95a5a6"
            />
          ) : (
            <Text style={styles.value}>{profile?.phone || 'N/A'}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>NIK</Text>
          <Text style={styles.value}>{profile?.nik || 'N/A'}</Text>
        </View>
      </View>

      {/* Employment Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informasi Kerja</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Posisi</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={formData.position}
              onChangeText={(value) =>
                setFormData({ ...formData, position: value })
              }
              placeholder="Posisi"
              placeholderTextColor="#95a5a6"
            />
          ) : (
            <Text style={styles.value}>{profile?.position || 'N/A'}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Gaji</Text>
          <Text style={styles.value}>
            Rp {profile?.salary?.toLocaleString('id-ID') || '0'}
          </Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Status</Text>
          <Text
            style={[
              styles.value,
              {
                color:
                  profile?.status === 'active'
                    ? '#27ae60'
                    : profile?.status === 'inactive'
                    ? '#e74c3c'
                    : '#f39c12',
              },
            ]}
          >
            {profile?.status === 'active'
              ? 'Aktif'
              : profile?.status === 'inactive'
              ? 'Tidak Aktif'
              : 'Suspend'}
          </Text>
        </View>
      </View>

      {/* Bank Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informasi Bank</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Nama Bank</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={formData.bankName}
              onChangeText={(value) =>
                setFormData({ ...formData, bankName: value })
              }
              placeholder="Nama bank"
              placeholderTextColor="#95a5a6"
            />
          ) : (
            <Text style={styles.value}>{profile?.bankName || 'N/A'}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Nomor Rekening</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={formData.bankAccount}
              onChangeText={(value) =>
                setFormData({ ...formData, bankAccount: value })
              }
              placeholder="Nomor rekening"
              placeholderTextColor="#95a5a6"
            />
          ) : (
            <Text style={styles.value}>{profile?.bankAccount || 'N/A'}</Text>
          )}
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
  photoSection: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  editButton: {
    flexDirection: 'row',
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: '#27ae60',
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  section: {
    backgroundColor: '#fff',
    marginVertical: 8,
    marginHorizontal: 10,
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  field: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  label: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '600',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 15,
    color: '#2c3e50',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ecf0f1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#2c3e50',
  },
});

export default ProfileScreen;
