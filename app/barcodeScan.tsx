import { StyleSheet, Text, View, Button } from "react-native";
import React, { useState, useEffect } from "react";
import { CameraView, Camera } from "expo-camera";

const BarcodeScan = () => {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanner, setScanner] = useState<boolean>(false);
    const [text, setText] = useState<string>("Not Yet Scanned");

    const askForCameraPermission = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === "granted");
    };

    useEffect(() => {
        askForCameraPermission();
    }, []);

    const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
        setScanner(true);
        setText(`Type: ${type}\nData: ${data}`);
        console.log(`Type: ${type}\nData: ${data}`);
    };

    if (hasPermission === null) {
        return (
            <View style={styles.container}>
                <Text>Requesting for Camera Permission</Text>
            </View>
        );
    }

    if (hasPermission === false) {
        return (
            <View style={styles.container}>
                <Text style={{ margin: 10 }}>No access to camera</Text>
                <Button title="Allow Camera" onPress={askForCameraPermission} />
            </View>
        );
    }

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
                    onBarcodeScanned={scanner ? undefined : handleBarCodeScanned}
                    style={{ height: 400, width: 400 }}
                />
            </View>
            <Text style={styles.mainText}>{text}</Text>
            {scanner && (
                <Button title="Scan Again?" onPress={() => setScanner(false)} color="tomato" />
            )}
        </View>
    );
};

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