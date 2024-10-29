import React, { useState, useEffect, useRef } from 'react';
import { View, Button, StyleSheet, Text, FlatList, TouchableOpacity, Alert } from 'react-native'; // Import Alert
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import FareComparison from '../components/FareComparison';

type RootStackParamList = {
  Transportation: { startingPoint: any; destination: any };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Transportation'>;

const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.googleMapsApiKey || '';

export default function MapScreen() {
  const [startingPoint, setStartingPoint] = useState<any>(null);
  const [destination, setDestination] = useState<any>(null);
  const [mapRegion, setMapRegion] = useState<any>(null);
  const [routeDetails, setRouteDetails] = useState<any>(null);
  const [routeOptions, setRouteOptions] = useState<any[]>([]);
  const navigation = useNavigation<NavigationProp>();
  const startingPointRef = useRef<any>(null);
  const destinationRef = useRef<any>(null);
  const mapRef = useRef<MapView>(null); // Reference to the MapView

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied'); // Use Alert
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();
  }, []);

  const fetchRouteDetails = async () => {
    if (!startingPoint || !destination) return;

    // Force collapse of fare comparison before fetching routes
    setRouteOptions([]); // Clear existing routes first
    
    const origin = `${startingPoint.lat},${startingPoint.lng}`;
    const dest = `${destination.lat},${destination.lng}`;
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${dest}&mode=transit&alternatives=true&key=${GOOGLE_MAPS_API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.routes.length > 0) {
        const options = data.routes.map((route: any) => ({
          polyline: decodePolyline(route.overview_polyline.points),
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
        setRouteOptions(options);
        setRouteDetails(options[0]); // Set the first route as default
      } else {
        Alert.alert('No Routes Found', 'No Public Transports Found'); // Use Alert
      }
    } catch (error) {
      Alert.alert('Error', 'Error fetching route details'); // Use Alert
    }
  };

  const decodePolyline = (t: string) => {
    let points = [];
    let index = 0, len = t.length;
    let lat = 0, lng = 0;

    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      points.push({ latitude: (lat / 1E5), longitude: (lng / 1E5) });
    }
    return points;
  };

  const updateMapRegion = (location: { lat: number, lng: number }) => {
    setMapRegion({
      latitude: location.lat,
      longitude: location.lng,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
  };

  const handleCardPress = (item: any) => {
    setRouteDetails(item);
    if (mapRef.current) {
      mapRef.current.fitToCoordinates(item.polyline, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  };

  const renderRouteCard = ({ item, index }: { item: any, index: number }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleCardPress(item)}
    >
      <Text style={styles.cardTitle}>Option {index + 1} - {item.duration}</Text>
      {item.steps.map((step: any, stepIndex: number) => (
        <Text key={stepIndex} style={styles.cardText}>
          {step.type} - {step.name} (Departs: {step.departure}, Arrives: {step.arrival})
        </Text>
      ))}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <GooglePlacesAutocomplete
          ref={startingPointRef}
          placeholder="Enter starting point"
          onPress={(data, details = null) => {
            if (details) {
              const location = {
                lat: details.geometry.location.lat,
                lng: details.geometry.location.lng,
              };
              setStartingPoint(location);
              updateMapRegion(location);
            }
          }}
          query={{
            key: GOOGLE_MAPS_API_KEY,
            language: 'en',
          }}
          styles={{
            container: { flex: 0 },
            textInput: styles.input,
          }}
          fetchDetails={true}
        />
        <GooglePlacesAutocomplete
          ref={destinationRef}
          placeholder="Enter destination"
          onPress={(data, details = null) => {
            if (details) {
              const location = {
                lat: details.geometry.location.lat,
                lng: details.geometry.location.lng,
              };
              setDestination(location);
              updateMapRegion(location);
            }
          }}
          query={{
            key: GOOGLE_MAPS_API_KEY,
            language: 'en',
          }}
          styles={{
            container: { flex: 0 },
            textInput: styles.input,
          }}
          fetchDetails={true}
        />
        <Button
          title="Show Public Transport Options"
          onPress={fetchRouteDetails}
          disabled={!startingPoint || !destination}
        />
      </View>
      {mapRegion && (
        <MapView
          ref={mapRef} // Attach the ref to the MapView
          style={styles.map}
          region={mapRegion}
        >
          {startingPoint && (
            <Marker
              coordinate={{
                latitude: startingPoint.lat,
                longitude: startingPoint.lng,
              }}
              title="Starting Point"
            />
          )}
          {destination && (
            <Marker
              coordinate={{
                latitude: destination.lat,
                longitude: destination.lng,
              }}
              title="Destination"
            />
          )}
          {routeDetails && (
            <Polyline
              coordinates={routeDetails.polyline}
              strokeColor="#0000FF"
              strokeWidth={3}
            />
          )}
        </MapView>
      )}
      {routeOptions.length > 0 && (
        <View style={styles.routeOptionsContainer}>
          <View style={styles.scrollIndicator} />
          <FlatList
            data={routeOptions}
            renderItem={renderRouteCard}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            snapToInterval={150} // Match with card height
            snapToAlignment="start"
            decelerationRate={0.95}
            pagingEnabled={true}
            getItemLayout={(data, index) => ({
              length: 150,
              offset: 150 * index,
              index,
            })}
          />
        </View>
      )}
      {startingPoint && destination && (
        <FareComparison
          startingPoint={startingPoint}
          destination={destination}
          isInitiallyCollapsed={routeOptions.length > 0}
          forceCollapse={routeOptions.length > 0}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    position: 'absolute',
    top: "8%",
    left: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
  },
  map: {
    flex: 1,
  },
  routeOptionsContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    height: 150,
    backgroundColor: 'rgba(255, 255, 255, 0)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    height: 150, // Fixed height for snapping
    width: '100%', // Ensure full width
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  cardText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  scrollIndicator: {
    height: 4,
    width: 40,
    backgroundColor: '#ddd',
    alignSelf: 'center',
    marginVertical: 5,
    borderRadius: 2,
  }
});
