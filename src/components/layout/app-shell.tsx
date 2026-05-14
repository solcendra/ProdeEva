import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/site-header";

/** Layout común con cabecera para toda la app demo. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#fafafa]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
      <footer className="border-t border-neutral-200 bg-white py-6 text-center text-xs text-neutral-500">
        Demo interna · Datos mock + persistencia local · Eva es un personaje de producto
      </footer>
    </div>
  );
}
