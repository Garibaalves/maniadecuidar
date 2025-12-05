"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { PawPrint } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const telefone = formData.get("telefone");
    const senha = formData.get("senha");
    setLoading(true);
    setError(null);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telefone, senha }),
    });
    setLoading(false);
    if (response.ok) {
      router.push("/dashboard");
    } else {
      const data = await response.json();
      setError(data.error ?? "Não foi possível fazer login");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background/80 px-4 py-10">
      <div className="grid w-full max-w-5xl gap-10 md:grid-cols-2">
        <div className="flex items-center justify-center rounded-3xl border border-border/70 bg-white/80 p-8 shadow-soft">
          <div className="text-center">
            <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-3xl bg-brand-primary/10 shadow-soft">
              <Image
                src="/logomarca.svg"
                alt="Mania de Cuidar"
                width={240}
                height={240}
                className="h-40 w-40 object-contain"
                priority
              />
            </div>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-deep">
              <PawPrint className="h-4 w-4" />
              Acesso restrito
            </div>
          </div>
        </div>

        <Card className="border-brand-primary/30 bg-white/90">
          <CardHeader>
            <CardTitle>Login do time</CardTitle>
            <p className="text-sm text-foreground/70">
              Autenticação customizada por telefone + senha.
            </p>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  name="telefone"
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  name="senha"
                  type="password"
                  placeholder="Sua senha"
                  required
                />
              </div>
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className={cn("w-full")}
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
