import { Text, View, Alert, TouchableOpacity } from "react-native";
import React, { Component } from "react";
import { CameraView, Camera } from "expo-camera";
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

interface BarcodeScanState {
  hasPermission: boolean | null;
  scanner: boolean;
  text: string;
}

type Props = {
  navigation: any; // Use your correct navigation type here
};

class BarcodeScan extends Component<Props, BarcodeScanState> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasPermission: null,
      scanner: false,
      text: "Not Yet Scanned"
    };
  }

  componentDidMount() {
    this.askForCameraPermission();
  }

  askForCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    this.setState({ hasPermission: status === "granted" });
  };

  handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    this.setState({
      scanner: true,
      text: `Type: ${type}\nData: ${data}`
    });
    console.log(`Type: ${type}\nData: ${data}`);
  };

  handleRecycleButton = () => {
    const { navigation } = this.props;
    Alert.alert("500 points received!");
    navigation.navigate("Home"); // Change "Home" to your home/tab route name if needed
  };

  renderPermissionRequestView() {
    return (
      <View className="flex-1 bg-white items-center justify-center p-4">
        <Text className="text-lg text-center font-semibold">Requesting for Camera Permission</Text>
      </View>
    );
  }

  renderPermissionDeniedView() {
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
          onPress={this.askForCameraPermission}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  renderScannerView() {
    const { scanner, text } = this.state;

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
            onBarcodeScanned={scanner ? undefined : this.handleBarCodeScanned}
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
              onPress={() => this.setState({ scanner: false })}
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
              onPress={this.handleRecycleButton}
            >
              <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
                I Scanned this item
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  render() {
    const { hasPermission } = this.state;

    if (hasPermission === null) {
      return this.renderPermissionRequestView();
    }

    if (hasPermission === false) {
      return this.renderPermissionDeniedView();
    }

    return this.renderScannerView();
  }
}

export default BarcodeScan;