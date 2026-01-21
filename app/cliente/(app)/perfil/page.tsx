"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Perfil = {
  nome: string;
  telefone1: string;
  telefone2?: string | null;
  cpf?: string | null;
  email?: string | null;
  endereco_rua?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
};

export default function ClientePerfilPage() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/cliente/perfil")
      .then((res) => res.json())
      .then((data) => setPerfil(data.data ?? null))
      .catch(() => setPerfil(null));
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!perfil) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/cliente/perfil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(perfil),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao atualizar perfil");
        return;
      }
      setPerfil(data.data ?? perfil);
      setSuccess("Perfil atualizado com sucesso.");
    } catch (err) {
      console.error(err);
      setError("Erro ao atualizar perfil");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader title="Meu perfil" description="Atualize seus dados de contato." />

      <Card className="border-brand-primary/20">
        <CardHeader>
          <CardTitle>Dados do cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  value={perfil?.nome ?? ""}
                  onChange={(e) => setPerfil((p) => (p ? { ...p, nome: e.target.value } : p))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>CPF</Label>
                <Input
                  value={perfil?.cpf ?? ""}
                  onChange={(e) => setPerfil((p) => (p ? { ...p, cpf: e.target.value } : p))}
                />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Telefone principal</Label>
                <Input
                  value={perfil?.telefone1 ?? ""}
                  onChange={(e) => setPerfil((p) => (p ? { ...p, telefone1: e.target.value } : p))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone secundario</Label>
                <Input
                  value={perfil?.telefone2 ?? ""}
                  onChange={(e) => setPerfil((p) => (p ? { ...p, telefone2: e.target.value } : p))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={perfil?.email ?? ""}
                onChange={(e) => setPerfil((p) => (p ? { ...p, email: e.target.value } : p))}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Endereco</Label>
                <Input
                  value={perfil?.endereco_rua ?? ""}
                  onChange={(e) => setPerfil((p) => (p ? { ...p, endereco_rua: e.target.value } : p))}
                />
              </div>
              <div className="space-y-2">
                <Label>Numero</Label>
                <Input
                  value={perfil?.numero ?? ""}
                  onChange={(e) => setPerfil((p) => (p ? { ...p, numero: e.target.value } : p))}
                />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Bairro</Label>
                <Input
                  value={perfil?.bairro ?? ""}
                  onChange={(e) => setPerfil((p) => (p ? { ...p, bairro: e.target.value } : p))}
                />
              </div>
              <div className="space-y-2">
                <Label>Cidade</Label>
                <Input
                  value={perfil?.cidade ?? ""}
                  onChange={(e) => setPerfil((p) => (p ? { ...p, cidade: e.target.value } : p))}
                />
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Input
                  value={perfil?.estado ?? ""}
                  onChange={(e) => setPerfil((p) => (p ? { ...p, estado: e.target.value } : p))}
                />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>CEP</Label>
                <Input
                  value={perfil?.cep ?? ""}
                  onChange={(e) => setPerfil((p) => (p ? { ...p, cep: e.target.value } : p))}
                />
              </div>
              <div className="space-y-2">
                <Label>Complemento</Label>
                <Input
                  value={perfil?.complemento ?? ""}
                  onChange={(e) => setPerfil((p) => (p ? { ...p, complemento: e.target.value } : p))}
                />
              </div>
            </div>
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                {success}
              </div>
            )}
            <Button type="submit" disabled={saving}>
              {saving ? "Salvando..." : "Salvar alteracoes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
