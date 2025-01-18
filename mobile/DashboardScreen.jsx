import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

const screenWidth = Dimensions.get('window').width;

const DashboardScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    maintenancesByType: {
      preventive: 0,
      corrective: 0,
      predictive: 0
    },
    maintenancesByStatus: {
      pending: 0,
      in_progress: 0,
      completed: 0
    },
    monthlyStats: [],
    equipmentStats: []
  });

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${process.env.API_URL}/dashboard/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Cards de Resumo */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Icon name="wrench" size={30} color="#2196F3" />
          <Text style={styles.summaryNumber}>
            {stats.maintenancesByStatus.pending}
          </Text>
          <Text style={styles.summaryText}>Pendentes</Text>
        </View>

        <View style={styles.summaryCard}>
          <Icon name="progress-wrench" size={30} color="#FFA000" />
          <Text style={styles.summaryNumber}>
            {stats.maintenancesByStatus.in_progress}
          </Text>
          <Text style={styles.summaryText}>Em Andamento</Text>
        </View>

        <View style={styles.summaryCard}>
          <Icon name="check-circle" size={30} color="#4CAF50" />
          <Text style={styles.summaryNumber}>
            {stats.maintenancesByStatus.completed}
          </Text>
          <Text style={styles.summaryText}>Concluídas</Text>
        </View>
      </View>

      {/* Gráfico de Linha - Manutenções por Mês */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Manutenções por Mês</Text>
        <LineChart
          data={{
            labels: stats.monthlyStats.map(item => item.month),
            datasets: [{
              data: stats.monthlyStats.map(item => item.count)
            }]
          }}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
            style: {
              borderRadius: 16
            }
          }}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Gráfico de Pizza - Tipos de Manutenção */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Tipos de Manutenção</Text>
        <PieChart
          data={[
            {
              name: 'Preventiva',
              count: stats.maintenancesByType.preventive,
              color: '#4CAF50',
              legendFontColor: '#7F7F7F',
            },
            {
              name: 'Corretiva',
              count: stats.maintenancesByType.corrective,
              color: '#FFA000',
              legendFontColor: '#7F7F7F',
            },
            {
              name: 'Preditiva',
              count: stats.maintenancesByType.predictive,
              color: '#2196F3',
              legendFontColor: '#7F7F7F',
            }
          ]}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`
          }}
          accessor="count"
          backgroundColor="transparent"
          paddingLeft="15"
          style={styles.chart}
        />
      </View>

      {/* Gráfico de Barras - Equipamentos mais Manutenidos */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Equipamentos Mais Manutenidos</Text>
        <BarChart
          data={{
            labels: stats.equipmentStats.map(item => item.name),
            datasets: [{
              data: stats.equipmentStats.map(item => item.maintenance_count)
            }]
          }}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
            barPercentage: 0.5,
          }}
          style={styles.chart}
          showValuesOnTopOfBars
        />
      </View>

      {/* Indicadores de Desempenho */}
      <View style={styles.kpiContainer}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiTitle}>Tempo Médio de Resolução</Text>
          <Text style={styles.kpiValue}>
            {stats.averageResolutionTime} horas
          </Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiTitle}>Taxa de Conclusão</Text>
          <Text style={styles.kpiValue}>
            {stats.completionRate}%
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    width: '30%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  summaryText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    margin: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  chart: {
    borderRadius: 12,
    marginVertical: 8,
  },
  kpiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  kpiCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  kpiTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
});

export default DashboardScreen;