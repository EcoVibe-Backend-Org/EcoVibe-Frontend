import { View, Text, Image } from "react-native";
import React from "react";


const AuthHeader = () => {
    return (
        <View className="items-center mt-16 mb-8">
            <Text className="text-2xl font-bold text-green-900 mt-4">
                Welcome to EcoVibe
            </Text>
            <Text className="text-base text-green-600 mt-1">
                Recycle Smarter, Live Better!
            </Text>
        </View>
    );
};

export default AuthHeader;
