import React, { useState, useMemo, CSSProperties, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { terminal } from "virtual:terminal";

interface FilePreview {
  file: File;
  previewUrl: string | null; // Base64 data URL for images
}

const FileUploadField: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<FilePreview[]>([]);
  const [fileRejectionMessage, setFileRejectionMessage] = useState<string>("");
  const maxFiles = 3; // Limit to 3 files
  const maxSize = 10485760; // 10MB

  const testPrompt = `User: Welcome to KrisFlyer, Mr Minh Nguyen KrisFly membership number 886 517 6437 You can proceed to verify your status as a student to book exclusive fares and enjoy additional privileges. You can access your digital membership card by downloading SINGAPORE AIRLINES KRISFLYER the SingaporeAir mobile app. Alternatively, a printable version is available when you log in to your KrisFlyer account, under STAR ALLIANCE the "Profile" tab. To start earning KrisFlyer miles, please quote your KrisFlyer Minh Nguyen membership number when you make a booking with 886 517 6437 Singapore Airlines, or our airline and nonairline partners. MEMBER SINCE Dec 2021 VERIFY STUDENT STATUS By using the website, you are agreeing to our Privacy Policy, Terms  Conditions and the use of cookies in accordance with our Cookie Policy. ACCEPT 5270803.fls.doubleclick.net..
Bot:`;

  // Prepare the payload following Titan's schema
  const payload = {
    inputText: testPrompt, // Wrap the inputText per Titan's conversational format
    textGenerationConfig: {
      maxTokenCount: 512,
      temperature: 0.7,
      topP: 0.9,
      stopSequences: ["\n"], // Optional stop sequence
    },
  };

  console.log(JSON.stringify(payload));

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
              ? URL.createObjectURL(file) // Generate object URL for images
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

  const dropzoneStyle: CSSProperties = useMemo(
    () => ({
      border: isDragActive ? "2px solid green" : "2px dashed #4a4747cc",
      padding: "20px",
      textAlign: "center",
      backgroundColor: isDragReject
        ? "#ffdddd"
        : isDragActive
        ? "#ddffdd"
        : "#ffffff",
    }),
    [isDragActive, isDragReject]
  );

  const uploadFile = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const formData = new FormData();
      uploadedFiles.forEach(({ file }) => {
        formData.append("files", file);
      });

      try {
        terminal.log("Hello1");
        const response = await fetch("http://localhost:3000/upload/", {
          method: "POST",
          body: formData,
        });

        terminal.log("Hello");

        const data = await response.json(); // Parse the JSON body
        terminal.log("Upload successful:", data); // Log the full response

        if (response.ok) {
          console.log("File uploaded successfully");
        } else {
          console.error("Upload failed");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    },
    [uploadedFiles]
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
      {fileRejectionMessage && (
        <p style={{ color: "red" }}>{fileRejectionMessage}</p>
      )}
      <ul
        style={{
          paddingLeft: "0",
        }}
      >
        {uploadedFiles.map(({ file, previewUrl }, index) => (
          <li
            key={index}
            style={{
              background: "lightGrey",
              padding: "5px 8px",
              marginBottom: "5px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              border: "5px",
              gap: "10px",
            }}
          >
            {previewUrl && (
              <img
                src={previewUrl}
                alt={file.name}
                style={{ width: "50px", height: "50px", objectFit: "cover" }}
              />
            )}
            {truncateFileName(file.name)} - {(file.size / 1024).toFixed(2)} KB
            <button onClick={(event) => deleteFile(file.name, event)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
      {uploadedFiles.length >= maxFiles ? (
        <p style={{ color: "red" }}>File limit reached.</p>
      ) : (
        <div
          style={{
            padding: "5px",
            border: "2px dashed #cccccc",
            color: "#cccccc",
            marginBottom: "10px",
            cursor: "pointer",
          }}
        >
          <span>Add more files...</span>
        </div>
      )}
      <button
        style={{
          background: "lightGray",
        }}
        disabled={uploadedFiles.length == 0}
        onClick={uploadFile}
      >
        Upload
      </button>
    </div>
  );
};

export default FileUploadField;
