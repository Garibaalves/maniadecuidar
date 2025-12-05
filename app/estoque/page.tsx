"use client";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Produto } from "@/types";
import { useEffect, useMemo, useState } from "react";

type Movimento = {
  id: string;
  produto_id: string;
  tipo: "ENTRADA" | "SAIDA";
  quantidade: number;
  motivo?: string | null;
  referencia_tabela?: string | null;
  referencia_id?: string | null;
  created_at: string;
  produtos?: Produto;
};

export default function EstoquePage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [movimentos, setMovimentos] = useState<Movimento[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<{
    produto_id?: string;
    tipo: "ENTRADA" | "SAIDA";
    quantidade: number;
    motivo: string;
  }>({
    produto_id: "",
    tipo: "ENTRADA",
    quantidade: 0,
    motivo: "",
  });

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
    loadMovimentos();
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

  async function loadMovimentos() {
    try {
      const res = await fetch("/api/estoque");
      const data = await res.json();
      if (res.ok) setMovimentos(data.data ?? []);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.produto_id || !form.quantidade) {
      setError("Selecione produto e quantidade");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/estoque", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao registrar movimentação");
        return;
      }
      setForm({ produto_id: "", tipo: "ENTRADA", quantidade: 0, motivo: "" });
      loadProdutos();
      loadMovimentos();
    } catch (err) {
      console.error(err);
      setError("Erro ao registrar movimentação");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Estoque"
        description="Controle de produtos, entradas e saídas automáticas por atendimento."
      />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border-brand-primary/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Produtos</CardTitle>
            <Input
              placeholder="Buscar por nome ou SKU"
              className="w-72"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onBlur={loadProdutos}
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
                  <TableHead>Produto</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Estoque</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm">
                      Carregando...
                    </TableCell>
                  </TableRow>
                )}
                {!loading &&
                  filtrados.map((produto) => (
                    <TableRow key={produto.id}>
                      <TableCell className="font-semibold text-brand-deep">
                        {produto.nome}
                      </TableCell>
                      <TableCell>{produto.sku ?? "-"}</TableCell>
                      <TableCell>{formatCurrency(produto.preco_venda)}</TableCell>
                      <TableCell>
                        <Badge variant={produto.estoque_atual < 10 ? "warning" : "success"}>
                          {produto.estoque_atual} {produto.unidade ?? "un"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                {!loading && !filtrados.length && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-foreground/70">
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
            <CardTitle>Movimentar estoque</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <form className="space-y-3" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label>Produto</Label>
                <Select
                  value={form.produto_id ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, produto_id: e.target.value }))}
                  className="w-full"
                >
                  <option value="">Selecione</option>
                  {produtos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} — {p.sku ?? "sem SKU"}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={form.tipo}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, tipo: e.target.value as "ENTRADA" | "SAIDA" }))
                  }
                  className="w-full"
                >
                  <option value="ENTRADA">Entrada</option>
                  <option value="SAIDA">Saída</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.quantidade}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, quantidade: Number(e.target.value) }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Motivo</Label>
                <Input
                  placeholder="Compra, uso em atendimento..."
                  value={form.motivo}
                  onChange={(e) => setForm((f) => ({ ...f, motivo: e.target.value }))}
                  required
                />
              </div>
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Salvando..." : "Registrar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card className="border-brand-primary/20">
          <CardHeader>
            <CardTitle>Movimentações recentes</CardTitle>
            <p className="text-sm text-foreground/70">
              Últimas entradas e saídas registradas.
            </p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Qtd</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movimentos.map((mov) => (
                  <TableRow key={mov.id}>
                    <TableCell>{formatDate(mov.created_at)}</TableCell>
                    <TableCell>{mov.produtos?.nome ?? "-"}</TableCell>
                    <TableCell>
                      <Badge variant={mov.tipo === "ENTRADA" ? "success" : "danger"}>
                        {mov.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell>{mov.quantidade}</TableCell>
                    <TableCell className="text-sm text-foreground/70">
                      {mov.motivo ?? "-"}
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          if (!confirm("Deseja excluir esta movimentação?")) return;
                          try {
                            await fetch("/api/estoque", {
                              method: "DELETE",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ id: mov.id }),
                            });
                            loadProdutos();
                            loadMovimentos();
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                      >
                        Excluir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!movimentos.length && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-foreground/70">
                      Nenhuma movimentação encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
