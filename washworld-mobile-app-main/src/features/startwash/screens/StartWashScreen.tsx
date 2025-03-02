import { FC, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, globalTextStyles } from '@globals/globalStyles';
import MapView, { Marker } from 'react-native-maps';
import { getCurrentPositionAsync, LocationObject } from 'expo-location';
import { ScreenHeader } from '@shared/ScreenHeader';
import { ButtonGroup } from '@shared/ButtonGroup';
import { AddressObject, AddressPicker } from '../components/AddressPicker';
import { LocationsList } from '@shared/LocationsList';
import { useLocations } from '@queries/Locations';
import { Location } from '@models/Location';

export const StartWashScreen: FC = () => {
  console.log('StartWashScreen component rendered');

  const [address, setAddress] = useState<AddressObject>({
    tekst: '',
    adresse: {
      husnr: '',
      postnr: '',
      postnrnavn: '',
      vejnavn: '',
      x: 0,
      y: 0,
    },
  });
  
  const [modalLocation, setModalLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef<MapView>(null);

  const { data: locationsData } = useLocations(address?.adresse?.x, address?.adresse?.y);

  async function setCurrentLocation() {
    try {
      console.log('Fetching current location...');
      setLoading(true);
      const currentLocation: LocationObject = await getCurrentPositionAsync();
      console.log('Current location obtained:', currentLocation);
      
      const { longitude, latitude } = currentLocation.coords;
      console.log(`Longitude: ${longitude}, Latitude: ${latitude}`);

      const addressData = await reverseGeocode(longitude, latitude);
      if (!addressData) {
        console.error('Reverse geocoding returned null, address not updated.');
        return;
      }

      const newAddress = {
        tekst: addressData.display_name,
        adresse: {
          husnr: addressData.address.house_number || '',
          postnr: addressData.address.postcode || '',
          postnrnavn: addressData.address.city || '',
          vejnavn: addressData.address.road || '',
          x: longitude,
          y: latitude,
        },
      };

      console.log('Setting new address:', newAddress);
      setAddress(newAddress);
    } catch (error) {
      console.error('Error fetching current location:', error);
    } finally {
      setLoading(false);
      console.log('Finished fetching current location.');
    }
  }

  async function reverseGeocode(longitude: number, latitude: number) {
    console.log(`Reverse geocoding for Longitude: ${longitude}, Latitude: ${latitude}`);
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
  
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'WashWorld/1.0 (rockstaralansaji@gmail.com)', // Required by OSM
          'Accept-Language': 'en',
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const result = await response.json();
      console.log('Reverse geocode response:', result);
      return result;
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      alert('Reverse geocoding failed. Please check your network connection.');
      return null;
    }
  }

  async function handleMarkerPress(location: Location) {
    console.log('Marker pressed:', location);
    setModalLocation(location);
  }
  useEffect(() => {
    console.log('Fetching current location on mount...');
    setCurrentLocation();
  }, []);
  

  // 📍 Animate map when address updates
  useEffect(() => {
    console.log('Address state updated:', address);
    if (address?.adresse) {
      console.log('Animating map to new address:', address.adresse);
      mapRef.current?.animateToRegion({
        longitude: address.adresse.x,
        latitude: address.adresse.y,
        longitudeDelta: 0.02,
        latitudeDelta: 0.06,
      });
    }
  }, [address]);

  return (
    <View style={styles.container}>
      <ScreenHeader filterButtonShown />
      <View style={styles.body}>
        <View style={{ flex: 5 }}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              longitude: 19.076090,
              latitude: 72.877426,
              longitudeDelta: 0.1,
              latitudeDelta: 0.2,
            }}
          >
            {address?.adresse && (
              <Marker
                coordinate={{
                  longitude: address.adresse.x,
                  latitude: address.adresse.y,
                }}
              />
            )}

            {locationsData?.map((location, index) => (
              <Marker
                key={`location-${index}-${location.id}`}
                coordinate={{
                  longitude: location.coordinates.longitude,
                  latitude: location.coordinates.latitude,
                }}
                icon={require('../../../assets/wwpin.png')}
                pinColor={colors.tertiary.blue}
                onPress={() => handleMarkerPress(location)}
              />
            ))}
          </MapView>
          <AddressPicker
            onIconPress={setCurrentLocation}
            address={address}
            onAddressSelect={value => {
              console.log('Address selected:', value);
              setAddress(value);
            }}
            loading={loading}
          />
        </View>
        <View style={styles.underMap}>
          <ButtonGroup
            data={[
              { display: 'Automatic', value: 'auto' },
              { display: 'Self-wash', value: 'manual' },
              { display: 'Vacuum', value: 'vacuum' },
            ]}
            onPress={value => {
              console.log('Button pressed:', value);
            }}
            initialIndex={0}
            containerStyle={styles.buttonsContainer}
          />

          <Text style={textStyles.heading}>Nearby wash locations</Text>
          <LocationsList
            locations={locationsData ?? []}
            modalLocation={modalLocation}
            setModalLocation={setModalLocation}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white.base,
  },
  body: {
    paddingHorizontal: 24,
    flex: 1,
    marginTop: 8,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  underMap: {
    flex: 3,
  },
  buttonsContainer: {
    marginTop: 16,
    justifyContent: 'space-around',
  },
});

const textStyles = StyleSheet.create({
  heading: {
    ...globalTextStyles.heading,
    color: colors.black.base,
    paddingTop: 24,
    paddingBottom: 16,
  },
});
