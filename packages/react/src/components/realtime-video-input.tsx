import { useAvailableMediaDevices } from "../hooks";
import { FormDescription, FormItem, FormLabel } from "./__internal/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./__internal/select";
import { useEffect } from "react";

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
  /**
   * If then border and label color will be red.
   */
  isError?: boolean;

  /**
   * If defined then error msg will be shown below description.
   */
  errorMsg?: string;
};

export function RealtimeVideoInput(props: TRealtimeVideoInputProps) {
  const {
    value,
    onChange,
    placeholder = null,
    label = "Video",
    description,
    isError,
    errorMsg,
  } = props;

  const { availableVideoDevices } = useAvailableMediaDevices();

  useEffect(() => {
    if (availableVideoDevices.length > 0 && !value && !placeholder) {
      onChange(availableVideoDevices[0].deviceId);
    }
  }, [availableVideoDevices, placeholder]);

  return (
    <FormItem>
      <FormLabel htmlFor="video-device" isError={isError}>
        {label}
      </FormLabel>
      <Select onValueChange={onChange} value={value}>
        <SelectTrigger id="video-device" isError={isError}>
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
      {errorMsg && <FormDescription isError>{errorMsg}</FormDescription>}
    </FormItem>
  );
}
