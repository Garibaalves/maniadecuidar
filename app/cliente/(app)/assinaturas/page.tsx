"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

type Plano = {
  id: string;
  nome: string;
  descricao?: string | null;
  intervalo_dias: number;
  valor: number;
  plano_servicos?: { quantidade: number; servicos?: { id: string; nome: string } | null }[];
};

type Assinatura = {
  id: string;
  status: string;
  data_adesao?: string | null;
  data_vencimento?: string | null;
  planos?: { nome: string; valor: number } | null;
  stripe_checkout_url?: string | null;
};

export default function ClienteAssinaturasPage() {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPlanos = async () => {
    const res = await fetch("/api/cliente/planos");
    const data = await res.json();
    if (res.ok) setPlanos(data.data ?? []);
  };

  const loadAssinaturas = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cliente/assinaturas");
      const data = await res.json();
      if (res.ok) setAssinaturas(data.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlanos();
    loadAssinaturas();
  }, []);

  const handleAssinar = async (planoId: string) => {
    setError(null);
    try {
      const res = await fetch("/api/cliente/assinaturas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plano_id: planoId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao criar assinatura");
        return;
      }
      await loadAssinaturas();
      if (data.checkout_url) {
        window.open(data.checkout_url, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      console.error(err);
      setError("Erro ao criar assinatura");
    }
  };

  return (
    <>
      <PageHeader
        title="Assinaturas"
        description="Confira suas assinaturas e escolha um novo plano."
      />

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card className="border-brand-primary/20">
          <CardHeader>
            <CardTitle>Minhas assinaturas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading && <div className="text-sm text-foreground/70">Carregando...</div>}
            {!loading &&
              assinaturas.map((assinatura) => (
                <div
                  key={assinatura.id}
                  className="flex items-center justify-between rounded-xl border border-border/70 bg-white/90 px-4 py-3"
                >
                  <div>
                    <div className="font-semibold text-brand-deep">
                      {assinatura.planos?.nome ?? "Plano"}
                    </div>
                    <div className="text-xs text-foreground/70">
                      Vencimento: {assinatura.data_vencimento ?? "-"}
                    </div>
                  </div>
                  <Badge>{assinatura.status}</Badge>
                </div>
              ))}
            {!loading && !assinaturas.length && (
              <div className="text-sm text-foreground/70">Nenhuma assinatura encontrada.</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-brand-primary/20">
          <CardHeader>
            <CardTitle>Planos disponiveis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {planos.map((plano) => (
              <div key={plano.id} className="rounded-xl border border-border/70 bg-white/90 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-brand-deep">{plano.nome}</p>
                    <p className="text-xs text-foreground/70">
                      {formatCurrency(plano.valor)} • {plano.intervalo_dias} dias
                    </p>
                  </div>
                  <Button size="sm" onClick={() => handleAssinar(plano.id)}>
                    Assinar
                  </Button>
                </div>
                {plano.plano_servicos?.length ? (
                  <ul className="mt-3 space-y-1 text-xs text-foreground/70">
                    {plano.plano_servicos.map((ps, idx) => {
                      const servicoInfo = Array.isArray(ps.servicos)
                        ? ps.servicos[0]
                        : ps.servicos;
                      return (
                        <li key={`${plano.id}-${servicoInfo?.id ?? idx}`}>
                          {servicoInfo?.nome ?? "Servico"} • {ps.quantidade}x
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
