"use client";

import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { X } from "lucide-react";

interface TermsPolicyModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    url: string;
}

export const TermsPolicyModal = ({
    open,
    onOpenChange,
    title,
    url,
}: TermsPolicyModalProps) => {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-4xl min-h-[80vh]">
                <AlertDialogHeader className="relative">
                    <AlertDialogTitle>{title}</AlertDialogTitle>

                    {/* Header-right close button */}
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="absolute right-0 top-0 rounded p-1 text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </AlertDialogHeader>

                <div className="w-full h-[70vh]">
                    <iframe
                        src={url}
                        className="w-full h-full border rounded"
                    />
                </div>
                <div className="flex justify-end mt-4">
                    <AlertDialogCancel className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded">
                        Close
                    </AlertDialogCancel>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
};