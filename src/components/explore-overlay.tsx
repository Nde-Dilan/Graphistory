'use client';
import type { CameroonEvent } from '@/lib/cameroon-history-data';
import Image from 'next/image';
import { Button } from './ui/button';
import { X, ChevronLeft, ChevronRight, Link } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import ImageDescription from './image-description';

interface ExploreOverlayProps {
  event: CameroonEvent;
  currentIndex: number;
  totalImages: number;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
}

export default function ExploreOverlay({
  event,
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-20 flex items-center justify-center fade-in">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 rounded-full h-12 w-12 text-white"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full h-12 w-12 text-white"
        onClick={handlePrev}
      >
        <ChevronLeft className="h-8 w-8" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full h-12 w-12 text-white"
        onClick={handleNext}
      >
        <ChevronRight className="h-8 w-8" />
      </Button>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 p-4 max-w-7xl w-full">
        <div className="relative w-full max-w-2xl aspect-[4/3] rounded-lg overflow-hidden shadow-2xl">
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover"
          />
        </div>
        <Card className="w-full max-w-md bg-card/80 border-border">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-accent">{event.title}</CardTitle>
            <p className="text-sm text-gray-300">{event.date}</p>
          </CardHeader>
          <CardContent>
            <p className="text-gray-200 mb-4">{event.summary}</p>
            <div className="mb-6">
              <ImageDescription imageId={event.id} imageHint={event.imageHint}/>
            </div>
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Link className="h-4 w-4" />
              Context & Themes
            </h3>
            <div className="flex flex-wrap gap-2">
              {event.contextLinks.map((link) => (
                <Badge key={link} variant="secondary" className="bg-secondary/50 text-white border-secondary">
                  {link}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
