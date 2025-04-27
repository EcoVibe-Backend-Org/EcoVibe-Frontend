import React from 'react';
import { View, Text, SafeAreaView} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const Map = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
    <View>
      <Text >Welcome to Map!</Text>
      <MapView
        className="flex-1"
        style={{ width: '100%', height: '100%' }} // Ensure proper width and height
        initialRegion={{
          latitude: 37.78825,     // 👈 starting location
          longitude: -122.4324,
          latitudeDelta: 0.0922,  // 👈 how much zoom
          longitudeDelta: 0.0421,
        }}
      >
        
        
        <Marker
          coordinate={{ latitude: 37.78825, longitude: -122.4324 }}
          title="My Marker"
          description="Here is a cool place"
        />
      </MapView>
      <Text>
          HIIIIII
        </Text>
    </View>
    </SafeAreaView>
  );
};

export default Map