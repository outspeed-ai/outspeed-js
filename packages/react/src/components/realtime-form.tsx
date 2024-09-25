import React from "react";
import { cn } from "./__internal/utils";
import { Button, ButtonProps } from "./__internal/button";

export type TRealtimeFormProps = React.HTMLProps<HTMLFormElement>;

export function RealtimeForm(props: TRealtimeFormProps) {
  const { className, ...rest } = props;

  return (
    <form
      {...rest}
      className={cn(
        "max-w-lg space-y-4 py-4 px-8 rounded-md border flex-1",
        className
      )}
    />
  );
}

export function RealtimeFormButton(props: ButtonProps) {
  const { className, ...rest } = props;
  return (
    <Button
      type="button"
      className={cn("w-full !mt-8 font-bold", className)}
      {...rest}
    />
  );
}
