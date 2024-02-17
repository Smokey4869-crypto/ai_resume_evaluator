import React, { useState, useMemo, CSSProperties } from "react";
import { useDropzone } from "react-dropzone";

const FileUploadField: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [fileRejectionMessage, setFileRejectionMessage] = useState<string>("");
  const maxSize = 10485760; // 10MB

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    fileRejections,
  } = useDropzone({
    accept: {
      "image/png": [],
      "image/jpeg": [],
      "application/pdf": [],
      "text/plain": [],
    },
    onDrop: (acceptedFiles, fileRejections) => {
      setUploadedFiles((current) => [...current, ...acceptedFiles]);
      if (fileRejections.length > 0) {
        setFileRejectionMessage("Some files were rejected.");
      }
    },
    onDropRejected: () => {
      setFileRejectionMessage("File type not accepted or file too large.");
    },
    maxSize,
  });

  const deleteFile = (fileName: string) => {
    setUploadedFiles((currentFiles) =>
      currentFiles.filter((file) => file.name !== fileName)
    );
  };

  const acceptedFileTypesMessage = "Accepted file types: .png, .pdf, .txt.";
  const maxFileSizeMessage = `Maximum file size: ${maxSize / 1048576} MB.`;

  const dropzoneStyle = useMemo<CSSProperties>(
    () => ({
      border: "2px dashed #cccccc",
      padding: "20px",
      textAlign: "center",
      ...(isDragActive ? { backgroundColor: "#e2e2e2" } : {}),
    }),
    [isDragActive]
  );

  return (
    <div {...getRootProps()} style={dropzoneStyle}>
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the files here ...</p>
      ) : (
        <>
          <p>Drag 'n' drop some files here, or click to select files</p>
          <p>{acceptedFileTypesMessage}</p>
          <p>{maxFileSizeMessage}</p>
        </>
      )}
      {isDragReject && <p style={{ color: "red" }}>{fileRejectionMessage}</p>}
      <ul style={{ listStyle: 'none'}}>
        {uploadedFiles.map((file, index) => (
          <li key={index} style={{ background: 'lightGrey', padding: '5px 8px'}}>
            {file.name} - {file.size} bytes &nbsp; 
            <button type="button" onClick={() => deleteFile(file.name)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileUploadField;
