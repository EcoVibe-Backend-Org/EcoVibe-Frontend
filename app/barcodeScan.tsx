import { Text, View, Alert, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { CameraView, Camera } from "expo-camera";
import { useRouter } from "expo-router";

const BarcodeScan = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanner, setScanner] = useState(false);
  const [text, setText] = useState("Not Yet Scanned");

  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanner(true);
    setText(`Type: ${type}\nData: ${data}`);
    console.log(`Type: ${type}\nData: ${data}`);
  };

  const handleRecycleButton = () => {
    Alert.alert("500 points received!");
    router.replace("/(tabs)/home"); // Navigate using Expo Router
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
            onPress={() => setScanner(false)}
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
