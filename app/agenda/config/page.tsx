"use client";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

type ConfigItem = {
  id?: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fim: string;
  intervalo_minutos: number;
};

const dias = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export default function AgendaConfigPage() {
  const [config, setConfig] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [novoItem, setNovoItem] = useState<ConfigItem>({
    dia_semana: 1,
    hora_inicio: "08:00",
    hora_fim: "18:00",
    intervalo_minutos: 30,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    setLoading(true);
    try {
      const res = await fetch("/api/agenda/config");
      const data = await res.json();
      if (res.ok) setConfig(data.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdate = async (item: ConfigItem) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/agenda/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erro ao salvar configuração");
        return;
      }
      loadConfig();
    } catch (err) {
      console.error(err);
      setError("Erro ao salvar configuração");
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/agenda/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novoItem),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erro ao criar configuração");
        return;
      }
      setNovoItem({
        dia_semana: 1,
        hora_inicio: "08:00",
        hora_fim: "18:00",
        intervalo_minutos: 30,
      });
      loadConfig();
    } catch (err) {
      console.error(err);
      setError("Erro ao criar configuração");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Configuração da agenda"
        description="Defina horários disponíveis por dia da semana e bloqueios específicos."
        actions={
          <Button variant="outline" asChild>
            <a href="/agenda">Voltar para agenda</a>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border-brand-primary/20">
          <CardHeader>
            <CardTitle>Dias da semana</CardTitle>
            <p className="text-sm text-foreground/70">
              Ajuste horário de início, fim e intervalo. Salve cada dia individualmente.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading && <p className="text-sm">Carregando configurações...</p>}
            {config
              .slice()
              .sort((a, b) => a.dia_semana - b.dia_semana)
              .map((item) => (
                <div
                  key={item.dia_semana}
                  className="rounded-xl border border-border/70 bg-white/80 p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-semibold text-brand-deep">
                      {dias[item.dia_semana]}
                    </span>
                    <Input
                      type="time"
                      value={item.hora_inicio}
                      onChange={(e) =>
                        setConfig((cfg) =>
                          cfg.map((c) =>
                            c.dia_semana === item.dia_semana
                              ? { ...c, hora_inicio: e.target.value }
                              : c
                          )
                        )
                      }
                      className="w-28"
                    />
                    <Input
                      type="time"
                      value={item.hora_fim}
                      onChange={(e) =>
                        setConfig((cfg) =>
                          cfg.map((c) =>
                            c.dia_semana === item.dia_semana
                              ? { ...c, hora_fim: e.target.value }
                              : c
                          )
                        )
                      }
                      className="w-28"
                    />
                    <Input
                      type="number"
                      value={item.intervalo_minutos}
                      onChange={(e) =>
                        setConfig((cfg) =>
                          cfg.map((c) =>
                            c.dia_semana === item.dia_semana
                              ? { ...c, intervalo_minutos: Number(e.target.value) }
                              : c
                          )
                        )
                      }
                      className="w-24"
                      min={5}
                      step={5}
                    />
                    <Button
                      size="sm"
                      onClick={() => handleUpdate(item)}
                      disabled={saving}
                    >
                      Salvar
                    </Button>
                  </div>
                </div>
              ))}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-brand-primary/30">
          <CardHeader>
            <CardTitle>Nova configuração</CardTitle>
            <p className="text-sm text-foreground/70">
              Adicione rapidamente um novo dia com início, término e intervalo.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form className="space-y-3" onSubmit={handleCreate}>
              <div className="space-y-2">
                <Label>Dia da semana</Label>
                <select
                  className="h-11 w-full rounded-xl border border-input bg-white px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={novoItem.dia_semana}
                  onChange={(e) =>
                    setNovoItem((f) => ({ ...f, dia_semana: Number(e.target.value) }))
                  }
                >
                  {dias.map((d, idx) => (
                    <option key={d} value={idx}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Início</Label>
                  <Input
                    type="time"
                    value={novoItem.hora_inicio}
                    onChange={(e) =>
                      setNovoItem((f) => ({ ...f, hora_inicio: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Término</Label>
                  <Input
                    type="time"
                    value={novoItem.hora_fim}
                    onChange={(e) => setNovoItem((f) => ({ ...f, hora_fim: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Intervalo (min)</Label>
                <Input
                  type="number"
                  min={5}
                  step={5}
                  value={novoItem.intervalo_minutos}
                  onChange={(e) =>
                    setNovoItem((f) => ({
                      ...f,
                      intervalo_minutos: Number(e.target.value),
                    }))
                  }
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Salvando..." : "Adicionar dia"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
