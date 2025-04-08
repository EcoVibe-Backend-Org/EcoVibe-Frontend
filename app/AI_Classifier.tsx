import React, { Component } from 'react';
import { View, Image, Button, StyleSheet, ActivityIndicator, Text, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import SSE from 'react-native-sse';

interface AiClassifierState {
  imageUri: string | null;
  loading: boolean;
  analysisResult: string;
  displayedText: string;
  typingIndex: number;
}

class AiClassifier extends Component<{}, AiClassifierState> {
  private sseInstance: SSE | null = null;

  constructor(props: {}) {
    super(props);
    this.state = {
      imageUri: null,
      loading: false,
      analysisResult: '',
      displayedText: '',
      typingIndex: 0,
    };
  }

  componentDidUpdate(prevProps: {}, prevState: AiClassifierState) {
    const { analysisResult, typingIndex } = this.state;
    
    if (analysisResult.length > 0 && typingIndex < analysisResult.length) {
      if (typingIndex !== prevState.typingIndex || analysisResult !== prevState.analysisResult) {
        setTimeout(() => {
          this.setState({
            displayedText: analysisResult.substring(0, typingIndex + 1),
            typingIndex: typingIndex + 1,
          });
        }, 20);
      }
    }
  }

  componentWillUnmount() {
    this.cleanUpSSE();
  }

  private cleanUpSSE() {
    if (this.sseInstance) {
      this.sseInstance.close();
      this.sseInstance = null;
    }
  }

  takePhoto = async () => {
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
      this.setState({ imageUri: result.assets[0].uri });
      this.analyzeImage(result.assets[0].base64);
    }
  };

  analyzeImage = async (base64: string) => {
    this.setState({ 
      loading: true,
      analysisResult: '',
      displayedText: '',
      typingIndex: 0,
    });

    this.cleanUpSSE();

    try {
      this.sseInstance = new SSE('https://ecovibe-backend.up.railway.app/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: `data:image/jpeg;base64,${base64}`
        }),
        pollingInterval: 0,
      });

      const sse = this.sseInstance;

      sse.addEventListener('message', (event) => {
        if (event.data) {
          try {
            const data = JSON.parse(event.data);
            if (data.chunk) {
              this.setState(prevState => {
                if (!prevState.analysisResult.endsWith(data.chunk)) {
                  return { analysisResult: prevState.analysisResult + data.chunk };
                }
                return null;
              });
            }
          } catch (error) {
            console.error('Error parsing SSE message:', error);
          }
        }
      });

      sse.addEventListener('error', (event) => {
        console.error('SSE Error:', event);
        this.cleanUpSSE();
        this.setState({ loading: false });
      });

      sse.addEventListener('close', () => {
        this.sseInstance = null;
        this.setState({ loading: false });
      });

    } catch (error) {
      let errorMessage = 'Failed to analyze the image';
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      }
      this.setState({
        analysisResult: errorMessage,
        loading: false,
      });
    }
  };

  render() {
    const { imageUri, loading, displayedText } = this.state;

    return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
          <Button title="Take a Photo" onPress={this.takePhoto} color="#4CAF50" />
          {loading && <ActivityIndicator size="large" color="#4CAF50" style={styles.loadingIndicator} />}
          {this.state.analysisResult && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultText}>{displayedText}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingTop: 20, // Add top padding to match other sections
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  image: {
    width: 300,
    height: 300,
    marginBottom: 20,
    borderRadius: 15, // Apply rounded corners for consistency
    borderWidth: 2,
    borderColor: '#ddd', // Border color for the image
  },
  loadingIndicator: {
    marginTop: 20,
  },
  resultContainer: {
    marginTop: 30,
    width: '100%',
    padding: 15,
    backgroundColor: '#F1F1F1', // Add a background for better readability
    borderRadius: 10, // Rounded corners for the result box
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  resultText: {
    fontSize: 16,
    textAlign: 'left',
    color: '#333',
  },
});

export default AiClassifier;
