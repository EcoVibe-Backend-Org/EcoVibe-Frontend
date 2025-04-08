import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router'; // Import useRouter from expo-router

// Replace this with your actual path to the image
import CokeImage from '../../assets/coke.png';
import camera from '../../assets/camera.png';
import scan from '../../assets/scan.png';

export default function Scan() {
  const router = useRouter(); // Access the router
  const [redirectToScan, setRedirectToScan] = useState(false);
  const [redirectToLearn, setRedirectToLearn] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 24 }}>
        
        {/* Coke Image */}
        <Image
          source={CokeImage}
          className="w-full h-60 rounded-xl mb-4"
          resizeMode="contain"
        />

<View className="flex-row justify-center mb-6">
  {/* Scan Button */}
  <TouchableOpacity
    className="flex-[0.39] bg-green-600 rounded-xl py-3 flex-row justify-center items-center mr-2"
    onPress={() => router.push('/barcodeScan')}
  >
    <Image source={scan} className="w-6 h-6" style={{ tintColor: 'white' }} />
    <Text className="text-white text-base font-semibold ml-2">Scan Barcode</Text>
  </TouchableOpacity>

  {/* Learn How to Recycle Button */}
  <TouchableOpacity
    className="flex-[0.39] bg-green-600 rounded-xl py-3 flex-row justify-center items-center"
    onPress={() => router.push('/AI_Classifier')}
  >
    <Image source={camera} className="w-6 h-6" style={{ tintColor: 'white' }} />
    <Text className="text-white text-base font-semibold ml-2">Capture Image</Text>
  </TouchableOpacity>
</View>



        {/* How It Works */}
        <Text className="text-lg font-bold mb-4">How It Works</Text>

        <Step
          number={1}
          title="Capture or Upload Image"
          description="Take a photo of the item or upload an existing image."
        />
        <Step
          number={2}
          title="Verify Material Type"
          description="The AI will analyze the material and display whether it is recyclable."
        />
        <Step
          number={3}
          title="Follow Recycling Instructions"
          description="Use the provided suggestions to recycle properly."
        />
        <Step
          number={4}
          title="Log Your Efforts"
          description="Add the item to your recycling log to earn points."
        />
      </ScrollView>
    </SafeAreaView>
  );
}

type StepProps = {
  number: number;
  title: string;
  description: string;
};

const Step = ({ number, title, description }: StepProps) => (
  <View className="flex-row items-start mb-4">
    <View className="w-8 h-8 rounded-full bg-green-600 justify-center items-center mr-3">
      <Text className="text-white font-bold">{number}</Text>
    </View>
    <View className="flex-1">
      <Text className="font-semibold mb-1">{title}</Text>
      <Text className="text-sm text-gray-600">{description}</Text>
    </View>
  </View>
);
