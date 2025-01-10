import React, { useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import SideBar from "./SideBar";
import { FaCircleCheck } from "react-icons/fa6";
import { GrView } from "react-icons/gr";
import {
  FaWindowClose,
  FaChevronCircleRight,
  FaChevronCircleLeft,
} from "react-icons/fa";
import axios from "axios";
import Loader from "./Loader";
import placeholderImage from "../assets/233-2332677_image-500580-placeholder-transparent.png";

interface PdfPageProps {
  pdfPath: string;
}

const PdfPage: React.FC<PdfPageProps> = ({ pdfPath }) => {
  const [images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string[]>([]);
  const [generatedPdfLink, setGeneratedPdfLink] = useState<string | null>(null);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<number>(0);
  const [totalPdfPage, setTotalPdfPage] = useState(0);
  const generatePdf = (selectedPages: string) => {
    axios
      .post(`${import.meta.env.VITE_BACKEND}/generatepdf`, {
        selectedPages,
        pdfPath,
      })
      .then((res) => {
        if (res.data) {
          setGeneratedPdfLink(res.data.generatedDownloadLink);
        }
      });
  };

  const inputChange = (input: string) => {
    const numArr = input.split(",");
    setSelectedPages([]);
    const newSelectedImages: string[] = [];
    for (const str of numArr) {
      if (str.includes("-")) {
        const arr = str.split("-");
        for (let i = Number(arr[0]); i <= Number(arr[1]); i++) {
          setSelectedPages((prevSelectedPages) => [...prevSelectedPages, i]);
          newSelectedImages.push(images[i - 1]);
        }
      } else {
        setSelectedPages((prevSelectedPages) => [
          ...prevSelectedPages,
          Number(str),
        ]);
        newSelectedImages.push(images[Number(str) - 1]);
      }
    }
    setSelectedImage(newSelectedImages);
  };

  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleImageSelection = (image: string, index: number) => {
    setSelectedImage((prev) => {
      if (prev?.includes(image)) {
        if (selectedPreviewImage > 0) {
          setSelectedPreviewImage((prev) => prev - 1);
        }
        return prev.filter((img) => img !== image);
      } else {
        return [...(prev || []), image];
      }
    });

    setSelectedPages((prev) =>
      prev.includes(index + 1)
        ? prev.filter((num) => num !== index + 1)
        : [...prev, index + 1]
    );
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
        const totalPages = pdfDoc.numPages;
        setTotalPdfPage(totalPages);
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
        <div className="w-full sm:w-3/4 md:w-1/3 overflow-y-auto p-4 flex gap-4 flex-wrap justify-center">
          {images && images.length ? (
            <div className="flex flex-col gap-4 items-center">
            <h1 className="text-xl md:text-2xl font-semibold text-white text-center">
              Select Pages
            </h1>
            <div className="flex gap-4 flex-wrap justify-center">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="relative cursor-pointer"
                  onClick={() => handleImageSelection(image, index)}
                >
                  <img
                    className={`w-24 h-32 ${
                      selectedPages.includes(index + 1)
                        ? "border-4 border-green-500"
                        : "hover:border-4 hover:border-gray-500"
                    }`}
                    src={image}
                    alt={`Page ${index + 1}`}
                  />
                  {selectedPages.includes(index + 1) && (
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
          
          ) : (
            <div className="flex flex-col items-center justify-center min-h-screen h-full p-10 ">
              <Loader />
              <h1 className="text-lg text-white mt-5">Loading Pages...</h1>
            </div>
          )}
        </div>

        <>
          {selectedImage && images && images.length && (
            <div className="sm:hidden fixed bottom-4 left-4 right-4 z-50">
              <button
                onClick={() => setIsModalOpen(true)}
                className="
              w-1/3 
              bg-red-500 
              text-white 
              py-4
              rounded-lg 
              flex 
              items-center 
              justify-center 
              gap-2 
              hover:bg-red-600 
              transition-colors
            "
              >
                <GrView className="text-xl" />
                Preview
              </button>
            </div>
          )}

          <div className="hidden sm:flex sm:w-1/4 md:w-1/2 bg-gray-100 flex-col items-center">
            <h1 className="text-xl md:text-2xl font-semibold mt-4">Preview</h1>
            {selectedImage && (
              <div className="flex items-center space-x-5 justify-center mt-4 p-4">
                <div className="w-8 flex justify-center">
                  {selectedPreviewImage > 0 && (
                    <FaChevronCircleLeft
                      className="hover:cursor-pointer"
                      size={30}
                      onClick={() =>
                        setSelectedPreviewImage((prev) => prev - 1)
                      }
                    />
                  )}
                </div>

                <div className="flex justify-center items-center">
                  <img
                    src={
                      selectedImage.length
                        ? selectedImage[selectedPreviewImage]
                        : placeholderImage
                    }
                    alt="image"
                    className={
                      !selectedImage.length
                        ? "w-64 mt-40"
                        : "max-h-[60vh] w-auto"
                    }
                  />
                </div>

                <div className="w-8 flex justify-center">
                  {selectedImage.length > 1 &&
                    selectedPreviewImage + 1 < selectedImage.length && (
                      <FaChevronCircleRight
                        className="hover:cursor-pointer"
                        size={30}
                        onClick={() =>
                          setSelectedPreviewImage((prev) => prev + 1)
                        }
                      />
                    )}
                </div>
              </div>
            )}
          </div>

          {isModalOpen && selectedImage && (
            <div
              className="
      fixed 
      inset-0 
      z-[100] 
      bg-black 
      bg-opacity-90 
      flex 
      items-center 
      justify-center 
      p-4 
      sm:hidden
    "
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="
        absolute 
        top-4 
        right-4 
        text-white 
        hover:text-red-500 
        transition-colors 
        z-[110]
      "
              >
                <FaWindowClose className="text-red-500" size={30} />
              </button>

              <div className="relative w-full max-w-md flex items-center justify-center">
                {selectedPreviewImage > 0 && (
                  <FaChevronCircleLeft
                    className="absolute left-4 hover:cursor-pointer z-[110] text-black"
                    size={30}
                    onClick={() => setSelectedPreviewImage((prev) => prev - 1)}
                  />
                )}

                <img
                  src={
                    selectedImage.length
                      ? selectedImage[selectedPreviewImage]
                      : placeholderImage
                  }
                  alt="Full Preview"
                  className={
                    !selectedImage.length
                      ? "w-32"
                      : "max-w-full max-h-[80vh] object-contain"
                  }
                />

                {selectedImage.length > 1 &&
                  selectedPreviewImage + 1 < selectedImage.length && (
                    <FaChevronCircleRight
                      className="absolute right-4 hover:cursor-pointer z-[110] text-black"
                      size={30}
                      onClick={() =>
                        setSelectedPreviewImage((prev) => prev + 1)
                      }
                    />
                  )}
              </div>
            </div>
          )}
        </>
        <SideBar
          onGeneratePDF={generatePdf}
          onPageSelect={selectedPages}
          downloadLink={generatedPdfLink}
          onInputChange={inputChange}
          totalPages={totalPdfPage}
          isImagesLoaded={images && images.length ?true:false}
        />
      </div>
    </>
  );
};

export default PdfPage;
