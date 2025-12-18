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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";

type Despesa = {
  id: string;
  descricao: string;
  categoria: string;
  valor: number;
  data_vencimento: string;
  data_pagamento?: string | null;
  conta_fixa_id?: string | null;
  observacoes?: string | null;
};

type FormState = {
  descricao: string;
  categoria: string;
  valor: number;
  data_vencimento: string;
  data_pagamento: string;
  observacoes: string;
};

const initialFormState: FormState = {
  descricao: "",
  categoria: "",
  valor: 0,
  data_vencimento: "",
  data_pagamento: "",
  observacoes: "",
};

export default function DespesasPage() {
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [mesFiltro, setMesFiltro] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState<FormState>(initialFormState);

  const filtradas = useMemo(() => despesas, [despesas]);

  useEffect(() => {
    loadDespesas();
  }, []);

  async function loadDespesas() {
    setLoading(true);
    try {
      const res = await fetch("/api/despesas");
      const data = await res.json();
      if (res.ok) setDespesas(data.data ?? []);
      else setError(data.error ?? "Erro ao carregar despesas");
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar despesas");
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    setEditingId(null);
    setForm(initialFormState);
    setError(null);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        valor: Number(form.valor) || 0,
        data_pagamento: form.data_pagamento || null,
      };
      const res = await fetch("/api/despesas", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao salvar despesa");
        return;
      }
      resetForm();
      setOpenModal(false);
      loadDespesas();
    } catch (err) {
      console.error(err);
      setError("Erro ao salvar despesa");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Deseja excluir esta despesa?")) return;
    try {
      const res = await fetch("/api/despesas", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        await loadDespesas();
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Despesas e contas fixas"
        description="Controle de despesas, vencimentos e integracao com o caixa."
        actions={(
          <Button onClick={() => { resetForm(); setOpenModal(true); }}>
            Nova despesa
          </Button>
        )}
      />

      <Card className="border-brand-primary/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Proximos vencimentos</CardTitle>
          <Input
            type="month"
            className="w-40"
            value={mesFiltro}
            onChange={(e) => setMesFiltro(e.target.value)}
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
                <TableHead>Descricao</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm">
                    Carregando...
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                filtradas
                  .filter((d) => {
                    if (!mesFiltro) return true;
                    return d.data_vencimento.startsWith(mesFiltro);
                  })
                  .map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-semibold text-brand-deep">
                        {item.descricao}
                      </TableCell>
                      <TableCell>{item.categoria}</TableCell>
                      <TableCell>{formatDate(item.data_vencimento)}</TableCell>
                      <TableCell>{formatCurrency(item.valor)}</TableCell>
                      <TableCell>
                        <Badge variant={item.data_pagamento ? "success" : "warning"}>
                          {item.data_pagamento ? "Pago" : "Em aberto"}
                        </Badge>
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingId(item.id);
                            setForm({
                              descricao: item.descricao,
                              categoria: item.categoria,
                              valor: item.valor,
                              data_vencimento: item.data_vencimento,
                              data_pagamento: item.data_pagamento ?? "",
                              observacoes: item.observacoes ?? "",
                            });
                            setOpenModal(true);
                          }}
                        >
                          Editar
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                          Excluir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              {!loading && !filtradas.length && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-foreground/70">
                    Nenhuma despesa encontrada.
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
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar despesa" : "Nova despesa"}</DialogTitle>
          </DialogHeader>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label>Descricao</Label>
              <Input
                placeholder="Ex.: aluguel, agua, insumos"
                value={form.descricao}
                onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <select
                className="h-11 w-full rounded-xl border border-input bg-white px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.categoria}
                onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
                required
              >
                <option value="">Selecione</option>
                <option value="Fixa">Fixa</option>
                <option value="Insumos">Insumos</option>
                <option value="Variavel">Variavel</option>
                <option value="Contas">Contas</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Valor</Label>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  value={form.valor}
                  onChange={(e) => setForm((f) => ({ ...f, valor: Number(e.target.value) }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Vencimento</Label>
                <Input
                  type="date"
                  value={form.data_vencimento}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, data_vencimento: e.target.value }))
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Pagamento (opcional)</Label>
              <Input
                type="date"
                value={form.data_pagamento}
                onChange={(e) => setForm((f) => ({ ...f, data_pagamento: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Observacoes</Label>
              <Input
                placeholder="Observacoes"
                value={form.observacoes}
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
                {saving ? "Salvando..." : editingId ? "Atualizar" : "Salvar"}
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
