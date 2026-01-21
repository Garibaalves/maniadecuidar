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

const initialFormState: FormState = {
  porte: "PEQUENO",
  sexo: "MACHO",
  especie: "Cachorro",
  temperamento: "CALMO",
};

export default function AnimaisPage() {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<FormState>(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
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

  const resetForm = () => {
    setForm(initialFormState);
    setEditingId(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.cliente_id) {
      setError("Selecione um cliente");
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      cliente_id: form.cliente_id,
      nome: form.nome,
      especie: form.especie,
      porte: form.porte,
      temperamento: form.temperamento,
      sexo: form.sexo,
      raca: form.raca,
      observacoes: form.observacoes,
      data_nascimento: form.data_nascimento,
    };
    try {
      const res = await fetch("/api/animais", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao salvar animal");
        return;
      }
      resetForm();
      setOpenModal(false);
      loadAnimais();
    } catch (err) {
      console.error(err);
      setError("Erro ao salvar animal");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (animal: Animal & { clientes?: Cliente }) => {
    setForm({
      ...animal,
      cliente_id: animal.cliente_id,
      especie: animal.especie ?? "Cachorro",
      porte: animal.porte ?? "PEQUENO",
      temperamento: animal.temperamento ?? "CALMO",
      sexo: animal.sexo ?? "MACHO",
    });
    setEditingId(animal.id);
    setOpenModal(true);
  };

  const handleDelete = async (animal: Animal & { clientes?: Cliente }) => {
    const confirmed = window.confirm(`Deseja excluir o animal ${animal.nome}?`);
    if (!confirmed) return;
    setDeletingId(animal.id);
    setError(null);
    try {
      const res = await fetch("/api/animais", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: animal.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao excluir animal");
        return;
      }
      loadAnimais();
    } catch (err) {
      console.error(err);
      setError("Erro ao excluir animal");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Animais"
        description="Animais vinculados aos clientes, porte, especie e observacoes."
        actions={(
          <>
            <Button onClick={() => { resetForm(); setOpenModal(true); }}>
              Novo animal
            </Button>
            <Button variant="outline" asChild>
              <a href="/agenda">Agendar</a>
            </Button>
          </>
        )}
      />

      <Card className="border-brand-primary/20">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Lista de animais</CardTitle>
          <Input
            placeholder="Buscar por nome ou cliente"
            className="w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
                <TableHead>Animal</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Especie</TableHead>
                <TableHead>Porte</TableHead>
                <TableHead>Temperamento</TableHead>
                <TableHead>Observacoes</TableHead>
                <TableHead>Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm">
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
                      <TableCell>
                        <Badge variant="outline">{animal.temperamento}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-foreground/70">
                        {animal.observacoes}
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(animal)}>
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          disabled={deletingId === animal.id}
                          onClick={() => handleDelete(animal)}
                        >
                          {deletingId === animal.id ? "Excluindo..." : "Excluir"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              {!loading && !animaisFiltrados.length && (
                <TableRow>
                  <TableCell
                    colSpan={7}
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

      <Dialog
        open={openModal}
        onOpenChange={(open) => {
          setOpenModal(open);
          if (!open) {
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar animal" : "Novo animal"}</DialogTitle>
          </DialogHeader>
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
                    {c.nome} - {c.telefone1}
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
                <Label>Especie</Label>
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
                  <option value="MEDIO">Medio</option>
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
                  <option value="FEMEA">Femea</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Temperamento</Label>
                <Select
                  value={form.temperamento ?? "CALMO"}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      temperamento: e.target.value as Animal["temperamento"],
                    }))
                  }
                >
                  <option value="CALMO">Calmo</option>
                  <option value="AGITADO">Agitado</option>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
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
              <div className="space-y-2">
                <Label>Observacoes</Label>
                <Input
                  placeholder="Observacoes"
                  value={form.observacoes ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, observacoes: e.target.value }))
                  }
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
                {saving ? "Salvando..." : editingId ? "Atualizar" : "Salvar animal"}
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
