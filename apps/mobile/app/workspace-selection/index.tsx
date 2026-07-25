import { ReactElement, useCallback } from 'react';
import { router } from 'expo-router';
import { WorkspaceSelectionScreen } from '../../../../frontend/src/auth/screens';

export default function WorkspaceSelectionRoute(): ReactElement {
  const handleSelectWorkspace = useCallback((workspaceId: string) => {
    // Store selected workspace
    router.replace('/');
  }, []);

  return (
    <WorkspaceSelectionScreen
      onSelectWorkspace={handleSelectWorkspace}
    />
  );
}
