'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

/**
 * An invisible component that listens for globally emitted 'permission-error' events.
 * Instead of unhandled crashing of the entire React tree, it logs the detailed rule context
 * and alerts the user gracefully via a toast notice.
 */
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      console.warn('Firestore Permission Warning:', error.message);
      toast({
        title: 'Firestore Sync Notice',
        description: 'Record could not be saved to Firestore history (Permission Denied). Please ensure Firestore Security Rules are published in Firebase Console.',
        variant: 'destructive',
      });
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  return null;
}
