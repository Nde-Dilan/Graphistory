import { CAMEROON_HISTORY_DATA, CAMEROON_HISTORY_LINKS } from '@/lib/cameroon-history-data';
import VisualExplorerClient from './visual-explorer-client';

export default function VisualExplorer() {
  return <VisualExplorerClient events={CAMEROON_HISTORY_DATA} links={CAMEROON_HISTORY_LINKS} />;
}
