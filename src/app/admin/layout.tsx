export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background pt-24 pb-12 text-foreground">
      {children}
    </div>
  );
}
