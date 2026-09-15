import React from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from './theme';
export type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];
export default function Icon({ name, size = 24, color }: { name: IconName; size?: number; color?: string }) {
  const { colors } = useTheme();

  return <MaterialCommunityIcons name={name} size={size} color={color ?? colors.primary} />;
}
