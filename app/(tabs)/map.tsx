import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

// === 1. Pin and Feed Type Definitions ===
interface Pin {
  _id: string;
  name: string;
  location: { coordinates: number[] };
  type: string;
  description: string;
  acceptedMaterials: string[];
}

interface FeedItem {
  id: string;
  user: string | null;
  text: string;
  timeAgo: string;
}

// === 2. Dummy Data (for testing) ===
const DUMMY_PINS: Pin[] = [
  {
    _id: "1",
    name: "Green Street Recycling Bin",
    location: { coordinates: [-0.09, 51.505] },
    type: "Recycling Bin",
    description: "Accepts plastic and cans",
    acceptedMaterials: ["plastic", "cans"],
  },
  {
    _id: "2",
    name: "EcoMart",
    location: { coordinates: [-0.1, 51.51] },
    type: "Recycling Vendor",
    description: "Recycling rewards partner",
    acceptedMaterials: [],
  },
  {
    _id: "3",
    name: "Community Drop-off Point",
    location: { coordinates: [-0.08, 51.506] },
    type: "Community Drop-off",
    description: "Local recycling initiative",
    acceptedMaterials: ["paper", "plastic"],
  },
];

const DUMMY_FEED: FeedItem[] = [
  {
    id: "f1",
    user: "Alex",
    text: "recycled at Main St. Bin",
    timeAgo: "5m ago",
  },
  {
    id: "f2",
    user: null,
    text: "System  New vendor: EcoMart added",
    timeAgo: "10m ago",
  },
  { id: "f3", user: null, text: "You earned 10 points!", timeAgo: "15m ago" },
];

// === 3. Main Component ===
const CommunityMapScreen = () => {
  const [pins, setPins] = useState<Pin[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isAddVisible, setIsAddVisible] = useState(false);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);

  useEffect(() => {
    setPins(DUMMY_PINS);
    setFeed(DUMMY_FEED);

    // --- LATER: Integrate with API like the following ---
    /*
    axios.get("/api/pin/get/all")
      .then(res => setPins(res.data));
    axios.get("/api/community/feed")
      .then(res => setFeed(res.data));
    */
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* HEADER & SEARCH BAR */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Community Map</Text>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for bins, vendors, or users"
          />
          <TouchableOpacity
            onPress={() => setIsFilterVisible(true)}
            style={styles.filterBtn}
          >
            <Text style={{ fontWeight: "bold" }}>⛃</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* MAP */}
      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: 51.505,
          longitude: -0.09,
          latitudeDelta: 0.03,
          longitudeDelta: 0.015,
        }}
      >
        {pins.map((pin) => (
          <Marker
            key={pin._id}
            coordinate={{
              latitude: pin.location.coordinates[1],
              longitude: pin.location.coordinates[0],
            }}
            pinColor={getPinColor(pin.type)}
            title={pin.name}
            description={pin.description}
            onPress={() => setSelectedPin(pin)}
          />
        ))}
      </MapView>

      {/* Add Location FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsAddVisible(true)}
      >
        <Text style={{ fontSize: 30, color: "#fff" }}>+</Text>
      </TouchableOpacity>

      {/* FEED CARDS */}
      <FlatList
        data={feed}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.feedCard}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 3,
              }}
            >
              <Text style={{ fontSize: 16, marginRight: 5 }}>👤</Text>
              <Text numberOfLines={1} style={{ fontWeight: "500" }}>
                {item.user ? `${item.user} ` : ""}
                {item.text}
              </Text>
            </View>
            <Text style={{ fontSize: 11, color: "#4B5563" }}>
              {item.timeAgo}
            </Text>
          </View>
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.feedList}
      />

      {/* FILTER MODAL (placeholder) */}
      <Modal visible={isFilterVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={{ fontWeight: "bold", fontSize: 20, marginBottom: 8 }}>
            Filter Locations
          </Text>
          {/* Add filter chips/buttons here */}
          <TouchableOpacity
            style={styles.closeModal}
            onPress={() => setIsFilterVisible(false)}
          >
            <Text style={{ fontSize: 24 }}>✕</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* ADD LOCATION MODAL (placeholder) */}
      <Modal visible={isAddVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={{ fontWeight: "bold", fontSize: 20, marginBottom: 8 }}>
            Add Location
          </Text>
          {/* Add form fields here */}
          <TouchableOpacity
            style={styles.closeModal}
            onPress={() => setIsAddVisible(false)}
          >
            <Text style={{ fontSize: 24 }}>✕</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* PIN DETAILS MODAL */}
      {selectedPin ? (
        <Modal transparent visible={!!selectedPin} animationType="fade">
          <View style={styles.pinModal}>
            <TouchableOpacity
              onPress={() => setSelectedPin(null)}
              style={styles.closeModal}
            >
              <Text style={{ fontSize: 24 }}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.popupTitle}>{selectedPin.name}</Text>
            <Text style={{ fontWeight: "500", marginTop: 6 }}>
              Type: {selectedPin.type}
            </Text>
            {selectedPin.description ? (
              <Text>{selectedPin.description}</Text>
            ) : null}
            {selectedPin.acceptedMaterials &&
              selectedPin.acceptedMaterials.length > 0 && (
                <View
                  style={{
                    flexDirection: "row",
                    marginTop: 8,
                    flexWrap: "wrap",
                  }}
                >
                  {selectedPin.acceptedMaterials.map((mat) => (
                    <Text style={styles.materialTag} key={mat}>
                      {mat}
                    </Text>
                  ))}
                </View>
              )}
          </View>
        </Modal>
      ) : null}
    </SafeAreaView>
  );
};

function getPinColor(type: string): string {
  if (type === "Recycling Bin") return "#16a34a";
  if (type === "Recycling Vendor") return "#2563eb";
  if (type === "Community Drop-off") return "#f59e42";
  return "red";
}

const styles = StyleSheet.create({
  header: { padding: 16, backgroundColor: "#fff", zIndex: 2 },
  headerText: { fontSize: 20, fontWeight: "600", marginBottom: 8 },
  searchRow: { flexDirection: "row", alignItems: "center" },
  searchInput: {
    flex: 1,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    backgroundColor: "#F0F0F0",
  },
  filterBtn: {
    marginLeft: 8,
    padding: 8,
    backgroundColor: "#E5E5E5",
    borderRadius: 8,
  },
  fab: {
    position: "absolute",
    bottom: 110,
    right: 24,
    backgroundColor: "#16a34a",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 10,
    zIndex: 10,
  },
  feedList: {
    position: "absolute",
    bottom: 48,
    left: 0,
    right: 0,
    paddingHorizontal: 8,
  },
  feedCard: {
    backgroundColor: "#dcfce7",
    borderRadius: 12,
    padding: 10,
    margin: 4,
    minWidth: 140,
    maxWidth: 180,
  },
  modalContainer: {
    margin: 36,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    elevation: 24,
  },
  closeModal: { position: "absolute", top: 14, right: 14 },
  pinModal: {
    margin: 36,
    marginTop: "50%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    elevation: 24,
  },
  popupTitle: { fontWeight: "bold", fontSize: 17, marginBottom: 12 },
  materialTag: {
    backgroundColor: "#ecfccb",
    color: "#222",
    borderRadius: 8,
    paddingHorizontal: 8,
    marginRight: 7,
    marginVertical: 2,
  },
});

export default CommunityMapScreen;
