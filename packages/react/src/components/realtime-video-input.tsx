import { useAvailableMediaDevices } from "../hooks";
import { FormDescription, FormItem, FormLabel } from "./__internal/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./__internal/select";

export type TRealtimeVideoInputProps = {
  /**
   * The current selected video device id.
   */
  value: string;
  /**
   * @default "Select a video device"
   */
  placeholder?: string;

  /**
   * @default "Video"
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

export function RealtimeVideoInput(props: TRealtimeVideoInputProps) {
  const {
    value,
    onChange,
    placeholder = "Select video device",
    label = "Video",
    description,
  } = props;

  const { availableVideoDevices } = useAvailableMediaDevices();

  return (
    <FormItem>
      <FormLabel htmlFor="video-device">{label}</FormLabel>
      <Select onValueChange={onChange} value={value}>
        <SelectTrigger id="video-device">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {availableVideoDevices.map(({ deviceId, label }) => (
            <SelectItem key={deviceId} value={deviceId}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && <FormDescription>{description}</FormDescription>}
    </FormItem>
  );
}
