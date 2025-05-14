// CommunityMapScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  Alert,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import axios from "axios";
import FilterIcon from "../../assets/filter.png";
import GPSIcon from "../../assets/gps.png";
import { ActivityIndicator } from "react-native";

// ============================
// Type Definitions
// ============================

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

// ============================
// Component
// ============================
const CommunityMapScreen = () => {
  // ========================
  // State Variables
  // ========================
  const [pins, setPins] = useState<Pin[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);

  //modals
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isAddVisible, setIsAddVisible] = useState(false);

  const [selectedPin, setSelectedPin] = useState<Pin | null>(null); //pins fetched
  const [searchQuery, setSearchQuery] = useState(""); //search bar

  //location add button
  const [locationName, setLocationName] = useState<string>(""); //location clicked by user on map
  const [locationDescription, setLocationDescription] = useState<string>(""); //location clicked by user on map
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); //to close and open the dropdown
  const [selectedType, setSelectedType] = useState(""); //dropdown selection
  const locationTypes = [
    "Recycling Bin",
    "Recycling Vendor",
    "Community Drop-off",
  ]; // List of location types for dropdown

  //filter add button
  const [selectedBinType, setSelectedBinType] = useState(null);
  const [selectedVendorType, setSelectedVendorType] = useState(null);

  const [error, setError] = useState<string | null>(null); // To store any error message
  const [isLoading, setIsLoading] = useState(false); // To handle loading state

  // ========================
  // Data Fetching Functions
  // ========================
  const fetchPins = async () => {
    try {
      const res = await axios.get(
        "https://ecovibe-backend.up.railway.app/api/pin/get/all"
      );
      setPins(res.data);
    } catch (err) {
      console.error("Failed to fetch pins:", err);
    }
  };

  //not yet ready
  const fetchFeed = async () => {
    setFeed([
      {
        id: "f1",
        user: "Alex",
        text: "recycled at Main St. Bin",
        timeAgo: "5m ago",
      },
      {
        id: "f2",
        user: null,
        text: "System: New vendor EcoMart added",
        timeAgo: "10m ago",
      },
      {
        id: "f3",
        user: null,
        text: "You earned 10 points!",
        timeAgo: "15m ago",
      },
    ]);
  };

  useEffect(() => {
    fetchPins();
    fetchFeed();
  }, []);

  const mapRef = React.useRef<MapView>(null);

  //not the most accurate geocoding api
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    const query = encodeURIComponent(searchQuery.trim());
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "ReactNativeApp",
        },
      });
      const results = await response.json();

      if (results.length > 0) {
        const { lat, lon } = results[0];
        const coordinate = {
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
        };

        mapRef.current.animateToRegion(
          {
            ...coordinate,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          1000
        );
      } else {
        console.log("No results found.");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null); // Reset any previous error messages

    try {
      // Make sure all fields are filled before sending
      if (
        !locationName ||
        !selectedType ||
        !locationDescription ||
        !selectedMaterial ||
        !selectedLocation
      ) {
        throw new Error("All fields are required.");
      }
      console.log(selectedLocation);
      // Build the new pin matching backend expectations
      const pinData = {
        name: locationName,
        location: {
          type: "Point",
          coordinates: [selectedLocation.longitude, selectedLocation.latitude],
        },
        type: selectedType,
        description: locationDescription,
        acceptedMaterials: [selectedMaterial],
      };
      console.log(pinData);
      const response = await fetch(
        "https://ecovibe-backend.up.railway.app/api/pin/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pinData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add location.");
      }

      alert("Location added successfully!");
      setIsAddVisible(false);
      setLocationName("");
      setLocationDescription("");
      setSelectedLocation(null);
      setSelectedMaterial(null);
      setSelectedType("");

      fetchPins(); // <-- Refresh pins on map
    } catch (error: any) {
      setError(error.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };
  const resetFilters = () => {
    setSelectedBinType(null);
    setSelectedVendorType(null);
    fetchPins();
  };
  const fetchFilteredPins = async (
    typeFilter: string[] = [],
    materialFilter: string[] = []
  ) => {
    try {
      const res = await axios.post(
        "https://ecovibe-backend.up.railway.app/api/pin/get/filtered",
        {
          types: typeFilter,
          acceptedMaterials: materialFilter,
        }
      );
      setPins(res.data); // Update pins on the map with filtered data
    } catch (err) {
      console.error("Failed to filter pins:", err);
    }
  };
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* =======================
        Header Section
      ======================= */}
      <View className="p-4 bg-white z-10">
        <Text className="text-xl font-semibold mb-2">Community Map</Text>
        <View className="flex-row items-center">
          {/* Search Bar */}
          <TextInput
            className="flex-1 border border-gray-300 rounded-lg p-2 bg-gray-100"
            placeholder="Search places"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {/* Search Button */}
          <TouchableOpacity
            onPress={handleSearch}
            className="ml-2 p-2 bg-green-500 rounded-lg"
          >
            <Text className="text-white font-bold">Go</Text>
          </TouchableOpacity>

          {/* Filter Button */}
          <TouchableOpacity
            onPress={() => setIsFilterVisible(true)}
            className="ml-2 p-2 bg-gray-200 rounded-lg"
          >
            <Image source={FilterIcon} className="w-6 h-6" />
          </TouchableOpacity>
        </View>
      </View>

      {/* =======================
        Map Section
      ======================= */}
      <MapView
        ref={mapRef}
        style={{ width: "100%", height: "77%" }}
        initialRegion={{
          latitude: 30.020319,
          longitude: 31.502139,
          latitudeDelta: 0.03,
          longitudeDelta: 0.015,
        }}
        onPress={(e) => {
          const { latitude, longitude } = e.nativeEvent.coordinate;
          setSelectedLocation({ latitude, longitude });
        }}
      >
        {/* Displaying pins on the map */}
        {pins.map((pin) => {
          const { coordinates } = pin.location || {}; // Destructure location to handle undefined
          if (!coordinates || coordinates.length < 2) {
            return null; // Skip pins without valid coordinates
          }

          const [longitude, latitude] = coordinates; // Assuming coordinates is an array with [longitude, latitude]
          return (
            <Marker
              key={pin._id}
              coordinate={{
                latitude,
                longitude,
              }}
              pinColor={getPinColor(pin.type)}
              title={pin.name}
              description={pin.description}
              onPress={() => setSelectedPin(pin)}
            />
          );
        })}

        {/* Marker for the selected location */}
        {selectedLocation && (
          <Marker
            coordinate={selectedLocation}
            pinColor="red"
            title="Selected Location"
            description="You clicked here"
          />
        )}
      </MapView>

      {/* =======================
        Add Location Button
      ======================= */}
      <TouchableOpacity
        style={{ position: "absolute", bottom: 130, left: 24 }}
        onPress={() => setIsAddVisible(true)}
        className="bg-green-600 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-10"
      >
        <Text className="text-3xl text-white">+</Text>
      </TouchableOpacity>

      {/* =======================
        Activity Feed Section
      ======================= */}
      <FlatList
        data={feed}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="bg-green-100 rounded-xl p-3 m-1 min-w-[140px] max-w-[180px]">
            <View className="flex-row items-center mb-1">
              <Text className="text-lg mr-1">👤</Text>
              <Text numberOfLines={1} className="font-medium">
                {item.user ? `${item.user} ` : ""}
                {item.text}
              </Text>
            </View>
            <Text className="text-xs text-gray-600">{item.timeAgo}</Text>
          </View>
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        className="absolute bottom-3 left-0 right-0 px-2"
      />

      {/* =======================
          Filter Modal
      ======================= */}
      <Modal visible={isFilterVisible} transparent animationType="slide">
        <View className="flex-1 justify-center items-center bg-black/30">
          <View className="w-[90%] bg-white rounded-2xl p-6">
            {/* Close Button */}
            <TouchableOpacity
              className="w-9 h-9 bg-white rounded-full items-center justify-center"
              onPress={() => setIsFilterVisible(false)}
            >
              <Text className="text-xl text-gray-800">✕</Text>
            </TouchableOpacity>
            <Text className="text-xl font-bold text-center mb-4">
              Filter Locations
            </Text>
            {/* Bin Types */}
            <Text className="text-base font-semibold mb-2">Bin Types</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {["Plastic", "Paper", "Glass", "E-Waste", "Metal"].map((type) => (
                <TouchableOpacity
                  key={type}
                  className={`px-4 py-2 border rounded-md ${
                    selectedBinType === type ? "bg-green-600" : "bg-white"
                  } border-gray-300`}
                  onPress={() => setSelectedBinType(type)}
                >
                  <Text
                    className={`text-sm ${
                      selectedBinType === type ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {/* Vendor Types */}
            <Text className="text-base font-semibold mb-2">Vendor Types</Text>
            <View className="flex-row flex-wrap gap-2 mb-6">
              {["Discounts", "Gifts", "Services"].map((type) => (
                <TouchableOpacity
                  key={type}
                  className={`px-4 py-2 border rounded-md ${
                    selectedVendorType === type ? "bg-green-600" : "bg-white"
                  } border-gray-300`}
                  onPress={() => setSelectedVendorType(type)}
                >
                  <Text
                    className={`text-sm ${
                      selectedVendorType === type
                        ? "text-white"
                        : "text-gray-800"
                    }`}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            f{/* Apply Button */}
            <TouchableOpacity
              className="flex-row items-center justify-center bg-green-600 py-3 rounded-md"
              onPress={() => {
                fetchFilteredPins(
                  selectedType ? [selectedType] : [],
                  selectedBinType ? [selectedBinType] : []
                );
                setIsFilterVisible(false);
              }}
            >
              <Image
                source={FilterIcon}
                className="w-5 h-5 mr-2"
                resizeMode="contain"
              />
              <Text className="text-white font-semibold">Apply Filters</Text>
            </TouchableOpacity>
            {/* Reset Filters Button */}
            <TouchableOpacity
              className="flex-row items-center justify-center bg-gray-300 py-3 rounded-md mt-4"
              onPress={resetFilters}
            >
              <Text className="text-black font-semibold">Reset Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* =======================
        Add Location Modal
      ======================= */}
      <Modal visible={isAddVisible} transparent animationType="slide">
        <View className="flex-1 items-center justify-center bg-black/30">
          <View className="w-[402px] h-[871px] bg-[#F9F9F9] rounded-2xl p-4 relative">
            <View className="absolute top-8 left-4 flex-row items-center w-[370px] h-9">
              <TouchableOpacity
                className="w-9 h-9 bg-white rounded-full items-center justify-center"
                onPress={() => setIsAddVisible(false)}
              >
                <Text className="text-xl text-gray-800">✕</Text>
              </TouchableOpacity>
              <Text className="ml-4 text-[17px] font-semibold text-[#333]">
                Add Location
              </Text>
            </View>

            {/* Location Selection Section */}
            <View className="absolute top-[92px] left-4 w-[370px]">
              {/* Location Selection */}
              <View
                className={`flex-row items-center bg-white border rounded-lg h-[78px] mb-6 ${"border-[#D3D3D3]"}`}
              >
                <View
                  className={`w-10 h-10 bg-[#4CAF50] rounded-full m-[19px] items-center justify-center`}
                >
                  <Image
                    source={GPSIcon}
                    className="w-5 h-5"
                    resizeMode="contain"
                  />
                </View>
                <View>
                  <Text className="text-[13.6px] font-medium text-[#333]">
                    Selected Location
                  </Text>
                  <Text className="text-[11.9px] text-[#666] mt-1">
                    Save the red pin you placed on map
                  </Text>
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-[11.9px] font-medium text-[#333] mb-1.5">
                  Location Name
                </Text>
                <TextInput
                  value={locationName} // Use state variable for value
                  onChangeText={(text) => setLocationName(text)} // Update state on input change
                  placeholder="e.g., Community Recycling Bin"
                  placeholderTextColor="#CCC"
                  className="h-[42px] border border-gray-300 rounded-lg px-3 text-[16px]"
                />
              </View>

              {/* Location Type Dropdown */}
              <View className="mb-4">
                <Text className="text-[11.9px] font-medium text-[#333] mb-1.5">
                  Location Type
                </Text>
                <TouchableOpacity
                  className="flex-row items-center justify-between border border-gray-300 rounded-lg px-3 h-[39px]"
                  onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <Text className="text-[16px] text-black">{selectedType}</Text>
                  <Text className="text-black text-xl">⌄</Text>
                </TouchableOpacity>
                {isDropdownOpen && (
                  <View className="border border-gray-300 rounded-lg mt-1 bg-white">
                    {locationTypes.map((type) => (
                      <TouchableOpacity
                        key={type}
                        className="px-3 py-2"
                        onPress={() => {
                          setSelectedType(type);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <Text className="text-[16px] text-black">{type}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Description Input */}
              <View className="mb-4">
                <Text className="text-[11.9px] font-medium text-[#333] mb-1.5">
                  Description
                </Text>
                <TextInput
                  placeholder="Add details about this location..."
                  placeholderTextColor="#CCC"
                  value={locationDescription} // Use state variable for value
                  onChangeText={(text) => setLocationDescription(text)} // Update state on input change
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="h-[90px] border border-gray-300 rounded-lg px-3 py-2 text-[16px]"
                />
              </View>

              {/* Accepted Materials Section */}
              <View className="mb-4">
                <Text className="text-[11.9px] font-medium text-[#333] mb-1.5">
                  Accepted Materials
                </Text>
                <View className="flex-wrap flex-row gap-2">
                  {["Plastic", "Paper", "Glass", "Metal", "E-Waste"].map(
                    (item, index) => {
                      const isSelected = selectedMaterial === item;
                      return (
                        <TouchableOpacity
                          key={index}
                          onPress={() => setSelectedMaterial(item)}
                          className={`w-[181px] h-[42px] border rounded-lg items-center justify-center ${
                            isSelected
                              ? "border-[#4CAF50] bg-[#E8F5E9]"
                              : "border-[#E5E7EB] bg-white"
                          }`}
                        >
                          <Text
                            className={`text-[13.6px] ${
                              isSelected ? "text-[#4CAF50]" : "text-[#333]"
                            }`}
                          >
                            {item}
                          </Text>
                        </TouchableOpacity>
                      );
                    }
                  )}
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                className="bg-green-600 py-3 rounded-md justify-center items-center"
                onPress={handleSubmit} // Calls handleSubmit
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-white font-semibold">
                    Submit New LocahandleSubmittion
                  </Text>
                )}
              </TouchableOpacity>

              {error && (
                <Text className="text-red-500 text-center mb-4">{error}</Text>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* =======================
        Pin Detail Modal
      ======================= */}
      {selectedPin && (
        <Modal transparent visible animationType="fade">
          <View className="m-9 mt-1/3 bg-white rounded-2xl p-6 shadow-xl">
            <TouchableOpacity
              className="w-9 h-9 bg-white rounded-full items-center justify-center"
              onPress={() => setSelectedPin(null)}
            >
              <Text className="text-xl text-gray-800">✕</Text>
            </TouchableOpacity>
            <Text className="font-bold text-lg mb-3">{selectedPin.name}</Text>
            <Text className="font-medium mt-1">Type: {selectedPin.type}</Text>
            {selectedPin.description && (
              <Text className="mt-2">{selectedPin.description}</Text>
            )}
            {selectedPin.acceptedMaterials.length > 0 && (
              <View className="flex-row mt-2 flex-wrap">
                {selectedPin.acceptedMaterials.map((mat) => (
                  <Text
                    key={mat}
                    className="bg-green-200 text-gray-800 rounded-lg px-3 py-1 mr-2 mb-1"
                  >
                    {mat}
                  </Text>
                ))}
              </View>
            )}
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

// Function to determine the pin color based on type
function getPinColor(type: string): string {
  if (type === "Recycling Bin") return "#16a34a";
  if (type === "Recycling Vendor") return "#3b82f6";
  return "#eab308";
}

export default CommunityMapScreen;
