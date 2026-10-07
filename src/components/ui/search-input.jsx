import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchInput({
  className,
  inputClassName,
  value,
  onClear,
  clearLabel = "Clear search",
  disabled,
  ...props
}) {
  const showClear = Boolean(value) && Boolean(onClear);
  return (
    <div
      data-slot="search-field"
      className={cn("relative w-full min-w-0", className)}
    >
      <Search
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground",
          disabled && "opacity-50",
        )}
      />
      <Input
        {...props}
        value={value}
        disabled={disabled}
        className={cn(
          "h-11 rounded-md border-input bg-transparent pl-9 !text-[length:var(--text-search)] leading-5 font-medium text-foreground placeholder:text-muted-foreground shadow-none",
          showClear ? "pr-11" : "pr-3",
          inputClassName,
        )}
      />
      {showClear && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={clearLabel}
          disabled={disabled}
          className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-primary"
          onClick={onClear}
        >
          <X aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}
