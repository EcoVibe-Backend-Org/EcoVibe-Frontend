import React, { useState, useEffect, useRef } from 'react';
import { View, Image, Button, StyleSheet, ActivityIndicator, Text, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
//import axios from 'axios';
import  SSE from 'react-native-sse';


const AiClassifier = () => {
  const sseRef = useRef<SSE | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [displayedText, setDisplayedText] = useState('');
  const [typingIndex, setTypingIndex] = useState(0);

  useEffect(() => {
    if (analysisResult.length > 0 && typingIndex < analysisResult.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(analysisResult.substring(0, typingIndex + 1));
        setTypingIndex(prev => prev + 1);
      }, 20);

      return () => clearTimeout(timeout);
    }
  }, [typingIndex, analysisResult]);

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setImageUri(result.assets[0].uri);
      analyzeImage(result.assets[0].base64);
    }
  };

  const analyzeImage = async (base64: string) => {
    setLoading(true);
    setAnalysisResult(''); // Reset result state
    setDisplayedText('');
    setTypingIndex(0);

    if (sseRef.current) {
      sseRef.current.close();
      sseRef.current = null;
    }

    try {
      sseRef.current = new SSE('http://192.168.1.9:3000/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: `data:image/jpeg;base64,${base64}`
        }),
        pollingInterval: 0, // Disable automatic reconnection
      });

      const sse = sseRef.current;
// Handle incoming chunks
sse.addEventListener('message', (event) => {
  if (event.data) {
    try {
      const data = JSON.parse(event.data);
      if (data.chunk) {
        setAnalysisResult(prev => {
          // Prevent duplicate final chunks
          if (!prev.endsWith(data.chunk)) {
            return prev + data.chunk;
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Error parsing SSE message:', error);
    }
  }
});

// Handle errors
sse.addEventListener('error', (event) => {
  console.error('SSE Error:', event);
  sse.close();
  setLoading(false);
});

// Handle stream closure
sse.addEventListener('close', () => {
  sseRef.current = null;
  setLoading(false);
});

} catch (error) {
let errorMessage = 'Failed to analyze the image';
if (error instanceof Error) {
  errorMessage += `: ${error.message}`;
}
setAnalysisResult(errorMessage);
setLoading(false);
}
};

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
        <Button title="Take a Photo" onPress={takePhoto} />
        {loading && <ActivityIndicator size="large" color="#0000ff" />}
        {analysisResult && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>{displayedText}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: 300,
    height: 300,
    marginBottom: 20,
    borderRadius: 10,
  },
  resultContainer: {
    marginTop: 20,
    width: '100%',
  },
  resultText: {
    fontSize: 16,
    textAlign: 'left',
  },
});

export default AiClassifier;
