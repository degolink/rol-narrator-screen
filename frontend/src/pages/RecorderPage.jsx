import { RecorderCard } from '../components/Recorder';

export function RecorderPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8">
      <div className="w-full max-w-lg">
        <RecorderCard />
      </div>
    </div>
  );
}
