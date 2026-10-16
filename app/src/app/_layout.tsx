import { BricolageGrotesque_700Bold } from '@expo-google-fonts/bricolage-grotesque';
import { Figtree_400Regular, Figtree_500Medium, Figtree_600SemiBold, Figtree_700Bold } from '@expo-google-fonts/figtree';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WebPopup } from '@/components/WebPopup';
import { useOverlaySync } from '@/lib/overlay';
import { useProgress } from '@/store/progress';
import { useSettings } from '@/store/settings';
import { useIsDark, useTheme } from '@/theme/useTheme';

SplashScreen.preventAutoHideAsync();

const STORES = [useSettings, useProgress];

/** True once every persisted store has been read back from the device. */
function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() => STORES.every((s) => s.persist.hasHydrated()));
  useEffect(() => {
    const check = () => setHydrated(STORES.every((s) => s.persist.hasHydrated()));
    const unsubscribe = STORES.map((s) => s.persist.onFinishHydration(check));
    check();
    return () => unsubscribe.forEach((u) => u());
  }, []);
  return hydrated;
}

function OverlaySync() {
  useOverlaySync();
  return null;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    BricolageGrotesque_700Bold,
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
  });
  const hydrated = useHydrated();
  const ready = hydrated && (fontsLoaded || fontError !== null);
  const theme = useTheme();
  const isDark = useIsDark();

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.bg);
  }, [theme.bg]);

  if (!ready) return null;

  const base = isDark ? DarkTheme : DefaultTheme;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider
          value={{ ...base, colors: { ...base.colors, background: theme.bg, card: theme.surface, text: theme.ink, border: theme.line, primary: theme.accent } }}>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <OverlaySync />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.bg } }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="lecon/[id]/index" />
            <Stack.Screen name="lecon/[id]/vocabulaire" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="lecon/[id]/grammaire" />
            <Stack.Screen name="lecon/[id]/dialogue" />
            <Stack.Screen name="lecon/[id]/exercices" options={{ animation: 'slide_from_bottom' }} />
          </Stack>
          {Platform.OS === 'web' ? <WebPopup /> : null}
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
