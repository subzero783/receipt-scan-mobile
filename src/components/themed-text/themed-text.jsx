import { Platform, Text } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import classes from './themed-text.module.css';
import { styles } from './themed-text.styles';

export function ThemedText({ style, type = 'default', themeColor, ...rest }) {
  const theme = useTheme();

  // Web implementation using CSS Modules
  if (Platform.OS === 'web') {
    const classNames = [
      classes[type],
      style
    ].filter(Boolean).join(' ');
    
    return (
      <span
        className={classNames}
        style={{ color: theme[themeColor ?? 'text'] }}
        {...rest}
      />
    );
  }

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        styles[type],
        style,
      ]}
      {...rest}
    />
  );
}
