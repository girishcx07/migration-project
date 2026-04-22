import { AlertTitle, Alert } from "@workspace/ui/components/alert"
import { cn } from "@workspace/ui/lib/utils"


export const ChildApplicantError = ({ className }: { className?: string }) => {
    return (
        <Alert className={cn("bg-red-500/10 border-red-500/30", className)} variant="destructive">
            <AlertTitle className="line-clamp-0 text-red-700">
                Minors are advised to travel with a parent to avoid a high risk of visa rejection.
            </AlertTitle>
        </Alert>
    )
}