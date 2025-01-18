import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const MaintenanceHistory = ({ route }) => {
  const { equipmentId } = route.params;
  const [loading, setLoading] = useState(true);
  const [maintenances, setMaintenances] = useState([]);
  const [equipment, setEquipment] = useState(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    type: null,
    search: ''
  });

  const fetchMaintenanceHistory = async () => {
    try {
      const queryParams = new URLSearchParams({
        ...filters,
        startDate: filters.startDate?.toISOString(),
        endDate: filters.endDate?.toISOString()
      }).toString();

      const response = await fetch(
        `${process.env.API_URL}/equipment/${equipmentId}/maintenance-history?${queryParams}`
      );
      const data = await response.json();
      setMaintenances(data.maintenances);
      setEquipment(data.equipment);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenanceHistory();
  }, [equipmentId, filters]);

  const renderMaintenanceItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.maintenanceCard}
      onPress={() => navigation.navigate('MaintenanceDetail', { maintenance: item })}
    >
      <View style={styles.maintenanceHeader}>
        <View style={styles.typeContainer}>
          <Icon 
            name={
              item.type === 'preventive' ? 'shield-check' :
              item.type === 'corrective' ? 'wrench' : 'chart-line'
            }
            size={24}
            color={
              item.type === 'preventive' ? '#4CAF50' :
              item.type === 'corrective' ? '#FFA000' : '#2196F3'
            }
          />
          <Text style={styles.typeText}>
            {item.type === 'preventive' ? 'Preventiva' :
             item.type === 'corrective' ? 'Corretiva' : 'Preditiva'}
          </Text>
        </View>
        <Text style={styles.date}>
          {format(new Date(item.maintenance_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </Text>
      </View>

      <Text style={styles.description}>{item.description}</Text>

      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Icon name="account" size={16} color="#666" />
          <Text style={styles.detailText}>{item.technician.name}</Text>
        </View>

        {item.cost && (
          <View style={styles.detailItem}>
            <Icon name="currency-brl" size={16} color="#666" />
            <Text style={styles.detailText}>
              R$ {item.cost.toFixed(2)}
            </Text>
          </View>
        )}

        {item.parts_replaced?.length > 0 && (
          <View style={styles.detailItem}>
            <Icon name="cog" size={16} color="#666" />
            <Text style={styles.detailText}>
              {item.parts_replaced.length} peças substituídas
            </Text>
          </View>
        )}
      </View>

      {item.photos?.length > 0 && (
        <View style={styles.mediaContainer}>
          <Icon name="image" size={16} color="#666" />
          <Text style={styles.mediaText}>{item.photos.length} fotos</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const FilterModal = () => (
    <Modal
      visible={filterModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filtros</Text>

          <Text style={styles.filterLabel}>Buscar</Text>
          <TextInput
            style={styles.filterInput}
            value={filters.search}
            onChangeText={(text) => setFilters({...filters, search: text})}
            placeholder="Buscar por descrição..."
          />

          <Text style={styles.filterLabel}>Tipo de Manutenção</Text>
          <View style={styles.typeButtons}>
            {['all', 'preventive', 'corrective', 'predictive'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  filters.type === type && styles.typeButtonActive
                ]}
                onPress={() => setFilters({...filters, type})}
              >
                <Text style={[
                  styles.typeButtonText,
                  filters.type === type && styles.typeButtonTextActive
                ]}>
{type === 'all' ? 'Todos' :
                   type === 'preventive' ? 'Preventiva' :
                   type === 'corrective' ? 'Corretiva' : 'Preditiva'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.filterLabel}>Período</Text>
          <View style={styles.dateContainer}>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => showDatePicker('start')}
            >
              <Icon name="calendar" size={20} color="#666" />
              <Text style={styles.dateText}>
                {filters.startDate 
                  ? format(filters.startDate, 'dd/MM/yyyy')
                  : 'Data inicial'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => showDatePicker('end')}
            >
              <Icon name="calendar" size={20} color="#666" />
              <Text style={styles.dateText}>
                {filters.endDate 
                  ? format(filters.endDate, 'dd/MM/yyyy')
                  : 'Data final'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setFilters({
                  startDate: null,
                  endDate: null,
                  type: null,
                  search: ''
                });
                setFilterModalVisible(false);
              }}
            >
              <Text style={styles.clearButtonText}>Limpar Filtros</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.applyButtonText}>Aplicar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.equipmentName}>{equipment?.name}</Text>
          <Text style={styles.equipmentCode}>Código: {equipment?.code}</Text>
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Icon name="filter-variant" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Lista de Manutenções */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      ) : (
        <FlatList
          data={maintenances}
          renderItem={renderMaintenanceItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Icon name="clipboard-text" size={48} color="#666" />
              <Text style={styles.emptyText}>Nenhuma manutenção encontrada</Text>
            </View>
          )}
        />
      )}

      <FilterModal />

      {/* Botão Flutuante para Nova Manutenção */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('MaintenanceForm', { equipmentId })}
      >
        <Icon name="plus" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  filterButton: {
    padding: 8,
  },
  listContainer: {
    padding: 16,
  },
  maintenanceCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  maintenanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  date: {
    color: '#666',
    fontSize: 14,
  },
  description: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  detailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  detailText: {
    marginLeft: 4,
    color: '#666',
    fontSize: 14,
  },
  mediaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  mediaText: {
    marginLeft: 4,
    color: '#666',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#4CAF50',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  filterInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  typeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
    marginBottom: 8,
  },
  typeButtonActive: {
    backgroundColor: '#2196F3',
  },
  typeButtonText: {
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#FFF',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dateInput: {
    flex: 0.48,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
  },
  dateText: {
    marginLeft: 8,
    color: '#666',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  clearButton: {
    padding: 12,
  },
  clearButtonText: {
    color: '#666',
  },
  applyButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  applyButtonText: {
    color: '#FFF',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    marginTop: 8,
    color: '#666',
    fontSize: 16,
  },
});

export default MaintenanceHistory;