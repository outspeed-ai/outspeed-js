import { useAvailableMediaDevices } from "../hooks";
import { FormDescription, FormItem, FormLabel } from "./__internal/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./__internal/select";

export type TRealtimeAudioInputProps = {
  /**
   * The current selected audio device id.
   */
  value: string;
  /**
   * @default "Select a audio device"
   */
  placeholder?: string;

  /**
   * @default "audio"
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

export function RealtimeAudioInput(props: TRealtimeAudioInputProps) {
  const {
    value,
    onChange,
    placeholder = "Select audio device",
    label = "Audio",
    description,
    isError,
    errorMsg,
  } = props;

  const { availableAudioDevices } = useAvailableMediaDevices();

  return (
    <FormItem>
      <FormLabel htmlFor="audio-device" isError={isError}>
        {label}
      </FormLabel>
      <Select onValueChange={onChange} value={value}>
        <SelectTrigger id="audio-device" isError={isError}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {availableAudioDevices.map(({ deviceId, label }) => (
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
