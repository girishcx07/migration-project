import { NoticeResult } from "@acme/shared-ui/lib/new-visa-utils";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@acme/ui/components/alert-dialog";
import { Button } from "@acme/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/components/dialog";

export const NoticeDialog = ({
  title,
  htmlContent,
  open,
  onClose,
}: {
  title: string;
  htmlContent: string;
  open: boolean;
  onClose: () => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-primary">IMPORTANT NOTICE</DialogTitle>
          <h6>{title}</h6>
        </DialogHeader>
        {htmlContent ? (
          <div
            className="mb-3 max-h-[60vh] overflow-y-auto"
            dangerouslySetInnerHTML={{
              __html: htmlContent,
            }}
          ></div>
        ) : (
          <div>No Content Found!</div>
        )}
        <DialogFooter className="px-6 pb-6">
          <Button onClick={onClose}>Ok</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const VisaNoticeDialog = ({
  data,
  open,
  onConfirm,
  onCancel,
  onClose,
}: {
  data: NoticeResult | null;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="p-0">
        <AlertDialogHeader className="px-6 pt-6">
          <AlertDialogTitle className="text-primary">
            {data?.title}
          </AlertDialogTitle>
        </AlertDialogHeader>
        {data?.description ? (
          <div className="mb-3 max-h-[60vh] overflow-y-auto px-6 ">
            {data?.description}
          </div>
        ) : (
          <div>No Content Found!</div>
        )}

        <AlertDialogDescription className="px-6 italic ">
          {data?.sub_description}
        </AlertDialogDescription>
        <AlertDialogFooter className="px-6 pb-6">
          {data?.cancel && (
            <Button onClick={onCancel} className={`
              ${data?.proceed ? "bg-black hover:bg-black" : ""} 
              `}>{!data?.proceed ? "OK" : "Back"}</Button>
          )}
          {data?.proceed && <Button onClick={onConfirm}>Proceed</Button>}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
