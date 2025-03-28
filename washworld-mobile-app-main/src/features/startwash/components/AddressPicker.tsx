import { FC, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '@globals/globalStyles';
import Input from '@shared/Input';
import { Button } from '@shared/Button';

export type AddressObject = {
  tekst: string;
  adresse: {
    husnr: string;
    postnr: string;
    postnrnavn: string;
    vejnavn: string;
    x: number; // longitude
    y: number; // latitude
  };
};

type Props = {
  onIconPress: () => void;
  address: AddressObject;
  onAddressSelect: (value: AddressObject) => void;
  loading?: boolean;
};

export const AddressPicker: FC<Props> = ({ onIconPress, address, onAddressSelect, loading }) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<TextInput>(null);
  const [addressOptions, setAddressOptions] = useState<AddressObject[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  function handleOnSelect(option: AddressObject) {
    onAddressSelect(option);
    setInputValue(option.tekst);
    setAddressOptions([]);
    inputRef.current?.blur();
  }

  useEffect(() => {
    if (inputValue.length < 3) {
      setAddressOptions([]);
      return;
    }

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(inputValue)}`, {
      headers: { 'User-Agent': 'WashWorld/1.0 (rockstaralansaji@gmail.com)' }
    })
      .then(response => response.json())
      .then(response => {
        const formattedResults = response.map((item: any) => {
          const address = item.address || {}; // Ensure address exists
    
          return {
            tekst: item.display_name,
            adresse: {
              husnr: address.house_number || '',
              postnr: address.postcode || '',
              postnrnavn: address.city || address.town || address.village || '',
              vejnavn: address.road || '',
              x: parseFloat(item.lon),
              y: parseFloat(item.lat),
            },
          };
        });
        setAddressOptions(formattedResults);
      })
      .catch(error => console.error('OSM API Error:', error));
    
  }, [inputValue]);

  useEffect(() => {
    setInputValue(address?.tekst ?? '');
  }, [address]);

  return (
    <TouchableWithoutFeedback onPress={() => inputRef.current?.blur()}>
      <>
        <Input
          ref={inputRef}
          placeholder="City, street name, or zip code"
          onChangeText={text => setInputValue(text)}
          value={inputValue}
          rightIcon={
            inputValue ? (
              <MaterialIcons name="close" size={24} color={colors.black.base} />
            ) : loading ? (
              <ActivityIndicator color={colors.primary.base} size={'small'} />
            ) : (
              <MaterialIcons name="location-on" size={32} color={colors.primary.base} />
            )
          }
          onRightIconPress={inputValue ? () => setInputValue('') : loading ? undefined : onIconPress}
          inputContainerStyle={styles.input}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          isValid
        />

        {addressOptions.length > 0 && isFocused && (
          <FlatList
            data={addressOptions}
            keyExtractor={(item) => `address-option-${item.adresse.x}-${item.adresse.y}`}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Button style={styles.option} onPress={() => handleOnSelect(item)}>
                <Text style={text.option}>{item.tekst}</Text>
              </Button>
            )}
            style={[styles.optionsContainer, { maxHeight: Math.min(4, addressOptions.length) * 48 }]}
          />
        )}
      </>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.white.base,
    borderWidth: 1,
    borderColor: colors.grey[10],
    margin: 8,
  },
  optionsContainer: {
    marginHorizontal: 8,
    backgroundColor: colors.white.base,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.grey[10],
    marginTop: -8,
  },
  option: {
    height: 48,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
});

const text = StyleSheet.create({
  option: {
    fontFamily: 'gilroy-medium',
    fontSize: 14,
    lineHeight: 18,
    color: colors.grey[90],
  },
});
