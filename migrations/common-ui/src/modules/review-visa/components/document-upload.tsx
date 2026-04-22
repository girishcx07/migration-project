import { ApplicantRequiredDocument } from "@workspace/types/review";
import Dragger from "@workspace/common-ui/components/dragger";
import { queryClient } from "@workspace/common-ui/lib/react-query";
import {
  convertToJpeg,
  generateFileTypeMap,
} from "@workspace/common-ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { motion } from "framer-motion";
import { UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useApplicationState } from "../context/review-visa-context";
import { useLinkDocument } from "../hooks/use-link-document";
import { useSaveApplicanForm } from "@workspace/common-ui/hooks/global-queries";
import { orpc } from "@workspace/orpc/lib/orpc";
import { useIsMobile } from "@workspace/common-ui/hooks/use-is-mobile";
import { MobileDocumentEditor } from "../../../components/mobile-document-editor";
import { MAX_UPLOAD_DOCUMENT_SIZE } from "@workspace/common/constants";

interface DocumentUploadProps {
  format: string[];
  document: ApplicantRequiredDocument;
  closeDeager: (value: boolean) => void;
}

export const DocumentUpload = ({
  format,
  document,
  closeDeager,
}: DocumentUploadProps) => {
  const {
    activeApplicantId,
    setActionType,
    setSelectedDocument,
    setIsDocumentPoolOpen,
    applicationId,
    getVisaFormValues,
  } = useApplicationState();
  const { mutateAsync } = useSaveApplicanForm();

  const isMobile = useIsMobile();
  const [mobileCropFile, setMobileCropFile] = useState<File | null>(null);
  const [isMobileEditorOpen, setIsMobileEditorOpen] = useState(false);

  const { handleUploadFile, isPending } = useLinkDocument({
    applicantId: activeApplicantId!,
    docType: document.doc_type!,
    applicationId,
    onSuccess: ({ data, msg }, payload) => {
      console.log("upload documents---->", data, document);
      if (data === "success") {
        queryClient.invalidateQueries({
          queryKey: orpc.visa.getApplicantDocData.key(),
        });

        if (document.doc_snap[0]?.ocr_required) {
          queryClient.removeQueries({
            queryKey: orpc.visa.getVisaFormForApplicant.key(),
          });
          queryClient.invalidateQueries({
            queryKey: orpc.visa.getVisaFormForApplicant.key(),
          });
        }
      } else {
        toast.error(`Failed to upload ${payload.file?.name}`, {
          description: msg || "Something went wrong!",
        });
        // toast.error(msg || "Something went wrong!");
      }
    },
    onFailure: () => {
      toast.error("Something went wrong!");
    },
  });

  const handleDropFiles = async (files: File[]) => {
    const { formValues, ...formData } = getVisaFormValues();

    await mutateAsync({
      formData,
      applicantId: activeApplicantId!,
      applicationId,
    });
    console.log("updated doc ", files);

    const processedFiles: File[] = [];

    for (const file of files) {
      if (file.type === "application/pdf") {
        // keep PDF as is
        processedFiles.push(file);
      } else {
        try {
          processedFiles.push(file);
          // const converted = await convertToJpeg(file); // 👈 our util
          // processedFiles.push(converted);
        } catch (error) {
          console.error("Image conversion failed:", error);
        }
      }
    }
    console.log("processedFiles", processedFiles);

    // If on mobile and it's a single image, intercept and open MobileDocumentEditor
    if (
      isMobile &&
      processedFiles.length === 1 &&
      processedFiles[0]?.type.startsWith("image/")
    ) {
      setMobileCropFile(processedFiles[0]!);
      setIsMobileEditorOpen(true);
      return;
    }

    handleUploadFile(processedFiles);
  };

  const handleMobileSave = (croppedFile: File) => {
    handleUploadFile([croppedFile]);
  };

  // const formatTxt = format.join(", ");

  const acceptedFormats = generateFileTypeMap(format);
  // console.log(
  //   "accepted formats >>",
  //   acceptedFormats,
  //   " for ",
  //   document.doc_display_name,
  // );

  if (isPending) {
    return <UploadingDocumentsCard />;
  }

  return (
    <>
      <Dragger
        className="rounded-t-none"
        onClick={(e) => {
          e.stopPropagation();
          closeDeager(false);
        }}
        uploadOptions={{
          onDrop: handleDropFiles,
          multiple: false,
          maxSize: MAX_UPLOAD_DOCUMENT_SIZE,
          accept: acceptedFormats,
        }}
      >
        <div className="rounded-t-none p-4 text-center">
          <div className="mx-auto max-w-min rounded-md border p-2">
            <UploadCloud size={20} />
          </div>
          <p className="mt-2 text-sm text-gray-600">
            <span className="font-semibold">
              {/* Drag and drop a document here */}
              {isMobile ? "Select files to upload" : "Click OR Drag-n-Drop"}
            </span>
          </p>
          <p className="text-xs text-gray-500">
            to upload files Max size:{" "}
            {(MAX_UPLOAD_DOCUMENT_SIZE / (1024 * 1024)).toFixed()} MB
          </p>
          {/* <p className="text-xs text-gray-500">
          Supported file types: {formatTxt}
        </p> */}
          <div className="my-2 text-center text-xs text-slate-500">OR</div>
          <div className="mb-5 flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              className="border-primary text-primary bg-primary/5 hover:bg-primary/10 hover:text-primary w-full"
              onClick={(e) => {
                e.stopPropagation();
                setActionType("link");
                setSelectedDocument(document);
                setIsDocumentPoolOpen(true);
                closeDeager(false);
              }}
            >
              Link Document
            </Button>
          </div>
        </div>
      </Dragger>

      <MobileDocumentEditor
        isOpen={isMobileEditorOpen}
        setIsOpen={setIsMobileEditorOpen}
        file={mobileCropFile}
        onSave={handleMobileSave}
        title={document.doc_display_name}
      />
    </>
  );
};

const UploadingDocumentsCard = () => {
  const [progress, setProgress] = useState(0);

  // Simulate upload progress (or replace with real progress later)
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  // Dynamic message based on progress
  const getMessage = () => {
    if (progress === 0) return "Preparing upload...";
    if (progress < 100) return "Uploading document...";
    return "Finalizing upload...";
  };

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.div
      className="relative flex min-h-[230px] w-full flex-col items-center justify-center bg-gray-50"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Custom SVG Circular Progress */}
      <div className="relative mb-6 h-24 w-24">
        <svg className="h-full w-full" viewBox="0 0 100 100">
          {/* Background Circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="rgba(0, 0, 0, 0.1)"
            strokeWidth="8"
          />
          {/* Progress Circle */}
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="var(--primary)"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: strokeDashoffset }}
            transition={{ duration: 0.1, ease: "linear" }}
            style={{
              transform: "rotate(-90deg)",
              transformOrigin: "center",
            }}
          />
        </svg>

        {/* Upload Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <UploadCloud className="text-primary h-8 w-8" />
        </div>
      </div>

      {/* Dynamic Message Label */}
      <motion.div
        key={getMessage()} // Ensures animation triggers on message change
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.5 }}
        className="bg-primary absolute right-0 bottom-0 left-0 px-3 py-2 text-center font-medium text-white shadow-lg"
      >
        {getMessage()}
      </motion.div>
    </motion.div>
  );
};
