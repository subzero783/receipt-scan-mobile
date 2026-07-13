import { Platform, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import classes from './hint-row.module.css';

export function HintRow({ title = 'Try editing', hint = 'app/index.tsx' }) {
  if (Platform.OS === 'web') {
    return (
      <div className={classes.stepRow}>
        <ThemedText type="small">{title}</ThemedText>
        <ThemedView type="backgroundSelected" style={{ borderRadius: 8, padding: '2px 8px' }}>
          <ThemedText themeColor="textSecondary">{hint}</ThemedText>
        </ThemedView>
      </div>
    );
  }

  // Native fallback using inline style objects
  const nativeStyles = {
    stepRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    codeSnippet: {
      borderRadius: 8,
      paddingVertical: 2,
      paddingHorizontal: 8,
    },
  };

  return (
    <View style={nativeStyles.stepRow}>
      <ThemedText type="small">{title}</ThemedText>
      <ThemedView type="backgroundSelected" style={nativeStyles.codeSnippet}>
        <ThemedText themeColor="textSecondary">{hint}</ThemedText>
      </ThemedView>
    </View>
  );
}
