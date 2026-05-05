"use client";

import * as React from "react";
import { X } from "lucide-react";

import { cn } from "@repo/ui/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";

type DrawerProps = React.ComponentProps<typeof Dialog> & {
  direction?: "top" | "right" | "bottom" | "left";
  dismissible?: boolean;
  handleOnly?: boolean;
};

function Drawer({
  direction: _direction,
  dismissible: _dismissible,
  handleOnly: _handleOnly,
  ...props
}: DrawerProps) {
  return <Dialog {...props} />;
}

function DrawerContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogContent>) {
  return (
    <DialogContent
      data-slot="drawer-content"
      showClose={false}
      className={cn(
        "fixed inset-x-0 right-auto bottom-0 left-0 top-auto z-50 max-h-[95dvh] w-full max-w-none translate-x-0 translate-y-0 rounded-t-xl",
        className,
      )}
      {...props}
    >
      <div className="bg-muted mx-auto mt-2 h-1.5 w-12 rounded-full" />
      {children}
    </DialogContent>
  );
}

function DrawerClose({
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      className={cn("rounded-sm opacity-70 hover:opacity-100", className)}
      type="button"
      {...props}
    >
      {children ?? <X className="size-4" />}
    </button>
  );
}

export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DialogDescription as DrawerDescription,
  DialogFooter as DrawerFooter,
  DialogHeader as DrawerHeader,
  DialogTitle as DrawerTitle,
};
