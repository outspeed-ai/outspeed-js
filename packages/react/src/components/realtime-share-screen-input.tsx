import { FormDescription, FormItem, FormLabel } from "./__internal/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./__internal/select";

export type TRealtimeShareScreenInputProps = {
  value: string;
  /**
   * @default "Do you want to share you screen"
   */
  placeholder?: string;

  /**
   * @default "Screen"
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
  onChange: (value: string) => void;
  /**
   * If then border and label color will be red.
   */
  isError?: boolean;

  /**
   * If defined then error msg will be shown below description.
   */
  errorMsg?: string;
};

export function RealtimeShareScreenInput(
  props: TRealtimeShareScreenInputProps
) {
  const {
    value,
    onChange,
    placeholder = "Select resolution. 512p is recommended for now.",
    label = "Video Resolution",
    description,
    isError,
    errorMsg,
  } = props;

  return (
    <FormItem>
      <FormLabel htmlFor="share-screen" isError={isError}>
        {label}
      </FormLabel>
      <Select onValueChange={onChange} value={value}>
        <SelectTrigger isError={isError} id="share-screen">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {[
            { label: "512p", value: "512p" },
            { label: "1080p", value: "1080p" },
          ].map(({ value, label }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && <FormDescription>{description}</FormDescription>}
      {errorMsg && <FormDescription isError>{errorMsg}</FormDescription>}
    </FormItem>
  );
}
