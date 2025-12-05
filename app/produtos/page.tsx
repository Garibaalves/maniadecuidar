"use client";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Produto } from "@/types";
import { useEffect, useMemo, useState } from "react";

type FormState = Partial<Produto>;

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [form, setForm] = useState<FormState>({ ativo: true, estoque_atual: 0 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const filtrados = useMemo(() => {
    if (!search) return produtos;
    const q = search.toLowerCase();
    return produtos.filter(
      (p) =>
        p.nome.toLowerCase().includes(q) ||
        (p.sku ?? "").toLowerCase().includes(q)
    );
  }, [produtos, search]);

  useEffect(() => {
    loadProdutos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadProdutos() {
    setLoading(true);
    try {
      const res = await fetch(`/api/produtos${search ? `?search=${encodeURIComponent(search)}` : ""}`);
      const data = await res.json();
      if (res.ok) setProdutos(data.data ?? []);
      else setError(data.error ?? "Erro ao carregar produtos");
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        nome: form.nome ?? "",
        descricao: form.descricao ?? "",
        sku: form.sku ?? "",
        unidade: form.unidade ?? "",
        preco_venda: Number(form.preco_venda) || 0,
        preco_custo: form.preco_custo != null ? Number(form.preco_custo) : null,
        estoque_atual: Number(form.estoque_atual) || 0,
        ativo: form.ativo ?? true,
      };
      const res = await fetch("/api/produtos", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao salvar produto");
        return;
      }
      setForm({ ativo: true, estoque_atual: 0 });
      setEditingId(null);
      loadProdutos();
    } catch (err) {
      console.error(err);
      setError("Erro ao salvar produto");
    } finally {
      setSaving(false);
    }
  }

  async function toggleAtivo(produto: Produto) {
    setSaving(true);
    try {
      await fetch("/api/produtos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...produto, ativo: !produto.ativo }),
      });
      loadProdutos();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  const handleEdit = (p: Produto) => {
    setEditingId(p.id);
    setForm(p);
  };

  return (
    <AppShell>
      <PageHeader
        title="Produtos"
        description="Gerencie catálogo, estoque inicial e status dos produtos."
      />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border-brand-primary/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Lista de produtos</CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="Buscar por nome ou SKU"
                className="w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onBlur={loadProdutos}
              />
              <Button variant="outline" onClick={loadProdutos}>Atualizar</Button>
            </div>
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
                  <TableHead>SKU</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Estoque</TableHead>
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
                {!loading && filtrados.map((produto) => (
                  <TableRow key={produto.id}>
                    <TableCell className="font-semibold text-brand-deep">{produto.nome}</TableCell>
                    <TableCell>{produto.sku ?? "-"}</TableCell>
                    <TableCell>R$ {produto.preco_venda?.toFixed(2)}</TableCell>
                    <TableCell>{produto.estoque_atual} un</TableCell>
                    <TableCell>
                      <Badge variant={produto.ativo ? "success" : "danger"}>
                        {produto.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(produto)}>
                        Editar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => toggleAtivo(produto)}>
                        {produto.ativo ? "Inativar" : "Ativar"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && !filtrados.length && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-foreground/70">
                      Nenhum produto encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-brand-primary/30">
          <CardHeader>
            <CardTitle>{editingId ? "Editar produto" : "Novo produto"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  placeholder="Shampoo, Coleira..."
                  value={form.nome ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  placeholder="Detalhes do produto"
                  value={form.descricao ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>SKU / Código</Label>
                  <Input
                    placeholder="ABC-123"
                    value={form.sku ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unidade</Label>
                  <Select
                    value={form.unidade ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, unidade: e.target.value }))}
                    className="w-full"
                  >
                    <option value="">Selecione</option>
                    <option value="un">un</option>
                    <option value="ml">ml</option>
                    <option value="kg">kg</option>
                    <option value="l">l</option>
                    <option value="m">m</option>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Preço de venda (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    value={form.preco_venda ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, preco_venda: Number(e.target.value) }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preço de custo (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    value={form.preco_custo ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, preco_custo: Number(e.target.value) }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Estoque atual</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.estoque_atual ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, estoque_atual: Number(e.target.value) }))
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="ativo_produto"
                  type="checkbox"
                  className="h-4 w-4 accent-brand-primary"
                  checked={form.ativo ?? true}
                  onChange={(e) => setForm((f) => ({ ...f, ativo: e.target.checked }))}
                />
                <Label htmlFor="ativo_produto">Produto ativo</Label>
              </div>
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}
              <div className="flex gap-3">
                <Button type="submit" className="flex-1" disabled={saving}>
                  {saving ? "Salvando..." : editingId ? "Atualizar" : "Salvar produto"}
                </Button>
                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingId(null);
                      setForm({ ativo: true, estoque_atual: 0 });
                    }}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
