import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Modal, SafeAreaView } from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

const RewardsScreen = () => {
const [modalVisible, setModalVisible] = useState(false);
const [selectedReward, setSelectedReward] = useState(null);
const [visibleRewards, setVisibleRewards] = useState(2); // Show 2 rewards at first
const [visibleVouchers, setVisibleVouchers] = useState(2); // Show 2 vouchers at first
const [voucherModalVisible, setVoucherModalVisible] = useState(false); // New state for voucher modal
const [selectedVoucher, setSelectedVoucher] = useState(null); // New state for selected voucher

  const rewards = [
    {
      id: 1,
      name: 'Coffee Discount',
      icon: 'cafe-outline',
      points: 100,
      description: 'Get 15% off your next coffee purchase at participating cafés.',
      expirationDays: 30,
      locations: ['Green Café', 'Eco Coffee', 'Planet Friendly Brews'],
      staticCode: 'GFT-COF-9357A1XZB4'
    },
    {
      id: 2,
      name: 'Shopping Voucher',
      icon: 'card-outline',
      points: 500,
      description: 'Get $10 off your next purchase at eco-friendly stores.',
      expirationDays: 60,
      locations: ['Green Market', 'Sustainable Goods', 'EcoLife Store'],
      staticCode: 'GFT-SHP-29HZ7PLQF9'
    },
    {
      id: 3,
      name: 'Charity Donation',
      icon: 'heart-outline',
      points: 200,
      description: 'Donate on your behalf to a green initiative.',
      expirationDays: 0,
      locations: ['Global Green Foundation'],
      staticCode: 'GFT-CHR-5YUA36TZ8K'
    },
    {
      id: 4,
      name: 'Reusable Bottle',
      icon: 'water-outline',
      points: 350,
      description: 'Get a premium reusable water bottle.',
      expirationDays: 90,
      locations: ['EcoLife Store'],
      staticCode: 'GFT-BTL-Q2ZL6KM94X'
    },
  ];

  // Function to get future date for expiration display
  const getFutureDate = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  const openRewardModal = (reward) => {
    setSelectedReward(reward);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const redeemReward = () => {
    // Handle redemption logic here
    alert(`Redeeming ${selectedReward.name} for ${selectedReward.points} points`);
    setModalVisible(false);
  };

  // New function to open voucher modal
  const openVoucherModal = (voucher) => {
    setSelectedVoucher(voucher);
    setVoucherModalVisible(true);
  };

  // New function to close voucher modal
  const closeVoucherModal = () => {
    setVoucherModalVisible(false);
  };

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
              <Text className="text-2xl font-bold text-green-600">850</Text>
              <Text className="text-xs text-gray-500">Total Eco Points</Text>
              <Text className="text-xs text-gray-400">Last Updated: 20/06</Text>
            </View>

            <View className="w-20 h-20">
              <View className="w-20 h-20 rounded-full border-4 border-green-500 items-center justify-center">
                <Ionicons name="leaf" size={32} color="#22c55e" />
              </View>
              <Text className="text-xs text-center text-green-600 font-semibold mt-1">Level 3</Text>
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

        {/* Achievements */}
        <View className="bg-white rounded-xl p-4 shadow mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-base font-bold">Achievements</Text>
            <Text className="text-green-600 text-xs">View All</Text>
          </View>

          <View className="flex-row justify-between">
            <View className="items-center w-20">
              <View className="w-14 h-14 rounded-lg bg-amber-100 items-center justify-center mb-1">
                <Ionicons name="timer-outline" size={24} color="#f59e0b" />
              </View>
              <Text className="text-xs text-center">Early Bird</Text>
            </View>

            <View className="items-center w-20">
              <View className="w-14 h-14 rounded-lg bg-emerald-100 items-center justify-center mb-1">
                <Ionicons name="flame-outline" size={24} color="#10b981" />
              </View>
              <Text className="text-xs text-center">Eco Warrior</Text>
            </View>

            <View className="items-center w-20">
              <View className="w-14 h-14 rounded-lg bg-blue-100 items-center justify-center mb-1">
                <Ionicons name="people-outline" size={24} color="#3b82f6" />
              </View>
              <Text className="text-xs text-center">Community Leader</Text>
            </View>

            <View className="items-center w-20">
              <View className="w-14 h-14 rounded-lg bg-gray-100 items-center justify-center mb-1">
                <Text className="text-gray-400 font-bold">+4</Text>
              </View>
              <Text className="text-xs text-center">More</Text>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View className="bg-white rounded-xl p-4 shadow mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-base font-bold">Recent Activity</Text>
            <Text className="text-green-600 text-xs">View All</Text>
          </View>

          <View className="border-b border-gray-100 pb-2 mb-2">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center">
                  <Ionicons name="water-outline" size={16} color="#3b82f6" />
                </View>
                <View className="ml-2">
                  <Text className="font-medium">Plastic Bottle</Text>
                  <Text className="text-xs text-gray-400">Today, 11:42</Text>
                </View>
              </View>
              <Text className="text-green-600 font-medium">+10</Text>
            </View>
          </View>

          <View className="border-b border-gray-100 pb-2 mb-2">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-yellow-100 items-center justify-center">
                  <Ionicons name="people-outline" size={16} color="#eab308" />
                </View>
                <View className="ml-2">
                  <Text className="font-medium">Community Post</Text>
                  <Text className="text-xs text-gray-400">Today, 10:58</Text>
                </View>
              </View>
              <Text className="text-green-600 font-medium">+20</Text>
            </View>
          </View>

          <View>
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-purple-100 items-center justify-center">
                  <Ionicons name="pulse-outline" size={16} color="#a855f7" />
                </View>
                <View className="ml-2">
                  <Text className="font-medium">Weekly Streak</Text>
                  <Text className="text-xs text-gray-400">Yesterday</Text>
                </View>
              </View>
              <Text className="text-green-600 font-medium">+50</Text>
            </View>
          </View>
        </View>

       {/* Available Rewards */}
       <View className="bg-white rounded-xl p-4 shadow mb-4">
         <View className="flex-row justify-between items-center mb-2">
           <Text className="text-base font-bold">Available Rewards</Text>
           {visibleRewards < rewards.length && (
             <TouchableOpacity onPress={() => setVisibleRewards(visibleRewards + 2)}>
               <Text className="text-green-600 text-xs">See All</Text>
             </TouchableOpacity>
           )}
         </View>

         {rewards.slice(0, visibleRewards).map((reward) => (
           <TouchableOpacity
             key={reward.id}
             className="border border-gray-200 rounded-lg p-3 mb-2"
             onPress={() => openRewardModal(reward)}
           >
             <View className="flex-row items-center justify-between">
               <View className="flex-row items-center">
                 <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center">
                   <Ionicons name={reward.icon} size={20} color="#22c55e" />
                 </View>
                 <Text className="font-medium ml-2">{reward.name}</Text>
               </View>
               <View className="flex-row items-center">
                 <Ionicons name="logo-usd" size={14} color="#22c55e" />
                 <Text className="text-green-600 font-medium ml-1">{reward.points}</Text>
               </View>
             </View>
           </TouchableOpacity>
         ))}
       </View>

       {/* Bought Vouchers - EDITED SECTION */}
       <View className="bg-white rounded-xl p-4 shadow mb-4">
         <View className="flex-row justify-between items-center mb-2">
           <Text className="text-base font-bold">Bought Vouchers</Text>
           {visibleVouchers < rewards.length && (
             <TouchableOpacity onPress={() => setVisibleVouchers(visibleVouchers + 2)}>
               <Text className="text-green-600 text-xs">See All</Text>
             </TouchableOpacity>
           )}
         </View>

         {rewards.slice(0, visibleVouchers).map((reward) => (
           <TouchableOpacity
             key={`voucher-${reward.id}`}
             className="border border-gray-200 rounded-lg p-3 mb-2"
             onPress={() => openVoucherModal(reward)}
           >
             <View className="flex-row items-center justify-between">
               <View className="flex-row items-center">
                 <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center">
                   <Ionicons name={reward.icon} size={20} color="#22c55e" />
                 </View>
                 <View className="ml-2">
                   <Text className="font-medium">{reward.name}</Text>
                   <Text className="text-xs text-gray-400">
                     Expires: {getFutureDate(reward.expirationDays)}
                   </Text>
                 </View>
               </View>
               <TouchableOpacity
                 className="bg-blue-500 px-3 py-1 rounded-full"
                 onPress={() => openVoucherModal(reward)}
               >
                 <Text className="text-white text-xs font-medium">Use</Text>
               </TouchableOpacity>
             </View>
           </TouchableOpacity>
         ))}
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
                    <Ionicons name={selectedReward.icon} size={32} color="#22c55e" />
                  </View>
                  <View>
                    <Text className="text-lg font-bold">{selectedReward.name}</Text>
                    <View className="flex-row items-center">
                      <Ionicons name="logo-usd" size={16} color="#22c55e" />
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
                    {selectedReward.locations.map((location, index) => (
                      <Text key={index} className="font-medium">• {location}</Text>
                    ))}
                  </View>
                </View>

                <View className="bg-yellow-50 p-4 rounded-xl mb-4 flex-row items-center">
                  <Ionicons name="information-circle-outline" size={24} color="#f59e0b" />
                  <Text className="text-yellow-800 ml-2 flex-1">Redeeming will deduct {selectedReward.points} points from your balance.</Text>
                </View>

                <TouchableOpacity
                  className="bg-green-500 rounded-full py-4 items-center mb-2"
                  onPress={redeemReward}
                >
                  <Text className="text-white font-bold">Redeem for {selectedReward.points} points</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="py-3 items-center"
                  onPress={closeModal}
                >
                  <Text className="text-gray-500 font-medium">Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Voucher Modal - NEW MODAL */}
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
                    <Ionicons name={selectedVoucher.icon} size={32} color="#22c55e" />
                  </View>
                  <View>
                    <Text className="text-lg font-bold">{selectedVoucher.name}</Text>
                    <Text className="text-gray-500">Ready to use</Text>
                  </View>
                </View>

                <View className="bg-gray-50 p-4 rounded-xl mb-4">
                  <Text className="text-gray-800 mb-3">{selectedVoucher.description}</Text>

                  <View className="mb-4">
                    <Text className="text-gray-500 text-xs mb-1">VALID UNTIL</Text>
                    <Text className="font-medium">{getFutureDate(selectedVoucher.expirationDays)}</Text>
                  </View>

                  <View className="mb-4">
                    <Text className="text-gray-500 text-xs mb-1">AVAILABLE AT</Text>
                    {selectedVoucher.locations.map((location, index) => (
                      <Text key={index} className="font-medium">• {location}</Text>
                    ))}
                  </View>

                  <View className="bg-white p-4 rounded-xl border border-gray-200 mb-2">
                    <Text className="text-gray-500 text-xs mb-2 text-center">YOUR VOUCHER CODE</Text>
                    <View className="flex-row items-center justify-center">
                      <Text className="font-bold text-lg text-center">{selectedVoucher.staticCode}</Text>
                      <TouchableOpacity className="ml-2" onPress={() => {
                        // Copy to clipboard functionality would go here
                        alert('Code copied to clipboard!');
                      }}>
                        <Ionicons name="copy-outline" size={20} color="#22c55e" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <View className="bg-green-50 p-4 rounded-xl mb-4 flex-row items-center">
                  <Ionicons name="information-circle-outline" size={24} color="#22c55e" />
                  <Text className="text-green-800 ml-2 flex-1">Show this code at the checkout to redeem your voucher.</Text>
                </View>

                <TouchableOpacity
                  className="bg-blue-500 rounded-full py-4 items-center mb-2"
                  onPress={() => {
                    // Handle share functionality
                    alert('Sharing voucher!');
                  }}
                >
                  <Text className="text-white font-bold">Share Voucher</Text>
                </TouchableOpacity>

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