"use client";

export default function TeamsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col overflow-auto p-6">
      {children}
    </div>
  );
}
