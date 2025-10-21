'use client';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Button } from './ui/button';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import ImageDescription from './image-description';
import { Card, CardContent } from './ui/card';

interface ExploreOverlayProps {
  image: ImagePlaceholder;
  currentIndex: number;
  totalImages: number;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
}

export default function ExploreOverlay({
  image,
  currentIndex,
  totalImages,
  onClose,
  onNavigate,
}: ExploreOverlayProps) {

  const handlePrev = () => {
    onNavigate((currentIndex - 1 + totalImages) % totalImages);
  };

  const handleNext = () => {
    onNavigate((currentIndex + 1) % totalImages);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-20 flex items-center justify-center fade-in">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 rounded-full h-12 w-12"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full h-12 w-12"
        onClick={handlePrev}
      >
        <ChevronLeft className="h-8 w-8" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full h-12 w-12"
        onClick={handleNext}
      >
        <ChevronRight className="h-8 w-8" />
      </Button>
      
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 p-4 max-w-6xl w-full">
        <div className="relative w-full max-w-lg lg:max-w-xl aspect-[4/3] rounded-lg overflow-hidden shadow-2xl">
            <Image
                src={image.imageUrl}
                alt={`Image ${image.id}`}
                fill
                className="object-contain"
                data-ai-hint={image.imageHint}
            />
        </div>
        <Card className="w-full max-w-md bg-card/70">
          <CardContent className="p-6">
            <h2 className="text-2xl font-headline text-primary mb-4">Details</h2>
            <ImageDescription imageId={image.id} imageHint={image.imageHint} />
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
