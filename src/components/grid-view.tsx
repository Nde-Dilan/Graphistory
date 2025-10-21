'use client';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';

interface GridViewProps {
  images: ImagePlaceholder[];
  onImageSelect: (index: number) => void;
}

export default function GridView({ images, onImageSelect }: GridViewProps) {
  return (
    <ScrollArea className="h-screen w-screen fade-in">
      <div className="p-4 md:p-8 pb-24">
        <h1 className="text-4xl md:text-6xl font-headline mb-8 text-center">Image Grid</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="group relative aspect-w-1 aspect-h-1 cursor-pointer overflow-hidden rounded-lg shadow-lg"
              onClick={() => onImageSelect(index)}
              data-ai-hint={image.imageHint}
            >
              <Image
                src={image.imageUrl}
                alt={`Placeholder image ${image.id}`}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}
