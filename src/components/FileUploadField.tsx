import React, { useState, useMemo, CSSProperties } from "react";
import { useDropzone } from "react-dropzone";

const FileUploadField: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [fileRejectionMessage, setFileRejectionMessage] = useState<string>("");
  const maxFiles = 3; // Limit to 3 files
  const maxSize = 10485760; // 10MB

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
  } = useDropzone({
    accept: {
      "image/png": [],
      "image/jpeg": [],
      "application/pdf": [],
      "text/plain": [],
    },
    onDrop: (acceptedFiles, fileRejections) => {
      if (uploadedFiles.length + acceptedFiles.length > maxFiles) {
        setFileRejectionMessage(`You can only upload up to ${maxFiles} files.`);
      } else {
        setUploadedFiles((current) => [...current, ...acceptedFiles]);
        setFileRejectionMessage("");
      }

      if (fileRejections.length > 0) {
        setFileRejectionMessage("Some files were rejected.");
      }
    },
    onDropRejected: () => {
      setFileRejectionMessage("File type not accepted or file too large.");
    },
    maxSize,
    maxFiles,
  });

  const deleteFile = (fileName: string) => {
    setUploadedFiles((currentFiles) =>
      currentFiles.filter((file) => file.name !== fileName)
    );
  };

  const truncateFileName = (name: string, maxLength: number = 30) => {
    if (name.length > maxLength) {
      return `${name.substring(0, maxLength - 3)}...`;
    }
    return name;
  };

  const dropzoneStyle: CSSProperties = useMemo(
    () => ({
      border: isDragActive ? "2px solid green" : "2px dashed #cccccc",
      padding: "20px",
      textAlign: "center",
      backgroundColor: isDragReject ? "#ffdddd" : isDragActive ? "#ddffdd" : "#ffffff",
    }),
    [isDragActive, isDragReject]
  );

  return (
    <div {...getRootProps({ style: dropzoneStyle })}>
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the files here...</p>
      ) : (
        <>
          <p>Drag 'n' drop some files here, or click to select files</p>
          <p>Accepted file types: .png, .jpeg, .pdf, .txt.</p>
          <p>Maximum file size: 10MB.</p>
        </>
      )}
      {fileRejectionMessage && <p style={{ color: "red" }}>{fileRejectionMessage}</p>}
      <ul>
        {uploadedFiles.map((file, index) => (
          <li
            key={index}
            style={{
              background: "lightGrey",
              padding: "5px 8px",
              marginBottom: "5px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              border: '5px',
              gap: '10px'
            }}
          >
            {truncateFileName(file.name)} - {(file.size / 1024).toFixed(2)} KB
            <button onClick={() => deleteFile(file.name)}>Delete</button>
          </li>
        ))}
      </ul>
      {uploadedFiles.length >= maxFiles && <p style={{ color: "red" }}>File limit reached.</p>}
    </div>
  );
};

export default FileUploadField;
