import { H1, H2, H3, H4, type TextProps } from "tamagui";
import type { ComponentProps, ReactElement } from "react";
import type { WithChildren, WithoutIndex } from "./props";

interface HeadingProps extends WithChildren<WithoutIndex<TextProps>> {
  level?: 1 | 2 | 3 | 4;
}

export function Heading({ level = 1, children, ...props }: HeadingProps): ReactElement {
  const textProps = props as ComponentProps<typeof H1>;
  switch (level) {
    case 1:
      return <H1 {...textProps}>{children}</H1>;
    case 2:
      return <H2 {...textProps}>{children}</H2>;
    case 3:
      return <H3 {...textProps}>{children}</H3>;
    case 4:
      return <H4 {...textProps}>{children}</H4>;
  }
}
