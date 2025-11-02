import VisualExplorer from '@/components/visual-explorer';

export default function Home() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-background bg-[url('/desktop-bg.svg')] bg-cover">
      <VisualExplorer />
    </main>
  );
}
