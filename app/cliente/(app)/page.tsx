"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

type DashboardData = {
  total_pets: number;
  total_agendamentos: number;
  agendamentos_abertos: number;
  valor_gasto: number;
};

export default function ClienteDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cliente/dashboard")
      .then((res) => res.json())
      .then((payload) => setData(payload.data ?? null))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Resumo rapido da sua conta."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <a href="/cliente/agendar">Novo agendamento</a>
            </Button>
            <Button asChild>
              <a href="/cliente/assinaturas">Ver assinaturas</a>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-brand-primary/20">
          <CardHeader>
            <CardTitle>Valor gasto</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-brand-deep">
            {loading ? "..." : formatCurrency(data?.valor_gasto ?? 0)}
          </CardContent>
        </Card>
        <Card className="border-brand-primary/20">
          <CardHeader>
            <CardTitle>Agendamentos em aberto</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-brand-deep">
            {loading ? "..." : data?.agendamentos_abertos ?? 0}
          </CardContent>
        </Card>
        <Card className="border-brand-primary/20">
          <CardHeader>
            <CardTitle>Total de agendamentos</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-brand-deep">
            {loading ? "..." : data?.total_agendamentos ?? 0}
          </CardContent>
        </Card>
        <Card className="border-brand-primary/20">
          <CardHeader>
            <CardTitle>Total de pets</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-brand-deep">
            {loading ? "..." : data?.total_pets ?? 0}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="border-brand-primary/15">
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/70">
              Atualize seus dados de contato e endereco.
            </p>
            <Button asChild className="mt-3 w-full" variant="outline">
              <a href="/cliente/perfil">Editar perfil</a>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-brand-primary/15">
          <CardHeader>
            <CardTitle>Meus pets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/70">
              Cadastre novos pets e mantenha as infos atualizadas.
            </p>
            <Button asChild className="mt-3 w-full" variant="outline">
              <a href="/cliente/pets">Gerenciar pets</a>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-brand-primary/15">
          <CardHeader>
            <CardTitle>Agendamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/70">
              Acompanhe seu historico e proximos horarios.
            </p>
            <Button asChild className="mt-3 w-full" variant="outline">
              <a href="/cliente/agendamentos">Ver agendamentos</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
