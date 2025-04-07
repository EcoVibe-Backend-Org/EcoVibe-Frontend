import React from 'react';
import { View, Text} from 'react-native';
import BarcodeScan from "../barcodeScan"
import AiClassifier from "../AI_Classifier";

const Scan = () => {
  return (
    <View>
      <Text >Welcome to Scan!</Text>
      <Text >AI Classifier</Text>
      <AiClassifier/>
      <Text >Barcode Scanner</Text>
      <BarcodeScan/>
      
      
    </View>
  );
};

export default Scan