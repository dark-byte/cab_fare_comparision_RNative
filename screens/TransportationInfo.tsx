import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { GOOGLE_MAPS_API_KEY } from '@env';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App'; // Adjust the import path as needed

type Props = NativeStackScreenProps<RootStackParamList, 'Transportation'>;

const TransportationInfo: React.FC<Props> = ({ route }) => {
  const { startingPoint, destination } = route.params;
  const [transportationOptions, setTransportationOptions] = useState<any[]>([]);

  useEffect(() => {
    fetchTransportationOptions();
  }, [startingPoint, destination]);

  const fetchTransportationOptions = async () => {
    if (!startingPoint || !destination) {
      console.error('Starting point or destination is undefined');
      return;
    }

    try {
      const origin = `${startingPoint.lat},${startingPoint.lng}`;
      const dest = `${destination.lat},${destination.lng}`;
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${dest}&mode=transit&alternatives=true&key=${GOOGLE_MAPS_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.routes) {
        const options = data.routes.map((route: any) => ({
          duration: route.legs[0].duration.text,
          steps: route.legs[0].steps
            .filter((step: any) => step.travel_mode === 'TRANSIT')
            .map((step: any) => ({
              type: step.transit_details.line.vehicle.type,
              name: step.transit_details.line.short_name || step.transit_details.line.name,
              departure: step.transit_details.departure_time.text,
              arrival: step.transit_details.arrival_time.text,
            })),
        }));
        setTransportationOptions(options);
      }
    } catch (error) {
      console.error('Error fetching transportation options:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Public Transport Options:</Text>
      <FlatList
        data={transportationOptions}
        renderItem={({ item, index }) => (
          <View style={styles.optionContainer}>
            <Text style={styles.optionTitle}>Option {index + 1} - {item.duration}</Text>
            {item.steps.map((step: any, stepIndex: number) => (
              <View key={stepIndex} style={styles.stepContainer}>
                <Text>{step.type} - {step.name}</Text>
                <Text>Departure: {step.departure}</Text>
                <Text>Arrival: {step.arrival}</Text>
              </View>
            ))}
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: 'none',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  optionContainer: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  stepContainer: {
    marginLeft: 10,
    marginBottom: 5,
  },
});

export default TransportationInfo;
