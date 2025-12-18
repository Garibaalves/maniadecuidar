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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Servico } from "@/types";
import { useEffect, useMemo, useState } from "react";

type FormState = Partial<Servico>;

const initialFormState: FormState = { ativo: true };

export default function ServicosPage() {
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
    if (!search) return servicos;
    const q = search.toLowerCase();
    return servicos.filter((s) => s.nome.toLowerCase().includes(q));
  }, [servicos, search]);

  useEffect(() => {
    loadServicos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadServicos() {
    setLoading(true);
    try {
      const res = await fetch(`/api/servicos${search ? `?search=${encodeURIComponent(search)}` : ""}`);
      const data = await res.json();
      if (res.ok) setServicos(data.data ?? []);
      else setError(data.error ?? "Erro ao carregar servicos");
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar servicos");
    } finally {
      setLoading(false);
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
        duracao_minutos: Number(form.duracao_minutos) || 0,
        valor_padrao: Number(form.valor_padrao) || 0,
        ativo: form.ativo ?? true,
      };
      const res = await fetch("/api/servicos", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao salvar servico");
        return;
      }
      resetForm();
      setOpenModal(false);
      loadServicos();
    } catch (err) {
      console.error(err);
      setError("Erro ao salvar servico");
    } finally {
      setSaving(false);
    }
  }

  async function toggleAtivo(servico: Servico) {
    setSaving(true);
    try {
      await fetch("/api/servicos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...servico, ativo: !servico.ativo }),
      });
      loadServicos();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  const handleEdit = (s: Servico) => {
    setEditingId(s.id);
    setForm(s);
    setOpenModal(true);
  };

  const handleDelete = async (servico: Servico) => {
    const confirmed = window.confirm(`Deseja excluir o servico ${servico.nome}?`);
    if (!confirmed) return;
    setDeletingId(servico.id);
    setError(null);
    try {
      const res = await fetch("/api/servicos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: servico.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao excluir servico");
        return;
      }
      loadServicos();
    } catch (err) {
      console.error(err);
      setError("Erro ao excluir servico");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Servicos"
        description="Cadastre, edite e ative/inative servicos oferecidos."
        actions={(
          <>
            <Button onClick={() => { resetForm(); setOpenModal(true); }}>
              Novo servico
            </Button>
            <Button variant="outline" onClick={loadServicos}>
              Atualizar
            </Button>
          </>
        )}
      />

      <Card className="border-brand-primary/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Lista de servicos</CardTitle>
          <Input
            placeholder="Buscar por nome"
            className="w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onBlur={loadServicos}
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
                <TableHead>Duracao</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm">Carregando...</TableCell>
                </TableRow>
              )}
              {!loading && filtrados.map((servico) => (
                <TableRow key={servico.id}>
                  <TableCell className="font-semibold text-brand-deep">{servico.nome}</TableCell>
                  <TableCell>{servico.duracao_minutos} min</TableCell>
                  <TableCell>R$ {servico.valor_padrao?.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={servico.ativo ? "success" : "danger"}>
                      {servico.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(servico)}>
                      Editar
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => toggleAtivo(servico)}>
                      {servico.ativo ? "Inativar" : "Ativar"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                      disabled={deletingId === servico.id}
                      onClick={() => handleDelete(servico)}
                    >
                      {deletingId === servico.id ? "Excluindo..." : "Excluir"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && !filtrados.length && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-foreground/70">
                    Nenhum servico encontrado.
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
            <DialogTitle>{editingId ? "Editar servico" : "Novo servico"}</DialogTitle>
          </DialogHeader>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                placeholder="Banho, Tosa, Hidratacao"
                value={form.nome ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Descricao</Label>
              <Input
                placeholder="Detalhes, observacoes..."
                value={form.descricao ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Duracao (min)</Label>
                <Input
                  type="number"
                  min={5}
                  step={5}
                  value={form.duracao_minutos ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, duracao_minutos: Number(e.target.value) }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Valor padrao (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  value={form.valor_padrao ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, valor_padrao: Number(e.target.value) }))
                  }
                  required
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="ativo"
                type="checkbox"
                className="h-4 w-4 accent-brand-primary"
                checked={form.ativo ?? true}
                onChange={(e) => setForm((f) => ({ ...f, ativo: e.target.checked }))}
              />
              <Label htmlFor="ativo">Servico ativo</Label>
            </div>
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="flex gap-3">
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving ? "Salvando..." : editingId ? "Atualizar" : "Salvar servico"}
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
