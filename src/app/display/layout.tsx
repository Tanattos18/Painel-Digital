export default function DisplayLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen items-center justify-center overflow-hidden bg-black text-white">
      <div className="aspect-video h-auto w-full max-h-screen max-w-[177.78vh]">
        {children}
      </div>
    </div>
  );
}
