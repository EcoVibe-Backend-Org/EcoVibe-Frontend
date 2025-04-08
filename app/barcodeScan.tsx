import { Text, View, Button } from "react-native";
import React, { Component } from "react";
import { CameraView, Camera } from "expo-camera";

interface BarcodeScanState {
  hasPermission: boolean | null;
  scanner: boolean;
  text: string;
}

class BarcodeScan extends Component<{}, BarcodeScanState> {
  constructor(props: {}) {
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
          <Button 
            title="Scan Again?" 
            onPress={() => this.setState({ scanner: false })} 
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
