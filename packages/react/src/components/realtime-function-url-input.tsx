import React from "react";
import { FormDescription, FormItem, FormLabel } from "./__internal/form";
import { Input } from "./__internal/input";

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
  } = props;

  return (
    <FormItem>
      <FormLabel className="space-y-2">
        <div className="inline">{label}</div>

        <Input placeholder={placeholder} value={value} onChange={onChange} />
      </FormLabel>
      {description && <FormDescription>{description}</FormDescription>}
    </FormItem>
  );
}
