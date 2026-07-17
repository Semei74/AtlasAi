import { YStack, XStack, type YStackProps } from "tamagui";
import type { ComponentProps, ReactElement } from "react";
import type { WithChildren, WithoutIndex } from "./props";

interface StackProps extends WithChildren<WithoutIndex<YStackProps>> {
  orientation?: "vertical" | "horizontal";
}

export function Stack({ orientation, children, ...props }: StackProps): ReactElement {
  const stackProps = props as ComponentProps<typeof YStack>;
  if (orientation === "horizontal") {
    return <XStack {...stackProps}>{children}</XStack>;
  }
  return <YStack {...stackProps}>{children}</YStack>;
}
