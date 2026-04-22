import React from "react";

const PdfViewer = ({ pdfUrl }: { pdfUrl: string }) => {
    const modifiedPdfUrl = `${pdfUrl}#toolbar=0`;
    return (
        <iframe
            src={modifiedPdfUrl}
            width="100%"
            height="100%"
            style={{ border: "none" }}
            title="PDF Viewer"
        ></iframe>
    );
};


export default PdfViewer

