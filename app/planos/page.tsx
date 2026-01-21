"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { type Plano, type Servico } from "@/types";

type FormServico = { servico_id: string; quantidade: number };

type FormState = {
  id?: string;
  nome?: string;
  descricao?: string | null;
  intervalo_dias?: number;
  valor?: number;
  ativo?: boolean;
  servicos: FormServico[];
};

const initialFormState: FormState = {
  ativo: true,
  intervalo_dias: 30,
  valor: 0,
  servicos: [],
};

export default function PlanosPage() {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);

  const filtrados = useMemo(() => {
    if (!search) return planos;
    const q = search.toLowerCase();
    return planos.filter((p) => p.nome.toLowerCase().includes(q));
  }, [planos, search]);

  useEffect(() => {
    void loadPlanos();
    void loadServicos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadPlanos() {
    setLoading(true);
    try {
      const res = await fetch(`/api/planos${search ? `?search=${encodeURIComponent(search)}` : ""}`);
      const data = await res.json();
      if (res.ok) setPlanos(data.data ?? []);
      else setError(data.error ?? "Erro ao carregar planos");
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar planos");
    } finally {
      setLoading(false);
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

  const resetForm = () => {
    setForm(initialFormState);
    setEditingId(null);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        nome: form.nome ?? "",
        descricao: form.descricao ?? "",
        intervalo_dias: Number(form.intervalo_dias) || 1,
        valor: Number(form.valor) || 0,
        ativo: form.ativo ?? true,
        servicos: (form.servicos ?? []).map((s: FormServico) => ({
          servico_id: s.servico_id,
          quantidade: s.quantidade ?? 1,
        })),
      };
      const res = await fetch("/api/planos", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao salvar plano");
        return;
      }
      resetForm();
      setOpenModal(false);
      void loadPlanos();
    } catch (err) {
      console.error(err);
      setError("Erro ao salvar plano");
    } finally {
      setSaving(false);
    }
  }

  async function toggleAtivo(plano: Plano) {
    setSaving(true);
    try {
      await fetch("/api/planos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: plano.id,
          nome: plano.nome,
          descricao: plano.descricao,
          intervalo_dias: plano.intervalo_dias,
          valor: plano.valor,
          ativo: !plano.ativo,
          servicos: (plano.plano_servicos ?? []).map((s) => ({
            servico_id: s.servico_id,
            quantidade: s.quantidade ?? 1,
          })),
        }),
      });
      void loadPlanos();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  const handleEdit = (plano: Plano) => {
    setEditingId(plano.id);
    setForm({
      id: plano.id,
      nome: plano.nome,
      descricao: plano.descricao ?? "",
      intervalo_dias: plano.intervalo_dias,
      valor: plano.valor,
      ativo: plano.ativo,
      servicos: (plano.plano_servicos ?? []).map((s) => ({
        servico_id: s.servico_id,
        quantidade: s.quantidade ?? 1,
      })),
    });
    setOpenModal(true);
  };

  const handleDelete = async (plano: Plano) => {
    const confirmed = window.confirm(`Deseja excluir o plano ${plano.nome}?`);
    if (!confirmed) return;
    setDeletingId(plano.id);
    setError(null);
    try {
      const res = await fetch("/api/planos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: plano.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao excluir plano");
        return;
      }
      void loadPlanos();
    } catch (err) {
      console.error(err);
      setError("Erro ao excluir plano");
    } finally {
      setDeletingId(null);
    }
  };

  const isServicoSelecionado = (id: string) =>
    (form.servicos ?? []).some((s) => s.servico_id === id);

  const toggleServico = (id: string, checked: boolean) => {
    setForm((prev) => {
      const atuais = prev.servicos ?? [];
      if (checked && !atuais.find((s) => s.servico_id === id)) {
        return { ...prev, servicos: [...atuais, { servico_id: id, quantidade: 1 }] };
      }
      if (!checked) {
        return { ...prev, servicos: atuais.filter((s) => s.servico_id !== id) };
      }
      return prev;
    });
  };

  const updateQuantidade = (id: string, quantidade: number) => {
    setForm((prev) => {
      const atuais = prev.servicos ?? [];
      return {
        ...prev,
        servicos: atuais.map((s: FormServico) =>
          s.servico_id === id ? { ...s, quantidade: quantidade || 1 } : s
        ),
      };
    });
  };

  const renderServicosSelecionados = (lista?: Array<{ servico_id: string; quantidade?: number }>) =>
    (lista ?? [])
      .map((s) => {
        const servico = servicos.find((sv) => sv.id === s.servico_id);
        return servico ? `${servico.nome} (x${s.quantidade ?? 1})` : undefined;
      })
      .filter(Boolean)
      .join(", ");

  return (
    <AppShell>
      <PageHeader
        title="Planos"
        description="Gerencie planos recorrentes e serviços inclusos."
        actions={(
          <>
            <Button onClick={() => { resetForm(); setOpenModal(true); }}>
              Novo plano
            </Button>
            <Button variant="outline" onClick={() => void loadPlanos()}>
              Atualizar
            </Button>
          </>
        )}
      />

      <Card className="border-brand-primary/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Lista de planos</CardTitle>
          <Input
            placeholder="Buscar por nome"
            className="w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onBlur={() => void loadPlanos()}
          />
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Recorrência</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Serviços inclusos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm">Carregando...</TableCell>
                </TableRow>
              )}
              {!loading && filtrados.map((plano) => (
                <TableRow key={plano.id}>
                  <TableCell className="font-semibold text-brand-deep">{plano.nome}</TableCell>
                  <TableCell>{plano.intervalo_dias} dias</TableCell>
                  <TableCell>R$ {plano.valor?.toFixed(2)}</TableCell>
                  <TableCell className="text-sm">
                    {renderServicosSelecionados(plano.plano_servicos) || "Nenhum serviço incluído"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={plano.ativo ? "success" : "danger"}>
                      {plano.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(plano)}>
                      Editar
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => void toggleAtivo(plano)}>
                      {plano.ativo ? "Inativar" : "Ativar"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                      disabled={deletingId === plano.id}
                      onClick={() => void handleDelete(plano)}
                    >
                      {deletingId === plano.id ? "Excluindo..." : "Excluir"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && !filtrados.length && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-foreground/70">
                    Nenhum plano encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={openModal}
        onOpenChange={(open) => {
          setOpenModal(open);
          if (!open) {
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar plano" : "Novo plano"}</DialogTitle>
          </DialogHeader>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                placeholder="Plano mensal, semanal..."
                value={form.nome ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                placeholder="O que está incluso, observações..."
                value={form.descricao ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-2">
                <Label>Recorrência (dias)</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.intervalo_dias ?? 1}
                  onChange={(e) => setForm((f) => ({ ...f, intervalo_dias: Number(e.target.value) }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Valor do plano (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  value={form.valor ?? 0}
                  onChange={(e) => setForm((f) => ({ ...f, valor: Number(e.target.value) }))}
                  required
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  id="ativo"
                  type="checkbox"
                  className="h-4 w-4 accent-brand-primary"
                  checked={form.ativo ?? true}
                  onChange={(e) => setForm((f) => ({ ...f, ativo: e.target.checked }))}
                />
                <Label htmlFor="ativo">Plano ativo</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Serviços incluídos</Label>
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto rounded-xl border border-border/70 p-3">
                {servicos.map((s) => {
                  const selecionado = isServicoSelecionado(s.id);
                  const quantidade =
                    (form.servicos ?? []).find((item) => item.servico_id === s.id)?.quantidade ?? 1;
                  return (
                    <div key={s.id} className="flex items-center gap-3">
                      <input
                        id={`serv-${s.id}`}
                        type="checkbox"
                        className="h-4 w-4 accent-brand-primary"
                        checked={selecionado}
                        onChange={(e) => toggleServico(s.id, e.target.checked)}
                      />
                      <div className="flex-1">
                        <Label htmlFor={`serv-${s.id}`} className="font-semibold">
                          {s.nome}
                        </Label>
                        <div className="text-xs text-foreground/70">
                          Valor padrão: R$ {s.valor_padrao?.toFixed(2)}
                        </div>
                      </div>
                      {selecionado && (
                        <Input
                          type="number"
                          min={1}
                          className="w-20"
                          value={quantidade}
                          onChange={(e) =>
                            updateQuantidade(s.id, Number(e.target.value) || 1)
                          }
                        />
                      )}
                    </div>
                  );
                })}
                {!servicos.length && (
                  <div className="col-span-2 text-sm text-foreground/70">
                    Cadastre serviços para vinculá-los aos planos.
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="flex gap-3">
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving ? "Salvando..." : editingId ? "Atualizar" : "Salvar plano"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpenModal(false);
                  resetForm();
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
