import { PlaceHolderImages } from '@/lib/placeholder-images';
import VisualExplorerClient from './visual-explorer-client';

export default function VisualExplorer() {
  // In a real app, you might fetch this data from an API
  const images = PlaceHolderImages;
  
  return <VisualExplorerClient images={images} />;
}
