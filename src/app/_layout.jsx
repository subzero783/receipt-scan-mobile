import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false, title: 'Login' }} />
      <Stack.Screen name="dashboard" options={{ title: 'My Receipts', headerBackVisible: false }} />
      <Stack.Screen name="scanner" options={{ title: 'Scan Receipt', presentation: 'modal' }} />
    </Stack>
  );
}
