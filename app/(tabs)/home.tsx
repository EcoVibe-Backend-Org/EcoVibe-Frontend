import React from 'react';
import { View, Text, Image, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

import ScanIcon from '../../assets/scan.png';
import CommunityIcon from '../../assets/community.png';
import BinIcon from '../../assets/recycle.png';
import RewardIcon from '../../assets/rewards.png';
import MilestoneImage from '../../assets/trashBins.png';
import CoffeeShop from '../../assets/koffeeCulture.png';
import ProfileIcon from '../../assets/user.png';
import AchievementIcon from '../../assets/achievement.png';
import TicketIcon from '../../assets/ticket.png';

export default function EcoVibeScreen() {
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
        <Text className="text-lg font-semibold mb-1">Welcome back, <Text className="text-green-700">Sarah</Text>!</Text>
        <Text className="text-sm text-gray-500 mb-4">850 points <Text className="text-yellow-500">7 day streak 🔥</Text></Text>

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
        </View>

        {/* Your Impact */}
        <View className="mb-6">
          <Text className="text-base font-semibold mb-2">Your Impact</Text>
          <View className="bg-green-50 p-4 rounded-xl">
            <Text className="text-xl font-bold text-green-700 mb-1">850 points</Text>
            <Text className="text-sm text-gray-600">Waste Reduced: <Text className="font-semibold text-black">5 kg</Text></Text>
            <Text className="text-sm text-gray-600">CO₂ Saved: <Text className="font-semibold text-black">12 kg</Text></Text>
            <Text className="text-xs text-gray-400 mt-2">160 points behind Mustafa</Text>
          </View>
        </View>

        {/* Recent Activity */}
        <View className="mb-6">
          <Text className="text-base font-semibold mb-2">Recent Activity</Text>
          {[
            { item: 'Plastic Bottle', time: 'Today, 10:30 AM', points: '+10' },
            { item: 'Glass Jar', time: 'Today, 9:15 AM', points: '+15' },
            { item: 'Cardboard Box', time: 'Yesterday, 2:45 PM', points: '+20' }
          ].map((activity, idx) => (
            <View key={idx} className="bg-gray-100 rounded-xl p-3 mb-2">
              <Text className="text-sm font-medium text-gray-700">{activity.item}</Text>
              <Text className="text-xs text-gray-500">{activity.time}</Text>
              <Text className="text-green-600 text-xs font-semibold absolute right-4 top-4">{activity.points}</Text>
            </View>
          ))}
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
