import { Text as TamaguiText } from "tamagui";
import type { ComponentProps, ReactElement } from "react";
import type { WithChildren } from "./props";

export function Text(props: WithChildren<ComponentProps<typeof TamaguiText>>): ReactElement {
  return <TamaguiText {...props} />;
}
