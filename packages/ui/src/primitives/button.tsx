import { Button as TamaguiButton } from "tamagui";
import type { ComponentProps, ReactElement } from "react";
import type { WithoutIndex } from "./props";

export function Button(props: WithoutIndex<ComponentProps<typeof TamaguiButton>>): ReactElement {
  return <TamaguiButton {...props} />;
}
