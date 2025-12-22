import React from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Country } from '@/libs/countries';

interface CountrySelectorProps {
  selectedCountry: Country | null;
  countries: Country[];
  onSelectCountry: (country: Country) => void;
  label?: string;
}

export const CountryPickerButton = ({
  selectedCountry,
  countries,
  onSelectCountry,
  label = 'Country',
}: CountrySelectorProps) => {
  const [showPicker, setShowPicker] = React.useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        className="flex-row items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200"
      >
        <View className="flex-row items-center gap-3">
          <Text className="text-2xl">{selectedCountry?.flag}</Text>
          <View>
            <Text className="text-slate-600 text-xs">{label}</Text>
            <Text className="text-slate-800 font-semibold">{selectedCountry?.name}</Text>
          </View>
        </View>
        <Ionicons name="chevron-down" size={20} color="#64748b" />
      </TouchableOpacity>

      <Modal visible={showPicker} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl max-h-3/4">
            <View className="flex-row justify-between items-center p-6 border-b border-slate-200">
              <Text className="text-lg font-bold">Select {label}</Text>
              <Pressable onPress={() => setShowPicker(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </Pressable>
            </View>
            <ScrollView>
              {countries.map((country) => (
                <TouchableOpacity
                  key={country.code}
                  onPress={() => {
                    onSelectCountry(country);
                    setShowPicker(false);
                  }}
                  className="flex-row items-center p-4 border-b border-slate-100"
                >
                  <Text className="text-2xl mr-3">{country.flag}</Text>
                  <View className="flex-1">
                    <Text className="font-semibold text-slate-800">{country.name}</Text>
                    <Text className="text-sm text-slate-500">{country.currency}</Text>
                  </View>
                  {selectedCountry?.code === country.code && (
                    <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};
