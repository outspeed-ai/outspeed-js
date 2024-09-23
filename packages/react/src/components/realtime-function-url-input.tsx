import React from "react";
import { FormDescription, FormItem, FormLabel } from "./__internal/form";
import { Input } from "./__internal/input";
import { cn } from "./__internal/utils";

export type TRealtimeFunctionURLInputProps = {
  /**
   * function url input.
   */
  value: string;
  /**
   * @default "https://infra.getadapt.ai/run/..."
   */
  placeholder?: string;

  /**
   * @default "Function URL"
   */
  label?: string;

  /**
   * Optional description text.
   * This will be shown below the select.
   */
  description?: string;
  /**
   * Callback when the value changes.
   */
  onChange: (e: React.FormEvent<HTMLInputElement>) => void;
  /**
   * If then border and label color will be red.
   */
  isError?: boolean;

  /**
   * If defined then error msg will be shown below description.
   */
  errorMsg?: string;
};

export function RealtimeFunctionURLInput(
  props: TRealtimeFunctionURLInputProps
) {
  const {
    value,
    onChange,
    placeholder = "https://infra.getadapt.ai/run/...",
    description,
    label = "Function URL",
    isError,
    errorMsg,
  } = props;

  return (
    <FormItem>
      <FormLabel className="space-y-2">
        <div className={cn("inline", isError && "text-destructive")}>
          {label}
        </div>

        <Input
          isError={isError}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      </FormLabel>
      {description && <FormDescription>{description}</FormDescription>}
      {errorMsg && <FormDescription isError>{errorMsg}</FormDescription>}
    </FormItem>
  );
}
