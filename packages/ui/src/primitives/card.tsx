import { Card as TamaguiCard } from "tamagui";
import type { ComponentProps, ReactElement } from "react";
import type { WithChildren } from "./props";

export function Card(props: WithChildren<ComponentProps<typeof TamaguiCard>>): ReactElement {
  return <TamaguiCard {...props} />;
}
