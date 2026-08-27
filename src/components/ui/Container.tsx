import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type ContainerElement = "div" | "section" | "main" | "article";

type ContainerProps<T extends ContainerElement = "div"> = {
  as?: T;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export function Container<T extends ContainerElement = "div">({
  as,
  children,
  className,
  ...props
}: ContainerProps<T>) {
  const Component = (as ?? "div") as ElementType;
  const classes = ["container", className].filter(Boolean).join(" ");

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
}
