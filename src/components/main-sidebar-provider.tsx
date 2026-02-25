"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useSidebarStore } from "@/app/store/sidebar.store";

export function MainSidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen, setIsOpen } = useSidebarStore();
  const [mounted, setMounted] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (mounted && !isOpen) {
      // Intentionally not forcing isOpen to true on pathname changes
      // to allow the sidebar to remain collapsed when navigating.
    }
  }, [mounted]);

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
