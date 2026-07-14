import { useState } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { X, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ImageLightbox = ({
  images,
  initialIndex = 0,
  open,
  onOpenChange,
}: ImageLightboxProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleDownload = () => {
    const url = images[currentIndex];
    const a = document.createElement("a");
    a.href = url;
    a.download = `image-${currentIndex + 1}`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 bg-black border-none overflow-hidden">
        <div className="relative flex items-center justify-center min-h-[50vh]">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 text-white hover:bg-white/20"
            onClick={() => onOpenChange(false)}
          >
            <X size={20} />
          </Button>

          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 z-10 text-white hover:bg-white/20"
                onClick={handlePrev}
              >
                <ChevronLeft size={24} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 z-10 text-white hover:bg-white/20"
                onClick={handleNext}
              >
                <ChevronRight size={24} />
              </Button>
            </>
          )}

          <img
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
            className="max-h-[80vh] max-w-full object-contain"
          />

          <Button
            variant="ghost"
            size="icon"
            className="absolute bottom-2 right-2 z-10 text-white hover:bg-white/20"
            onClick={handleDownload}
          >
            <Download size={18} />
          </Button>
        </div>

        {images.length > 1 && (
          <div className="flex justify-center gap-1 pb-3">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentIndex ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
