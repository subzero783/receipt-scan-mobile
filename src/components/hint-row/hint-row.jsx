import { Platform, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import classes from './hint-row.module.css';
import { styles } from './hint-row.styles';

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

  return (
    <View style={styles.stepRow}>
      <ThemedText type="small">{title}</ThemedText>
      <ThemedView type="backgroundSelected" style={styles.codeSnippet}>
        <ThemedText themeColor="textSecondary">{hint}</ThemedText>
      </ThemedView>
    </View>
  );
}
