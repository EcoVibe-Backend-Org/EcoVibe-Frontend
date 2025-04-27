import { Text, View } from "react-native";
import Register from "./(auth)/register";
import Login from "./(auth)/login";
import Home from "./(tabs)/home";
import { Redirect } from 'expo-router';

const debugMode = true;


export default function Index() {
  if (!debugMode)
  return <Redirect href={"./(auth)/login"} />;
  else
  return <Redirect href={"./(tabs)/home"} />;
}


