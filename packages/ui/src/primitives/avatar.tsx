import { Avatar as TamaguiAvatar } from "tamagui";
import type { ComponentProps, ReactElement } from "react";
import type { WithoutIndex } from "./props";

export function Avatar(props: WithoutIndex<ComponentProps<typeof TamaguiAvatar>>): ReactElement {
  return <TamaguiAvatar {...props} circular />;
}
