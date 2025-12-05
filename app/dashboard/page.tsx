"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { CalendarClock, PawPrint, Wallet } from "lucide-react";

type Agendamento = {
  id: string;
  data: string;
  hora: string;
  status: string;
  clientes?: { nome: string } | null;
  animais?: { nome: string } | null;
  agendamento_servicos?: { servicos?: { nome: string } | null }[];
};

type CaixaMovimento = { id: string; data: string; tipo: "ENTRADA" | "SAIDA"; valor: number };
type ContaFixa = { id: string; valor_mensal: number; ativo: boolean };
type Despesa = { id: string; valor: number; data_pagamento?: string | null; data_vencimento?: string | null };

const toLocalISODate = (date: Date) => {
  const tz = date.getTimezoneOffset();
  const local = new Date(date.getTime() - tz * 60000);
  return local.toISOString().slice(0, 10);
};

export default function DashboardPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [caixaDia, setCaixaDia] = useState<{ entradas: number; saidas: number }>({ entradas: 0, saidas: 0 });
  const [caixaMes, setCaixaMes] = useState<{ entradas: number; saidas: number; saldo: number }>({
    entradas: 0,
    saidas: 0,
    saldo: 0,
  });
  const [error, setError] = useState<string | null>(null);

  const hojeIso = toLocalISODate(new Date());
  const inicioMes = useMemo(() => {
    const now = new Date();
    return toLocalISODate(new Date(now.getFullYear(), now.getMonth(), 1));
  }, []);
  const fimMes = useMemo(() => {
    const now = new Date();
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return toLocalISODate(last);
  }, []);

  useEffect(() => {
    loadAgendamentos();
    loadCaixaDia();
    loadCaixaMes();
  }, []);

  const proximos = useMemo(() => {
    return agendamentos
      .filter((a) => a.status !== "CONCLUIDO" && a.status !== "CANCELADO")
      .slice(0, 5);
  }, [agendamentos]);

  const resumo = useMemo(
    () => [
      {
        title: "Agendamentos hoje",
        value: agendamentos.length,
        icon: <CalendarClock className="h-5 w-5" />,
      },
      {
        title: "Atendimentos em curso",
        value: agendamentos.filter((a) => a.status === "EM_ATENDIMENTO").length,
        icon: <PawPrint className="h-5 w-5" />,
      },
      {
        title: "Saldo do dia",
        value: formatCurrency(caixaDia.entradas - caixaDia.saidas),
        icon: <Wallet className="h-5 w-5" />,
      },
    ],
    [agendamentos, caixaDia]
  );

  async function loadAgendamentos() {
    setError(null);
    try {
      const res = await fetch(`/api/agendamentos?data=${hojeIso}`);
      const data = await res.json();
      if (res.ok) setAgendamentos(data.data ?? []);
      else setError(data.error ?? "Erro ao carregar agendamentos");
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar agendamentos");
    }
  }

  async function loadCaixaDia() {
    try {
      const res = await fetch(`/api/caixa?inicio=${hojeIso}&fim=${hojeIso}`);
      const data = await res.json();
      if (!res.ok) return;
      const entradas = (data.data ?? []).filter((m: CaixaMovimento) => m.tipo === "ENTRADA").reduce((acc: number, m: CaixaMovimento) => acc + Number(m.valor ?? 0), 0);
      const saidas = (data.data ?? []).filter((m: CaixaMovimento) => m.tipo === "SAIDA").reduce((acc: number, m: CaixaMovimento) => acc + Number(m.valor ?? 0), 0);
      setCaixaDia({ entradas, saidas });
    } catch (err) {
      console.error(err);
    }
  }

  async function loadCaixaMes() {
    try {
      const [movRes, fixRes, despRes] = await Promise.all([
        fetch(`/api/caixa?inicio=${inicioMes}&fim=${fimMes}`),
        fetch("/api/contas-fixas"),
        fetch("/api/despesas"),
      ]);
      const movData = await movRes.json();
      const fixData = await fixRes.json();
      const despData = await despRes.json();

      if (movRes.ok) {
        const entradas = (movData.data ?? [])
          .filter((m: CaixaMovimento) => m.tipo === "ENTRADA")
          .reduce((acc: number, m: CaixaMovimento) => acc + Number(m.valor ?? 0), 0);
        const saidasBase = (movData.data ?? [])
          .filter((m: CaixaMovimento) => m.tipo === "SAIDA")
          .reduce((acc: number, m: CaixaMovimento) => acc + Number(m.valor ?? 0), 0);
        const fixas =
          fixRes.ok && Array.isArray(fixData.data)
            ? (fixData.data as ContaFixa[])
                .filter((c) => c.ativo !== false)
                .reduce((acc, c) => acc + Number(c.valor_mensal ?? 0), 0)
            : 0;
        const despesasMes =
          despRes.ok && Array.isArray(despData.data)
            ? (despData.data as Despesa[])
                .filter((d) => {
                  const ref = (d.data_pagamento ?? d.data_vencimento ?? "").slice(0, 10);
                  return ref >= inicioMes && ref <= fimMes;
                })
                .reduce((acc, d) => acc + Number(d.valor ?? 0), 0)
            : 0;
        const saidas = saidasBase + fixas + despesasMes;
        setCaixaMes({ entradas, saidas, saldo: entradas - saidas });
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Dashboard"
        description="Visão geral de agendamentos, atendimentos, caixa e estoque."
        actions={
          <Button asChild>
            <a href="/agenda">Abrir agenda</a>
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        {resumo.map((item) => (
          <Card key={item.title} className="border-brand-primary/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">{item.title}</CardTitle>
              <div className="rounded-lg bg-brand-primary/10 p-2 text-brand-primary">
                {item.icon}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-brand-deep">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="border-brand-primary/20">
          <CardHeader>
            <CardTitle>Próximos horários</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hora</TableHead>
                  <TableHead>Cliente / Animal</TableHead>
                  <TableHead>Serviços</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proximos.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-semibold text-brand-deep">{item.hora}</TableCell>
                    <TableCell>
                      <div className="font-semibold">{item.clientes?.nome ?? "Cliente"}</div>
                      <div className="text-xs text-foreground/70">{item.animais?.nome ?? "Pet"}</div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {(item.agendamento_servicos ?? [])
                        .map((s) => s.servicos?.nome)
                        .filter(Boolean)
                        .join(", ") || "Serviço não informado"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.status === "EM_ATENDIMENTO" ? "warning" : "default"}>
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {!proximos.length && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-foreground/70">
                      Nenhum agendamento para hoje.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card className="border-brand-primary/20">
            <CardHeader>
              <CardTitle>Caixa do dia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-brand-primary/10 px-4 py-3">
                <div>
                  <p className="text-sm text-foreground/70">Entradas</p>
                  <p className="text-2xl font-semibold text-brand-deep">{formatCurrency(caixaDia.entradas)}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground/70">Saídas</p>
                  <p className="text-2xl font-semibold text-brand-deep">{formatCurrency(caixaDia.saidas)}</p>
                </div>
              </div>
              <Button variant="outline" asChild>
                <a href="/caixa">Abrir caixa</a>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-brand-primary/20">
            <CardHeader>
              <CardTitle>Caixa do mês</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-xl border border-border/70 bg-white/80 px-4 py-3 text-sm text-brand-deep">
                <div className="flex items-center justify-between">
                  <span>Entradas</span>
                  <span className="font-semibold">{formatCurrency(caixaMes.entradas)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Saídas (inclui contas fixas)</span>
                  <span className="font-semibold">{formatCurrency(caixaMes.saidas)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-base font-semibold">
                  <span>Saldo previsto</span>
                  <span className={caixaMes.saldo >= 0 ? "text-green-700" : "text-red-600"}>
                    {formatCurrency(caixaMes.saldo)}
                  </span>
                </div>
              </div>
              <div className="text-xs text-foreground/70">
                Considera entradas/saídas do mês atual e o total das contas fixas ativas.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
    </AppShell>
  );
}
