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
};

export function RealtimeShareScreenInput(
  props: TRealtimeShareScreenInputProps
) {
  const {
    value,
    onChange,
    placeholder = "Do you want to share your screen",
    label = "Screen",
    description,
  } = props;

  return (
    <FormItem>
      <FormLabel htmlFor="share-screen">{label}</FormLabel>
      <Select onValueChange={onChange} value={value}>
        <SelectTrigger id="share-screen">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {[
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ].map(({ value, label }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && <FormDescription>{description}</FormDescription>}
    </FormItem>
  );
}
