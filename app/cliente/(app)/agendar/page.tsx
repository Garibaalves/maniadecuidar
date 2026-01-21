"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";

type Cliente = { id: string; nome: string };
type Animal = { id: string; nome: string; especie?: string | null };
type Servico = { id: string; nome: string; valor_padrao?: number | null };

type AssinaturaConsumo = {
  assinatura: {
    id: string;
    plano_id: string;
    plano_nome: string;
    data_ultimo_pagamento: string;
    data_vencimento: string;
  };
  servicos: {
    servico_id: string;
    nome: string;
    quantidade: number;
    consumidos: number;
    restantes: number;
  }[];
};

type FormState = {
  animal_id?: string;
  servicos: { servico_id: string; valor?: number }[];
  hora?: string;
  observacoes?: string;
  usar_assinatura?: boolean;
};

const initialFormState: FormState = {
  servicos: [],
  hora: "",
};

export default function ClienteAgendarPage() {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().slice(0, 10));
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);
  const [assinaturaInfo, setAssinaturaInfo] = useState<AssinaturaConsumo | null>(null);
  const [assinaturaLoading, setAssinaturaLoading] = useState(false);
  const [assinaturaError, setAssinaturaError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [successOpen, setSuccessOpen] = useState(false);

  const valorTotal = useMemo(() => {
    return (form.servicos ?? []).reduce((acc, item) => {
      const base = servicos.find((s) => s.id === item.servico_id);
      const valor = item.valor != null && !Number.isNaN(item.valor)
        ? item.valor
        : base?.valor_padrao ?? 0;
      return acc + valor;
    }, 0);
  }, [form.servicos, servicos]);

  const usarAssinatura = form.usar_assinatura === true && !!assinaturaInfo;
  const servicosDisponiveis = useMemo(() => {
    if (usarAssinatura && assinaturaInfo) {
      return assinaturaInfo.servicos.map((s) => ({
        id: s.servico_id,
        nome: s.nome,
        restantes: s.restantes,
        quantidade: s.quantidade,
      }));
    }
    return servicos.map((s) => ({
      id: s.id,
      nome: s.nome,
    }));
  }, [assinaturaInfo, servicos, usarAssinatura]);

  const loadHorarios = useCallback(async (dateOverride?: string) => {
    try {
      const targetDate = dateOverride ?? dataSelecionada;
      if (!targetDate) return;
      const res = await fetch(`/api/public/horarios?data=${targetDate}`);
      const data = await res.json();
      setHorariosDisponiveis(data.slots ?? []);
    } catch (err) {
      console.error(err);
    }
  }, [dataSelecionada]);

  useEffect(() => {
    fetch("/api/cliente/me")
      .then((res) => res.json())
      .then((data) => setCliente(data.data ?? null))
      .catch(() => setCliente(null));
  }, []);

  useEffect(() => {
    if (!cliente?.id) return;
    setLoading(true);
    Promise.all([
      fetch("/api/cliente/animais")
        .then((res) => res.json())
        .then((data) => setAnimais(data.data ?? [])),
      fetch("/api/public/servicos")
        .then((res) => res.json())
        .then((data) => setServicos(data.data ?? [])),
    ])
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [cliente?.id]);

  useEffect(() => {
    loadHorarios(dataSelecionada);
  }, [dataSelecionada, loadHorarios]);

  useEffect(() => {
    if (cliente?.id && dataSelecionada) {
      loadAssinaturaConsumo(cliente.id, dataSelecionada);
    }
  }, [cliente?.id, dataSelecionada]);

  useEffect(() => {
    if (assinaturaInfo) {
      setForm((f) => (f.usar_assinatura === undefined ? { ...f, usar_assinatura: true } : f));
    } else {
      setForm((f) => (f.usar_assinatura ? { ...f, usar_assinatura: false } : f));
    }
  }, [assinaturaInfo]);

  async function loadAssinaturaConsumo(clienteId: string, data: string) {
    setAssinaturaLoading(true);
    setAssinaturaError(null);
    try {
      const params = new URLSearchParams({ cliente_id: clienteId, data });
      const res = await fetch(`/api/assinaturas/consumo?${params.toString()}`);
      const payload = await res.json();
      if (!res.ok) {
        setAssinaturaError(payload.error ?? "Erro ao carregar assinatura");
        setAssinaturaInfo(null);
        return;
      }
      setAssinaturaInfo(payload.data ?? null);
    } catch (err) {
      console.error(err);
      setAssinaturaError("Erro ao carregar assinatura");
      setAssinaturaInfo(null);
    } finally {
      setAssinaturaLoading(false);
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.animal_id || !form.hora) {
      setError("Preencha pet e horario");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/cliente/agendamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          animal_id: form.animal_id,
          data: dataSelecionada,
          hora: form.hora,
          status: "AGENDADO",
          observacoes: form.observacoes,
          servicos: form.servicos.length
            ? form.servicos
            : servicosDisponiveis.slice(0, 1).map((s) => ({ servico_id: s.id })),
          usar_assinatura: form.usar_assinatura,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao salvar agendamento");
        return;
      }
      setForm(initialFormState);
      setSuccessOpen(true);
      loadHorarios();
    } catch (err) {
      console.error(err);
      setError("Erro ao salvar agendamento");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Novo agendamento"
        description={`Agende um horario para ${cliente?.nome ?? "voce"} em ${formatDate(dataSelecionada)}.`}
      />

      <Card className="border-brand-primary/20">
        <CardHeader>
          <CardTitle>Agendamento</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={dataSelecionada}
                onChange={(e) => {
                  const val = e.target.value;
                  setDataSelecionada(val);
                  setForm((f) => ({ ...f, hora: "" }));
                  loadHorarios(val);
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Horario disponivel</Label>
              <Select
                value={form.hora ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, hora: e.target.value }))}
                className="w-full"
              >
                <option value="">Selecione</option>
                {horariosDisponiveis.map((hora) => (
                  <option key={hora} value={hora}>
                    {hora}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Pet</Label>
              <Select
                value={form.animal_id ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, animal_id: e.target.value }))}
                className="w-full"
                disabled={loading}
              >
                <option value="">Selecione</option>
                {animais.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome} ({a.especie})
                  </option>
                ))}
              </Select>
            </div>

            <div className="rounded-xl border border-border/70 bg-white/90 px-4 py-3 text-sm">
              {assinaturaLoading && (
                <div className="text-foreground/70">Carregando assinatura...</div>
              )}
              {!assinaturaLoading && assinaturaError && (
                <div className="text-red-600">{assinaturaError}</div>
              )}
              {!assinaturaLoading && !assinaturaError && !assinaturaInfo && (
                <div className="text-foreground/70">Cliente sem assinatura ativa.</div>
              )}
              {!assinaturaLoading && assinaturaInfo && (
                <div className="space-y-2">
                  <div className="font-semibold text-brand-deep">
                    Assinatura ativa: {assinaturaInfo.assinatura.plano_nome}
                  </div>
                  <div className="text-xs text-foreground/70">
                    Periodo: {assinaturaInfo.assinatura.data_ultimo_pagamento} ate{" "}
                    {assinaturaInfo.assinatura.data_vencimento}
                  </div>
                  <div className="space-y-1 text-xs text-foreground/70">
                    {assinaturaInfo.servicos.map((s) => (
                      <div key={s.servico_id}>
                        {s.nome}: {s.restantes} restantes de {s.quantidade}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Label>Usar assinatura?</Label>
                    <Select
                      value={form.usar_assinatura ? "SIM" : "NAO"}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          usar_assinatura: e.target.value === "SIM",
                          servicos: [],
                        }))
                      }
                    >
                      <option value="SIM">Sim, usar pacote</option>
                      <option value="NAO">Nao, cobrar a parte</option>
                    </Select>
                    {!form.usar_assinatura && (
                      <div className="text-xs text-foreground/70">
                        Servicos serao cobrados fora do pacote.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Servicos</Label>
              <div className="space-y-2">
                {form.servicos.map((item, idx) => (
                  <div key={`${item.servico_id}-${idx}`} className="flex items-center gap-2">
                    <Select
                      value={item.servico_id}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          servicos: f.servicos.map((s, i) =>
                            i === idx ? { ...s, servico_id: e.target.value } : s
                          ),
                        }))
                      }
                      className="flex-1"
                    >
                      <option value="">Selecione</option>
                      {servicosDisponiveis.map((s) => {
                        const restantes = "restantes" in s ? s.restantes : undefined;
                        const quantidade = "quantidade" in s ? s.quantidade : undefined;
                        const label =
                          restantes != null
                            ? `${s.nome} (${restantes} de ${quantidade} restantes)`
                            : s.nome;
                        return (
                          <option key={s.id} value={s.id} disabled={restantes === 0}>
                            {label}
                          </option>
                        );
                      })}
                    </Select>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      placeholder="Valor opcional"
                      className="w-32"
                      value={item.valor ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          servicos: f.servicos.map((s, i) =>
                            i === idx ? { ...s, valor: Number(e.target.value) } : s
                          ),
                        }))
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          servicos: f.servicos.filter((_, i) => i !== idx),
                        }))
                      }
                    >
                      Remover
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      servicos: [...(f.servicos ?? []), { servico_id: "" }],
                    }))
                  }
                >
                  Adicionar servico
                </Button>
                <div className="text-right text-sm font-semibold text-brand-deep">
                  Total: R$ {valorTotal.toFixed(2)}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Observacoes</Label>
              <Input
                placeholder="Observacoes internas"
                value={form.observacoes ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
              />
            </div>
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "Salvando..." : "Salvar agendamento"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Agendamento realizado</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-foreground/70">
              Seu agendamento foi realizado e esta aguardando comissao da equipe do petshop.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => setSuccessOpen(false)} variant="outline" className="flex-1">
                Fechar
              </Button>
              <Button asChild className="flex-1">
                <a href="/cliente/agendamentos">Ver agendamentos</a>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
