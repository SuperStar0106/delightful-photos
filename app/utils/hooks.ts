import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  useAnimatedReaction,
  withSpring,
} from 'react-native-reanimated'

export const useFloatHederAnimation = (maxHeight: number) => {
  const scrollY = useSharedValue(0)
  const diffY = useSharedValue(0)
  useAnimatedReaction(
    () => scrollY.value,
    (result, previous) => {
      if (result >= 0 && result !== previous) {
        const diff = (previous || 0) - result
        diffY.value = interpolate(
          diffY.value + diff,
          [-maxHeight * 2, 0],
          [-maxHeight * 2, 0],
          Animated.Extrapolate.CLAMP,
        )
      }
    },
    [maxHeight],
  )
  const styles = useAnimatedStyle(
    () => ({
      transform: [
        {
          translateY: diffY.value,
        },
      ],
    }),
    [],
  )

  return [scrollY, styles]
}
