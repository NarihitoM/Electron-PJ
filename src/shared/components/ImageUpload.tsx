import { useRef } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { Button } from "./ui/button";

interface ImageUploadProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  uploading?: boolean;
  maxImages?: number;
  maxFileSizeMB?: number;
  disabled?: boolean;
}

export const ImagePreview = ({
  images,
  onImagesChange,
  uploading = false,
}: Pick<ImageUploadProps, "images" | "onImagesChange" | "uploading">) => {
  if (images.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {images.map((file, index) => (
        <div
          key={`${file.name}-${index}`}
          className="relative group w-20 h-20 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden"
        >
          <img
            src={URL.createObjectURL(file)}
            alt={file.name}
            className="w-full h-full object-cover"
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 size={20} className="text-white animate-spin" />
            </div>
          )}
          {!uploading && (
            <button
              onClick={() => onImagesChange(images.filter((_, i) => i !== index))}
              className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={12} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export const ImagePicker = ({
  images,
  onImagesChange,
  uploading = false,
  maxImages = 4,
  maxFileSizeMB = 5,
  disabled = false,
}: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > maxFileSizeMB * 1024 * 1024) continue;
      if (images.length + validFiles.length >= maxImages) break;
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      onImagesChange([...images, ...validFiles]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || uploading || images.length >= maxImages}
        className="h-8 w-8 rounded-lg"
      >
        {uploading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
      </Button>
      {images.length > 0 && (
        <span className="text-xs text-muted-foreground">
          {uploading ? "Uploading..." : `${images.length}/${maxImages}`}
        </span>
      )}
    </div>
  );
};

export const ImageUpload = (props: ImageUploadProps) => {
  return (
    <div className="flex flex-col gap-2">
      <ImagePreview {...props} />
      <ImagePicker {...props} />
    </div>
  );
};
