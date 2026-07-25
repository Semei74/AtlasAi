export const zIndex = {
  content: 0,
  sticky: 100,
  topBar: 100,
  sidebar: 90,
  bottomTab: 100,
  banner: 110,
  footer: 10,
  statusBar: 50,
  dropdown: 200,
  tooltip: 200,
  popover: 200,
  searchOverlay: 300,
  bottomSheet: 400,
  drawer: 400,
  modal: 500,
  commandPalette: 600,
  systemDialog: 700,
  toast: 800,
  spinner: 900,
} as const;

export type ZIndexKey = keyof typeof zIndex;
