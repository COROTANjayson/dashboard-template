"use client";

import * as React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useSidebarStore } from "@/app/store/sidebar.store";

export function SidebarProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen, setIsOpen } = useSidebarStore();
  const [mounted, setMounted] = React.useState(false);

  // Prevent hydration mismatch by only rendering after mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <SidebarProvider defaultOpen={true}>
        {children}
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider open={isOpen} onOpenChange={setIsOpen}>
      {children}
    </SidebarProvider>
  );
}
