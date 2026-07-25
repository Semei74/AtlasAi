import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button, Card, Heading, Text } from "@atlas/ui";
import { captureError } from "@atlas/observability";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, info: ErrorInfo): void {
    captureError(error, { componentStack: info.componentStack ?? "" });
  }

  private readonly reset = (): void => {
    this.setState({ hasError: false });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.reset);
      }
      return (
        <Card padding="$6" gap="$3" alignItems="center" justifyContent="center" minHeight={240}>
          <Heading level={3} color="$red10">Unexpected error</Heading>
          <Text color="$gray11" textAlign="center">
            The dashboard crashed while rendering. You can try to recover.
          </Text>
          <Button color="$blue10" onPress={this.reset}>
            Reload view
          </Button>
        </Card>
      );
    }
    return this.props.children;
  }
}
