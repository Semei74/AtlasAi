import { View, StyleSheet } from 'react-native';
import { Loader, Text } from '../../design-system';

interface GlobalLoaderProps {
  message?: string;
}

export function GlobalLoader({ message = 'Loading...' }: GlobalLoaderProps) {
  return (
    <View style={styles.container}>
      <Loader size={48} />
      <View style={{ height: 16 }} />
      <Text role="body" color="#6B7280">
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
});
