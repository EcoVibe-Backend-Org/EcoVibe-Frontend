import { StyleSheet, Text, View, Button } from "react-native";
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
            <View style={styles.container}>
                <Text>Requesting for Camera Permission</Text>
            </View>
        );
    }

    renderPermissionDeniedView() {
        return (
            <View style={styles.container}>
                <Text style={{ margin: 10 }}>No access to camera</Text>
                <Button title="Allow Camera" onPress={this.askForCameraPermission} />
            </View>
        );
    }

    renderScannerView() {
        const { scanner, text } = this.state;

        return (
            <View style={styles.container}>
                <View style={styles.barcodeBox}>
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
                <Text style={styles.mainText}>{text}</Text>
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
    barcodeBox: {
        alignItems: "center",
        justifyContent: "center",
        height: 300,
        width: 300,
        overflow: "hidden",
        borderRadius: 30,
        backgroundColor: "tomato",
    },
    mainText: {
        fontSize: 16,
        margin: 20,
    },
});

export default BarcodeScan;