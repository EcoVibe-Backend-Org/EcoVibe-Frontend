import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Define types
interface UserRank {
  id: string;
  name: string;
  points: number;
  rank: number;
  type: 'gold' | 'silver' | 'bronze' | 'default';
}

interface UserStats {
  totalPoints: number;
  currentPoints: number;
  nextRankPoints: number;
  weeklyRank: number;
}

interface RankData {
  globalRank: number;
  friendRank: number;
  totalFriends: number;
}

const BASE_URL = 'https://ecovibe-backend.up.railway.app/api';

export default function Leaderboard() {
  const [globalUsers, setGlobalUsers] = useState<UserRank[]>([]);
  const [friendsData, setFriendsData] = useState<UserRank[]>([]);
  const [currentUser, setCurrentUser] = useState<UserRank & { globalRank: number; friendRank: number; nextRankPoints: number } | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('This Week');
  const [viewMode, setViewMode] = useState<'Global' | 'Friends'>('Global');
  const [error, setError] = useState<string | null>(null);

  // Fetch authentication data
  useEffect(() => {
    const getAuthData = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsedUserData = JSON.parse(userData);
          setToken(parsedUserData.token);
          setUserId(parsedUserData.id);
          setFirstName(parsedUserData.firstName);
        }
      } catch (error) {
        console.error('Error fetching auth data:', error);
        setError('Could not retrieve authentication data');
      }
    };

    getAuthData();
  }, []);

  // Fetch leaderboard data when token is available
  useEffect(() => {
    if (!token || !userId) return;
    fetchLeaderboardData();
  }, [token, userId, activeTab, viewMode]);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Create axios instance with auth header
      const api = axios.create({
        baseURL: BASE_URL,
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Determine which timeframe endpoint to use
      let timeframe = 'all-time';
      if (activeTab === 'This Week') timeframe = 'weekly';
      else if (activeTab === 'This Month') timeframe = 'monthly';
      
      // Fetch data based on view mode
      if (viewMode === 'Global') {
        const response = await api.get(`/users/leaderboard/${timeframe}`);
        setGlobalUsers(response.data.map((user: any, index: number) => ({
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          points: timeframe === 'all-time' ? user.totalPoints : user.currentPoints,
          rank: index + 1,
          type: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : 'default'
        })));
      } else {
        const response = await api.get('/users/leaderboard/friends');
        setFriendsData(response.data.map((user: any, index: number) => ({
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          points: timeframe === 'all-time' ? user.totalPoints : user.currentPoints,
          rank: index + 1,
          type: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : 'default'
        })));
      }
      
      // Fetch user stats
      const statsResponse = await api.get('/users/leaderboard/stats');
      
      // Fetch rank data
      const rankResponse = await api.get('/users/rank');
      
      // Create current user object
        // Create current user object
        const currentUserData = {
        id: userId ?? '', // Convert null to empty string
        name: `${firstName || 'User'}`,
        points: timeframe === 'all-time' ? statsResponse.data.totalPoints : statsResponse.data.currentPoints,
        globalRank: rankResponse.data.globalRank,
        friendRank: rankResponse.data.friendRank,
        nextRankPoints: statsResponse.data.nextRankPoints,
        rank: rankResponse.data.globalRank,
        type: 'default' as const
        };

      
      setCurrentUser(currentUserData);
      setUserStats(statsResponse.data);
      
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      setError('Failed to load leaderboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeaderboardData();
  };

  const getDisplayData = (): UserRank[] => {
    return viewMode === 'Global' ? globalUsers : friendsData;
  };

  const getColor = (type: string): string => {
    switch (type) {
      case 'gold': return 'border-yellow-400';
      case 'silver': return 'border-gray-400';
      case 'bronze': return 'border-orange-400';
      default: return 'border-gray-200';
    }
  };

  const displayData = getDisplayData();
  const topThree = displayData.slice(0, 3);
  const others = displayData.slice(3);

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#10b981" />
        <Text className="mt-2 text-gray-600">Loading leaderboard...</Text>
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View className="flex-1 bg-white justify-center items-center px-4">
        <Text className="text-red-500 mb-2">{error}</Text>
        <Pressable 
          className="bg-green-500 py-2 px-4 rounded-lg"
          onPress={fetchLeaderboardData}
        >
          <Text className="text-white font-semibold">Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white px-4 pt-10">
      {/* Tabs */}
      <View className="flex-row justify-around border-b mb-4">
        {['This Week', 'This Month', 'All Time'].map((label) => (
          <Pressable 
            key={label} 
            onPress={() => setActiveTab(label)}
            className={`pb-2 ${activeTab === label ? 'border-b-2 border-green-500' : ''}`}
          >
            <Text className={`text-sm ${activeTab === label ? 'text-green-500 font-semibold' : 'text-gray-500'}`}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Global/Friends */}
      <View className="flex-row justify-center mb-4">
        <View className="bg-gray-100 p-1 rounded-full flex-row">
          <Pressable 
            onPress={() => setViewMode('Global')}
            className={`px-3 py-1 rounded-full ${viewMode === 'Global' ? 'bg-white' : ''}`}
          >
            <Text className={`text-xs ${viewMode === 'Global' ? 'font-semibold' : 'text-gray-500'}`}>Global</Text>
          </Pressable>
          <Pressable 
            onPress={() => setViewMode('Friends')}
            className={`px-3 py-1 rounded-full ${viewMode === 'Friends' ? 'bg-white' : ''}`}
          >
            <Text className={`text-xs ${viewMode === 'Friends' ? 'font-semibold' : 'text-gray-500'}`}>Friends</Text>
          </Pressable>
        </View>
      </View>

      {/* Top 3 */}
      <View className="flex-row justify-around mb-6">
        {topThree.length > 0 ? (
          topThree.map((user, i) => (
            <View key={`top-${user.id || i}`} className="items-center">
              <View className={`w-16 h-16 rounded-full border-4 ${getColor(user.type)} mb-2`} />
              <Text className="text-sm font-semibold">{user.name}</Text>
              <Text className="text-xs text-gray-500">{user.points} pts</Text>
            </View>
          ))
        ) : (
          <Text className="text-gray-500 italic">No data available</Text>
        )}
      </View>

      {/* List */}
      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {others.length > 0 ? (
  others.map((user) => (
                <View 
                key={`list-${user.id}`}
                className={`flex-row items-center justify-between px-4 py-3 mb-2 rounded-lg ${
                    currentUser?.id === user.id ? 'bg-green-50' : 'bg-white'
                }`}
                >
                <View className="flex-row items-center">
                    <Text className="text-base font-semibold w-6 text-center">{user.rank}</Text>
                    <View className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center ml-3 mr-2">
                        <Text className="text-xs font-medium">{user.name.charAt(0)}</Text>
                    </View>
                    <View>
                        <Text className="text-sm font-medium">{user.name}</Text>
                    </View>
                </View>
                <Text className="text-sm font-medium">{user.points} pts</Text>
                </View>
            ))
            ) : (
          <View className="items-center py-8">
            <Text className="text-gray-500 italic">
              {viewMode === 'Friends' ? 'No friends yet' : 'No users found'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Current User Summary */}
      {currentUser && (
        <View className="p-4 border-t border-gray-200 mt-2">
          <Text className="text-sm">
            Your Rank: #{viewMode === 'Global' ? currentUser.globalRank : currentUser.friendRank}
          </Text>
          <View className="h-2 bg-gray-200 rounded-full mt-2">
            <View
              className="h-2 bg-green-400 rounded-full"
              style={{ 
                width: `${Math.min(100, (currentUser.points / (currentUser.nextRankPoints || currentUser.points + 100)) * 100)}%` 
              }}
            />
          </View>
          <Text className="text-xs text-gray-500 mt-1">
            {(currentUser.nextRankPoints || currentUser.points + 100) - currentUser.points} points until next rank
          </Text>
        </View>
      )}
    </View>
  );
}
