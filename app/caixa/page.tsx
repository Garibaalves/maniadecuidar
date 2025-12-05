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
import { useEffect, useMemo, useState } from "react";

type Movimento = {
  id: string;
  data: string;
  tipo: "ENTRADA" | "SAIDA";
  categoria: string;
  forma_pagamento: "PIX" | "DINHEIRO" | "DEBITO" | "CREDITO" | "OUTROS";
  valor: number;
  descricao?: string | null;
};

export default function CaixaPage() {
  const [movimentos, setMovimentos] = useState<Movimento[]>([]);
  const [inicio, setInicio] = useState<string>("");
  const [fim, setFim] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<{
    data: string;
    tipo: "ENTRADA" | "SAIDA";
    categoria: string;
    forma_pagamento: Movimento["forma_pagamento"];
    valor: number;
    descricao?: string;
  }>({
    data: new Date().toISOString(),
    tipo: "ENTRADA",
    categoria: "",
    forma_pagamento: "PIX",
    valor: 0,
    descricao: "",
  });

  const totalEntradas = useMemo(
    () => movimentos.filter((m) => m.tipo === "ENTRADA").reduce((a, b) => a + b.valor, 0),
    [movimentos]
  );
  const totalSaidas = useMemo(
    () => movimentos.filter((m) => m.tipo === "SAIDA").reduce((a, b) => a + b.valor, 0),
    [movimentos]
  );

  useEffect(() => {
    loadMovimentos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadMovimentos() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (inicio) params.append("inicio", inicio);
      if (fim) params.append("fim", fim);
      const res = await fetch(`/api/caixa?${params.toString()}`);
      const data = await res.json();
      if (res.ok) setMovimentos(data.data ?? []);
      else setError(data.error ?? "Erro ao carregar caixa");
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar caixa");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/caixa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao salvar lançamento");
        return;
      }
      setForm((f) => ({ ...f, descricao: "", valor: 0 }));
      loadMovimentos();
    } catch (err) {
      console.error(err);
      setError("Erro ao salvar lançamento");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Deseja excluir este lançamento?")) return;
    try {
      await fetch("/api/caixa", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      await loadMovimentos();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Caixa"
        description="Movimentos de entrada e saída, categorias e formas de pagamento."
        actions={
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-brand-primary/10 px-3 py-2 text-sm">
              <span className="mr-3 font-semibold text-brand-deep">
                Entradas: {formatCurrency(totalEntradas)}
              </span>
              <span className="font-semibold text-brand-deep">
                Saídas: {formatCurrency(totalSaidas)}
              </span>
            </div>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border-brand-primary/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Movimentações</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Input
                type="date"
                className="w-40"
                value={inicio}
                onChange={(e) => setInicio(e.target.value)}
              />
              <Input
                type="date"
                className="w-40"
                value={fim}
                onChange={(e) => setFim(e.target.value)}
              />
              <Button variant="outline" onClick={loadMovimentos}>
                Filtrar
              </Button>
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
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Forma</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Ações</TableHead>
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
                  movimentos.map((mov) => (
                    <TableRow key={mov.id}>
                      <TableCell>{formatDate(mov.data)}</TableCell>
                      <TableCell>
                        <Badge variant={mov.tipo === "ENTRADA" ? "success" : "danger"}>
                          {mov.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell>{mov.categoria}</TableCell>
                      <TableCell>{mov.forma_pagamento}</TableCell>
                      <TableCell className="font-semibold text-brand-deep">
                        {formatCurrency(mov.valor)}
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(mov.id)}
                        >
                          Excluir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                {!loading && !movimentos.length && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-foreground/70">
                      Nenhum lançamento encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-brand-primary/30">
          <CardHeader>
            <CardTitle>Novo lançamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <form className="space-y-3" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label>Data</Label>
                <Input
                  type="datetime-local"
                  value={form.data}
                  onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={form.tipo}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, tipo: e.target.value as Movimento["tipo"] }))
                  }
                >
                  <option value="ENTRADA">ENTRADA</option>
                  <option value="SAIDA">SAIDA</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Input
                  placeholder="Atendimento, despesa..."
                  value={form.categoria}
                  onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
                  required
                />
              </div>
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
                <Label>Forma de pagamento</Label>
                <Select
                  value={form.forma_pagamento}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      forma_pagamento: e.target.value as Movimento["forma_pagamento"],
                    }))
                  }
                >
                  <option value="PIX">Pix</option>
                  <option value="DINHEIRO">Dinheiro</option>
                  <option value="DEBITO">Debito</option>
                  <option value="CREDITO">Credito</option>
                  <option value="OUTROS">Outros</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  placeholder="Observações"
                  value={form.descricao ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                />
              </div>
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
