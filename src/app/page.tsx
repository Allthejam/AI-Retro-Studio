'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/app/app-layout';
import { HistoryPanel } from '@/components/app/history-panel';
import { ToolPanel } from '@/components/app/tool-panel';
import { ImageEditorPanel } from '@/components/app/image-editor-panel';
import { useToast } from '@/hooks/use-toast';
import {
  transformPhotoIntoCartoon,
  colorizeBlackAndWhitePhoto,
  upscaleImageTo4K,
  restoreOldPhoto,
} from '@/ai/flows';
import { useUser, useFirestore, useStorage } from '@/firebase';
import { doc } from 'firebase/firestore';
import { uploadImage, uploadDataUri } from '@/firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export type Tool = 'restore' | 'colorize' | 'upscale' | 'cartoon';

export default function Home() {
  const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
  const [storageUrl, setStorageUrl] = useState<string | null>(null);
  const [transformedImage, setTransformedImage] = useState<string | null>(null);
  const [loadingTool, setLoadingTool] = useState<Tool | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const storage = useStorage();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleImageUpload = useCallback(async (file: File) => {
    if (!user || !storage || !firestore) {
      toast({
        title: 'Authentication Error',
        description: 'You must be signed in to upload an image.',
        variant: 'destructive',
      });
      return;
    }

    // Reset states
    setIsUploading(true);
    setTransformedImage(null);
    setStorageUrl(null);

    // 1. Show local preview immediately for better UX
    const reader = new FileReader();
    reader.onloadend = () => {
      setOriginalImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      // 2. Upload to Firebase Storage
      const downloadUrl = await uploadImage(storage, user.uid, file);
      
      // CRITICAL: Ensure we have a valid URL before setting it
      if (!downloadUrl || !downloadUrl.startsWith('http')) {
        throw new Error('Cloud sync failed to return a valid image URL.');
      }

      // 3. Save metadata to Firestore (non-blocking)
      const imageId = uuidv4();
      const imageRef = doc(firestore, 'users', user.uid, 'images', imageId);
      setDocumentNonBlocking(imageRef, {
        id: imageId,
        userId: user.uid,
        originalUrl: downloadUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
      }, { merge: true });
      
      // Update state with the SECURE CLOUD URL
      setStorageUrl(downloadUrl);
      
      toast({
        title: 'Ready for AI',
        description: 'Image synced to cloud. You can now use the AI tools.',
      });
    } catch (error: any) {
      console.error('Image Upload Flow Error:', error);
      setOriginalImagePreview(null);
      setStorageUrl(null);
      toast({
        title: 'Cloud Sync Failed',
        description: error.message || 'There was a problem syncing your image to the cloud.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  }, [user, storage, firestore, toast]);

  const handleReset = useCallback(() => {
    setOriginalImagePreview(null);
    setStorageUrl(null);
    setTransformedImage(null);
    setLoadingTool(null);
    setIsUploading(false);
  }, []);

  const handleToolSelect = async (tool: Tool) => {
    if (isUploading) {
      toast({
        title: 'Syncing...',
        description: 'Please wait for the image to finish syncing to the cloud.',
      });
      return;
    }

    if (!storageUrl) {
      toast({
        title: 'Image Not Ready',
        description: 'Please upload an image and wait for cloud sync to complete.',
        variant: 'destructive',
      });
      return;
    }

    // FINAL PAYLOAD SAFETY CHECK
    if (storageUrl.startsWith('data:')) {
      toast({
        title: 'Invalid Source',
        description: 'Cannot process local image data. Please re-upload.',
        variant: 'destructive',
      });
      return;
    }

    setLoadingTool(tool);
    setTransformedImage(null);

    try {
      let result: any = null;
      const input = { photoUrl: storageUrl };
      
      switch (tool) {
        case 'restore':
          result = await restoreOldPhoto(input);
          setTransformedImage(result.restoredPhotoDataUri);
          break;
        case 'colorize':
          result = await colorizeBlackAndWhitePhoto(input);
          setTransformedImage(result.colorizedPhotoDataUri);
          break;
        case 'upscale':
          result = await upscaleImageTo4K(input);
          setTransformedImage(result.upscaledPhotoDataUri);
          break;
        case 'cartoon':
          result = await transformPhotoIntoCartoon(input);
          setTransformedImage(result.cartoonPhotoDataUri);
          break;
      }

      if (user && firestore && result) {
        const transformationId = uuidv4();
        const transRef = doc(firestore, 'users', user.uid, 'transformations', transformationId);
        const rawTransformedUrl = result.restoredPhotoDataUri || result.colorizedPhotoDataUri || result.upscaledPhotoDataUri || result.cartoonPhotoDataUri;
        
        let storedImageUrl = rawTransformedUrl;
        // Upload the large base64 data to Firebase Storage to keep Firestore documents lightweight (<1MB)
        if (storage && rawTransformedUrl && rawTransformedUrl.startsWith('data:')) {
          try {
            storedImageUrl = await uploadDataUri(storage, user.uid, rawTransformedUrl, tool);
          } catch (storageErr) {
            console.warn('Storage upload of transformed image failed, attempting direct save:', storageErr);
          }
        }

        setDocumentNonBlocking(transRef, {
          id: transformationId,
          userId: user.uid,
          originalImageId: 'uploaded_file',
          transformedImageUrl: storedImageUrl,
          type: tool,
          createdAt: new Date().toISOString(),
          status: 'completed'
        }, { merge: true });
      }
    } catch (error: any) {
      console.error(`AI Tool Error (${tool}):`, error);
      toast({
        title: 'AI Transformation Failed',
        description: error.message || 'The AI server took too long to respond.',
        variant: 'destructive',
      });
    } finally {
      setLoadingTool(null);
    }
  };

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium animate-pulse">Initializing Studio...</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout
      sidebar={
        <div className="flex flex-col gap-8">
          <ToolPanel 
            onToolSelect={handleToolSelect} 
            loadingTool={loadingTool}
            hasImage={!!storageUrl}
            disabled={!user || isUserLoading || isUploading}
          />
          <HistoryPanel />
        </div>
      }
    >
      <ImageEditorPanel
        originalImage={originalImagePreview}
        transformedImage={transformedImage}
        onImageUpload={handleImageUpload}
        onReset={handleReset}
        loading={!!loadingTool}
        loadingTool={loadingTool}
        isUploading={isUploading}
        disabled={!user || isUserLoading}
      />
    </AppLayout>
  );
}
