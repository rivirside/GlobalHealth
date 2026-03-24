export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Hide the root layout header and main wrapper styling for embed */}
      <style>{`
        header { display: none !important; }
        main { flex: none !important; }
        body { min-height: auto !important; }
      `}</style>
      {children}
    </>
  );
}
