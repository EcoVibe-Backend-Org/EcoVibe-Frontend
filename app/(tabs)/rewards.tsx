import React, { useState, useEffect } from 'react';

import { View, Text, ScrollView, TouchableOpacity, Modal, 

         SafeAreaView, ActivityIndicator, Alert } from 'react-native';

import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

import AsyncStorage from '@react-native-async-storage/async-storage';


// API URL

const API_URL = 'https://ecovibe-backend.up.railway.app';


const RewardsScreen = () => {

  const [modalVisible, setModalVisible] = useState(false);

  const [selectedReward, setSelectedReward] = useState(null);

  const [visibleRewards, setVisibleRewards] = useState(2);

  const [visibleVouchers, setVisibleVouchers] = useState(2);

  const [voucherModalVisible, setVoucherModalVisible] = useState(false);

  const [selectedVoucher, setSelectedVoucher] = useState(null);

  

  // New state variables for API integration

  const [loading, setLoading] = useState(false);

  const [loadingVouchers, setLoadingVouchers] = useState(false);

  const [error, setError] = useState(null);

  const [userPoints, setUserPoints] = useState(0);

  const [availableRewards, setAvailableRewards] = useState([]);

  const [userVouchers, setUserVouchers] = useState([]);

  const [userId, setUserId] = useState(null);


  // Fetch user ID from AsyncStorage on component mount

  useEffect(() => {

    const getUserId = async () => {

      try {

        const id = await AsyncStorage.getItem('userId');

        if (id) {

          setUserId(id);

          fetchUserData(id);

        } else {

          setError('User not logged in');

        }

      } catch (error) {

        console.error('Failed to get user ID:', error);

        setError('Authentication error');

      }

    };


    getUserId();

  }, []);


  // Fetch all user data (points, rewards, vouchers)

  const fetchUserData = async (id) => {

    if (!id) return;

    

    try {

      // Fetch available rewards for the user

      fetchAvailableRewards(id);

      

      // Fetch user's redeemed vouchers

      fetchUserVouchers(id);

    } catch (error) {

      console.error('Error fetching user data:', error);

      setError('Failed to load user data');

    }

  };


  // Fetch available rewards from the API

  const fetchAvailableRewards = async (id) => {

    setLoading(true);

    try {

      const response = await fetch(`${API_URL}/api/promo/user/${id}`);

      

      if (!response.ok) {

        throw new Error('Failed to fetch rewards');

      }

      

      const data = await response.json();

      

      if (data.success) {

        setAvailableRewards(data.promoCodes || []);

        setUserPoints(data.userPoints || 0);

      } else {

        throw new Error(data.message || 'Unknown error');

      }

    } catch (error) {

      console.error('Error fetching rewards:', error);

      setError('Failed to load rewards');

    } finally {

      setLoading(false);

    }

  };


  // Fetch user's redeemed vouchers

  const fetchUserVouchers = async (id) => {

    setLoadingVouchers(true);

    try {

      const response = await fetch(`${API_URL}/api/redemption/user/${id}`);

      

      if (!response.ok) {

        throw new Error('Failed to fetch vouchers');

      }

      

      const data = await response.json();

      

      if (data.success) {

        setUserVouchers(data.redemptions || []);

      } else {

        throw new Error(data.message || 'Unknown error');

      }

    } catch (error) {

      console.error('Error fetching vouchers:', error);

      // Not setting error state here to still show rewards even if vouchers fail

    } finally {

      setLoadingVouchers(false);

    }

  };


  // Redeem a reward through the API

  const redeemReward = async () => {

    if (!selectedReward || !userId) {

      Alert.alert('Error', 'Unable to redeem reward');

      return;

    }


    setLoading(true);

    try {

      const response = await fetch(`${API_URL}/api/redemption/redeem`, {

        method: 'POST',

        headers: {

          'Content-Type': 'application/json',

        },

        body: JSON.stringify({

          userId: userId,

          promoCodeId: selectedReward.id

        }),

      });


      const data = await response.json();


      if (data.success) {

        Alert.alert('Success', `You've successfully redeemed "${selectedReward.name}"!`);

        setUserPoints(data.remainingPoints);

        

        // Refresh user data after redemption

        fetchUserData(userId);

      } else {

        Alert.alert('Error', data.message || 'Failed to redeem reward');

      }

    } catch (error) {

      console.error('Error redeeming reward:', error);

      Alert.alert('Error', 'Failed to redeem reward. Please try again.');

    } finally {

      setLoading(false);

      setModalVisible(false);

    }

  };


  // Mark a voucher as used

  const markVoucherAsUsed = async (redemptionId, location) => {

    try {

      const response = await fetch(`${API_URL}/api/redemption/${redemptionId}/use`, {

        method: 'PUT',

        headers: {

          'Content-Type': 'application/json',

        },

        body: JSON.stringify({

          location: location || 'Unknown location'

        }),

      });


      const data = await response.json();


      if (data.success) {

        Alert.alert('Success', 'Voucher marked as used');

        fetchUserVouchers(userId);

      } else {

        Alert.alert('Error', data.message || 'Failed to update voucher');

      }

    } catch (error) {

      console.error('Error updating voucher:', error);

      Alert.alert('Error', 'Failed to update voucher');

    }

  };


  const openRewardModal = (reward) => {

    setSelectedReward(reward);

    setModalVisible(true);

  };


  const closeModal = () => {

    setModalVisible(false);

  };


  const openVoucherModal = (voucher) => {

    setSelectedVoucher(voucher);

    setVoucherModalVisible(true);

  };


  const closeVoucherModal = () => {

    setVoucherModalVisible(false);

  };


  // Function to get future date for expiration display

  const getFutureDate = (date) => {

    if (!date) return 'No expiration';

    

    const expirationDate = new Date(date);

    return `${expirationDate.getMonth() + 1}/${expirationDate.getDate()}/${expirationDate.getFullYear()}`;

  };


  // Handle retry when there's an error

  const handleRetry = () => {

    setError(null);

    if (userId) {

      fetchUserData(userId);

    }

  };


  // Show error state if there's an error

  if (error) {

    return (

      <SafeAreaView className="flex-1 bg-white justify-center items-center p-4">

        <Ionicons name="alert-circle-outline" size={50} color="#ef4444" />

        <Text className="text-red-500 text-lg font-bold mt-2 mb-4">{error}</Text>

        <TouchableOpacity 

          className="bg-green-500 px-6 py-3 rounded-full"

          onPress={handleRetry}

        >

          <Text className="text-white font-bold">Retry</Text>

        </TouchableOpacity>

      </SafeAreaView>

    );

  }


  return (

    <SafeAreaView className="flex-1 bg-white">

      <ScrollView className="flex-1 bg-white p-4">

        {/* Header */}

        <View className="flex-row items-center mb-4">

          <Ionicons name="chevron-back" size={24} color="#000" />

          <Text className="text-base font-semibold ml-2">Rewards</Text>

        </View>


        {/* Points Overview */}

        <View className="bg-white rounded-xl p-4 shadow mb-4">

          <Text className="text-base font-bold mb-2">Points Overview</Text>


          <View className="flex-row justify-between items-center">

            <View>

              <Text className="text-2xl font-bold text-green-600">{userPoints}</Text>

              <Text className="text-xs text-gray-500">Total Eco Points</Text>

              <Text className="text-xs text-gray-400">Last Updated: {new Date().toLocaleDateString()}</Text>

            </View>


            <View className="w-20 h-20">

              <View className="w-20 h-20 rounded-full border-4 border-green-500 items-center justify-center">

                <Ionicons name="leaf" size={32} color="#22c55e" />

              </View>

              <Text className="text-xs text-center text-green-600 font-semibold mt-1">

                {userPoints >= 1000 ? 'Level 4' : userPoints >= 500 ? 'Level 3' : userPoints >= 200 ? 'Level 2' : 'Level 1'}

              </Text>

            </View>

          </View>


          {/* Categories */}

          <View className="flex-row justify-between mt-4">

            <View className="items-center">

              <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center">

                <Ionicons name="water" size={18} color="#3b82f6" />

              </View>

              <Text className="text-xs mt-1">Saving</Text>

            </View>


            <View className="items-center">

              <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center">

                <FontAwesome5 name="recycle" size={16} color="#22c55e" />

              </View>

              <Text className="text-xs mt-1">Recycle</Text>

            </View>


            <View className="items-center">

              <View className="w-10 h-10 rounded-full bg-yellow-100 items-center justify-center">

                <Ionicons name="people" size={18} color="#eab308" />

              </View>

              <Text className="text-xs mt-1">Community</Text>

            </View>


            <View className="items-center">

              <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center">

                <Ionicons name="pulse" size={18} color="#a855f7" />

              </View>

              <Text className="text-xs mt-1">Streak</Text>

            </View>

          </View>

        </View>


        {/* Daily Challenges */}

        <View className="bg-white rounded-xl p-4 shadow mb-4">

          <Text className="text-base font-bold mb-2">Daily Challenges</Text>


          <View className="border border-gray-200 rounded-lg mb-2">

            <View className="flex-row justify-between items-center p-3">

              <Text className="font-medium">Recycle 3 items</Text>

              <Text className="text-green-600 font-medium">20 pts</Text>

            </View>

          </View>


          <View className="border border-gray-200 rounded-lg mb-2">

            <View className="flex-row justify-between items-center p-3">

              <Text className="font-medium">Share on Community</Text>

              <Text className="text-green-600 font-medium">20 pts</Text>

            </View>

          </View>


          <View className="border border-gray-200 rounded-lg mb-2">

            <View className="flex-row justify-between items-center p-3">

              <View>

                <Text className="font-medium">Visit a New Bio</Text>

                <Text className="text-xs text-gray-400">1 / 3</Text>

              </View>

              <Text className="text-green-600 font-medium">10 pts</Text>

            </View>

          </View>

        </View>


        {/* Available Rewards */}

        <View className="bg-white rounded-xl p-4 shadow mb-4">

          <View className="flex-row justify-between items-center mb-2">

            <Text className="text-base font-bold">Available Rewards</Text>

            {availableRewards.length > visibleRewards && (

              <TouchableOpacity onPress={() => setVisibleRewards(visibleRewards + 2)}>

                <Text className="text-green-600 text-xs">See All</Text>

              </TouchableOpacity>

            )}

          </View>


          {loading ? (

            <View className="items-center py-4">

              <ActivityIndicator size="large" color="#22c55e" />

              <Text className="text-gray-500 mt-2">Loading rewards...</Text>

            </View>

          ) : availableRewards.length === 0 ? (

            <View className="items-center py-4">

              <Ionicons name="gift-outline" size={40} color="#d1d5db" />

              <Text className="text-gray-500 mt-2">No rewards available</Text>

            </View>

          ) : (

            availableRewards.slice(0, visibleRewards).map((reward) => (

              <TouchableOpacity

                key={reward.id}

                className={`border border-gray-200 rounded-lg p-3 mb-2 ${

                  !reward.canRedeem ? 'opacity-70' : ''

                }`}

                onPress={() => reward.canRedeem && openRewardModal(reward)}

                disabled={!reward.canRedeem}

              >

                <View className="flex-row items-center justify-between">

                  <View className="flex-row items-center flex-1">

                    <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center">

                      <Ionicons name={reward.icon || 'gift-outline'} size={20} color="#22c55e" />

                    </View>

                    <View className="ml-2 flex-1">

                      <Text className="font-medium">{reward.name}</Text>

                      <Text className="text-xs text-gray-500" numberOfLines={1}>{reward.description}</Text>

                    </View>

                  </View>

                  <View className="flex-row items-center">

                    <Ionicons name="leaf-outline" size={14} color="#22c55e" />

                    <Text 

                      className={`font-medium ml-1 ${

                        reward.canRedeem ? 'text-green-600' : 'text-red-500'

                      }`}

                    >

                      {reward.points}

                    </Text>

                  </View>

                </View>

                {!reward.canRedeem && (

                  <Text className="text-xs text-red-500 mt-1">

                    Not enough points

                  </Text>

                )}

              </TouchableOpacity>

            ))

          )}

        </View>


        {/* My Vouchers */}

        <View className="bg-white rounded-xl p-4 shadow mb-4">

          <View className="flex-row justify-between items-center mb-2">

            <Text className="text-base font-bold">My Vouchers</Text>

            {userVouchers.length > visibleVouchers && (

              <TouchableOpacity onPress={() => setVisibleVouchers(visibleVouchers + 2)}>

                <Text className="text-green-600 text-xs">See All</Text>

              </TouchableOpacity>

            )}

          </View>


          {loadingVouchers ? (

            <View className="items-center py-4">

              <ActivityIndicator size="large" color="#22c55e" />

              <Text className="text-gray-500 mt-2">Loading vouchers...</Text>

            </View>

          ) : userVouchers.length === 0 ? (

            <View className="items-center py-4">

              <Ionicons name="ticket-outline" size={40} color="#d1d5db" />

              <Text className="text-gray-500 mt-2">No vouchers yet</Text>

              <Text className="text-gray-400 text-xs">Redeem rewards to get vouchers</Text>

            </View>

          ) : (

            userVouchers.slice(0, visibleVouchers).map((voucher) => (

              <TouchableOpacity

                key={voucher.id}

                className={`border border-gray-200 rounded-lg p-3 mb-2 ${

                  voucher.status !== 'ACTIVE' ? 'opacity-70' : ''

                }`}

                onPress={() => voucher.status === 'ACTIVE' && openVoucherModal(voucher)}

                disabled={voucher.status !== 'ACTIVE'}

              >

                <View className="flex-row items-center justify-between">

                  <View className="flex-row items-center flex-1">

                    <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center">

                      <Ionicons name={voucher.icon || 'ticket-outline'} size={20} color="#22c55e" />

                    </View>

                    <View className="ml-2 flex-1">

                      <Text className="font-medium">{voucher.name}</Text>

                      <Text className="text-xs text-gray-400">

                        {voucher.status === 'ACTIVE' 

                          ? `Expires: ${getFutureDate(voucher.expirationDate)}` 

                          : `Status: ${voucher.status.toLowerCase()}`

                        }

                      </Text>

                    </View>

                  </View>

                  {voucher.status === 'ACTIVE' && (

                    <TouchableOpacity

                      className="bg-blue-500 px-3 py-1 rounded-full"

                      onPress={() => openVoucherModal(voucher)}

                    >

                      <Text className="text-white text-xs font-medium">Use</Text>

                    </TouchableOpacity>

                  )}

                </View>

              </TouchableOpacity>

            ))

          )}

        </View>

      </ScrollView>


      {/* Reward Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-5">
            <View className="items-center mb-2">
              <View className="w-10 h-1 bg-gray-300 rounded-full mb-4" />
              <Text className="text-xl font-bold mb-1">Redeem Reward</Text>
            </View>

            {selectedReward && (
              <View className="mb-4">
                <View className="flex-row items-center mb-4">
                  <View className="w-16 h-16 rounded-full bg-green-100 items-center justify-center mr-4">
                    <Ionicons name={selectedReward.icon || 'gift-outline'} size={32} color="#22c55e" />
                  </View>
                  <View>
                    <Text className="text-lg font-bold">{selectedReward.name}</Text>
                    <View className="flex-row items-center">
                      <Ionicons name="leaf-outline" size={16} color="#22c55e" />
                      <Text className="text-green-600 font-bold ml-1 text-lg">{selectedReward.points} points</Text>
                    </View>
                  </View>
                </View>

                <View className="bg-gray-50 p-4 rounded-xl mb-4">
                  <Text className="text-gray-800 mb-3">{selectedReward.description}</Text>

                  <View className="mb-2">
                    <Text className="text-gray-500 text-xs mb-1">VALID FOR</Text>
                    <Text className="font-medium">{selectedReward.expirationDays} days after redemption</Text>
                  </View>

                  <View>
                    <Text className="text-gray-500 text-xs mb-1">AVAILABLE AT</Text>
                    {selectedReward.locations && selectedReward.locations.map((location, index) => (
                      <Text key={index} className="font-medium">• {location}</Text>
                    ))}
                  </View>
                </View>

                <View className="bg-yellow-50 p-4 rounded-xl mb-4 flex-row items-center">
                  <Ionicons name="information-circle-outline" size={24} color="#f59e0b" />
                  <Text className="text-yellow-800 ml-2 flex-1">
                    Redeeming will deduct {selectedReward.points} points from your balance.
                  </Text>
                </View>

                {loading ? (
                  <View className="bg-gray-300 rounded-full py-4 items-center mb-2">
                    <ActivityIndicator size="small" color="#ffffff" />
                  </View>
                ) : (
                  <TouchableOpacity
                    className="bg-green-500 rounded-full py-4 items-center mb-2"
                    onPress={redeemReward}
                  >
                    <Text className="text-white font-bold">Redeem for {selectedReward.points} points</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  className="py-3 items-center"
                  onPress={closeModal}
                  disabled={loading}
                >
                  <Text className={`font-medium ${loading ? 'text-gray-300' : 'text-gray-500'}`}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Voucher Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={voucherModalVisible}
        onRequestClose={closeVoucherModal}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-5">
            <View className="items-center mb-2">
              <View className="w-10 h-1 bg-gray-300 rounded-full mb-4" />
              <Text className="text-xl font-bold mb-1">Your Voucher</Text>
            </View>

            {selectedVoucher && (
              <View className="mb-4">
                <View className="flex-row items-center mb-4">
                  <View className="w-16 h-16 rounded-full bg-green-100 items-center justify-center mr-4">
                    <Ionicons name={selectedVoucher.icon || 'ticket-outline'} size={32} color="#22c55e" />
                  </View>
                  <View>
                    <Text className="text-lg font-bold">{selectedVoucher.name}</Text>
                    <Text className="text-gray-500">
                      {selectedVoucher.status === 'ACTIVE' ? 'Ready to use' : `Status: ${selectedVoucher.status.toLowerCase()}`}
                    </Text>
                  </View>
                </View>

                <View className="bg-gray-50 p-4 rounded-xl mb-4">
                  <Text className="text-gray-800 mb-3">{selectedVoucher.description}</Text>

                  <View className="mb-4">
                    <Text className="text-gray-500 text-xs mb-1">VALID UNTIL</Text>
                    <Text className="font-medium">{getFutureDate(selectedVoucher.expirationDate)}</Text>
                  </View>

                  <View className="mb-4">
                    <Text className="text-gray-500 text-xs mb-1">AVAILABLE AT</Text>
                    {selectedVoucher.locations && selectedVoucher.locations.map((location, index) => (
                      <Text key={index} className="font-medium">• {location}</Text>
                    ))}
                  </View>

                  <View className="bg-white p-4 rounded-xl border border-gray-200 mb-2">
                    <Text className="text-gray-500 text-xs mb-2 text-center">YOUR VOUCHER CODE</Text>
                    <View className="flex-row items-center justify-center">
                      <Text className="font-bold text-lg text-center">{selectedVoucher.code}</Text>
                      <TouchableOpacity className="ml-2" onPress={() => {
                        // Copy to clipboard functionality - you'll need to import Clipboard
                        // Clipboard.setString(selectedVoucher.code);
                        Alert.alert('Copied!', 'Code copied to clipboard');
                      }}>
                        <Ionicons name="copy-outline" size={20} color="#22c55e" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <View className="bg-green-50 p-4 rounded-xl mb-4 flex-row items-center">
                  <Ionicons name="information-circle-outline" size={24} color="#22c55e" />
                  <Text className="text-green-800 ml-2 flex-1">
                    Show this code at the checkout to redeem your voucher.
                  </Text>
                </View>

                {selectedVoucher.status === 'ACTIVE' && (
                  <TouchableOpacity
                    className="bg-blue-500 rounded-full py-4 items-center mb-2"
                    onPress={() => {
                      const location = selectedVoucher.locations && 
                                     selectedVoucher.locations.length > 0 ? 
                                     selectedVoucher.locations[0] : 'Unknown location';
                      
                      Alert.alert(
                        'Mark as Used?',
                        'Do you want to mark this voucher as used?',
                        [
                          {
                            text: 'Cancel',
                            style: 'cancel'
                          },
                          {
                            text: 'Yes, Mark as Used',
                            onPress: () => {
                              markVoucherAsUsed(selectedVoucher.id, location);
                              closeVoucherModal();
                            }
                          }
                        ]
                      );
                    }}
                  >
                    <Text className="text-white font-bold">Mark as Used</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  className="py-3 items-center"
                  onPress={closeVoucherModal}
                >
                  <Text className="text-gray-500 font-medium">Close</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default RewardsScreen;

