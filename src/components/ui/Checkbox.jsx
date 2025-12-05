import React from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "../../utils/cn";

const Checkbox = React.forwardRef(({
    className,
    id,
    checked,
    indeterminate = false,
    disabled = false,
    required = false,
    label,
    description,
    error,
    size = "default",
    onCheckedChange,
    onChange,
...props
}, ref) => {
    // Generate unique ID if not provided
    const checkboxId = id || `checkbox-${Math.random()?.toString(36)?.substr(2, 9)}`;

    // Handle checkbox change
    const handleChange = (e) => {
        const isChecked = e?.target?.checked;
        
        // Call both handlers if provided
        if (onChange) {
            onChange(e);
        }
        if (onCheckedChange) {
            onCheckedChange(isChecked);
        }
    };

    // Size variants
    const sizeClasses = {
        sm: "h-4 w-4",
        default: "h-4 w-4",
        lg: "h-5 w-5"
    };

    return (
        <div className={cn("flex items-start space-x-2", className)}>
            <div className="relative flex items-center">
                <input
                    type="checkbox"
                    ref={ref}
                    id={checkboxId}
                    checked={checked}
                    disabled={disabled}
                    required={required}
                    onChange={handleChange}
                    className="sr-only"
                    { ...props}
                />

                <label
                    htmlFor={checkboxId}
                    className={cn(
                        "peer shrink-0 rounded-sm border-2 border-gray-300 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer transition-all duration-200 flex items-center justify-center",
                        sizeClasses?.[size],
                        checked && "bg-blue-600 text-white border-blue-600",
                        indeterminate && "bg-blue-600 text-white border-blue-600",
                        error && "border-red-500",
                        disabled && "cursor-not-allowed opacity-50 bg-gray-100",
                        !checked && !indeterminate && "hover:border-blue-400"
                    )}
                >
                    {checked && !indeterminate && (
                        <Check className="h-3 w-3 text-current" />
                    )}
                    {indeterminate && (
                        <Minus className="h-3 w-3 text-current" />
                    )}
                </label>
            </div>
            {(label || description || error) && (
                <div className="flex-1 space-y-1">
                    {label && (
                        <label
                            htmlFor={checkboxId}
                            className={cn(
                                "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer",
                                error ? "text-red-600" : "text-gray-900"
                            )}
                        >
                            {label}
                            {required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                    )}

                    {description && !error && (
                        <p className="text-sm text-gray-600">
                            {description}
                        </p>
                    )}

                    {error && (
                        <p className="text-sm text-red-600">
                            {error}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
});

Checkbox.displayName = "Checkbox";

// Checkbox Group component
const CheckboxGroup = React.forwardRef(({
    className,
    children,
    label,
    description,
    error,
    required = false,
    disabled = false,
...props
}, ref) => {
    return (
        <fieldset
            ref={ref}
            disabled={disabled}
            className={cn("space-y-3", className)}
            { ...props}
        >
            {label && (
                <legend className={cn(
                    "text-sm font-medium",
                    error ? "text-destructive" : "text-foreground"
                )}>
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </legend>
            )}

            {description && !error && (
                <p className="text-sm text-muted-foreground">
                    {description}
                </p>
            )}

            <div className="space-y-2">
                {children}
            </div>

            {error && (
                <p className="text-sm text-destructive">
                    {error}
                </p>
            )}
        </fieldset>
    );
});

CheckboxGroup.displayName = "CheckboxGroup";

export { Checkbox, CheckboxGroup };