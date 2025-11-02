'use client';
import type { CameroonEvent } from '@/lib/cameroon-history-data';
import Image from 'next/image';
import { Button } from './ui/button';
import { X, ChevronLeft, ChevronRight, Link } from 'lucide-react';
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 flex items-center justify-center p-4 fade-in">
      <div className="w-full max-w-5xl bg-[#C0C0C0] border-t border-l border-[#FFFFFF] border-r border-b border-[#808080] shadow-lg rounded-sm">
        <div className="h-8 bg-gradient-to-r from-[#000080] to-[#1084d0] flex items-center justify-between px-2 rounded-t-sm">
          <p className="text-white font-code text-sm">Event Details: {event.title}</p>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-sm bg-[#C0C0C0] text-black hover:bg-red-500 hover:text-white"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 flex flex-col lg:flex-row items-start justify-center gap-4">
          <div className="relative w-full max-w-md lg:max-w-lg aspect-square lg:aspect-[4/3] border-t border-l border-[#808080] border-r border-b border-[#FFFFFF] p-0.5 bg-black">
             <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              className="object-contain"
            />
          </div>
          <div className="w-full max-w-md space-y-4">
              <h1 className="text-2xl font-headline text-accent">{event.title}</h1>
              <p className="text-sm font-code text-secondary">{event.date}</p>
              <p className="text-foreground/80">{event.summary}</p>
              <div className="py-2">
                <ImageDescription imageId={event.id} imageHint={event.imageHint}/>
              </div>
              <h3 className="font-semibold text-foreground flex items-center gap-2 pt-2 border-t border-gray-400">
                <Link className="h-4 w-4" />
                Context & Themes
              </h3>
              <div className="flex flex-wrap gap-2">
                {event.contextLinks.map((link) => (
                  <Badge key={link} variant="secondary" className="bg-secondary/80 text-white border-none font-code">
                    {link}
                  </Badge>
                ))}
              </div>
          </div>
        </div>

        <div className="flex justify-center gap-4 p-2">
          <Button onClick={handlePrev} className="bg-[#C0C0C0] border-t border-l border-white border-b border-r border-gray-500 text-black hover:bg-gray-300 font-code">
            <ChevronLeft className="h-5 w-5 mr-2" /> Prev
          </Button>
          <Button onClick={handleNext} className="bg-[#C0C0C0] border-t border-l border-white border-b border-r border-gray-500 text-black hover:bg-gray-300 font-code">
            Next <ChevronRight className="h-5 w-5 ml-2" />
          </Button>
        </div>

      </div>
    </div>
  );
}
