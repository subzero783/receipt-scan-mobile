import { Platform } from 'react-native';

export const styles = {
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    width: 201,
    height: 201,
    position: 'absolute',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 128,
    height: 128,
    ...Platform.select({
      web: {},
      default: { zIndex: 100 },
    }),
  },
  image: {
    width: 76,
    height: 71,
    ...Platform.select({
      web: { position: 'absolute' },
      default: {},
    }),
  },
  background: {
    width: 128,
    height: 128,
    position: 'absolute',
    ...Platform.select({
      web: {},
      default: {
        borderRadius: 40,
        experimental_backgroundImage: `linear-gradient(180deg, #3C9FFE, #0274DF)`,
      },
    }),
  },
  splashOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#208AEF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  // Used in web version
  container: {
    alignItems: 'center',
    width: '100%',
    zIndex: 1000,
    position: 'absolute',
    top: 128 / 2 + 138,
  },
};
