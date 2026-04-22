// "use client";

// import { useState, useCallback } from "react";
// import { Document, Page, pdfjs } from "@mikecousins/react-pdf";

// import "react-pdf/dist/Page/TextLayer.css";
// import "react-pdf/dist/Page/AnnotationLayer.css";

// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   "pdfjs-dist/build/pdf.worker.min.js",
//   import.meta.url,
// ).toString();
// interface PDFViewerProps {
//   file: string;
//   width?: number; // optional width
// }

// const PDFViewerClient = ({ file, width = 800 }: PDFViewerProps) => {
//   const [numPages, setNumPages] = useState<number | null>(null);
//   const [pageNumber, setPageNumber] = useState(1);

//   const onDocumentLoadSuccess = useCallback(
//     ({ numPages }: { numPages: number }) => {
//       setNumPages(numPages);
//       setPageNumber(1); // reset to first page on new file load
//     },
//     [],
//   );

//   const goToPrevPage = useCallback(() => {
//     setPageNumber((prev) => (prev - 1 < 1 ? 1 : prev - 1));
//   }, []);

//   const goToNextPage = useCallback(() => {
//     setPageNumber((prev) =>
//       numPages && prev + 1 > numPages ? numPages : prev + 1,
//     );
//   }, [numPages]);

//   return (
//     <div style={{ padding: "2rem" }}>
//       {/* Navigation */}
//       <nav
//         style={{
//           marginBottom: "1rem",
//           display: "flex",
//           gap: "1rem",
//           alignItems: "center",
//         }}
//       >
//         <button
//           onClick={goToPrevPage}
//           disabled={pageNumber <= 1}
//           style={{
//             padding: "0.5rem 1rem",
//             backgroundColor: pageNumber <= 1 ? "#ccc" : "#007bff",
//             color: "white",
//             border: "none",
//             borderRadius: "4px",
//             cursor: pageNumber <= 1 ? "not-allowed" : "pointer",
//           }}
//         >
//           Prev
//         </button>
//         <button
//           onClick={goToNextPage}
//           disabled={numPages ? pageNumber >= numPages : true}
//           style={{
//             padding: "0.5rem 1rem",
//             backgroundColor:
//               numPages && pageNumber >= numPages ? "#ccc" : "#007bff",
//             color: "white",
//             border: "none",
//             borderRadius: "4px",
//             cursor:
//               numPages && pageNumber >= numPages ? "not-allowed" : "pointer",
//           }}
//         >
//           Next
//         </button>
//         <p style={{ margin: 0, fontWeight: "bold", color: "#333" }}>
//           Page {pageNumber} of {numPages || "..."}
//         </p>
//       </nav>

//       {/* PDF Viewer */}
//       <div
//         style={{
//           border: "1px solid #ccc",
//           borderRadius: "4px",
//           overflow: "hidden",
//           display: "flex",
//           justifyContent: "center",
//         }}
//       >
//         <Document
//           file={file}
//           onLoadSuccess={onDocumentLoadSuccess}
//           loading={
//             <div style={{ padding: "2rem", textAlign: "center" }}>
//               Loading PDF...
//             </div>
//           }
//           error={
//             <div style={{ padding: "2rem", textAlign: "center", color: "red" }}>
//               Failed to load PDF. Please make sure the file exists in the public
//               folder.
//             </div>
//           }
//         >
//           <Page
//             pageNumber={pageNumber}
//             renderTextLayer
//             renderAnnotationLayer
//             width={width}
//           />
//         </Document>
//       </div>
//     </div>
//   );
// };

// export default PDFViewerClient;
