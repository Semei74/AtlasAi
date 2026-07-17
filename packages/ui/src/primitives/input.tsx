import { Input as TamaguiInput } from "tamagui";
import type { ComponentProps, ReactElement } from "react";
import type { WithoutIndex } from "./props";

export function Input(props: WithoutIndex<ComponentProps<typeof TamaguiInput>>): ReactElement {
  return <TamaguiInput {...props} />;
}
