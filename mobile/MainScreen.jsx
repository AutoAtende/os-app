import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform,
  Alert
} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Camera } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

const MainScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [recentEquipments, setRecentEquipments] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    requestPermissions();
    loadRecentEquipments();
  }, []);

  const requestPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const loadRecentEquipments = async () => {
    try {
      const recent = await AsyncStorage.getItem('recentEquipments');
      if (recent) {
        setRecentEquipments(JSON.parse(recent));
      }
    } catch (error) {
      console.error('Erro ao carregar equipamentos recentes:', error);
    }
  };

  const handleBarCodeScanned = async ({ data }) => {
    setScanned(true);
    setIsCameraVisible(false);

    try {
      // Verifica se o QR Code é válido para o sistema
      if (!data.startsWith(process.env.APP_URL)) {
        Alert.alert('Erro', 'QR Code inválido');
        return;
      }

      const equipmentId = data.split('/').pop();
      const response = await fetch(`${process.env.API_URL}/equipment/${equipmentId}`);
      
      if (!response.ok) {
        throw new Error('Equipamento não encontrado');
      }

      const equipment = await response.json();

      // Salva nos equipamentos recentes
      const updatedRecent = [equipment, ...recentEquipments.filter(eq => eq.id !== equipment.id)].slice(0, 5);
      await AsyncStorage.setItem('recentEquipments', JSON.stringify(updatedRecent));
      setRecentEquipments(updatedRecent);

      // Navega para a tela de manutenção
      navigation.navigate('MaintenanceForm', { equipment });

    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Solicitando permissão da câmera...</Text></View>;
  }

  if (hasPermission === false) {
    return <View style={styles.container}><Text>Sem acesso à câmera</Text></View>;
  }

  return (
    <View style={styles.container}>
      {isCameraVisible ? (
        <View style={styles.cameraContainer}>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={styles.camera}
          />
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setIsCameraVisible(false)}
          >
            <Icon name="close" size={30} color="#FFF" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.content}>
          <TouchableOpacity 
            style={styles.scanButton}
            onPress={() => {
              setScanned(false);
              setIsCameraVisible(true);
            }}
          >
            <Icon name="qrcode-scan" size={40} color="#FFF" />
            <Text style={styles.scanButtonText}>Escanear QR Code</Text>
          </TouchableOpacity>

          <View style={styles.recentContainer}>
            <Text style={styles.recentTitle}>Equipamentos Recentes</Text>
            {recentEquipments.map(equipment => (
              <TouchableOpacity
                key={equipment.id}
                style={styles.recentItem}
                onPress={() => navigation.navigate('MaintenanceForm', { equipment })}
              >
                <Icon name="wrench" size={24} color="#666" />
                <View style={styles.recentInfo}>
                  <Text style={styles.recentName}>{equipment.name}</Text>
                  <Text style={styles.recentCode}>Código: {equipment.code}</Text>
                </View>
                <Icon name="chevron-right" size={24} color="#666" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 25,
  },
  scanButton: {
    backgroundColor: '#2196F3',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  scanButtonText: {
    color: '#FFF',
    fontSize: 18,
    marginTop: 10,
    fontWeight: '500',
  },
  recentContainer: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recentInfo: {
    flex: 1,
    marginLeft: 15,
  },
  recentName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  recentCode: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});

export default MainScreen;