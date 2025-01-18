import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import SignatureScreen from 'react-native-signature-canvas';
import { useRoute, useNavigation } from '@react-navigation/native';

const MaintenanceForm = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { equipment } = route.params;
  
  const [formData, setFormData] = useState({
    description: '',
    type: 'corrective',
    priority: 'medium',
    notes: ''
  });
  
  const [photos, setPhotos] = useState([]);
  const [files, setFiles] = useState([]);
  const [signature, setSignature] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  
  const cameraRef = useRef(null);

  const handleTakePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          base64: true
        });
        setPhotos([...photos, photo]);
        setShowCamera(false);
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível capturar a foto');
      }
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        base64: true
      });

      if (!result.canceled) {
        setPhotos([...photos, result]);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*']
      });

      if (result.type === 'success') {
        setFiles([...files, result]);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar o documento');
    }
  };

  const handleSave = async () => {
    if (!formData.description.trim()) {
      Alert.alert('Erro', 'A descrição é obrigatória');
      return;
    }

    setLoading(true);

    try {
      const form = new FormData();

      // Dados básicos
      Object.keys(formData).forEach(key => {
        form.append(key, formData[key]);
      });

      // Equipment ID
      form.append('equipment_id', equipment.id);

      // Fotos
      photos.forEach((photo, index) => {
        form.append('photos', {
          uri: photo.uri,
          type: 'image/jpeg',
          name: `photo_${index}.jpg`
        });
      });

      // Arquivos
      files.forEach((file, index) => {
        form.append('files', {
          uri: file.uri,
          type: file.mimeType,
          name: file.name
        });
      });

      // Assinatura
      if (signature) {
        form.append('signature', {
          uri: signature,
          type: 'image/png',
          name: 'signature.png'
        });
      }

      const response = await fetch(`${process.env.API_URL}/service-orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: form
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar ordem de serviço');
      }

      Alert.alert(
        'Sucesso', 
        'Ordem de serviço registrada com sucesso',
        [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]
      );

    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (showCamera) {
    return (
      <View style={styles.container}>
        <Camera style={styles.camera} ref={cameraRef}>
          <View style={styles.cameraButtons}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowCamera(false)}
            >
              <Icon name="close" size={30} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.captureButton}
              onPress={handleTakePhoto}
            >
              <Icon name="camera" size={40} color="#FFF" />
            </TouchableOpacity>
          </View>
        </Camera>
      </View>
    );
  }

  if (showSignature) {
    return (
      <SignatureScreen
        onOK={(signature) => {
          setSignature(signature);
          setShowSignature(false);
        }}
        onEmpty={() => Alert.alert('Erro', 'Por favor, assine antes de confirmar')}
        onClear={() => setSignature(null)}
        descriptionText="Assinatura do Técnico"
        clearText="Limpar"
        confirmText="Salvar"
        webStyle={`.m-signature-pad--footer
          .button {
            background-color: #2196F3;
            color: #FFF;
            padding: 10px 20px;
            border-radius: 5px;
            margin: 0 10px;
          }`}
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.equipmentName}>{equipment.name}</Text>
        <Text style={styles.equipmentCode}>Código: {equipment.code}</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Descrição do Problema *</Text>
        <TextInput
          style={styles.input}
          multiline
          numberOfLines={4}
          value={formData.description}
          onChangeText={(text) => setFormData({...formData, description: text})}
          placeholder="Descreva o problema ou serviço necessário"
        />

        <Text style={styles.label}>Tipo de Manutenção</Text>
        <View style={styles.typeContainer}>
          {['corrective', 'preventive', 'predictive'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeButton,
                formData.type === type && styles.typeButtonActive
              ]}
              onPress={() => setFormData({...formData, type})}
            >
              <Text style={[
                styles.typeButtonText,
                formData.type === type && styles.typeButtonTextActive
              ]}>
                {type === 'corrective' ? 'Corretiva' :
                 type === 'preventive' ? 'Preventiva' : 'Preditiva'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.prioritySection}>
          <Text style={styles.label}>Prioridade</Text>
          <View style={styles.priorityContainer}>
            {[
              { value: 'low', label: 'Baixa' },
              { value: 'medium', label: 'Média' },
              { value: 'high', label: 'Alta' },
              { value: 'critical', label: 'Crítica' }
            ].map((priority) => (
              <TouchableOpacity
                key={priority.value}
                style={[
                  styles.priorityButton,
                  formData.priority === priority.value && styles.priorityButtonActive,
                  { backgroundColor: priority.value === 'critical' ? '#ffebee' : 
                                   priority.value === 'high' ? '#fff3e0' :
                                   priority.value === 'medium' ? '#e8f5e9' :
                                   '#f5f5f5' }
                ]}
                onPress={() => setFormData({...formData, priority: priority.value})}
              >
                <Text style={[
                  styles.priorityButtonText,
                  formData.priority === priority.value && styles.priorityButtonTextActive
                ]}>
                  {priority.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.mediaSection}>
          <Text style={styles.label}>Fotos</Text>
          <View style={styles.photoGrid}>
            {photos.map((photo, index) => (
              <View key={index} style={styles.photoContainer}>
                <Image source={{ uri: photo.uri }} style={styles.photo} />
                <TouchableOpacity
                  style={styles.removePhoto}
                  onPress={() => {
                    const newPhotos = [...photos];
                    newPhotos.splice(index, 1);
                    setPhotos(newPhotos);
                  }}
                >
                  <Icon name="close-circle" size={24} color="#FF5252" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              style={styles.addPhotoButton}
              onPress={() => {
                Alert.alert(
                  'Adicionar Foto',
                  'Escolha uma opção',
                  [
                    {
                      text: 'Tirar Foto',
                      onPress: () => setShowCamera(true)
                    },
                    {
                      text: 'Escolher da Galeria',
                      onPress: handlePickImage
                    },
                    {
                      text: 'Cancelar',
                      style: 'cancel'
                    }
                  ]
                );
              }}
            >
              <Icon name="camera-plus" size={32} color="#666" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Arquivos Anexos</Text>
          <View style={styles.fileList}>
            {files.map((file, index) => (
              <View key={index} style={styles.fileItem}>
                <Icon name="file-document" size={24} color="#2196F3" />
                <Text style={styles.fileName} numberOfLines={1}>
                  {file.name}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    const newFiles = [...files];
                    newFiles.splice(index, 1);
                    setFiles(newFiles);
                  }}
                >
                  <Icon name="close" size={24} color="#FF5252" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              style={styles.addFileButton}
              onPress={handlePickDocument}
            >
              <Icon name="file-plus" size={24} color="#666" />
              <Text style={styles.addFileText}>Adicionar Arquivo</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Observações Adicionais</Text>
          <TextInput
            style={styles.input}
            multiline
            numberOfLines={3}
            value={formData.notes}
            onChangeText={(text) => setFormData({...formData, notes: text})}
            placeholder="Observações ou notas adicionais"
          />

          <View style={styles.signatureSection}>
            <Text style={styles.label}>Assinatura do Técnico</Text>
            {signature ? (
              <View style={styles.signaturePreview}>
                <Image
                  source={{ uri: signature }}
                  style={styles.signatureImage}
                  resizeMode="contain"
                />
                <TouchableOpacity
                  style={styles.clearSignature}
                  onPress={() => setSignature(null)}
                >
                  <Text style={styles.clearSignatureText}>Limpar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addSignatureButton}
                onPress={() => setShowSignature(true)}
              >
                <Icon name="pen" size={24} color="#666" />
                <Text style={styles.addSignatureText}>Adicionar Assinatura</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Icon name="check" size={24} color="#FFF" />
              <Text style={styles.submitButtonText}>Registrar Manutenção</Text>
            </>
          )}
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
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 60,
  },
  equipmentName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  equipmentCode: {
    fontSize: 16,
    color: '#FFF',
    opacity: 0.8,
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 16,
    color: '#333',
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    textAlignVertical: 'top',
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#2196F3',
  },
  typeButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: '#FFF',
  },
  priorityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  priorityButton: {
    padding: 8,
    borderRadius: 8,
    margin: 4,
    minWidth: 80,
    alignItems: 'center',
  },
  priorityButtonActive: {
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  priorityButtonText: {
    fontWeight: '500',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  photoContainer: {
    width: 100,
    height: 100,
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  removePhoto: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    margin: 4,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileList: {
    marginBottom: 16,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  fileName: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
  },
  addFileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  addFileText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  signatureSection: {
    marginVertical: 16,
  },
  signaturePreview: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  signatureImage: {
    width: '100%',
    height: 120,
  },
  clearSignature: {
    marginTop: 8,
  },
  clearSignatureText: {
    color: '#FF5252',
    fontSize: 14,
  },
  addSignatureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  addSignatureText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default MaintenanceForm;