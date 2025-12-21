'use client'

interface AudioPlayerProps {
  audioUrl: string;
}

export default function AudioPlayer({ audioUrl }: AudioPlayerProps) {
  if (!audioUrl) return null;

  return (
    <div className="w-full bg-zinc-900 border-b-2 border-[#303436] p-3">
      <audio
        controls
        className="w-full h-10"
        src={audioUrl}
        style={{
          filter: 'invert(1) hue-rotate(180deg)',
        }}
      >
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}
