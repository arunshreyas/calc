import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return <ThemeProvider value={DarkTheme}><Stack screenOptions={{ headerShown: false }} /></ThemeProvider>;
}
