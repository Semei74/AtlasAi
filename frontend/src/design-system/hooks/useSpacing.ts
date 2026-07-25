import { spacing, inset, stack, inline, gap, density, layout, contentPadding } from '../theme/spacing';
import type { SpacingKey, SpacingValue } from '../theme/spacing';

export function useSpacing(): {
  spacing: typeof spacing;
  inset: typeof inset;
  stack: typeof stack;
  inline: typeof inline;
  gap: typeof gap;
  density: typeof density;
  layout: typeof layout;
  contentPadding: typeof contentPadding;
  getSpacing: (key: SpacingKey) => SpacingValue;
} {
  return {
    spacing,
    inset,
    stack,
    inline,
    gap,
    density,
    layout,
    contentPadding,
    getSpacing: (key: SpacingKey) => spacing[key],
  };
}
