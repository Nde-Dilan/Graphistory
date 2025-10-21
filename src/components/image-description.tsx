'use client';
import { generateImageDescription } from '@/ai/flows/image-description-generator';
import { useEffect, useState } from 'react';
import { Skeleton } from './ui/skeleton';

interface ImageDescriptionProps {
  imageId: string;
  imageHint: string;
}

export default function ImageDescription({ imageId, imageHint }: ImageDescriptionProps) {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function getDescription() {
      if (!isMounted) return;
      setLoading(true);
      setDescription('');
      try {
        const result = await generateImageDescription({ imageId: imageHint });
        if (isMounted) {
            setDescription(result.description);
        }
      } catch (error) {
        console.error('Failed to generate description:', error);
        if (isMounted) {
            setDescription('A beautiful image from the collection.');
        }
      } finally {
        if (isMounted) {
            setLoading(false);
        }
      }
    }

    if (imageId) {
      getDescription();
    }
    
    return () => {
        isMounted = false;
    }
  }, [imageId, imageHint]);

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  return <p className="text-muted-foreground">{description}</p>;
}
