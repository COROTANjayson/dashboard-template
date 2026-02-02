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
      setIsOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, mounted]);

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
