"use client";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
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
import { Animal, Cliente, Servico } from "@/types";
import { CalendarClock, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type AgendamentoRow = {
  id: string;
  data: string;
  hora: string;
  status: string;
  clientes?: Cliente;
  animais?: Animal;
  agendamento_servicos?: { servicos?: { nome: string } | null }[];
  observacoes?: string | null;
};

type FormState = {
  cliente_id?: string;
  animal_id?: string;
  servicos: { servico_id: string; valor?: number }[];
  hora?: string;
  observacoes?: string;
};

const initialFormState: FormState = {
  servicos: [],
  hora: "",
};

export default function AgendaPage() {
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().slice(0, 10));
  const [statusFiltro, setStatusFiltro] = useState<string>("");
  const [agendamentos, setAgendamentos] = useState<AgendamentoRow[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [openModal, setOpenModal] = useState(false);

  const valorTotal = useMemo(() => {
    return (form.servicos ?? []).reduce((acc, item) => {
      const base = servicos.find((s) => s.id === item.servico_id);
      const valor = item.valor != null && !Number.isNaN(item.valor)
        ? item.valor
        : base?.valor_padrao ?? 0;
      return acc + valor;
    }, 0);
  }, [form.servicos, servicos]);

  const agendamentosFiltrados = useMemo(() => agendamentos, [agendamentos]);
  const hojeFormatado = useMemo(() => formatDate(dataSelecionada), [dataSelecionada]);

  useEffect(() => {
    loadAgendamentos();
    loadClientes();
    loadServicos();
    loadHorarios(dataSelecionada);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (dataSelecionada) {
      loadAgendamentos();
      loadHorarios();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSelecionada, statusFiltro]);

  useEffect(() => {
    if (form.cliente_id) {
      loadAnimais(form.cliente_id);
    } else {
      setAnimais([]);
      setForm((f) => ({ ...f, animal_id: undefined }));
    }
  }, [form.cliente_id]);

  const resetForm = () => {
    setForm(initialFormState);
  };

  async function loadAgendamentos() {
    setLoading(true);
    setActionError(null);
    try {
      const params = new URLSearchParams();
      if (dataSelecionada) params.append("data", dataSelecionada);
      if (statusFiltro) params.append("status", statusFiltro);
      const res = await fetch(`/api/agendamentos?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setAgendamentos(data.data ?? []);
      } else {
        setError(data.error ?? "Erro ao carregar agenda");
      }
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar agenda");
    } finally {
      setLoading(false);
    }
  }

  async function loadClientes() {
    try {
      const res = await fetch("/api/clientes?pageSize=200");
      const data = await res.json();
      if (res.ok) setClientes(data.data ?? []);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadAnimais(cliente_id: string) {
    try {
      const res = await fetch(`/api/animais?cliente_id=${cliente_id}`);
      const data = await res.json();
      if (res.ok) setAnimais(data.data ?? []);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadServicos() {
    try {
      const res = await fetch("/api/servicos?ativos=true");
      const data = await res.json();
      if (res.ok) setServicos(data.data ?? []);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadHorarios(dateOverride?: string) {
    try {
      const targetDate = dateOverride ?? dataSelecionada;
      if (!targetDate) return;
      const res = await fetch(`/api/public/horarios?data=${targetDate}`);
      const data = await res.json();
      setHorariosDisponiveis(data.slots ?? []);
    } catch (err) {
      console.error(err);
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.cliente_id || !form.animal_id || !form.hora) {
      setError("Preencha cliente, animal e horario");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/agendamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente_id: form.cliente_id,
          animal_id: form.animal_id,
          data: dataSelecionada,
          hora: form.hora,
          status: "AGENDADO",
          observacoes: form.observacoes,
          servicos: form.servicos.length
            ? form.servicos
            : servicos.slice(0, 1).map((s) => ({ servico_id: s.id })),
          valor_total: valorTotal,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao salvar agendamento");
        return;
      }
      resetForm();
      setOpenModal(false);
      loadAgendamentos();
      loadHorarios();
    } catch (err) {
      console.error(err);
      setError("Erro ao salvar agendamento");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja excluir este agendamento?")) return;
    setActionError(null);
    try {
      const res = await fetch(`/api/agendamentos?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error ?? "Erro ao excluir agendamento");
        return;
      }
      loadAgendamentos();
      loadHorarios();
    } catch (err) {
      console.error(err);
      setActionError("Erro ao excluir agendamento");
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Agenda"
        description={`Agendamentos do dia ${hojeFormatado}`}
        actions={
          <>
            <Button onClick={() => { resetForm(); setOpenModal(true); }}>
              <Plus className="h-4 w-4" /> Novo agendamento
            </Button>
            <Button variant="outline" asChild>
              <a href="/agenda/config">Configurar agenda</a>
            </Button>
          </>
        }
      />

      <Card className="border-brand-primary/20">
        <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Agenda do dia</CardTitle>
            <p className="text-sm text-foreground/70">
              Horarios reais da configuracao e agendamentos existentes.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              type="date"
              value={dataSelecionada}
              onChange={(e) => {
                const val = e.target.value;
                setDataSelecionada(val);
                setForm((f) => ({ ...f, hora: "" }));
                loadHorarios(val);
              }}
              className="w-40"
            />
            <Select
              className="w-40"
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
            >
              <option value="">Todos status</option>
              <option value="AGENDADO">Agendado</option>
              <option value="EM_ATENDIMENTO">Em atendimento</option>
              <option value="CONCLUIDO">Concluido</option>
              <option value="CANCELADO">Cancelado</option>
              <option value="NAO_COMPARECEU">Nao compareceu</option>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {actionError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {actionError}
            </div>
          )}
          {loading && (
            <div className="text-sm text-foreground/70">Carregando agendamentos...</div>
          )}
          {!loading &&
            agendamentosFiltrados.map((slot) => (
              <div
                key={slot.id}
                className="flex items-center justify-between rounded-2xl border border-border/70 bg-white/90 px-4 py-3 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                    <CalendarClock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brand-deep">
                      {slot.hora} - {slot.clientes?.nome ?? "Cliente"} ({slot.animais?.nome ?? "Pet"})
                    </p>
                    <p className="text-xs text-foreground/70">
                      {(slot.agendamento_servicos ?? [])
                        .map((s) => s.servicos?.nome)
                        .filter(Boolean)
                        .join(", ") || "Servico nao informado"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      slot.status === "EM_ATENDIMENTO"
                        ? "warning"
                        : slot.status === "CONCLUIDO"
                        ? "success"
                        : slot.status === "CANCELADO"
                        ? "danger"
                        : "default"
                    }
                  >
                    {slot.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(slot.id)}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          {!loading && !agendamentosFiltrados.length && (
            <div className="rounded-xl border border-border/70 bg-white/90 px-4 py-3 text-sm text-foreground/70">
              Nenhum agendamento para este dia.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={openModal}
        onOpenChange={(open) => {
          setOpenModal(open);
          if (!open) {
            resetForm();
            setError(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo agendamento</DialogTitle>
          </DialogHeader>
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
              <Label>Cliente</Label>
              <Select
                value={form.cliente_id ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, cliente_id: e.target.value, animal_id: "" }))
                }
                className="w-full"
              >
                <option value="">Selecione</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome} - {c.telefone1}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Animal</Label>
              <Select
                value={form.animal_id ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, animal_id: e.target.value }))}
                className="w-full"
                disabled={!form.cliente_id}
              >
                <option value="">Selecione</option>
                {animais.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome} ({a.especie})
                  </option>
                ))}
              </Select>
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
                      {servicos.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nome}
                        </option>
                      ))}
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
            <div className="flex gap-3">
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpenModal(false);
                  resetForm();
                  setError(null);
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
