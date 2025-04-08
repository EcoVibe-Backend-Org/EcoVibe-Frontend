import { Text, View } from "react-native";
import Register from "./(auth)/register";
import Login from "./(auth)/login";
import Home from "./(tabs)/home";
import { Redirect } from 'expo-router';

const isLoggedIn = true;


export default function Index() {
  return <Redirect href={isLoggedIn ? "./(tabs)/home" : "./(auth)/login"} />;
}


