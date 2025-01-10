import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import PdfPage from "./Components/PdfPage";
import Loader from "./Components/Loader2";

const App: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [serverPdfFile, setServerPdfFile] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      if (file.type !== "application/pdf") {
        alert("valid only pdf!");
        return;
      }
      setPdfFile(file);
    }
  };

  useEffect(() => {
    if (!pdfFile) return;
    setIsUploading(true); 
    const formData = new FormData();
    formData.append("file", pdfFile);

    axios
      .post(`${import.meta.env.VITE_BACKEND}/uploadpdf`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        setServerPdfFile(res.data.filePath);
      })
      .catch((error) => {
        console.error("Error while uploading PDF", error);
      })
      .finally(() => {
        setIsUploading(false);
      });
  }, [pdfFile]);

  return (
    <>
      {isUploading ? (
        <div className="flex flex-col justify-center items-center min-h-screen">
        <Loader />
        <p className="text-white">Please Wait...</p>
      </div>
      
      ) : !serverPdfFile ? (
        <div className="flex flex-col items-center justify-center">
          <div className="space-y-4 mt-20 px-4 w-full max-w-md text-center">
            <h1 className="font-bold text-2xl sm:text-4xl text-red-500">
              Extract PDF Online
            </h1>
            <p className="text-white text-sm sm:text-lg mt-2">
              Extract the specific pages you need from your PDF instantly
            </p>
            <input
              id="fileupload"
              type="file"
              ref={fileInputRef}
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
              required
            />
            <button
              className="bg-red-600 hover:bg-red-700 text-white text-sm sm:text-base px-4 py-2 rounded mt-4"
              onClick={handleButtonClick}
            >
              Upload PDF
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          <PdfPage pdfPath={serverPdfFile} />
        </div>
      )}
    </>
  );
};

export default App;
