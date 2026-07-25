import { Button, Card, Heading, Text } from "@atlas/ui";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps): React.ReactElement {
  return (
    <Card padding="$5" gap="$2" alignItems="center" justifyContent="center" minHeight={160}>
      <Heading level={3}>{title}</Heading>
      {description ? <Text color="$gray11" textAlign="center">{description}</Text> : null}
      {actionLabel && onAction ? (
        <Button marginTop="$2" onPress={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </Card>
  );
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ title = "Something went wrong", message, onRetry }: ErrorStateProps): React.ReactElement {
  return (
    <Card padding="$5" gap="$2" alignItems="center" justifyContent="center" minHeight={160}>
      <Heading level={3} color="$red10">{title}</Heading>
      {message ? <Text color="$gray11" textAlign="center">{message}</Text> : null}
      {onRetry ? (
        <Button marginTop="$2" color="$blue10" onPress={onRetry}>
          Try again
        </Button>
      ) : null}
    </Card>
  );
}
