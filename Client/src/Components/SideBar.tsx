import React, { useEffect, useState, useCallback } from "react";
import { RiFileSettingsLine } from "react-icons/ri"
import { FaWindowClose } from "react-icons/fa";
import { saveAs } from 'file-saver';
import { debounce } from "lodash";

interface SideBarProps {
  onPageSelect: number[];
  onGeneratePDF: (selectedPages: string) => void;
  downloadLink: string | null;
  onInputChange: (input: string) => void;
  totalPages: number;
  isImagesLoaded: boolean;
}

const SideBar: React.FC<SideBarProps> = ({
  onPageSelect,
  onGeneratePDF,
  downloadLink,
  onInputChange,
  totalPages,
  isImagesLoaded
}) => {
  const [pageValue, setPageValue] = useState<string>("");
  const [isManualInput, setIsManualInput] = useState(false);
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);



  const parseRangeString = (value: string): number[] | null => {
    if (!value.trim()) return [];
    
    const pages = new Set<number>();
    const ranges = value.split(',').map(r => r.trim());
    
    for (const range of ranges) {
      if (range === '') continue;
      
      if (range.includes('-')) {
        const [start, end] = range.split('-').map(Number);
        if (isNaN(start) || isNaN(end) || start > end || start < 1 || end > totalPages) {
          return null;
        }
        for (let i = start; i <= end; i++) {
          pages.add(i);
        }
      } else {
        const pageNum = Number(range);
        if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) {
          return null;
        }
        pages.add(pageNum);
      }
    }
    return Array.from(pages);
  };




  const debouncedValidateAndProcess = useCallback(
    debounce((val: string) => {
      if (val.trim() === "") {
        onInputChange("");
        return;
      }

      const pages = parseRangeString(val);
      if (pages === null) {
        alert(`Please enter valid page numbers between 1 and ${totalPages}`);
        return;
      }

      onInputChange(val);
    }, 1500),
    [totalPages, onInputChange]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setIsManualInput(true);
    setPageValue(val);

    debouncedValidateAndProcess(val);
  };


  const handleBlur = () => {
    setIsManualInput(false);
    const pages = parseRangeString(pageValue);
    if (pages === null || pages.length === 0) {
      setPageValue('');
      return;
    }
    
    const sortedPages = [...pages].sort((a, b) => a - b);
    const ranges = [];
    let start = sortedPages[0];
    let end = start;

    for (let i = 1; i < sortedPages.length; i++) {
      if (sortedPages[i] === end + 1) {
        end = sortedPages[i];
      } else {
        ranges.push(start === end ? `${start}` : `${start}-${end}`);
        start = sortedPages[i];
        end = start;
      }
    }
    ranges.push(start === end ? `${start}` : `${start}-${end}`);
    setPageValue(ranges.join(', '));
  };

  useEffect(() => {
    if (!isManualInput) {
      const sortedPages = [...onPageSelect].sort((a, b) => a - b);
      if (sortedPages.length === 0) {
        setPageValue("");
        return;
      }
      const ranges = [];
      let start = sortedPages[0];
      let end = start;
      
      for (let i = 1; i < sortedPages.length; i++) {
        if (sortedPages[i] === end + 1) {
          end = sortedPages[i];
        } else {
          ranges.push(start === end ? `${start}` : `${start}-${end}`);
          start = sortedPages[i];
          end = start;
        }
      }

      ranges.push(start === end ? `${start}` : `${start}-${end}`);
      setPageValue(ranges.join(", "));
    }
  }, [onPageSelect, isManualInput]);

  const handleGeneratePDF = (pageValue: string) => {
    onGeneratePDF(pageValue);
  };

  const handleDownload = () => {
    if (downloadLink) {
      saveAs(downloadLink, `extractedPdf${new Date()}`);
    } else {
      console.error("Download link is not available.");
    }
  };

  return (
    <>
      <div className="sm:hidden">
        {isImagesLoaded && (<button 
          onClick={() => setIsFullScreenOpen(true)}
          className="bg-red-500 text-white p-4 rounded-full fixed bottom-4 right-4 z-50 shadow-lg hover:bg-red-600 transition-colors"
        >
          <RiFileSettingsLine className="text-3xl"/>
        </button>)}
      </div>

      {isFullScreenOpen && (
        <div className="fixed inset-0 z-[100] bg-white overflow-y-auto animate-fade-in sm:hidden">
          <div className="flex justify-end p-4">
            <button 
              onClick={() => setIsFullScreenOpen(false)}
              className="text-gray-700 hover:text-red-500 transition-colors"
            >
              <FaWindowClose/>
            </button>
          </div>

          <div className="px-6 pb-6">
            <h3 className="text-center text-gray-800 text-xl font-semibold mb-6">
              PDF Options
            </h3>

            <div className="mb-6">
              <input
                type="text"
                placeholder={`Eg: 1-${totalPages}, 20`}
                value={pageValue}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="w-full p-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <p className="text-sm text-gray-500 mt-2 text-center">
                Total Pages: {totalPages}
              </p>
            </div>

            <div className="space-y-4">
              {!downloadLink ? (
                <button
                  onClick={() => handleGeneratePDF(pageValue)}
                  className="flex items-center justify-center gap-3 bg-red-500 text-white py-4 rounded-lg font-medium w-full transition-colors hover:bg-red-600"
                >
                  Generate PDF
                </button>
              ) : (
                <button
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-3 bg-green-500 text-white py-4 rounded-lg font-medium w-full transition-colors hover:bg-green-600"
                >
                  Download PDF
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="hidden sm:block w-full max-w-sm bg-gray-100 p-6 shadow-md">
        <h3 className="text-center text-gray-800 text-lg sm:text-xl font-semibold mb-4">
          Choose Pages
        </h3>

        <div className="mb-5">
          <input
            type="text"
            placeholder={`Eg: 1-${totalPages}, 20`}
            value={pageValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className="w-full p-3 text-sm sm:text-base text-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <p className="text-xs text-gray-500 mt-2">
            Total Pages: {totalPages}
          </p>
        </div>

        <div className="text-center">
          {!downloadLink ? (
            <button
              onClick={() => handleGeneratePDF(pageValue)}
              className="flex items-center justify-center gap-2 bg-red-500 text-white py-2 px-4 sm:py-3 sm:px-6 rounded-lg font-medium w-full transition-colors duration-300 hover:bg-red-600"
            >
              Generate PDF
            </button>
          ) : (
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 bg-green-500 text-white py-2 px-4 sm:py-3 sm:px-6 rounded-lg font-medium w-full transition-colors duration-300 hover:bg-green-600"
            >
              Download PDF
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default SideBar;