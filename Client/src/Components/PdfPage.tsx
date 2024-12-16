import React, { useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import SideBar from "./SideBar";
import { FaCircleCheck } from "react-icons/fa6";
import { GrView } from "react-icons/gr";
import { FaWindowClose } from "react-icons/fa";
import axios from "axios";

interface PdfPageProps{
  pdfPath:string
}

const PdfPage:React.FC<PdfPageProps> = ({ pdfPath }) => {
  const [images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedPdfLink,setGeneratedPdfLink] = useState<string|null>(null)
  const [totalPdfPage,setTotalPdfPage] = useState(0)
  const generatePdf = (selectedPages:string) => {
    axios.post(`${import.meta.env.VITE_BACKEND}/generatepdf`,{selectedPages,pdfPath})
    .then((res)=>{
      if(res.data){
        setGeneratedPdfLink(res.data.generatedDownloadLink)
      }
    })
  };

  const inputChange = (input:string) => {
    const numArr = input.split(',')
    setSelectedPages([])
    for(const str of numArr){
      if(str.includes('-')){
        const arr = str.split('-')
        for(let i=Number(arr[0]);i<=Number(arr[1]);i++){
          setSelectedPages(prevSelectedPages => [...prevSelectedPages, i])
        }
      }else{
        setSelectedPages(prevSelectedPages => [...prevSelectedPages,Number(str)])
      }
    }
  }

  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleImageSelection = (image: string,index:number) => {
    setSelectedImage(image);
    setSelectedPages((prev)=>prev.includes(index+1)?prev.filter((num)=> num!==index+1):[...prev,index+1])    
  };

  useEffect(() => {
    const loadPdf = async () => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

      const loadingTask = await pdfjsLib.getDocument(pdfPath);
      const pdfDoc = await loadingTask.promise;
      const numPages = pdfDoc.numPages;

      const pageImages = [];
      const pageWidthsArray = [];
      for (let i = 1; i <= numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const totalPages = pdfDoc.numPages  
        setTotalPdfPage(totalPages)      
        const viewport = page.getViewport({ scale: 1.5 });
        const width = viewport.width;
        pageWidthsArray.push(width);
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) {
          console.error("Failed to get 2D context");
          continue; 
        }
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        const renderTask = page.render(renderContext);

        await renderTask.promise;

        const imageDataUrl = canvas.toDataURL("image/png");
        pageImages.push(imageDataUrl);
      }
      setImages(pageImages);
    };

    loadPdf();
  }, [pdfPath]);

  return (
    <>
    <div className="flex flex-col sm:flex-row h-screen">
      {/* Image List Section */}
      <div className="w-full sm:w-3/4 md:w-1/3 overflow-y-auto p-4 flex gap-4 flex-wrap justify-center">
      <h1 className="text-xl md:text-2xl font-semibold text-white text-center">Select Pages</h1>
      <div className="flex gap-4 flex-wrap justify-center">
        {images.map((image, index) => (
          <div key={index} className="relative">
            <img
              onClick={() => handleImageSelection(image, index)}
              className={`w-24 h-32 cursor-pointer ${
                selectedPages.includes(index+1)
                  ? "border-4 border-green-500"
                  : "hover:border-4 hover:border-gray-500"
              }`}
              src={image}
              alt={`Page ${index + 1}`}
            />
            {selectedPages.includes(index+1) && (
              <FaCircleCheck
                color="green"
                className="absolute top-20 left-16 w-6 h-6"
              />
            )}
            <p className="flex justify-center text-white mt-1">{index + 1}</p>
          </div>
        ))}
        </div>
      </div>
  
      {/* Preview Section */}
      <>
      {/* Mobile Preview Trigger */}
      {selectedImage && (
        <div className="sm:hidden fixed bottom-4 left-4 right-4 z-50">
          <button
            onClick={() => setIsModalOpen(true)}
            className="
              w-1/3 
              bg-red-500 
              text-white 
              py-2
              rounded-lg 
              flex 
              items-center 
              justify-center 
              gap-2 
              hover:bg-red-600 
              transition-colors
            "
          >
           <GrView/>
            Preview
          </button>
        </div>
      )}

      {/* Desktop Preview */}
      <div className="hidden sm:flex sm:w-1/4 md:w-1/2 bg-gray-100 flex-col items-center">
        <h1 className="text-xl md:text-2xl font-semibold mt-4">Preview</h1>
        {selectedImage && (
          <div className="flex items-center justify-center mt-4 p-4">
            <img
              src={selectedImage}
              alt="image"
              className="max-h-[60vh] w-auto"
            />
          </div>
        )}
      </div>

      {/* Mobile Modal Preview */}
      {isModalOpen && selectedImage && (
        <div 
          className="
            fixed 
            inset-0 
            z-[100] 
            bg-black 
            bg-opacity-90 
            flex 
            flex-col 
            items-center 
            justify-center 
            p-4 
            sm:hidden
          "
        >
          <div className="absolute top-4 right-4">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="text-white hover:text-red-500 transition-colors"
            >
             <FaWindowClose className="text-red-500"/>
            </button>
          </div>

          <div className="w-full max-w-md flex items-center justify-center">
            <img
              src={selectedImage}
              alt="Full Preview"
              className="max-w-full max-h-[80vh] object-contain"
            />
          </div>
        </div>
      )}
    </>
  
      {/* Sidebar Section */}
       
          <SideBar
            onGeneratePDF={generatePdf}
            onPageSelect={selectedPages}
            downloadLink={generatedPdfLink}
            onInputChange={inputChange}
            totalPages={totalPdfPage}
          />
        </div>
  </>
  
  );
};

export default PdfPage;
