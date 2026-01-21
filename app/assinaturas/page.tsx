"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { type Assinatura, type CaixaFormaPagamento, type Cliente, type Plano } from "@/types";

type FormState = {
  plano_id?: string;
  cliente_id?: string;
  data_adesao?: string;
};

export default function AssinaturasPage() {
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [form, setForm] = useState<FormState>({});
  const [search, setSearch] = useState("");
  const [clienteSearch, setClienteSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [clienteDropdownOpen, setClienteDropdownOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualSaving, setManualSaving] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);
  const [manualForma, setManualForma] = useState<CaixaFormaPagamento>("DINHEIRO");
  const [manualAssinatura, setManualAssinatura] = useState<Assinatura | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const filtrados = useMemo(() => {
    let list = assinaturas;
    if (statusFilter) {
      list = list.filter((a) => a.status === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.clientes?.nome?.toLowerCase().includes(q) ||
          a.planos?.nome?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [assinaturas, search, statusFilter]);

  useEffect(() => {
    void loadAssinaturas();
    void loadPlanos();
    void loadClientes();
  }, []);

  async function loadAssinaturas() {
    setLoading(true);
    try {
      const res = await fetch("/api/assinaturas");
      const data = await res.json();
      if (res.ok) setAssinaturas(data.data ?? []);
      else setError(data.error ?? "Erro ao carregar assinaturas");
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar assinaturas");
    } finally {
      setLoading(false);
    }
  }

  async function loadPlanos() {
    try {
      const res = await fetch("/api/planos?ativos=true");
      const data = await res.json();
      if (res.ok) setPlanos(data.data ?? []);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadClientes() {
    try {
      const res = await fetch("/api/clientes?page=1&pageSize=500");
      const data = await res.json();
      if (res.ok) setClientes(data.data ?? []);
    } catch (err) {
      console.error(err);
    }
  }

  const resetForm = () => {
    setForm({});
    setClienteSearch("");
    setClienteDropdownOpen(false);
  };

  const resetManual = () => {
    setManualAssinatura(null);
    setManualForma("DINHEIRO");
    setManualError(null);
  };

  const buildWhatsAppUrl = (telefone: string | undefined, planoNome: string, link: string) => {
    const digits = (telefone ?? "").replace(/\D/g, "");
    if (!digits) return null;
    const message = encodeURIComponent(
      `Olá! Segue o link para aderir ao plano ${planoNome}: ${link}`
    );
    return `https://wa.me/55${digits}?text=${message}`;
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setClienteDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        plano_id: form.plano_id ?? "",
        cliente_id: form.cliente_id ?? "",
        data_adesao: form.data_adesao,
      };
      const res = await fetch("/api/assinaturas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao criar assinatura");
        return;
      }
      resetForm();
      setOpenModal(false);
      void loadAssinaturas();
      const planoNome =
        planos.find((p) => p.id === (form.plano_id ?? ""))?.nome ?? "plano";
      const telefone = clientes.find((c) => c.id === (form.cliente_id ?? ""))?.telefone1;
      const waUrl = buildWhatsAppUrl(telefone, planoNome, data.checkout_url);
      if (waUrl) {
        window.open(waUrl, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      console.error(err);
      setError("Erro ao criar assinatura");
    } finally {
      setSaving(false);
    }
  }

  async function handleManualActivate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!manualAssinatura) return;
    setManualSaving(true);
    setManualError(null);
    try {
      const res = await fetch("/api/assinaturas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: manualAssinatura.id,
          status: "ATIVA",
          forma_pagamento: manualForma,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setManualError(data.error ?? "Erro ao ativar assinatura");
        return;
      }
      setManualOpen(false);
      resetManual();
      void loadAssinaturas();
    } catch (err) {
      console.error(err);
      setManualError("Erro ao ativar assinatura");
    } finally {
      setManualSaving(false);
    }
  }

  const statusVariant = (status: Assinatura["status"]) => {
    if (status === "ATIVA") return "success" as const;
    if (status === "PENDENTE") return "warning" as const;
    if (status === "ATRASADA") return "danger" as const;
    return "outline" as const;
  };

  return (
    <AppShell>
      <PageHeader
        title="Assinaturas"
        description="Gerencie assinaturas de planos e envie o checkout para clientes."
        actions={(
          <>
            <Button onClick={() => { resetForm(); setOpenModal(true); }}>
              Nova assinatura
            </Button>
            <Button variant="outline" onClick={() => void loadAssinaturas()}>
              Atualizar
            </Button>
          </>
        )}
      />

      <Card className="border-brand-primary/20">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Lista de assinaturas</CardTitle>
          <div className="flex gap-2">
            <Input
              placeholder="Buscar por cliente ou plano"
              className="w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="rounded-md border border-border px-2 py-1 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Todos status</option>
              <option value="ATIVA">Ativa</option>
              <option value="PENDENTE">Pendente</option>
              <option value="ATRASADA">Atrasada</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
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
                <TableHead>Cliente</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Adesão</TableHead>
                <TableHead>Último pagamento</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Checkout</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-sm">Carregando...</TableCell>
              </TableRow>
            )}
            {!loading && filtrados.map((a) => (
              <TableRow key={a.id}>
                  <TableCell className="font-semibold text-brand-deep">
                    {a.clientes?.nome ?? "Cliente"}
                  </TableCell>
                  <TableCell>{a.planos?.nome ?? "Plano"}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(a.status)}>{a.status}</Badge>
                  </TableCell>
                  <TableCell>{a.data_adesao ?? "-"}</TableCell>
                  <TableCell>{a.data_ultimo_pagamento ?? "-"}</TableCell>
                  <TableCell>{a.data_vencimento ?? "-"}</TableCell>
                  <TableCell>
                    {a.stripe_checkout_url ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const waUrl = buildWhatsAppUrl(
                            a.clientes?.telefone1 ?? undefined,
                            a.planos?.nome ?? "plano",
                            a.stripe_checkout_url ?? ""
                          );
                          if (waUrl) {
                            window.open(waUrl, "_blank", "noopener,noreferrer");
                          } else if (a.stripe_checkout_url) {
                            navigator.clipboard.writeText(a.stripe_checkout_url);
                          }
                        }}
                      >
                        Enviar link
                      </Button>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {a.status !== "ATIVA" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setManualAssinatura(a);
                          setManualForma("DINHEIRO");
                          setManualError(null);
                          setManualOpen(true);
                        }}
                      >
                        Ativar
                      </Button>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {!loading && !filtrados.length && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-sm text-foreground/70">
                    Nenhuma assinatura encontrada.
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
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Nova assinatura</DialogTitle>
          </DialogHeader>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label>Cliente</Label>
              <div className="relative" ref={dropdownRef}>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => setClienteDropdownOpen((prev) => !prev)}
                >
                  {form.cliente_id
                    ? clientes.find((c) => c.id === form.cliente_id)?.nome ?? "Selecionar cliente"
                    : "Selecionar cliente"}
                  <span className="text-xs text-foreground/70">▼</span>
                </Button>
                {clienteDropdownOpen && (
                  <div className="absolute z-20 mt-2 w-full rounded-xl border border-border/70 bg-white shadow-soft">
                    <div className="border-b border-border/60 p-3">
                      <Input
                        autoFocus
                        placeholder="Buscar cliente"
                        value={clienteSearch}
                        onChange={(e) => setClienteSearch(e.target.value)}
                      />
                    </div>
                    <div className="max-h-64 overflow-y-auto p-2">
                      {clientes
                        .filter((c) =>
                          c.nome.toLowerCase().includes(clienteSearch.toLowerCase())
                        )
                        .map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            className="flex w-full flex-col items-start gap-1 rounded-lg px-3 py-2 text-left hover:bg-brand-primary/10"
                            onClick={() => {
                              setForm((f) => ({ ...f, cliente_id: c.id }));
                              setClienteDropdownOpen(false);
                            }}
                          >
                            <span className="font-semibold text-brand-deep">{c.nome}</span>
                            {c.telefone1 && (
                              <span className="text-xs text-foreground/70">{c.telefone1}</span>
                            )}
                          </button>
                        ))}
                      {!clientes.length && (
                        <div className="px-3 py-2 text-sm text-foreground/70">
                          Nenhum cliente encontrado.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Plano</Label>
              <select
                className="w-full rounded-md border border-border px-3 py-2"
                value={form.plano_id ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, plano_id: e.target.value }))}
                required
              >
                <option value="">Selecione o plano</option>
                {planos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} - R$ {p.valor.toFixed(2)} / {p.intervalo_dias} dias
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Data de adesão</Label>
              <Input
                type="date"
                value={form.data_adesao ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, data_adesao: e.target.value }))}
              />
            </div>
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="flex gap-3">
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving ? "Salvando..." : "Criar e gerar link"}
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

      <Dialog
        open={manualOpen}
        onOpenChange={(open) => {
          setManualOpen(open);
          if (!open) {
            resetManual();
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ativar assinatura manualmente</DialogTitle>
          </DialogHeader>
          <form className="space-y-3" onSubmit={handleManualActivate}>
            <div className="rounded-xl border border-border/60 bg-white px-4 py-3 text-sm">
              <div className="font-semibold text-brand-deep">
                {manualAssinatura?.clientes?.nome ?? "Cliente"}
              </div>
              <div className="text-foreground/70">
                {manualAssinatura?.planos?.nome ?? "Plano"} - R${" "}
                {manualAssinatura?.planos?.valor?.toFixed(2) ?? "0,00"}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Forma de pagamento</Label>
              <select
                className="w-full rounded-md border border-border px-3 py-2"
                value={manualForma}
                onChange={(e) => setManualForma(e.target.value as CaixaFormaPagamento)}
                required
              >
                <option value="PIX">Pix</option>
                <option value="DINHEIRO">Dinheiro</option>
                <option value="DEBITO">Debito</option>
                <option value="CREDITO">Credito</option>
                <option value="OUTROS">Outros</option>
              </select>
            </div>
            {manualError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {manualError}
              </div>
            )}
            <div className="flex gap-3">
              <Button type="submit" className="flex-1" disabled={manualSaving}>
                {manualSaving ? "Ativando..." : "Ativar e lançar no caixa"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setManualOpen(false);
                  resetManual();
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
