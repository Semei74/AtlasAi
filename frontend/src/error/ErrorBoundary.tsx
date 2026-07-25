import { Component, ReactNode, ErrorInfo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Surface } from '../../design-system';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <Surface variant="elevated" padding={24}>
            <View style={styles.content}>
              <Text role="heading4" align="center" color="#DC2626">
                Something went wrong
              </Text>
              <View style={{ height: 8 }} />
              <Text role="body" align="center" color="#6B7280">
                An unexpected error occurred. Our team has been notified.
              </Text>
              <View style={{ height: 16 }} />
              <Text role="caption" align="center" color="#9CA3AF">
                {this.state.error?.message ?? 'Unknown error'}
              </Text>
              <View style={{ height: 24 }} />
              <Button variant="primary" size="md" onPress={this.handleRetry}>
                Try Again
              </Button>
            </View>
          </Surface>
        </View>
      );
    }

    return this.props.children;
  }
}
