import { Separator } from "tamagui";
import type { ComponentProps, ReactElement } from "react";
import type { WithoutIndex } from "./props";

export function Divider(props: WithoutIndex<ComponentProps<typeof Separator>>): ReactElement {
  return <Separator {...props} />;
}
