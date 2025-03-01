import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface InputGroupProps {
  id: string
  label: string
  value: string | number
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  className?: string
  suffix?: string
  prefix?: string
  disabled?: boolean
}

export function InputGroup({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  className,
  suffix,
  prefix,
  disabled = false,
}: InputGroupProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        {prefix && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
            {prefix}
          </div>
        )}
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(prefix && "pl-8", suffix && "pr-8")}
          disabled={disabled}
        />
        {suffix && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-400">
            {suffix}
          </div>
        )}
      </div>
    </div>
  )
}

