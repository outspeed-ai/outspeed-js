"use client";

import * as React from "react";
import { cn } from "./utils";
import { Label } from "./label";

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("space-y-2", className)} {...props} />;
});
FormItem.displayName = "FormItem";

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    isError?: boolean;
  }
>(({ className, isError, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn(
        "text-[0.8rem]",
        isError ? "text-destructive" : "text-muted-foreground",
        className
      )}
      {...props}
    />
  );
});
FormDescription.displayName = "FormDescription";

const FormLabel = Label;

export { FormItem, FormLabel, FormDescription };
