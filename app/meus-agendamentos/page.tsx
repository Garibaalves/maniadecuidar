"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { formatDate } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

type Agendamento = {
  id: string;
  data: string;
  hora: string;
  status: string;
  animais?: { nome: string } | null;
  agendamento_servicos?: { servicos?: { nome: string } | null }[];
};
type AgendamentoDetalhe = Agendamento & {
  observacoes?: string | null;
  clientes?: { nome: string; telefone1?: string } | null;
  atendimentos?: {
    id: string;
    valor_total?: number | null;
    forma_pagamento?: string | null;
    atendimento_fotos?: { id: string; url_foto: string }[];
  }[];
  valor_total?: number | null;
};

export default function MeusAgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  const [detalhe, setDetalhe] = useState<AgendamentoDetalhe | null>(null);
  const [open, setOpen] = useState(false);
  const [loadingDetalhe, setLoadingDetalhe] = useState(false);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10)
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    const p1 = digits.slice(0, 3);
    const p2 = digits.slice(3, 6);
    const p3 = digits.slice(6, 9);
    const p4 = digits.slice(9, 11);
    return [p1, p2, p3].filter(Boolean).join(".") + (p4 ? `-${p4}` : "");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const telefoneLimpo = telefone.replace(/\D/g, "");
    const cpfLimpo = cpf.replace(/\D/g, "");
    const response = await fetch("/api/public/meus-agendamentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telefone: telefoneLimpo, cpf: cpfLimpo }),
    });
    if (response.ok) {
      const data = await response.json();
      setAgendamentos(data.agendamentos ?? []);
      setMessage(null);
    } else {
      const data = await response.json();
      setMessage(data.error ?? "Dados não conferem.");
      setAgendamentos([]);
    }
  };
  const openDetalhe = async (id: string) => {
    setOpen(true);
    setLoadingDetalhe(true);
    setDetalhe(null);
    try {
      const res = await fetch(`/api/public/agendamentos?id=${id}`);
      const data = await res.json();
      if (res.ok) {
        setDetalhe(data.data);
      } else {
        setMessage(data.error ?? "Erro ao carregar detalhes.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Erro ao carregar detalhes.");
    } finally {
      setLoadingDetalhe(false);
    }
  };

  return (
    <div className="min-h-screen bg-background/70">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <PageHeader
          title="Meus agendamentos"
          description="Consulte seus horários futuros e histórico informando telefone e CPF."
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-brand-primary/30">
            <CardHeader>
              <CardTitle>Verificar</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    name="telefone"
                    placeholder="(11) 99999-9999"
                    value={telefone}
                    onChange={(e) => setTelefone(formatPhone(e.target.value))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>CPF</Label>
                  <Input
                    name="cpf"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(formatCpf(e.target.value))}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Consultar
                </Button>
                {message && (
                  <div className="rounded-xl border border-brand-primary/30 bg-brand-primary/10 px-3 py-2 text-sm text-brand-deep">
                    {message}
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          <Card className="border-brand-primary/20">
            <CardHeader>
              <CardTitle>Resultados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!agendamentos.length && (
                <p className="text-sm text-foreground/70">
                  Preencha seus dados para visualizar seus agendamentos.
                </p>
              )}
              {agendamentos.map((ag) => (
                <div
                  key={ag.id}
                  className="rounded-2xl border border-border/70 bg-white/90 px-4 py-3 cursor-pointer transition hover:border-brand-primary/60"
                  onClick={() => openDetalhe(ag.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-brand-deep">
                        {formatDate(ag.data)} às {ag.hora}
                      </p>
                      <p className="text-xs text-foreground/70">
                        {ag.animais?.nome} •{" "}
                        {(ag.agendamento_servicos ?? [])
                          .map((s) => s.servicos?.nome)
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                    <Badge>{ag.status}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do agendamento</DialogTitle>
          </DialogHeader>
          {loadingDetalhe && <p className="text-sm text-foreground/70">Carregando...</p>}
          {!loadingDetalhe && detalhe && (
            <div className="space-y-3">
              <div className="rounded-xl border border-border/70 bg-white/80 px-3 py-2 text-sm">
                <p className="font-semibold text-brand-deep">
                  {formatDate(detalhe.data)} às {detalhe.hora}
                </p>
                <p className="text-foreground/70">
                  Cliente: {detalhe.clientes?.nome ?? "-"} · Telefone: {detalhe.clientes?.telefone1 ?? "-"}
                </p>
                <p className="text-foreground/70">Pet: {detalhe.animais?.nome ?? "-"}</p>
                <p className="text-foreground/70">Status: {detalhe.status}</p>
                <p className="text-foreground/70">
                  Valor total do agendamento:{" "}
                  {detalhe.valor_total != null ? formatCurrency(detalhe.valor_total) : "-"}
                </p>
                {detalhe.observacoes && (
                  <p className="text-foreground/70">Observações: {detalhe.observacoes}</p>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-brand-deep">Serviços</p>
                <ul className="space-y-1 text-sm text-foreground/80">
                  {(detalhe.agendamento_servicos ?? []).map((s, idx) => (
                    <li key={`${s.servicos?.nome}-${idx}`}>• {s.servicos?.nome ?? "Serviço"}</li>
                  ))}
                </ul>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-brand-deep">Atendimento</p>
                {(detalhe.atendimentos ?? []).map((at) => (
                  <div key={at.id} className="space-y-1 rounded-lg border border-border/70 bg-white/80 p-3 text-sm">
                    <p>Valor total: {at.valor_total ? formatCurrency(at.valor_total) : "-"}</p>
                    <p>Forma de pagamento: {at.forma_pagamento ?? "-"}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {(at.atendimento_fotos ?? []).map((foto) => (
                        <a
                          key={foto.id}
                          href={foto.url_foto}
                          target="_blank"
                          rel="noreferrer"
                          className="overflow-hidden rounded-md border border-border/70"
                        >
                          <Image
                            src={foto.url_foto}
                            alt="Foto do atendimento"
                            width={200}
                            height={150}
                            className="h-24 w-full object-cover"
                          />
                        </a>
                      ))}
                      {!(at.atendimento_fotos ?? []).length && (
                        <span className="col-span-3 text-xs text-foreground/60">Sem fotos.</span>
                      )}
                    </div>
                  </div>
                ))}
                {!(detalhe.atendimentos ?? []).length && (
                  <p className="text-xs text-foreground/60">Atendimento ainda não registrado.</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}



