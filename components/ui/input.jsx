import * as React from "react";

const Input = React.forwardRef(({ className = "", type = "text", ...props }, ref) => {
    return (
        <input
            type={type}
            className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
            ref={ref}
            {...props}
        />
    );
});

Input.displayName = "Input";

export { Input };
