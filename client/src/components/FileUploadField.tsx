import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import styled from "styled-components";

interface FilePreview {
  file: File;
  previewUrl: string | null; // Base64 data URL for images
}

const FileUploadField: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<FilePreview[]>([]);
  const [fileRejectionMessage, setFileRejectionMessage] = useState<string>("");
  const maxFiles = 3; // Limit to 3 files
  const maxSize = 10485760; // 10MB

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      accept: {
        "image/png": [],
        "image/jpeg": [],
        "application/pdf": [],
        "text/plain": [],
        "application/msword": [],
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          [],
      },
      onDrop: (acceptedFiles, fileRejections) => {
        if (uploadedFiles.length + acceptedFiles.length > maxFiles) {
          setFileRejectionMessage(
            `You can only upload up to ${maxFiles} files.`
          );
        } else {
          const newPreviews = acceptedFiles.map((file) => ({
            file,
            previewUrl: file.type.startsWith("image/")
              ? URL.createObjectURL(file)
              : null,
          }));
          setUploadedFiles((current) => [...current, ...newPreviews]);
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

  const deleteFile = (
    fileName: string,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setUploadedFiles((currentFiles) =>
      currentFiles.filter((filePreview) => filePreview.file.name !== fileName)
    );
  };

  const truncateFileName = (name: string, maxLength: number = 30) => {
    if (name.length > maxLength) {
      return `${name.substring(0, maxLength - 3)}...`;
    }
    return name;
  };

  const uploadFile = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      // Example metadata
      const metadata = {
        uploadType: "JD",
        metadata: {
          title: "Job Description Upload",
          description: "Uploading job descriptions for processing",
        },
      };

      const formData = new FormData();

      // Add metadata as JSON string
      formData.append("metadata", JSON.stringify(metadata));

      // Add each file to the FormData
      uploadedFiles.forEach(({ file }) => {
        formData.append("files", file);
      });

      try {
        console.log("Uploading...");
        const response = await fetch("http://localhost:3000/upload/", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          console.log("Files uploaded successfully");
        } else {
          const errorData = await response.json();
          console.error("Upload failed", errorData);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    },
    [uploadedFiles]
  );

  return (
    <Dropzone
      {...getRootProps()}
      isDragActive={isDragActive}
      isDragReject={isDragReject}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <Message>Drop the files here...</Message>
      ) : (
        <>
          <Message>
            Drag 'n' drop some files here, or click to select files
          </Message>
          <Info>Accepted file types: .png, .jpeg, .pdf, .txt, .doc, .docx</Info>
          <Info>Maximum file size: 10MB.</Info>
        </>
      )}
      {fileRejectionMessage && <Error>{fileRejectionMessage}</Error>}
      <FileList>
        {uploadedFiles.map(({ file, previewUrl }, index) => (
          <FileItem key={index}>
            {previewUrl && <Preview src={previewUrl} alt={file.name} />}
            <FileName>
              {truncateFileName(file.name)} - {(file.size / 1024).toFixed(2)} KB
            </FileName>
            <DeleteButton onClick={(event) => deleteFile(file.name, event)}>
              Delete
            </DeleteButton>
          </FileItem>
        ))}
      </FileList>
      {uploadedFiles.length >= maxFiles ? (
        <Error>File limit reached.</Error>
      ) : (
        <AddMore>Add more files...</AddMore>
      )}
      <UploadButton disabled={uploadedFiles.length === 0} onClick={uploadFile}>
        Upload
      </UploadButton>
    </Dropzone>
  );
};

// Styled Components
const Dropzone = styled.div<{ isDragActive?: boolean; isDragReject?: boolean }>`
  border: ${(props) =>
    props.isDragActive ? "2px solid green" : "2px dashed #ccc"};
  padding: 20px;
  text-align: center;
  background-color: ${(props) =>
    props.isDragReject ? "#ffe6e6" : props.isDragActive ? "#e6ffe6" : "#fff"};
`;

const Message = styled.p`
  font-size: 14px;
  color: #333;
`;

const Info = styled.p`
  font-size: 12px;
  color: #666;
`;

const Error = styled.p`
  font-size: 14px;
  color: red;
`;

const FileList = styled.ul`
  padding-left: 0;
  margin-top: 10px;
`;

const FileItem = styled.li`
  background: #f4f4f4;
  padding: 5px 8px;
  margin-bottom: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FileName = styled.span`
  flex: 1;
`;

const Preview = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: red;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const AddMore = styled.div`
  padding: 10px;
  border: 2px dashed #ccc;
  color: #ccc;
  text-align: center;
  cursor: pointer;
`;

const UploadButton = styled.button`
  background: #007bff;
  color: #fff;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
  margin-top: 10px;

  &:disabled {
    background: #ddd;
    cursor: not-allowed;
  }
`;

export default FileUploadField;
