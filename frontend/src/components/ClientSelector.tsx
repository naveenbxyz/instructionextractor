import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClients } from "@/hooks/useClients";

interface Props {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function ClientSelector({ value, onChange, disabled }: Props) {
  const { clients, loading, error } = useClients();

  if (error) {
    return <p className="text-sm text-destructive">Failed to load client configs</p>;
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Client Configuration</label>
      <Select value={value} onValueChange={onChange} disabled={disabled || loading}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={loading ? "Loading..." : "Select a client config"} />
        </SelectTrigger>
        <SelectContent>
          {clients.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
