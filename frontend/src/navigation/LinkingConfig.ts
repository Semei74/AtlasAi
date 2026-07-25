import type { LinkingOptions } from '@react-navigation/native';

export const linkingConfig: LinkingOptions<any> = {
  prefixes: ['atlas://', 'https://atlas.ai'],
  config: {
    screens: {
      '(auth)': {
        screens: {
          login: 'login',
          register: 'register',
          'forgot-password': 'forgot-password',
          'verify-otp': 'verify-otp',
        },
      },
      '(tabs)': {
        screens: {
          index: 'dashboard',
          ai: 'ai',
          workspace: 'workspace',
          projects: 'projects',
          profile: 'profile',
        },
      },
      'ai/chat': 'ai/chat',
      'ai/prompts': 'ai/prompts',
      'ai/knowledge': 'ai/knowledge',
      notifications: 'notifications',
      search: 'search',
      settings: 'settings',
      'settings/profile': 'settings/profile',
      'settings/preferences': 'settings/preferences',
      'settings/security': 'settings/security',
      'settings/notifications': 'settings/notifications',
      'settings/about': 'settings/about',
      'settings/help': 'settings/help',
      'onboarding': 'onboarding',
      'workspace-selection': 'workspace-selection',
      'modals/command-palette': 'command-palette',
      'modals/qr-scanner': 'qr-scanner',
      'modals/app-update': 'app-update',
    },
  },
};
