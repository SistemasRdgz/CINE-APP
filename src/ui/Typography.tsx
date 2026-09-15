import React from 'react';
import { Text as NativeText, TextInput as NativeInput, TextProps, TextInputProps } from 'react-native';
import { useTheme } from './theme';
export function Text({ style, ...props }: TextProps) {
  const { colors } = useTheme();
 return <NativeText {...props} style={[{ color: colors.text }, style]} />; }
export function TextInput({ style, ...props }: TextInputProps) {
  const { colors } = useTheme();
 return <NativeInput placeholderTextColor={colors.muted} selectionColor={colors.primary} {...props} style={[{ color: colors.text }, style]} />; }
