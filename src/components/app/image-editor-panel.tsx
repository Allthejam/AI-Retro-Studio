import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { ImageUploader } from './image-uploader';
import { Button } from '@/components/ui/button';
import { Download, Loader2, RotateCcw } from 'lucide-react';
import type { Tool } from '@/app/page';

type ImageEditorPanelProps = {
  originalImage: string | null;
  transformedImage: string | null;
  onImageUpload: (file: File) => void;
  onReset: () => void;
  loading: boolean;
  loadingTool: Tool | null;
  isUploading?: boolean;
  disabled?: boolean;
};

export function ImageEditorPanel({
  originalImage,
  transformedImage,
  onImageUpload,
  onReset,
  loading,
  loadingTool,
  isUploading,
  disabled,
}: ImageEditorPanelProps) {
  if (!originalImage && !isUploading) {
    return <ImageUploader onImageUpload={onImageUpload} disabled={disabled} />;
  }

  const getDownloadFilename = () => {
    return `transformed-${new Date().getTime()}.png`;
  };

  const handleDownload = async () => {
    if (!transformedImage) return;
    try {
      if (transformedImage.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = transformedImage;
        link.download = getDownloadFilename();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const response = await fetch(transformedImage);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = getDownloadFilename();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }
    } catch {
      window.open(transformedImage, '_blank');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="shadow-lg">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <h3 className="text-center font-semibold text-muted-foreground">
                Original
              </h3>
              <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border bg-muted/20">
                {originalImage ? (
                  <>
                    <Image
                      src={originalImage}
                      alt="Original"
                      fill
                      className="object-contain"
                    />
                    {isUploading && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="mt-2 text-sm font-medium">Syncing to cloud...</p>
                      </div>
                    )}
                  </>
                ) : (
                  isUploading && (
                    <div className="flex flex-col items-center gap-4 text-muted-foreground">
                      <Loader2 className="h-12 w-12 animate-spin text-primary" />
                      <p>Initializing...</p>
                    </div>
                  )
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-center font-semibold text-muted-foreground">
                Result
              </h3>
              <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border bg-muted/20">
                {loading ? (
                  <div className="flex flex-col items-center gap-4 text-muted-foreground">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="capitalize">
                      {loadingTool
                        ? `Applying ${loadingTool}...`
                        : 'Processing...'}
                    </p>
                  </div>
                ) : transformedImage ? (
                  <Image
                    src={transformedImage}
                    alt="Transformed"
                    fill
                    className="object-contain"
                  />
                ) : (
                  <p className="p-8 text-center text-muted-foreground">
                    {isUploading 
                      ? "Waiting for cloud sync..." 
                      : "Select a tool on the left to transform this photo."}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={onReset} 
          disabled={loading || isUploading}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          New Image
        </Button>

        {transformedImage && !loading && (
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download Result
          </Button>
        )}
      </div>
    </div>
  );
}
