"use client";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Cliente } from "@/types";
import { useEffect, useMemo, useState } from "react";
import { MessageCircle } from "lucide-react";

type FormState = Partial<Cliente> & { id?: string };

const cidadesOptions = [
  "Conselheiro Lafaiete",
  "Ouro Branco",
  "Congonhas",
  "Carandaí",
];

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<FormState>({
    estado: "MG",
    cidade: cidadesOptions[0],
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search) return clientes;
    const q = search.toLowerCase();
    return clientes.filter(
      (c) =>
        c.nome.toLowerCase().includes(q) ||
        c.telefone1.toLowerCase().includes(q) ||
        (c.cpf ?? "").toLowerCase().includes(q)
    );
  }, [clientes, search]);

  const loadClientes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/clientes?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (res.ok) {
        setClientes(data.data ?? []);
      } else {
        setError(data.error ?? "Erro ao buscar clientes");
      }
    } catch (err) {
      console.error(err);
      setError("Erro ao buscar clientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      nome: form.nome ?? "",
      telefone1: sanitizeNumber(form.telefone1),
      telefone2: sanitizeNumber(form.telefone2),
      email: form.email ?? "",
      cpf: sanitizeNumber(form.cpf),
      endereco_rua: form.endereco_rua ?? "",
      numero: form.numero ?? "",
      bairro: form.bairro ?? "",
      cidade: form.cidade ?? cidadesOptions[0],
      estado: "MG",
    };
    try {
      const res = await fetch("/api/clientes", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao salvar cliente");
        return;
      }
      setForm({});
      setEditingId(null);
      loadClientes();
    } catch (err) {
      console.error(err);
      setError("Erro ao salvar cliente");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cliente: Cliente) => {
    setForm({
      ...cliente,
      estado: "MG",
      cidade: cliente.cidade ?? cidadesOptions[0],
    });
    setEditingId(cliente.id);
  };

  return (
    <AppShell>
      <PageHeader
        title="Clientes"
        description="Cadastro completo de clientes, dados de contato e endereços."
        actions={<Button asChild><a href="/agendar">Agendar para cliente</a></Button>}
      />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border-brand-primary/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Buscar clientes</CardTitle>
            <Input
              placeholder="Buscar por nome, telefone ou CPF"
              className="w-72"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onBlur={loadClientes}
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
                  <TableHead>Telefone</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>Ações</TableHead>
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
                {!loading && filtered.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell className="font-semibold text-brand-deep">{cliente.nome}</TableCell>
                    <TableCell>
                      <div>{cliente.telefone1}</div>
                      {cliente.telefone2 && (
                        <div className="text-xs text-foreground/70">{cliente.telefone2}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-foreground/70">
                      {[cliente.endereco_rua, cliente.numero, cliente.bairro, cliente.cidade]
                        .filter(Boolean)
                        .join(", ")}
                    </TableCell>
                  <TableCell className="space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(cliente)}>
                      Editar
                    </Button>
                    {cliente.telefone1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="text-brand-primary"
                      >
                        <a
                          href={`https://wa.me/55${sanitizeNumber(cliente.telefone1)}`}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="WhatsApp"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
                {!loading && !filtered.length && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-foreground/70">
                      Nenhum cliente encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-brand-primary/30 bg-white/90">
          <CardHeader>
            <CardTitle>{editingId ? "Editar cliente" : "Novo cliente"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label>Nome completo</Label>
                <Input
                  placeholder="Nome completo"
                  value={form.nome ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Telefone 1</Label>
                  <Input
                    placeholder="(11) 99999-9999"
                    value={formatPhone(form.telefone1 ?? "")}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, telefone1: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone 2</Label>
                  <Input
                    placeholder="Opcional"
                    value={formatPhone(form.telefone2 ?? "")}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, telefone2: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                  <Input
                    placeholder="contato@email.com"
                    value={form.email ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>CPF</Label>
                    <Input
                      placeholder="000.000.000-00"
                      value={formatCpf(form.cpf ?? "")}
                      onChange={(e) => setForm((f) => ({ ...f, cpf: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bairro</Label>
                    <Input
                    placeholder="Bairro"
                    value={form.bairro ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, bairro: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Rua</Label>
                  <Input
                    placeholder="Nome da rua"
                    value={form.endereco_rua ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, endereco_rua: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Número</Label>
                  <Input
                    placeholder="Número"
                    value={form.numero ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, numero: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <select
                    className="h-11 w-full rounded-xl border border-input bg-white px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={form.cidade ?? cidadesOptions[0]}
                    onChange={(e) => setForm((f) => ({ ...f, cidade: e.target.value }))}
                  >
                    {cidadesOptions.map((cidade) => (
                      <option key={cidade} value={cidade}>
                        {cidade}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Input
                    placeholder="MG"
                    value="MG"
                    disabled
                  />
                </div>
              </div>
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}
              <div className="flex gap-3">
                <Button type="submit" className="flex-1" disabled={saving}>
                  {saving ? "Salvando..." : editingId ? "Atualizar" : "Salvar cliente"}
                </Button>
                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingId(null);
                      setForm({});
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

function sanitizeNumber(value?: string | null) {
  if (!value) return "";
  return value.replace(/\D/g, "");
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function formatCpf(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  const part1 = digits.slice(0, 3);
  const part2 = digits.slice(3, 6);
  const part3 = digits.slice(6, 9);
  const part4 = digits.slice(9, 11);
  return [part1, part2, part3].filter(Boolean).join(".") + (part4 ? `-${part4}` : "");
}
