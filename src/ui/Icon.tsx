import React from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors } from './theme';
export type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];
export default function Icon({ name, size = 24, color = colors.primary }: { name: IconName; size?: number; color?: string }) {
  return <MaterialCommunityIcons name={name} size={size} color={color} />;
}
