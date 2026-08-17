import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, Platform } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import classes from './collapsible.module.css';
import { styles } from './collapsible.styles';

export function Collapsible({ children, title }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useTheme();

  const arrowRotation = isOpen ? '-90deg' : '90deg';

  if (Platform.OS === 'web') {
    return (
      <ThemedView>
        <button
          className={classes.heading}
          onClick={() => setIsOpen((value) => !value)}>
          <ThemedView type="backgroundElement" className={classes.button}>
            <SymbolView
              name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
              size={14}
              weight="bold"
              tintColor={theme.text}
              style={{ transform: [{ rotate: arrowRotation }] }}
            />
          </ThemedView>
          <ThemedText type="small">{title}</ThemedText>
        </button>
        {isOpen && (
          <div className={classes.content}>
            <ThemedView type="backgroundElement" style={{ borderRadius: 16, padding: 24 }}>
              {children}
            </ThemedView>
          </div>
        )}
      </ThemedView>
    );
  }

  return (
    <ThemedView>
      <Pressable
        style={({ pressed }) => [styles.heading, pressed && styles.pressedHeading]}
        onPress={() => setIsOpen((value) => !value)}>
        <ThemedView type="backgroundElement" style={styles.button}>
          <SymbolView
            name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
            size={14}
            weight="bold"
            tintColor={theme.text}
            style={{ transform: [{ rotate: arrowRotation }] }}
          />
        </ThemedView>

        <ThemedText type="small">{title}</ThemedText>
      </Pressable>
      {isOpen && (
        <Animated.View entering={FadeIn.duration(200)}>
          <ThemedView type="backgroundElement" style={styles.content}>
            {children}
          </ThemedView>
        </Animated.View>
      )}
    </ThemedView>
  );
}
