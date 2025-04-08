import React, { useState, useEffect } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  View,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import GoogleLogo from '../../assets/google.png';
import AppleLogo from '../../assets/apple.png';
import { Link } from 'expo-router'; // Import the Link component from expo-router
import { SafeAreaView } from 'react-native-safe-area-context'; // Import SafeAreaView

const Login: React.FC = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Disable the header
  useEffect(() => {
    navigation.setOptions({
      headerShown: false, // Hide the header on this screen
    });
  }, [navigation]);

  const validateForm = () => {
    let tempErrors: Record<string, string> = {};
    let isValid = true;

    if (!formData.username.trim()) {
      tempErrors.username = 'Username is required';
      isValid = false;
    }
    if (!formData.password) {
      tempErrors.password = 'Password is required';
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setIsLoading(true);
      try {
        const response = await axios.post('https://ecovibe-backend.up.railway.app/api/users/login', formData);
        console.log('success');
        navigation.navigate('Home' as never);
      } catch (error: any) {
        const errorMessage = error.response?.data || 'Login failed. Please check your credentials.';
        Alert.alert('Login Failed', errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}> {/* Wrap with SafeAreaView and set background to white */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-6">
          <View className="items-center mt-6 mb-8">
            <View className="bg-green-100 p-4 rounded-full mb-3">
              <Text className="text-2xl">♻️</Text>
            </View>
            <Text className="text-xl font-semibold text-gray-900">Welcome to EcoVibe</Text>
            <Text className="mt-1 text-gray-500">Recycle Smarter, Live Better!</Text>
          </View>

          <View className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <Text className="text-gray-700 mb-1">Username</Text>
            <TextInput
              placeholder="Enter your username"
              autoCapitalize="none"
              value={formData.username}
              onChangeText={(text) => handleChange('username', text)}
              className="border border-gray-300 rounded-md px-4 py-2 mb-4 bg-white"
            />
            {errors.username && <Text className="text-red-500 text-xs -mt-3 mb-2">{errors.username}</Text>}

            <Text className="text-gray-700 mb-1">Password</Text>
            <TextInput
              placeholder="Enter your password"
              secureTextEntry
              value={formData.password}
              onChangeText={(text) => handleChange('password', text)}
              className="border border-gray-300 rounded-md px-4 py-2 mb-4 bg-white"
            />
            {errors.password && <Text className="text-red-500 text-xs -mt-3 mb-2">{errors.password}</Text>}

            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center">
                <Switch
                  value={rememberMe}
                  onValueChange={setRememberMe}
                  trackColor={{ false: '#d1d5db', true: '#22c55e' }}
                  thumbColor={rememberMe ? '#fff' : '#f4f4f4'}
                />
                <Text className="ml-2 text-xs text-gray-600">Remember me</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword' as never)}>
                <Text className="text-green-500 text-sm">Forgot password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="bg-green-500 py-3 rounded-xl items-center mb-4"
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold">Sign In</Text>
              )}
            </TouchableOpacity>

            <View className="flex-row items-center justify-center mb-4">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="mx-3 text-gray-500 text-xs">Or continue with</Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            <TouchableOpacity className="flex-row items-center justify-center border border-gray-300 py-3 rounded-lg mb-3">
              <Image source={GoogleLogo} className="w-5 h-5 mr-2" />
              <Text className="text-gray-700">Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center justify-center border border-gray-300 py-3 rounded-lg">
              <Image source={AppleLogo} className="w-5 h-5 mr-2" />
              <Text className="text-gray-700">Continue with Apple</Text>
            </TouchableOpacity>
          </View>

          <View className="items-center mt-6">
            <Text className="text-gray-700">
              Don’t have an account?{' '}
              <Link href="/register" className="text-green-500 font-semibold"> {/* Link to Register Page */}
                Sign up
              </Link>
            </Text>
          </View>

          <View className="flex-row flex-wrap justify-between mt-8">
            <FeatureCard title="Earn Points" subtitle="Get rewards for recycling" />
            <FeatureCard title="Daily Streaks" subtitle="Track your progress" />
            <FeatureCard title="AI Recognition" subtitle="Smart recycling guide" />
            <FeatureCard title="Redeem Rewards" subtitle="At partner locations" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const FeatureCard = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <View className="w-[48%] bg-green-50 p-3 rounded-xl mb-3">
    <Text className="text-green-800 font-semibold">{title}</Text>
    <Text className="text-gray-600 text-xs">{subtitle}</Text>
  </View>
);

export default Login;
