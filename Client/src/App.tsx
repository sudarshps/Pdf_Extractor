import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import PdfPage from "./Components/PdfPage";
import Loader from "./Components/Loader2";
import Swal from 'sweetalert2'
import { BsFillLightningChargeFill } from "react-icons/bs";
import { GrSecure } from "react-icons/gr";
import { FaHandshakeSimple } from "react-icons/fa6";
import { Card } from './Components/ui/card';

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
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Please upload pdf format file!",
        });
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
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-red-500 mb-4">
            PDF Page Extractor
          </h1>
          <p className="text-gray-300 text-lg">
            Extract specific pages from your PDF documents in seconds
          </p>
        </div>

        <Card className="bg-white/10 backdrop-blur-lg border-2 border-white/20 p-8">
          <div className="text-center space-y-6">
            <div className="p-8 hover:border-red-400 transition-colors">       
              <input
              id="fileupload"
              type="file"
              ref={fileInputRef}
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
              required
            />
              <button onClick={handleButtonClick} className="border-2 border-dashed border-gray-400 rounded-lg bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
               Upload File
              </button>
              <p className="text-gray-400 text-sm mt-1">Choose PDF file to extract</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center p-4">
                <BsFillLightningChargeFill className="w-8 h-8 mx-auto mb-2 text-red-400" />
                <h3 className="text-white font-medium mb-1">Fast Processing</h3>
                <p className="text-gray-400 text-sm">Extract pages instantly</p>
              </div>
              <div className="text-center p-4">
                <GrSecure className="w-8 h-8 mx-auto mb-2 text-red-400" />
                <h3 className="text-white font-medium mb-1">Secure</h3>
                <p className="text-gray-400 text-sm">Your files are protected</p>
              </div>
              <div className="text-center p-4">
                <FaHandshakeSimple className="w-8 h-8 mx-auto mb-2 text-red-400" />
                <h3 className="text-white font-medium mb-1">Easy to Use</h3>
                <p className="text-gray-400 text-sm">Simple interface</p>
              </div>
            </div>
          </div>
        </Card>
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
