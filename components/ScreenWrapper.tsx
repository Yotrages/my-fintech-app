import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, ViewStyle } from 'react-native';
import { ReactNode } from 'react';

type ScreenWrapperProps = {
  children: ReactNode;
  backgroundColor?: string;
  edges?: ('top' | 'right' | 'bottom' | 'left')[];
  style?: ViewStyle;
};

export const ScreenWrapper = ({ 
  children, 
  backgroundColor = '#fff',
  edges = ['top', 'bottom'],
  style 
}: ScreenWrapperProps) => {
  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor }, style]}
      edges={edges}
    >
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});