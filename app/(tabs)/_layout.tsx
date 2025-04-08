import { Tabs } from "expo-router";
import React from "react";
import { Image } from "react-native";
import '../globals.css';

const _Layout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#4CAF50", // Highlight active tab with the color
        tabBarInactiveTintColor: "#8E8E8E", // Set color for inactive tabs
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: 'bold'
        }
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../../assets/home.png')}
              style={{ width: 24, height: 24, tintColor: focused ? '#4CAF50' : '#8E8E8E' }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../../assets/map.png')}
              style={{ width: 24, height: 24, tintColor: focused ? '#4CAF50' : '#8E8E8E' }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "Scan",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../../assets/camera.png')}
              style={{ width: 24, height: 24, tintColor: focused ? '#4CAF50' : '#8E8E8E' }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: "Rewards",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../../assets/rewards.png')}
              style={{ width: 24, height: 24, tintColor: focused ? '#4CAF50' : '#8E8E8E' }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: "Community",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../../assets/community.png')}
              style={{ width: 24, height: 24, tintColor: focused ? '#4CAF50' : '#8E8E8E' }}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default _Layout;
