import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, StyleSheet, Platform } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import classes from './collapsible.module.css';

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

  // Native fallback
  const nativeStyles = {
    heading: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    pressedHeading: {
      opacity: 0.7,
    },
    button: {
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      marginTop: 16,
      borderRadius: 16,
      marginLeft: 24,
      padding: 24,
    },
  };

  return (
    <ThemedView>
      <Pressable
        style={({ pressed }) => [nativeStyles.heading, pressed && nativeStyles.pressedHeading]}
        onPress={() => setIsOpen((value) => !value)}>
        <ThemedView type="backgroundElement" style={nativeStyles.button}>
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
          <ThemedView type="backgroundElement" style={nativeStyles.content}>
            {children}
          </ThemedView>
        </Animated.View>
      )}
    </ThemedView>
  );
}
