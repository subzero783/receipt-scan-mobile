import { version } from 'expo/package.json';
import { Image } from 'expo-image';
import { useColorScheme, Platform } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import classes from './web-badge.module.css';

export function WebBadge() {
  const scheme = useColorScheme();

  const badgeSource = scheme === 'dark'
    ? require('@/assets/images/expo-badge-white.png')
    : require('@/assets/images/expo-badge.png');

  if (Platform.OS === 'web') {
    return (
      <ThemedView className={classes.container} style={{ alignItems: 'center', gap: '8px', padding: '32px' }}>
        <ThemedText type="code" themeColor="textSecondary" className={classes.versionText}>
          v{version}
        </ThemedText>
        <Image
          source={badgeSource}
          className={classes.badgeImage}
          style={{ width: 123, height: 24 }}
        />
      </ThemedView>
    );
  }

  // Native fallback styling
  const nativeStyles = {
    container: {
      padding: 32,
      alignItems: 'center',
      gap: 8,
    },
    versionText: {
      textAlign: 'center',
    },
    badgeImage: {
      width: 123,
      aspectRatio: 123 / 24,
    },
  };

  return (
    <ThemedView style={nativeStyles.container}>
      <ThemedText type="code" themeColor="textSecondary" style={nativeStyles.versionText}>
        v{version}
      </ThemedText>
      <Image
        source={badgeSource}
        style={nativeStyles.badgeImage}
      />
    </ThemedView>
  );
}
