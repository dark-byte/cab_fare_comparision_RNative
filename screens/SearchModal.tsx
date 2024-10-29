import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Region } from 'react-native-maps';
import { GOOGLE_MAPS_API_KEY } from '@env';
import { GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

type RootStackParamList = {
  Transportation: { startingPoint: Region; destination: Region };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Transportation'>;

export default function SearchModal({ setStartingPoint, setDestination }: { 
  setStartingPoint: (location: Region) => void; 
  setDestination: (location: Region) => void 
}) {
  const navigation = useNavigation<NavigationProp>();
  const [origin, setOrigin] = useState<Region | null>(null);
  const [dest, setDest] = useState<Region | null>(null);
  const originRef = useRef<GooglePlacesAutocompleteRef>(null);
  const destRef = useRef<GooglePlacesAutocompleteRef>(null);

  const handleSubmit = () => {
    if (origin && dest) {
      setStartingPoint(origin);
      setDestination(dest);
      navigation.navigate('Transportation', { startingPoint: origin, destination: dest });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inputContainer}>
        <GooglePlacesAutocomplete
          ref={originRef}
          placeholder="Enter pickup location"
          onPress={(data, details = null) => {
            if (details?.geometry?.location) {
              setOrigin({
                latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              });
            }
          }}
          query={{
            key: GOOGLE_MAPS_API_KEY,
            language: 'en',
          }}
          styles={autocompleteStyles}
          fetchDetails={true}
          enablePoweredByContainer={false}
        />
        <GooglePlacesAutocomplete
          ref={destRef}
          placeholder="Enter destination"
          onPress={(data, details = null) => {
            if (details?.geometry?.location) {
              setDest({
                latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              });
            }
          }}
          query={{
            key: GOOGLE_MAPS_API_KEY,
            language: 'en',
          }}
          styles={autocompleteStyles}
          fetchDetails={true}
          enablePoweredByContainer={false}
        />
      </View>
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleSubmit}
        disabled={!origin || !dest}
      >
        <Text style={styles.buttonText}>Show Public Transport Options</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inputContainer: {
    padding: 10,
    backgroundColor: '#f2f2f2',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    margin: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

const autocompleteStyles = {
  container: {
    flex: 0,
    marginBottom: 10,
  },
  textInput: {
    fontSize: 16,
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  listView: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderTopWidth: 0,
    marginTop: -1,
  },
};
