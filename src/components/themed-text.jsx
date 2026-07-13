import { Platform, Text } from 'react-native';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import classes from './themed-text.module.css';

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

  // Native fallback using inline styles
  const nativeStyles = {
    small: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
    smallBold: { fontSize: 14, lineHeight: 20, fontWeight: '700' },
    default: { fontSize: 16, lineHeight: 24, fontWeight: '500' },
    title: { fontSize: 48, fontWeight: '600', lineHeight: 52 },
    subtitle: { fontSize: 32, lineHeight: 44, fontWeight: '600' },
    link: { lineHeight: 30, fontSize: 14 },
    linkPrimary: { lineHeight: 30, fontSize: 14, color: '#3c87f7' },
    code: {
      fontFamily: Fonts.mono,
      fontWeight: Platform.select({ android: '700' }) ?? '500',
      fontSize: 12,
    },
  };

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        nativeStyles[type],
        style,
      ]}
      {...rest}
    />
  );
}
