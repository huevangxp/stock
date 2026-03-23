import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';
import Animated, { 
  useAnimatedStyle, 
  interpolate,
  SharedValue,
  Extrapolate
} from 'react-native-reanimated';

interface CollapsibleHeaderProps {
  scrollY: SharedValue<number>;
  userName: string;
}

export function CollapsibleHeader({ scrollY, userName }: CollapsibleHeaderProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme as 'light' | 'dark'];

  const headerStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, 80],
      [0, -40],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ translateY }],
      paddingTop: insets.top + 8,
    };
  });

  return (
    <Animated.View style={[styles.wrapper, headerStyle]}>
      <BlurView intensity={colorScheme === 'dark' ? 80 : 60} tint={colorScheme} style={StyleSheet.absoluteFill} />
      <View style={styles.content}>
        <View style={styles.userInfo}>
          <View style={[styles.avatar, { backgroundColor: '#0a7ea4' }]}>
            <Text style={styles.avatarText}>{userName.charAt(0)}</Text>
          </View>
          <View>
            <Text style={[styles.greeting, { color: colors.icon }]}>Good Morning,</Text>
            <Text style={[styles.userName, { color: colors.text }]}>{userName}</Text>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.iconButton, { backgroundColor: colorScheme === 'dark' ? '#2A2D30' : '#F2F2F7' }]}>
            <MaterialCommunityIcons name="magnify" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconButton, { backgroundColor: colorScheme === 'dark' ? '#2A2D30' : '#F2F2F7' }]}>
            <MaterialCommunityIcons name="bell-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  greeting: {
    fontSize: 12,
    fontWeight: '600',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 10,
    borderRadius: 14,
  },
});
