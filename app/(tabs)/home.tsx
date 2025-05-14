import React from 'react';
import { View, Text, Image, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScanIcon from '../../assets/scan.png';
import CommunityIcon from '../../assets/community.png';
import BinIcon from '../../assets/recycle.png';
import RewardIcon from '../../assets/rewards.png';
import MilestoneImage from '../../assets/trashBins.png';
import CoffeeShop from '../../assets/koffeeCulture.png';
import ProfileIcon from '../../assets/user.png';
import AchievementIcon from '../../assets/achievement.png';
import TicketIcon from '../../assets/ticket.png';
import { Ionicons } from '@expo/vector-icons';

// API base URL - replace with your actual API URL
const API_BASE_URL = 'https://ecovibe-backend.up.railway.app/api';

export default function EcoVibeScreen() {
    const [token, setToken] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [firstName, setFirstName] = useState<string | null>(null);
    const [userPoints, setUserPoints] = useState<number>(0);
    const [recentActivities, setRecentActivities] = useState<any[]>([]);
    const [totalClassifications, setTotalClassifications] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);

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
            }
        };

        getAuthData();
    }, []);

    useEffect(() => {
        if (token && userId) {
            fetchUserData();
        }
    }, [token, userId]);

    const fetchUserData = async () => {
        setLoading(true);
        try {
            // Fetch user points
            const pointsResponse = await fetch(`${API_BASE_URL}/users/points/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const pointsData = await pointsResponse.json();
            setUserPoints(pointsData.points);

            // Fetch recent activities
            const activitiesResponse = await fetch(`${API_BASE_URL}/users/recent-activity/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const activitiesData = await activitiesResponse.json();
            setRecentActivities(activitiesData);

            // Fetch total AI classifications
            const classificationsResponse = await fetch(`${API_BASE_URL}/users/ai-classifications/count/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const classificationsData = await classificationsResponse.json();
            setTotalClassifications(classificationsData.count);
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Format the activity for display
    const formatActivity = (activity: any) => {
        switch (activity.type) {
            case 'post':
                return {
                    item: `Posted: ${activity.title.substring(0, 20)}${activity.title.length > 20 ? '...' : ''}`,
                    time: new Date(activity.createdAt).toLocaleString(),
                    points: ''
                };
            case 'comment':
                return {
                    item: `Commented: ${activity.content.substring(0, 20)}${activity.content.length > 20 ? '...' : ''}`,
                    time: new Date(activity.createdAt).toLocaleString(),
                    points: ''
                };
            case 'aiClassification':
                return {
                    item: `Scanned: ${activity.response.substring(0, 20)}${activity.response.length > 20 ? '...' : ''}`,
                    time: new Date(activity.createdAt).toLocaleString(),
                    points: ''
                };
            default:
                return {
                    item: 'Unknown activity',
                    time: new Date(activity.createdAt).toLocaleString(),
                    points: ''
                };
        }
    };

    if (loading && userId) {
        return (
            <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text className="mt-2 text-gray-600">Loading your eco data...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <ScrollView className="px-4 pt-8">
                {/* Header */}
                <View className="flex-row justify-between items-center mb-6">
                    <View className="py-3 flex-row">
                        <Text className="text-xl font-bold text-green-700">Eco </Text>
                        <Text className="text-xl font-bold text-black-700">Vibe</Text>
                    </View>
                    <TouchableOpacity>
                        <Image source={ProfileIcon} className="w-8 h-8" resizeMode="contain" style={{ tintColor: 'black' }}/>
                    </TouchableOpacity>
                </View>

                {/* Welcome Message */}
                <Text className="text-lg font-semibold mb-1">Welcome back, <Text className="text-green-700">{firstName}</Text>!</Text>
                <Text className="text-sm text-gray-500 mb-4">{userPoints} points <Text className="text-yellow-500">0 day streak 🔥</Text></Text>

                {/* Menu Options */}
                <View className="flex-row flex-wrap justify-between mb-6">
                    <TouchableOpacity
                        className="w-[48%] bg-gray-100 rounded-xl p-4 mb-4 items-center"
                        onPress={() => router.push('./scan')}
                    >
                        <Image source={ScanIcon} className="w-10 h-10 mb-2" style={{ tintColor: '#4CAF50' }} resizeMode="contain" />
                        <Text className="text-sm font-medium text-gray-700">Scan Item</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="w-[48%] bg-gray-100 rounded-xl p-4 mb-4 items-center"
                        onPress={() => router.push('./community')}
                    >
                        <Image source={CommunityIcon} className="w-10 h-10 mb-2" style={{ tintColor: '#4CAF50' }} resizeMode="contain" />
                        <Text className="text-sm font-medium text-gray-700">Community</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="w-[48%] bg-gray-100 rounded-xl p-4 mb-4 items-center"
                        onPress={() => router.push('./map')}
                    >
                        <Image source={BinIcon} className="w-10 h-10 mb-2" style={{ tintColor: '#4CAF50' }} resizeMode="contain" />
                        <Text className="text-sm font-medium text-gray-700">Find Bins</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="w-[48%] bg-gray-100 rounded-xl p-4 mb-4 items-center"
                        onPress={() => router.push('./rewards')}
                    >
                        <Image source={RewardIcon} className="w-10 h-10 mb-2" style={{ tintColor: '#4CAF50' }} resizeMode="contain" />
                        <Text className="text-sm font-medium text-gray-700">Redeem Rewards</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="w-[48%] bg-gray-100 rounded-xl p-4 mb-4 items-center"
                        onPress={() => router.push('../search')}
                    >
                        <Ionicons name="people-outline" size={28} color="#4CAF50" />
                        <Text className="text-sm font-medium text-gray-700">Add Friends</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="w-[48%] bg-gray-100 rounded-xl p-4 mb-4 items-center"
                        onPress={() => router.push('../leaderboards')}
                    >
                        <Ionicons name="trophy-outline" size={28} color="#4CAF50" />
                        <Text className="text-sm font-medium text-gray-700">View Leaderboards</Text>
                    </TouchableOpacity>
                </View>

                {/* Your Impact */}
                <View className="mb-6">
                    <Text className="text-base font-semibold mb-2">Your Impact</Text>
                    <View className="bg-green-50 p-4 rounded-xl">
                        <Text className="text-xl font-bold text-green-700 mb-1">{userPoints} points</Text>
                        <Text className="text-sm text-gray-600">Items Scanned: <Text className="font-semibold text-black">{totalClassifications}</Text></Text>
                    </View>
                </View>

                {/* Recent Activity */}
                <View className="mb-6">
                    <Text className="text-base font-semibold mb-2">Recent Activity</Text>
                    {recentActivities.length > 0 ? (
                        recentActivities.map((activity, idx) => {
                            const formattedActivity = formatActivity(activity);
                            return (
                                <View key={idx} className="bg-gray-100 rounded-xl p-3 mb-2">
                                    <Text className="text-sm font-medium text-gray-700">{formattedActivity.item}</Text>
                                    <Text className="text-xs text-gray-500">{formattedActivity.time}</Text>
                                    <Text className="text-green-600 text-xs font-semibold absolute right-4 top-4">{formattedActivity.points}</Text>
                                </View>
                            );
                        })
                    ) : (
                        <View className="bg-gray-100 rounded-xl p-3 mb-2">
                            <Text className="text-sm text-gray-500">No recent activity</Text>
                        </View>
                    )}
                </View>

                {/* Community Highlights */}
                <View className="mb-6">
                    <Text className="text-base font-semibold mb-2">Community Highlights</Text>

                    <View className="mb-4">
                        <Image source={MilestoneImage} className="w-full h-36 rounded-xl mb-2" resizeMode="contain" />
                        <View className="py-3 flex-row">
                            <Image source={AchievementIcon} className="w-6 h-6 rounded-full"/>
                            <Text className="text-sm font-semibold text-orange-600"> achievement</Text>
                        </View>
                        <Text className="text-sm text-gray-700">Community Milestone</Text>
                        <Text className="text-xs text-gray-500">10,000 items recycled!</Text>
                    </View>

                    <View>
                        <Image source={CoffeeShop} className="w-full h-36 rounded-xl mb-2" resizeMode="contain" />
                        <View className="py-3 flex-row">
                            <Image source={TicketIcon} className="w-6 h-6 rounded-full"/>
                            <Text className="text-sm font-semibold text-purple-600"> promotion</Text>
                        </View>
                        <Text className="text-sm text-gray-700">Koffee Kulture Discount</Text>
                        <Text className="text-xs text-gray-500">20% off with 100 points</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
