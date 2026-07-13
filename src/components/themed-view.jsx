import { Platform, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

export function ThemedView({ style, lightColor, darkColor, type, ...otherProps }) {
  const theme = useTheme();

  if (Platform.OS === 'web') {
    return (
      <div
        style={{
          backgroundColor: theme[type ?? 'background'],
          display: 'flex',
          flexDirection: 'column',
          ...style
        }}
        {...otherProps}
      />
    );
  }

  return <View style={[{ backgroundColor: theme[type ?? 'background'] }, style]} {...otherProps} />;
}
