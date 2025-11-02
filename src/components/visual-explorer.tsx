import { CAMEROON_HISTORY_DATA } from '@/lib/cameroon-history-data';
import VisualExplorerClient from './visual-explorer-client';

export default function VisualExplorer() {
  return <VisualExplorerClient events={CAMEROON_HISTORY_DATA} />;
}
