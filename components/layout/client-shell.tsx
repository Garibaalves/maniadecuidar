"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Menu,
  LogOut,
  LayoutDashboard,
  PawPrint,
  CalendarClock,
  User,
  Link2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactElement, type ReactNode } from "react";

type NavItem = { href: string; label: string; icon: string };

const clientNavItems: NavItem[] = [
  { href: "/cliente", label: "Dashboard", icon: "layout-dashboard" },
  { href: "/cliente/perfil", label: "Meu perfil", icon: "user" },
  { href: "/cliente/pets", label: "Meus pets", icon: "paw-print" },
  { href: "/cliente/agendamentos", label: "Agendamentos", icon: "calendar-clock" },
  { href: "/cliente/agendar", label: "Novo agendamento", icon: "calendar-clock" },
  { href: "/cliente/assinaturas", label: "Assinaturas", icon: "link" },
];

type ClientShellProps = {
  children: ReactNode;
};

export function ClientShell({ children }: ClientShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState<string>("Cliente");

  useEffect(() => {
    let active = true;
    fetch("/api/cliente/me")
      .then(async (res) => {
        if (!res.ok) {
          if (active) router.push("/cliente/login");
          return null;
        }
        const data = await res.json();
        return data.data;
      })
      .then((data) => {
        if (active && data?.nome) setUserName(data.nome);
      })
      .catch(() => {
        if (active) router.push("/cliente/login");
      });
    return () => {
      active = false;
    };
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/cliente/logout", { method: "POST" });
    router.push("/cliente/login");
  };

  return (
    <div className="flex min-h-screen bg-background/70">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen w-64 flex-col border-r border-border/80 bg-white/90 px-4 py-6 shadow-soft lg:flex"
        )}
      >
        <div className="flex items-center justify-center px-2 pb-4">
          <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-brand-primary/10 text-brand-primary shadow-soft">
            <Image
              src="/logomarca.svg"
              alt="Mania de Cuidar"
              width={144}
              height={144}
              className="h-24 w-24 object-contain"
              priority
            />
          </div>
        </div>
        <nav className="mt-8 space-y-1">
          {clientNavItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-foreground/80 transition hover:bg-brand-primary/10 hover:text-brand-deep",
                  active && "bg-brand-primary/15 text-brand-deep"
                )}
              >
                <span className="text-brand-primary">{renderIcon(item.icon)}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-3 px-2">
          <div className="rounded-xl border border-border/70 bg-brand-primary/10 px-3 py-3">
            <p className="text-xs text-foreground/60">Bem-vindo,</p>
            <p className="font-semibold text-brand-deep">{userName}</p>
          </div>
          <Button variant="outline" size="md" className="w-full" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      <div className="flex-1">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border/70 bg-white/90 px-4 py-4 shadow-soft lg:hidden">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setOpen((prev) => !prev)}
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Image
              src="/logomarca.svg"
              alt="Mania de Cuidar"
              width={48}
              height={48}
              className="h-10 w-10 object-contain"
              priority
            />
          </div>
          <Button variant="ghost" size="md" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </header>

        {open && (
          <div className="border-b border-border/70 bg-white px-4 py-3 lg:hidden">
            <nav className="space-y-1">
              {clientNavItems.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-foreground/80 transition hover:bg-brand-primary/10 hover:text-brand-deep",
                      active && "bg-brand-primary/15 text-brand-deep"
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {renderIcon(item.icon)}
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        <main className="px-4 py-6 lg:px-8 lg:py-10">{children}</main>
      </div>
    </div>
  );
}

function renderIcon(name: string) {
  const icons: Record<string, ReactElement> = {
    "layout-dashboard": <LayoutDashboard className="h-4 w-4" />,
    "paw-print": <PawPrint className="h-4 w-4" />,
    "calendar-clock": <CalendarClock className="h-4 w-4" />,
    user: <User className="h-4 w-4" />,
    link: <Link2 className="h-4 w-4" />,
  };
  return icons[name] ?? <LayoutDashboard className="h-4 w-4" />;
}
