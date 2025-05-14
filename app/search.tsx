import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  SafeAreaView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

// Define types
interface User {
  _id: string;
  username: string;
  firstName?: string;
  lastName?: string;
}

interface FriendRequest {
  _id: string;
  requester: User;
  recipient: User;
  status: string;
  createdAt: string;
}

interface Friend {
  _id: string;
  friend: User;
}

const API_URL = 'https://ecovibe-backend.up.railway.app/api'; // Updated API URL

const AddFriendsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getAuthData = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsedUserData = JSON.parse(userData);
          setToken(parsedUserData.token);
          setUserId(parsedUserData.id);
        }
      } catch (error) {
        console.error('Error fetching auth data:', error);
      }
    };

    getAuthData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (token) {
        fetchFriends();
        fetchPendingRequests();
      }
    }, [token])
  );

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/users/friends`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFriends(response.data);
    } catch (error) {
      console.error('Error fetching friends:', error);
      Alert.alert('Error', 'Failed to load friends');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/friend-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingRequests(response.data);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      Alert.alert('Error', 'Failed to load friend requests');
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/users/search?query=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching users:', error);
      Alert.alert('Error', 'Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (recipientId: string) => {
    try {
      await axios.post(
        `${API_URL}/friends/request`,
        { recipientId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Success', 'Friend request sent successfully');
      searchUsers();
    } catch (error: any) {
      console.error('Error sending friend request:', error);
      Alert.alert('Error', error.response?.data || 'Failed to send friend request');
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    try {
      await axios.post(
        `${API_URL}/friends/accept`,
        { requestId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Success', 'Friend request accepted');
      fetchFriends();
      fetchPendingRequests();
    } catch (error) {
      console.error('Error accepting friend request:', error);
      Alert.alert('Error', 'Failed to accept friend request');
    }
  };

  const deleteFriendRequest = async (requestId: string) => {
    try {
      await axios.delete(`${API_URL}/friends/delete/${requestId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Alert.alert('Success', 'Friend request deleted');
      fetchPendingRequests();
    } catch (error) {
      console.error('Error deleting friend request:', error);
      Alert.alert('Error', 'Failed to delete friend request');
    }
  };

  const isFriend = (userId: string) => {
    return friends.some(f => f.friend._id === userId);
  };

  const hasPendingRequest = (userId: string) => {
    return pendingRequests.some(r => r.requester._id === userId);
  };

  const renderUserItem = ({ item }: { item: User }) => {
    const isUserFriend = isFriend(item._id);
    const hasPending = hasPendingRequest(item._id);
    
    return (
      <View className="flex-row justify-between items-center bg-green-50 p-4 rounded-lg mb-2 shadow-sm">
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-green-200 rounded-full justify-center items-center mr-3">
            <Text className="text-green-800 font-bold">
              {item.firstName?.charAt(0) || item.username.charAt(0)}
            </Text>
          </View>
          <View>
            <Text className="font-semibold text-green-900">{item.firstName} {item.lastName}</Text>
            <Text className="text-green-700 text-xs">@{item.username}</Text>
          </View>
        </View>
        
        {isUserFriend ? (
          <Text className="text-green-700 font-medium">Friends</Text>
        ) : hasPending ? (
          <Text className="text-amber-600 font-medium">Pending</Text>
        ) : (
          <TouchableOpacity 
            onPress={() => sendFriendRequest(item._id)}
            className="bg-green-600 px-3 py-1 rounded-full"
          >
            <Text className="text-white font-medium">Add</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderPendingRequestItem = ({ item }: { item: FriendRequest }) => (
    <View className="flex-row justify-between items-center bg-green-50 p-4 rounded-lg mb-2 shadow-sm">
      <View className="flex-row items-center">
        <View className="w-10 h-10 bg-green-200 rounded-full justify-center items-center mr-3">
          <Text className="text-green-800 font-bold">
            {item.requester.firstName?.charAt(0) || item.requester.username.charAt(0)}
          </Text>
        </View>
        <View>
          <Text className="font-semibold text-green-900">{item.requester.firstName} {item.requester.lastName}</Text>
          <Text className="text-green-700 text-xs">@{item.requester.username}</Text>
        </View>
      </View>
      
      <View className="flex-row">
        <TouchableOpacity 
          onPress={() => acceptFriendRequest(item._id)}
          className="bg-green-600 px-3 py-1 rounded-full mr-2"
        >
          <Text className="text-white font-medium">Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => deleteFriendRequest(item._id)}
          className="bg-gray-300 px-3 py-1 rounded-full"
        >
          <Text className="text-gray-700 font-medium">Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1">
      <View className="p-4">
        
        {/* Search Bar */}
        <View className="flex-row bg-white rounded-full px-4 py-2 mb-6 items-center shadow-sm border border-green-200">
          <Ionicons name="search" size={20} color="#166534" />
          <TextInput
            className="flex-1 ml-2 text-green-900"
            placeholder="Search by username, email, or phone"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={searchUsers}
            returnKeyType="search"
            placeholderTextColor="#65a30d"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#166534" />
            </TouchableOpacity>
          )}
        </View>

        {/* Pending Friend Requests Section */}
        {pendingRequests.length > 0 && (
          <View className="mb-6">
            <Text className="text-base font-semibold mb-2 text-green-900">Friend Requests</Text>
            <FlatList
              data={pendingRequests}
              renderItem={renderPendingRequestItem}
              keyExtractor={item => item._id}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Search Results */}
        {loading ? (
          <ActivityIndicator size="large" color="#166534" className="mt-4" />
        ) : searchResults.length > 0 ? (
          <View>
            <Text className="text-base font-semibold mb-2 text-green-900">Search Results</Text>
            <FlatList
              data={searchResults}
              renderItem={renderUserItem}
              keyExtractor={item => item._id}
              scrollEnabled={false}
            />
          </View>
        ) : searchQuery.length > 0 ? (
          <View className="items-center justify-center mt-10">
            <Ionicons name="people" size={50} color="#84cc16" />
            <Text className="text-green-600 mt-2">No users found</Text>
          </View>
        ) : (
          <View className="items-center justify-center mt-10">
            <Ionicons name="search" size={50} color="#84cc16" />
            <Text className="text-green-600 mt-2">Search for friends to add</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default AddFriendsScreen;
