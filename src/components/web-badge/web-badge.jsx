import { version } from 'expo/package.json';
import { Image } from 'expo-image';
import { useColorScheme, Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import classes from './web-badge.module.css';
import { styles } from './web-badge.styles';

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

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="code" themeColor="textSecondary" style={styles.versionText}>
        v{version}
      </ThemedText>
      <Image
        source={badgeSource}
        style={styles.badgeImage}
      />
    </ThemedView>
  );
}
