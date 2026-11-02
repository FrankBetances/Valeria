// Copiado de React Native Reusables (MIT © 2025 Founded Labs)
// packages/registry/src/nativewind/components/ui/native-only-animated-view.tsx · https://github.com/founded-labs/react-native-reusables
import { Platform, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * This component is used to wrap animated views that should only be animated on native.
 * @param props - The props for the animated view.
 * @returns The animated view if the platform is native, otherwise the children.
 * @example
 * <NativeOnlyAnimatedView entering={FadeIn} exiting={FadeOut}>
 *   <Text>I am only animated on native</Text>
 * </NativeOnlyAnimatedView>
 */
function NativeOnlyAnimatedView(
  props: (React.ComponentProps<typeof Animated.View> & React.RefAttributes<typeof Animated.View> 
    & { as?: "View" }) | (React.ComponentProps<typeof AnimatedPressable> & React.RefAttributes<typeof AnimatedPressable> & { as: "Pressable" })
) {
  if (Platform.OS === 'web') {
    return <>{props.children as React.ReactNode}</>;
  } else {
    if (props.as === "Pressable"){
      return <AnimatedPressable {...props} />;
    }
    // Valeria+: los tipos de Reusables son los de Reanimated 4; aquí va la 3.
    return <Animated.View {...(props as React.ComponentProps<typeof Animated.View>)} />;
  }
}

export { NativeOnlyAnimatedView };
