import { useMutation, useQuery } from "@tanstack/react-query";
import { Content, Editor } from "@tiptap/react";
import { ACCEPTED_FILE_MIME_TYPES } from "@workspace/common-ui/constants";
import { orpc } from "@workspace/orpc/lib/orpc";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  AlertCircle,
  Copy,
  File,
  LoaderCircle,
  SquareCheckBig,
  Upload,
  User,
} from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
// import {
//   getUserProfileDetails,
//   uploadDocument,
// } from "../actions/track-application";
import useCopyToClipboard from "../hooks/use-copy-to-clipboard";
import { formatDate, getCookie } from "@workspace/common-ui/lib/utils";
import Dragger from "./dragger";
import { MinimalTiptapEditor } from "./ui/minimal-tiptap";
import { MAX_UPLOAD_DOCUMENT_SIZE } from "@workspace/common/constants";

interface NotesDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  applicationId?: string;
  ref_code: string;
}

interface CommentInput {
  readonly noteId: string;
  readonly comment: string;
}

const NotesDialog = ({
  open,
  onOpenChange,
  applicationId,
  ref_code,
}: NotesDialogProps) => {
  const editorRef = useRef<Editor | null>(null);

  const [value, setValue] = useState<Content>("");
  const [commentInput, setCommentInput] = useState<CommentInput>({
    noteId: "",
    comment: "",
  });
  const [selectedDocument, setSelectedDocument] = useState<{
    file: string;
    original_file_name: string;
    mime_type: string;
  } | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{
      file: string;
      file_thumbnail?: string;
      original_file_name: string;
      mime_type: string;
    }>
  >([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { isCopied, copyToClipboard } = useCopyToClipboard();

  const host = getCookie("host");
  const user_id = getCookie("user_id");

  const { data: notes, refetch: refetchNotes } = useQuery(
    orpc.visa.getNotesForApplication.queryOptions({
      input: {
        applicationId: applicationId || "",
      },
    }),
  );

  console.log("notes", ref_code);

  const { data: userProfileData } = useQuery(
    orpc.visa.getUserProfileDetails.queryOptions({
      input: {
        user_id: user_id!,
      },
    }),
  );

  const userData = userProfileData?.data;
  const userName = [userData?.first_name, userData?.last_name]
    .filter(Boolean)
    .join(" ");

  const uploadFilesMutation = useMutation(
    orpc.visa.uploadDocument.mutationOptions({
      onSuccess: (response: any) => {
        // console.log("uploadFilesMutation", response);
        const doc = response.data; // Adjust if necessary
        if (
          doc &&
          typeof doc.file === "string" &&
          typeof doc.original_file_name === "string" &&
          typeof doc.mime_type === "string"
        ) {
          setUploadedFiles((prev) => [...prev, doc]);
        }
        setUploadError(null);
        refetchNotes();
      },
      onError: (error: any) => {
        console.error("Error uploading files:", error);
        setUploadError("Failed to upload files. Please try again.");
      },
    }),
  );

  const addCommentOnNote = useMutation(
    orpc.visa.addCommentOnNote.mutationOptions({
      onSuccess: () => {
        console.log("Comment added successfully");
        refetchNotes();
      },
      onError: (error: any) => {
        console.error("Error adding comment:", error);
        setUploadError("Failed to add comment. Please try again.");
      },
    }),
  );

  const addNewNotesForApplication = useMutation(
    orpc.visa.addNotesForApplication.mutationOptions({
      onSuccess: (data: any) => {
        console.log("Note added successfully", data);
        refetchNotes();
        setUploadedFiles([]);
        setValue("");
        editorRef.current?.commands.setContent("");
        setUploadError(null);
      },
      onError: (error: any) => {
        console.error("Error adding note:", error);
        setUploadError("Failed to add note. Please try again.");
      },
    }),
  );

  const handleAddNewNotesForApplication = () => {
    if (!value && uploadedFiles.length === 0) {
      toast.error("Please add some notes or upload files before submitting.");
      return;
    }
    const noteData = {
      application_id: applicationId!,
      notes_html: value as string,
      note_user: {
        user_id: user_id,
        name: userName,
        profile_pic: userData?.profile_url || "",
        user_type: userData?.user_type || "Applicant",
      },
      host: host,
      documents: uploadedFiles,
    };
    addNewNotesForApplication.mutate(noteData);
  };

  const handleCommentSubmit = (noteId: string) => {
    const commentData = {
      application_id: applicationId!,
      note_id: noteId,
      comment: commentInput.comment,
      user_id: user_id,
      user: {
        user_id: userData?._id!,
        name: userName,
        profile_pic: userData?.profile_url || "",
        user_type: userData?.user_type || "Applicant",
      },
      host: host,
    };
    addCommentOnNote.mutate(commentData);
    setCommentInput({ noteId: "", comment: "" });
  };

  const handleUploadFiles = (files: File[]) => {
    if (!files.length) {
      return;
    }

    setUploadError(null);
    files.forEach((file) => {
      uploadFilesMutation.mutate({ documents: file });
    });
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;

    if (uploadError) {
      timeout = setTimeout(() => {
        setUploadError(null);
      }, 3000);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [uploadError]);

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCloseDocumentViewer = () => {
    setSelectedDocument(null);
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="gap-0 rounded-xl bg-white shadow-2xl transition-all duration-300 sm:max-w-[650px]">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Application Notes
            </DialogTitle>
            {/* <div className="m-0 text-xl font-semibold text-gray-900">
              Application Notes
            </div> */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{ref_code}</span>

              <button
                onClick={() => copyToClipboard(ref_code || "-")}
                className="text-gray-500 transition-colors hover:text-blue-600"
                title="Copy Reference Number"
              >
                {isCopied ? (
                  <SquareCheckBig className="h-5 w-5 text-green-500" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </button>
            </div>
            <DialogDescription className="text-sm">
              Add notes, upload files, and collaborate with comments.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[65vh] overflow-y-auto pr-2">
            {/* Error Message */}
            {uploadError && (
              <div className="mb-4 flex items-center rounded-md border border-red-200 bg-red-50 p-3">
                <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
                <span className="text-sm text-red-600">{uploadError}</span>
              </div>
            )}
            {/* Notes Editor and File Upload */}
            <div className="mb-6 flex flex-col gap-4">
              <div className="relative rounded-lg border border-gray-200 bg-white shadow-sm">
                <MinimalTiptapEditor
                  value={value ?? ""}
                  onChange={setValue}
                  className="w-full"
                  editorContentClassName="p-4 text-gray-800"
                  output="html"
                  placeholder="Type your note here..."
                  autofocus={true}
                  editable={true}
                  editorClassName="focus:outline-none min-h-[100px]"
                  onEditorReady={(editor) => (editorRef.current = editor)}
                />
              </div>
              {/* File Upload Area */}
              <Dragger
                className="w-full rounded-lg transition-all duration-20"
                uploadOptions={{
                  accept: ACCEPTED_FILE_MIME_TYPES,
                  multiple: true,
                  maxSize: MAX_UPLOAD_DOCUMENT_SIZE,
                  disabled: uploadFilesMutation.isPending,
                  onDrop: handleUploadFiles,
                }}
              >
                <div className="flex items-center justify-center gap-4 p-4 text-center">
                  {uploadFilesMutation.isPending ? (
                    <LoaderCircle className="h-6 w-6 animate-spin text-gray-500" />
                  ) : (
                    <Upload className="h-6 w-6 text-gray-500" />
                  )}
                  <span className="text-sm font-medium text-gray-600">
                    {uploadFilesMutation.isPending
                      ? "Uploading..."
                      : uploadedFiles.length > 0
                        ? `${uploadedFiles.length} file(s) uploaded`
                        : `Upload files (PNG, JPEG, PDF), Max size: ${(MAX_UPLOAD_DOCUMENT_SIZE / (1024 * 1024)).toFixed()}MB`}
                  </span>
                </div>
              </Dragger>
              {/* {uploadedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {uploadedFiles.map((file, index) => (
                    <button
                      key={`${file.file}-${index}`}
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50"
                    >
                      {file.original_file_name}
                    </button>
                  ))}
                </div>
              )} */}
              <div className="flex justify-end">
                <Button
                  onClick={handleAddNewNotesForApplication}
                  disabled={!value && uploadedFiles.length === 0}
                >
                  Add Note
                </Button>
              </div>
            </div>
            {/* Notes and Comments Display */}
            {notes?.status === "success" && notes?.data?.length > 0 ? (
              <div className="space-y-6">
                {notes.data?.map((note) => (
                  <div
                    key={note._id}
                    className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md"
                  >
                    {/* Note Content */}
                    <div className="flex items-start space-x-4">
                      <CommentAvatar
                        profilePic={note?.note_user?.profile_pic}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {note.note_user.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(note.created_on)}
                            </p>
                          </div>
                          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-500 capitalize">
                            {note.note_user?.user_type?.split("_")?.join(" ")}
                          </span>
                        </div>
                        <div
                          className="prose prose-sm mt-2 text-sm text-gray-800"
                          dangerouslySetInnerHTML={{ __html: note.notes_html }}
                        />
                        {/* Documents */}
                        {note?.documents?.length > 0 && (
                          <div className="mt-3">
                            <p className="mb-2 text-xs font-semibold text-gray-600">
                              Attached Documents:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {note?.documents?.map(
                                (doc: any, index: number) => (
                                  <button
                                    key={index}
                                    onClick={() =>
                                      setSelectedDocument({
                                        file: doc?.file,
                                        original_file_name:
                                          doc?.original_file_name,
                                        mime_type: doc?.mime_type,
                                      })
                                    }
                                    className="flex items-center rounded-md bg-gray-100 p-2 text-xs text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-200"
                                  >
                                    {doc?.mime_type !== "pdf" ? (
                                      <img
                                        className="mr-2 h-6 w-6 rounded object-cover"
                                        src={doc?.file_thumbnail}
                                        alt={doc?.original_file_name}
                                      />
                                    ) : (
                                      <File className="mr-2 h-5 w-5 text-gray-500" />
                                    )}
                                    <span className="max-w-[120px] truncate">
                                      {doc?.original_file_name}
                                    </span>
                                  </button>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Comments Section */}
                    {note.comments.length > 0 && (
                      <div className="mt-4 ml-12 space-y-3">
                        {note?.comments.map((comment: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-start space-x-3"
                          >
                            <CommentAvatar
                              profilePic={comment?.user?.profile_pic}
                            />
                            <div className="flex-1 rounded-lg bg-gray-50 p-3">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold text-gray-900">
                                  {comment?.user?.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatDate(comment?.created_on)}
                                </p>
                              </div>
                              <p className="mt-1 text-sm text-gray-800">
                                {comment?.comment}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Comment Input */}
                    <div className="mt-4 ml-12 flex items-start space-x-3">
                      <CommentAvatar profilePic={userData?.profile_url} />
                      <div className="flex-1">
                        <textarea
                          value={
                            commentInput?.noteId === note._id
                              ? commentInput?.comment
                              : ""
                          }
                          onChange={(e) =>
                            setCommentInput({
                              noteId: note._id,
                              comment: e.target.value,
                            })
                          }
                          placeholder="Write a comment..."
                          className="w-full resize-none rounded-lg border border-gray-200 p-3 text-sm text-gray-800 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          rows={2}
                        />
                        <div className="mt-2 flex justify-end">
                          <Button
                            onClick={() => handleCommentSubmit(note._id)}
                            disabled={
                              commentInput?.noteId !== note._id ||
                              !commentInput?.comment.trim()
                            }
                          >
                            Post Comment
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-gray-500">
                No notes available. Start by adding one above.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <Dialog
          open={!!selectedDocument}
          onOpenChange={handleCloseDocumentViewer}
        >
          <DialogContent className="max-h-[90vh] rounded-xl bg-white shadow-2xl sm:max-w-[80vw]">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-lg font-semibold text-gray-900">
                {selectedDocument.original_file_name}
              </DialogTitle>
              <DialogDescription className="flex items-center text-sm text-gray-600">
                Viewing document.{" "}
                <a
                  href={selectedDocument.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 flex items-center text-blue-600 hover:underline"
                >
                  <File className="mr-1 h-4 w-4" />
                  {selectedDocument.mime_type === "application/pdf"
                    ? "Open in new tab"
                    : "Download"}
                </a>
              </DialogDescription>
            </DialogHeader>
            <div className="flex max-h-[60vh] min-h-[60vh] items-center justify-center overflow-auto rounded-lg bg-gray-50">
              {selectedDocument.mime_type === "pdf" ? (
                <iframe
                  src={`${selectedDocument.file}#toolbar=0&scrollbar=0`}
                  title={selectedDocument.original_file_name}
                  className="h-full w-full"
                />
              ) : (
                <img
                  src={selectedDocument.file}
                  alt={selectedDocument.original_file_name}
                  className="max-h-[60vh] max-w-full object-contain"
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

const CommentAvatar = ({ profilePic }: { profilePic?: string }) => {
  const [imgError, setImgError] = useState(false);
  if (imgError || !profilePic) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
        <User className="h-5 w-5 text-gray-500" />
      </div>
    );
  }
  return (
    <img
      src={profilePic}
      alt="User avatar"
      className="h-8 w-8 rounded-full object-cover"
      onError={() => setImgError(true)}
    />
  );
};

export default memo(NotesDialog);
