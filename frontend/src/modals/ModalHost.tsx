import { ReactNode, createContext, useContext, useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInUp, SlideOutDown } from 'react-native-reanimated';
import { useTheme } from '../../design-system';

interface ModalConfig {
  id: string;
  content: ReactNode;
  onClose?: () => void;
}

interface ModalContextValue {
  openModal: (config: ModalConfig) => void;
  closeModal: (id: string) => void;
  closeAll: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function useModalHost(): ModalContextValue {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    return { openModal: () => {}, closeModal: () => {}, closeAll: () => {} };
  }
  return ctx;
}

interface ModalHostProps {
  children: ReactNode;
}

export function ModalHost({ children }: ModalHostProps) {
  const [modals, setModals] = useState<ModalConfig[]>([]);
  const theme = useTheme();

  const openModal = useCallback((config: ModalConfig) => {
    setModals((prev) => [...prev, config]);
  }, []);

  const closeModal = useCallback((id: string) => {
    setModals((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const closeAll = useCallback(() => {
    setModals([]);
  }, []);

  const contextValue = useMemo(
    () => ({ openModal, closeModal, closeAll }),
    [openModal, closeModal, closeAll],
  );

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      {modals.map((modal, index) => (
        <Animated.View
          key={modal.id}
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}
        >
          <Pressable
            style={styles.backdrop}
            onPress={() => closeModal(modal.id)}
          />
          <Animated.View
            entering={SlideInUp.duration(300)}
            exiting={SlideOutDown.duration(200)}
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.colors.surfaceElevated,
                borderRadius: theme.radius.lg,
              },
            ]}
          >
            {modal.content}
          </Animated.View>
        </Animated.View>
      ))}
    </ModalContext.Provider>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 500,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    width: '85%',
    maxWidth: 480,
    maxHeight: '80%',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
});
