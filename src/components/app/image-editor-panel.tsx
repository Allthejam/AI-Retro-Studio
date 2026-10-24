'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { ImageUploader } from './image-uploader';
import { Button } from '@/components/ui/button';
import { Download, Loader2, RotateCcw, Columns, SlidersHorizontal } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<'side' | 'slider'>('side');
  const [sliderPosition, setSliderPosition] = useState<number>(50);

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

  const handleSliderMove = (clientX: number, rect: DOMRect) => {
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPosition(Math.round((x / rect.width) * 100));
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="shadow-lg">
        <CardContent className="p-4">
          {transformedImage && !loading && (
            <div className="mb-4 flex justify-end gap-2">
              <Button
                variant={viewMode === 'side' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('side')}
              >
                <Columns className="mr-1.5 h-3.5 w-3.5" />
                Side-by-Side
              </Button>
              <Button
                variant={viewMode === 'slider' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('slider')}
              >
                <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
                Before / After Slider
              </Button>
            </div>
          )}

          {viewMode === 'slider' && transformedImage && originalImage && !loading ? (
            <div
              className="relative aspect-square w-full max-w-2xl mx-auto select-none overflow-hidden rounded-lg border bg-muted/20 cursor-ew-resize"
              onMouseMove={(e) => handleSliderMove(e.clientX, e.currentTarget.getBoundingClientRect())}
              onTouchMove={(e) => {
                const t = e.touches[0];
                if (t) handleSliderMove(t.clientX, e.currentTarget.getBoundingClientRect());
              }}
            >
              {/* Enhanced/Transformed Image (Base) */}
              <Image
                src={transformedImage}
                alt="Transformed Enhanced"
                fill
                className="object-contain"
              />

              {/* Original Image (Clipped overlay) */}
              <div
                className="absolute inset-0"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
              >
                <Image
                  src={originalImage}
                  alt="Original"
                  fill
                  className="object-contain"
                />
              </div>

              {/* Drag divider line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.8)] pointer-events-none"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg text-xs font-bold pointer-events-none">
                  ⇄
                </div>
              </div>

              {/* Badges */}
              <span className="absolute top-3 left-3 rounded bg-black/70 px-2 py-1 text-xs font-semibold text-white pointer-events-none">
                Original (Before)
              </span>
              <span className="absolute top-3 right-3 rounded bg-primary/90 px-2 py-1 text-xs font-semibold text-white pointer-events-none">
                Enhanced (After)
              </span>
            </div>
          ) : (
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
          )}
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
