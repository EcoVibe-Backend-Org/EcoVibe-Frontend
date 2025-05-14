import React, { Component } from 'react';
import { View, Image, Button, StyleSheet, ActivityIndicator, Text, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import SSE from 'react-native-sse';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Make sure this is imported

interface AiClassifierState {
  imageUri: string | null;
  loading: boolean;
  analysisResult: string;
  displayedText: string;
  typingIndex: number;
  userId: string | null;
  token: string | null;
  firstName: string | null;
  error: string | null;
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
      userId: null,
      token: null,
      firstName: null,
      error: null
    };
  }

  componentDidMount() {
    this.getAuthData();
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

  // Fetch authentication data
  getAuthData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        this.setState({
          token: parsedUserData.token,
          userId: parsedUserData.id,
          firstName: parsedUserData.firstName
        });
      } else {
        this.setState({ error: 'No authentication data found' });
      }
    } catch (error) {
      console.error('Error fetching auth data:', error);
      this.setState({ error: 'Could not retrieve authentication data' });
    }
  };

  private cleanUpSSE() {
    if (this.sseInstance) {
      this.sseInstance.close();
      this.sseInstance = null;
    }
  }

  takePhoto = async () => {
    const { userId } = this.state;
    
    if (!userId) {
      Alert.alert('Authentication Required', 'Please log in to use this feature');
      return;
    }

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
    const { userId, token } = this.state;
    
    if (!userId || !token) {
      this.setState({ 
        analysisResult: 'Authentication required. Please log in again.',
        loading: false
      });
      return;
    }
    
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
          'Authorization': `Bearer ${token}` // Add authentication token
        },
        body: JSON.stringify({
          imageBase64: `data:image/jpeg;base64,${base64}`,
          userId: userId // Include userId in the request
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
    const { imageUri, loading, displayedText, error } = this.state;

    return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          {error && <Text style={styles.errorText}>{error}</Text>}
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
    paddingTop: 20,
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
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  loadingIndicator: {
    marginTop: 20,
  },
  resultContainer: {
    marginTop: 30,
    width: '100%',
    padding: 15,
    backgroundColor: '#F1F1F1',
    borderRadius: 10,
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
  errorText: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  }
});

export default AiClassifier;
