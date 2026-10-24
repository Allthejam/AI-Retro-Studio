'use client';
import { useState, useRef, type DragEvent } from 'react';
import { UploadCloud } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type ImageUploaderProps = {
  onImageUpload: (file: File) => void;
  disabled?: boolean;
};

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

export function ImageUploader({ onImageUpload, disabled }: ImageUploaderProps) {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | null | undefined) => {
    if (!file || disabled) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast({
        title: 'Invalid File Type',
        description: `Please upload a valid image file (${ACCEPTED_TYPES.map(
          (t) => t.split('/')[1]
        ).join(', ')}).`,
        variant: 'destructive',
      });
      return;
    }

    if (file.size > MAX_SIZE) {
      toast({
        title: 'File Too Large',
        description: 'Please upload an image smaller than 10MB.',
        variant: 'destructive',
      });
      return;
    }

    onImageUpload(file);
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onButtonClick = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  return (
    <Card
      className={cn(
        'border-2 border-dashed shadow-lg transition-colors',
        isDragging && !disabled ? 'border-primary bg-primary/10' : 'border-border',
        disabled && 'bg-muted/50'
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <CardContent className="p-0">
        <div
          className={cn('flex flex-col items-center justify-center p-12 lg:p-24', !disabled && 'cursor-pointer')}
          onClick={onButtonClick}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={ACCEPTED_TYPES.join(',')}
            onChange={(e) => handleFile(e.target.files?.[0])}
            disabled={disabled}
          />
          <div className="space-y-4 text-center">
            <UploadCloud className={cn('mx-auto h-16 w-16', disabled ? 'text-muted' : 'text-muted-foreground')} />
            <h3 className="text-2xl font-bold tracking-tight">
              {disabled ? 'Please Sign In' : 'Upload Your Image'}
            </h3>
            <p className={cn(disabled ? 'text-muted' : 'text-muted-foreground')}>
              {disabled ? 'Sign in to upload and transform images.' : 'Drag & drop an image here, or click to select a file.'}
            </p>
            <Button variant="outline" className="pointer-events-none mt-4" disabled={disabled}>
              Select File
            </Button>
            <p className="pt-4 text-xs text-muted-foreground">
              Supports PNG, JPG, WEBP up to 10MB.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
