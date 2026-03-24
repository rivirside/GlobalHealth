export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="embed-wrapper">
      <style>{`
        header { display: none !important; }
        body { min-height: auto !important; overflow: hidden !important; margin: 0 !important; padding: 0 !important; }
        main { flex: none !important; }
      `}</style>
      {children}
    </div>
  );
}
