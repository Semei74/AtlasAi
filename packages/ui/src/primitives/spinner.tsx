import { Spinner as TamaguiSpinner } from "tamagui";
import type { ComponentProps, ReactElement } from "react";
import type { WithoutIndex } from "./props";

export function Spinner(props: WithoutIndex<ComponentProps<typeof TamaguiSpinner>>): ReactElement {
  return <TamaguiSpinner {...(props as ComponentProps<typeof TamaguiSpinner>)} />;
}
