import { Text, View } from "react-native";
import BarcodeScan from "../components/barcodeScan"
import AiClassifier from "../components/AI_Classifier";
export default function Index() {
  return (
    /*<View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",w
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </View>*/
    // <AiClassifier />
    <BarcodeScan/>
  );
}