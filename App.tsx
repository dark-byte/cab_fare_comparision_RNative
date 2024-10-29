import 'react-native-get-random-values';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MapScreen from './screens/MapScreen';
import TransportationInfo from './screens/TransportationInfo';

export type RootStackParamList = {
  Map: undefined;
  Transportation: { startingPoint: any; destination: any };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Map" 
          component={MapScreen}
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="Transportation" 
          component={TransportationInfo}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
