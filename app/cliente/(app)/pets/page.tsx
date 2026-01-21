"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type Animal = {
  id: string;
  nome: string;
  especie: string;
  raca?: string | null;
  porte: "PEQUENO" | "MEDIO" | "GRANDE";
  temperamento: "CALMO" | "AGITADO";
  sexo: "MACHO" | "FEMEA";
  data_nascimento?: string | null;
  observacoes?: string | null;
};

type FormState = {
  nome: string;
  especie: string;
  porte: Animal["porte"];
  temperamento: Animal["temperamento"];
  sexo: Animal["sexo"];
  raca: string;
  data_nascimento: string;
  observacoes: string;
};

const initialForm: FormState = {
  nome: "",
  especie: "Cachorro",
  porte: "PEQUENO",
  temperamento: "CALMO",
  sexo: "MACHO",
  raca: "",
  data_nascimento: "",
  observacoes: "",
};

export default function ClientePetsPage() {
  const [pets, setPets] = useState<Animal[]>([]);
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cliente/animais");
      const data = await res.json();
      if (res.ok) setPets(data.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPets();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/cliente/animais", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao cadastrar pet");
        return;
      }
      setForm(initialForm);
      loadPets();
    } catch (err) {
      console.error(err);
      setError("Erro ao cadastrar pet");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja excluir este pet?")) return;
    try {
      await fetch("/api/cliente/animais", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      loadPets();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <PageHeader
        title="Meus pets"
        description="Cadastre novos pets e mantenha seus dados atualizados."
      />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border-brand-primary/20">
          <CardHeader>
            <CardTitle>Pets cadastrados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading && <div className="text-sm text-foreground/70">Carregando...</div>}
            {!loading &&
              pets.map((pet) => (
                <div
                  key={pet.id}
                  className="flex items-center justify-between rounded-xl border border-border/70 bg-white/90 px-4 py-3"
                >
                  <div>
                    <div className="font-semibold text-brand-deep">{pet.nome}</div>
                    <div className="text-xs text-foreground/70">
                      {pet.especie} • {pet.porte} • {pet.temperamento}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{pet.sexo}</Badge>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(pet.id)}>
                      Excluir
                    </Button>
                  </div>
                </div>
              ))}
            {!loading && !pets.length && (
              <div className="text-sm text-foreground/70">Nenhum pet cadastrado.</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-brand-primary/30">
          <CardHeader>
            <CardTitle>Novo pet</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Especie</Label>
                  <Select
                    value={form.especie}
                    onChange={(e) => setForm((f) => ({ ...f, especie: e.target.value }))}
                  >
                    <option value="Cachorro">Cachorro</option>
                    <option value="Gato">Gato</option>
                    <option value="Outro">Outro</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Porte</Label>
                  <Select
                    value={form.porte}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, porte: e.target.value as Animal["porte"] }))
                    }
                  >
                    <option value="PEQUENO">Pequeno</option>
                    <option value="MEDIO">Medio</option>
                    <option value="GRANDE">Grande</option>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Temperamento</Label>
                  <Select
                    value={form.temperamento}
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
                <div className="space-y-2">
                  <Label>Sexo</Label>
                  <Select
                    value={form.sexo}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, sexo: e.target.value as Animal["sexo"] }))
                    }
                  >
                    <option value="MACHO">Macho</option>
                    <option value="FEMEA">Femea</option>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Data de nascimento</Label>
                <Input
                  type="date"
                  value={form.data_nascimento}
                  onChange={(e) => setForm((f) => ({ ...f, data_nascimento: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Observacoes</Label>
                <Input
                  value={form.observacoes}
                  onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
                />
              </div>
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Salvando..." : "Cadastrar pet"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
