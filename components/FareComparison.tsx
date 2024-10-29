import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FARE_PARAMETERS } from '../constants/FareConstants';
import { calculateDistance } from '../utils/distanceCalculator';

interface FareComparisonProps {
  startingPoint: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  isInitiallyCollapsed?: boolean;
  forceCollapse?: boolean;
}

const calculateFare = (distance: number, time: number, params: any) => {
  const distanceCost = distance * params.perKmRate;
  const timeCost = time * params.perMinuteRate;
  const totalFare = (params.basePrice + distanceCost + timeCost) * params.surgeMultiplier;
  return Math.max(totalFare, params.minimumFare);
};

const FareComparison: React.FC<FareComparisonProps> = ({ 
  startingPoint, 
  destination,
  isInitiallyCollapsed = false,
  forceCollapse = false
}) => {
  const [isCollapsed, setIsCollapsed] = useState(isInitiallyCollapsed);
  const [animation] = useState(new Animated.Value(isInitiallyCollapsed ? 0 : 1));

  useEffect(() => {
    if (forceCollapse && !isCollapsed) {
      toggleCollapse();
    }
  }, [forceCollapse]);

  const toggleCollapse = () => {
    const toValue = isCollapsed ? 1 : 0;
    Animated.spring(animation, {
      toValue,
      useNativeDriver: false,
    }).start();
    setIsCollapsed(!isCollapsed);
  };

  const { distance, estimatedTime } = calculateDistance(startingPoint, destination);
  const fares = {
    UBER: calculateFare(distance, estimatedTime, FARE_PARAMETERS.UBER),
    OLA: calculateFare(distance, estimatedTime, FARE_PARAMETERS.OLA),
    RAPIDO: calculateFare(distance, estimatedTime, FARE_PARAMETERS.RAPIDO),
    NAMMA_YATRI: calculateFare(distance, estimatedTime, FARE_PARAMETERS.NAMMA_YATRI),
  };

  const containerHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [60, 280], // Adjust these values based on your content
  });

  return (
    <Animated.View style={[styles.container, { height: containerHeight }]}>
      <TouchableOpacity onPress={toggleCollapse} style={styles.header}>
        <Text style={styles.headerText}>Fare Comparison</Text>
        <Ionicons 
          name={isCollapsed ? 'chevron-up' : 'chevron-down'} 
          size={24} 
          color="#666" 
        />
      </TouchableOpacity>
      
      {!isCollapsed && (
        <View style={styles.content}>
          <Text style={styles.subHeader}>
            Distance: {distance} km | Est. Time: {estimatedTime} mins
          </Text>
          
          <View style={styles.tableHeader}>
            <Text style={styles.columnHeader}>Service</Text>
            <Text style={styles.columnHeader}>Est. Fare</Text>
            <Text style={styles.columnHeader}>Per KM</Text>
          </View>
          
          {Object.entries(fares).map(([service, fare]) => (
            <View key={service} style={styles.tableRow}>
              <Text style={styles.serviceName}>{service.replace('_', ' ')}</Text>
              <Text style={styles.fare}>₹{Math.round(fare)}</Text>
              <Text style={styles.rate}>₹{FARE_PARAMETERS[service as keyof typeof FARE_PARAMETERS].perKmRate}</Text>
            </View>
          ))}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 10,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    padding: 15,
  },
  subHeader: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 5,
    marginBottom: 5,
  },
  columnHeader: {
    flex: 1,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  serviceName: {
    flex: 1,
  },
  fare: {
    flex: 1,
    fontWeight: 'bold',
  },
  rate: {
    flex: 1,
    color: '#666',
  },
});

export default FareComparison; 