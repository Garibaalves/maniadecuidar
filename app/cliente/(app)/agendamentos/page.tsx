"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

type Agendamento = {
  id: string;
  data: string;
  hora: string;
  status: string;
  observacoes?: string | null;
  animais?: { nome: string } | null;
  agendamento_servicos?: { servicos?: { nome: string } | null }[];
};

export default function ClienteAgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cliente/agendamentos")
      .then((res) => res.json())
      .then((data) => setAgendamentos(data.data ?? []))
      .catch(() => setAgendamentos([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader
        title="Meus agendamentos"
        description="Historico de horarios e servicos realizados."
      />

      <Card className="border-brand-primary/20">
        <CardHeader>
          <CardTitle>Historico</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading && <div className="text-sm text-foreground/70">Carregando...</div>}
          {!loading &&
            agendamentos.map((ag) => (
              <div
                key={ag.id}
                className="flex items-center justify-between rounded-xl border border-border/70 bg-white/90 px-4 py-3"
              >
                <div>
                  <div className="text-sm font-semibold text-brand-deep">
                    {formatDate(ag.data)} as {ag.hora}
                  </div>
                  <div className="text-xs text-foreground/70">
                    {ag.animais?.nome ?? "Pet"} •{" "}
                    {(ag.agendamento_servicos ?? [])
                      .map((s) => s.servicos?.nome)
                      .filter(Boolean)
                      .join(", ") || "Servicos nao informados"}
                  </div>
                </div>
                <Badge>{ag.status}</Badge>
              </div>
            ))}
          {!loading && !agendamentos.length && (
            <div className="text-sm text-foreground/70">Nenhum agendamento encontrado.</div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
