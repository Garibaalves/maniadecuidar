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
import { Animal, Cliente } from "@/types";
import { useEffect, useMemo, useState } from "react";

type FormState = Partial<Animal>;

export default function AnimaisPage() {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<FormState>({
    porte: "PEQUENO",
    sexo: "MACHO",
    especie: "Cachorro",
  });
  const [error, setError] = useState<string | null>(null);

  const animaisFiltrados = useMemo(() => {
    if (!search) return animais;
    const q = search.toLowerCase();
    return animais.filter((a) => {
      const clienteNome = (a as Animal & { clientes?: Cliente }).clientes?.nome ?? "";
      return (
        a.nome.toLowerCase().includes(q) || clienteNome.toLowerCase().includes(q)
      );
    });
  }, [animais, search]);

  async function loadClientes() {
    try {
      const res = await fetch("/api/clientes?pageSize=200");
      const data = await res.json();
      if (res.ok) setClientes(data.data ?? []);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadAnimais() {
    setLoading(true);
    try {
      const res = await fetch("/api/animais");
      const data = await res.json();
      if (res.ok) {
        setAnimais(data.data ?? []);
      } else {
        setError(data.error ?? "Erro ao carregar animais");
      }
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar animais");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClientes();
    loadAnimais();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.cliente_id) {
      setError("Selecione um cliente");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/animais", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente_id: form.cliente_id,
          nome: form.nome,
          especie: form.especie,
          porte: form.porte,
          sexo: form.sexo,
          raca: form.raca,
          observacoes: form.observacoes,
          data_nascimento: form.data_nascimento,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao salvar animal");
        return;
      }
      setForm({
        porte: "PEQUENO",
        sexo: "MACHO",
        especie: "Cachorro",
      });
      loadAnimais();
    } catch (err) {
      console.error(err);
      setError("Erro ao salvar animal");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Animais"
        description="Animais vinculados aos clientes, porte, espécie e observações."
        actions={
          <Button asChild>
            <a href="/agenda">Agendar</a>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border-brand-primary/20">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle>Lista de animais</CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="Buscar por nome ou cliente"
                className="w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Select
                className="w-36"
                value=""
                onChange={() => {
                  /* placeholder */
                }}
              >
                <option>Todos</option>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Animal</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Espécie</TableHead>
                  <TableHead>Porte</TableHead>
                  <TableHead>Observações</TableHead>
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
                  animaisFiltrados.map((animal) => {
                    const cliente = (animal as Animal & { clientes?: Cliente }).clientes;
                    return (
                      <TableRow key={animal.id}>
                        <TableCell className="font-semibold text-brand-deep">
                          {animal.nome}
                        </TableCell>
                        <TableCell>{cliente?.nome ?? "-"}</TableCell>
                        <TableCell>{animal.especie}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{animal.porte}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-foreground/70">
                          {animal.observacoes}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                {!loading && !animaisFiltrados.length && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-sm text-foreground/70"
                    >
                      Nenhum animal encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-brand-primary/30">
          <CardHeader>
            <CardTitle>Novo animal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <form className="space-y-3" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label>Cliente</Label>
                <select
                  className="h-11 w-full rounded-xl border border-input bg-white px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.cliente_id ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, cliente_id: e.target.value }))
                  }
                  required
                >
                  <option value="">Selecione</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome} — {c.telefone1}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Nome do animal</Label>
                <Input
                  placeholder="Nome"
                  value={form.nome ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nome: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Espécie</Label>
                  <Select
                    value={form.especie ?? "Cachorro"}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, especie: e.target.value }))
                    }
                  >
                    <option>Cachorro</option>
                    <option>Gato</option>
                    <option>Outro</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Porte</Label>
                  <Select
                    value={form.porte ?? "PEQUENO"}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        porte: e.target.value as Animal["porte"],
                      }))
                    }
                  >
                    <option value="PEQUENO">Pequeno</option>
                    <option value="MEDIO">Médio</option>
                    <option value="GRANDE">Grande</option>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Sexo</Label>
                  <Select
                    value={form.sexo ?? "MACHO"}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        sexo: e.target.value as Animal["sexo"],
                      }))
                    }
                  >
                    <option value="MACHO">Macho</option>
                    <option value="FEMEA">Fêmea</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data de nascimento</Label>
                  <Input
                    type="date"
                    value={form.data_nascimento ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        data_nascimento: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Observações</Label>
                <Input
                  placeholder="Observações"
                  value={form.observacoes ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, observacoes: e.target.value }))
                  }
                />
              </div>
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Salvando..." : "Salvar animal"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
