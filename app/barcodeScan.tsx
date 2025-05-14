import { Text, View, Button, ScrollView } from "react-native";
import React, { Component } from "react";
import { CameraView, Camera } from "expo-camera";
import axios from "axios";

// Define the base API URI as a constant
const API_BASE_URI = "https://ecovibe-backend.up.railway.app";

interface BarcodeScanState {
  hasPermission: boolean | null;
  scanner: boolean;
  text: string;
  response: string | null;
  loading: boolean;
}

class BarcodeScan extends Component<{}, BarcodeScanState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      hasPermission: null,
      scanner: false,
      text: "Not Yet Scanned",
      response: null,
      loading: false
    };
  }

  componentDidMount() {
    this.askForCameraPermission();
  }

  askForCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    this.setState({ hasPermission: status === "granted" });
  };

  fetchBarcodeData = async (data: string) => {
    try {
      this.setState({ loading: true });
      const response = await axios.get(`${API_BASE_URI}/api/barcodes/${encodeURIComponent(data)}`);
      if (response.data && response.data.response) {
        this.setState({ response: response.data.response });
      } else {
        this.setState({ response: "Not in database yet" });
      }
    } catch (error) {
      console.error("Error fetching barcode data:", error);
      this.setState({ response: "Not in database yet" });
    } finally {
      this.setState({ loading: false });
    }
  };

  handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    this.setState({
      scanner: true,
      text: `Type: ${type}\nData: ${data}`,
      response: null
    });
    console.log(`Type: ${type}\nData: ${data}`);
    await this.fetchBarcodeData(data);
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
        <Button title="Allow Camera" onPress={this.askForCameraPermission} />
      </View>
    );
  }

  renderScannerView() {
    const { scanner, text, response, loading } = this.state;

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
        
        {loading && <Text className="text-lg mt-2">Loading...</Text>}
        
        {response && (
          <View className="mt-4 w-full max-h-40 border border-gray-300 rounded-lg p-2">
            <ScrollView>
              <Text className="text-base">{response}</Text>
            </ScrollView>
          </View>
        )}
        
        {scanner && (
          <Button 
            title="Scan Again?" 
            onPress={() => this.setState({ scanner: false, response: null })} 
            color="tomato" 
          />
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
