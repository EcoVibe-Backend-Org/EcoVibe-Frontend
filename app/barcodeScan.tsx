import { Text, View, Alert, TouchableOpacity, ScrollView } from "react-native";
import React, { useState, useEffect } from "react";
import { CameraView, Camera } from "expo-camera";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the base API URI as a constant
const API_BASE_URI = "https://ecovibe-backend.up.railway.app";

const BarcodeScan = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanner, setScanner] = useState(false);
  const [text, setText] = useState("Not Yet Scanned");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
      
      // Get user ID
      try {
        const id = await AsyncStorage.getItem('userId');
        if (id) {
          setUserId(id);
        } else {
          // For testing, you can use a hardcoded ID
          // Remove this in production
          setUserId('65cdf0f28f6e3c7fa1b7a1e9');
        }
      } catch (error) {
        console.error('Failed to get user ID:', error);
      }
    })();
  }, []);

  const fetchBarcodeData = async (data: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URI}/api/barcodes/${encodeURIComponent(data)}`);
      if (response.data && response.data.response) {
        setResponse(response.data.response);
      } else {
        setResponse("Not in database yet");
      }
    } catch (error) {
      console.error("Error fetching barcode data:", error);
      setResponse("Not in database yet");
    } finally {
      setLoading(false);
    }
  };

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    setScanner(true);
    setText(`Type: ${type}\nData: ${data}`);
    console.log(`Type: ${type}\nData: ${data}`);
    await fetchBarcodeData(data);
  };

  const handleRecycleButton = async () => {
    if (!userId) {
      Alert.alert('Error', 'User not logged in');
      return;
    }
    
    try {
      const response = await axios.post(`${API_BASE_URI}/api/points/award`, {
        userId,
        points: 10, // Award 10 points for scanning
        action: 'scan'
      });
      
      if (response.data.success) {
        Alert.alert(
          'Success!', 
          `You earned ${response.data.pointsAwarded} points for scanning this item.`
        );
        router.replace("/(tabs)/home"); // Navigate using Expo Router
      } else {
        throw new Error(response.data.message || 'Failed to award points');
      }
    } catch (error) {
      console.error('Error awarding points:', error);
      Alert.alert('Error', 'Failed to award points. Please try again.');
      // Still navigate back even if points award fails
      router.replace("/(tabs)/home");
    }
  };

  if (hasPermission === null) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-4">
        <Text className="text-lg text-center font-semibold">Requesting for Camera Permission</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-4">
        <Text className="text-lg text-center mb-4 font-semibold">No access to camera</Text>
        <TouchableOpacity
          style={{
            backgroundColor: "#22c55e",
            padding: 14,
            borderRadius: 8,
            marginTop: 16,
            width: 180,
            alignItems: "center"
          }}
          onPress={async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === "granted");
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white items-center justify-center p-4">
      <View className="items-center justify-center h-80 w-80 overflow-hidden rounded-xl bg-tomato">
        <CameraView
          barcodeScannerSettings={{
            barcodeTypes: [
              "qr", "ean13", "ean8", "upc_a", "upc_e",
              "code128", "code39", "code93", "itf14",
              "codabar", "pdf417", "aztec", "datamatrix"
            ]
          }}
          onBarcodeScanned={scanner ? undefined : handleBarCodeScanned}
          style={{ height: 400, width: 400 }}
        />
      </View>
      <Text className="text-xl text-center mt-5">{text}</Text>
      
      {loading && <Text className="text-lg mt-2">Loading...</Text>}
      
      {response && (
        <View className="mt-4 w-full max-h-40 border border-gray-300 rounded-lg p-2">
          <ScrollView>
            <Text className="text-base">{response}</Text>
          </ScrollView>
        </View>
      )}
      
      {scanner && (
        <View style={{ marginTop: 20, width: "100%", alignItems: "center" }}>
          <TouchableOpacity
            style={{
              backgroundColor: "#22c55e",
              padding: 14,
              borderRadius: 8,
              alignItems: "center",
              marginBottom: 12,
              width: 220,
            }}
            onPress={() => {
              setScanner(false);
              setResponse(null);
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
              Scan Again?
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: "#22c55e",
              padding: 14,
              borderRadius: 8,
              alignItems: "center",
              width: 220,
            }}
            onPress={handleRecycleButton}
          >
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
              I Scanned this item
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default BarcodeScan;