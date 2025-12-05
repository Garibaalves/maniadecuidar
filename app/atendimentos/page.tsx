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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Animal, Cliente, Produto, Servico } from "@/types";
import Image from "next/image";
import { UploadCloud } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type AgendamentoRow = {
  id: string;
  data: string;
  hora: string;
  status: string;
  clientes?: Cliente;
  animais?: Animal;
  agendamento_servicos?: { servico_id?: string; servicos?: { id?: string; nome: string; valor_padrao?: number | null } | null }[];
  observacoes?: string | null;
};

type ItemAtendimento =
  | { tipo_item: "SERVICO"; servico_id: string; produto_id?: string; quantidade: number; valor_unitario: number }
  | { tipo_item: "PRODUTO"; produto_id: string; servico_id?: string; quantidade: number; valor_unitario: number };

export default function AtendimentosPage() {
  const [agendamentos, setAgendamentos] = useState<AgendamentoRow[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [dataFiltro, setDataFiltro] = useState(new Date().toISOString().slice(0, 10));
  const [statusFiltro, setStatusFiltro] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgendamento, setSelectedAgendamento] = useState<string | null>(null);
  const [items, setItems] = useState<ItemAtendimento[]>([]);
  const [observacoes, setObservacoes] = useState("");
  const [formaPagamento, setFormaPagamento] = useState<"PIX" | "DINHEIRO" | "DEBITO" | "CREDITO" | "OUTROS">("PIX");
  const [desconto, setDesconto] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [fotos, setFotos] = useState<{ id: string; url_foto: string }[]>([]);

  const agendamentosFiltrados = useMemo(
    () =>
      agendamentos.filter((a) => {
        if (dataFiltro && a.data !== dataFiltro) return false;
        if (statusFiltro && a.status !== statusFiltro) return false;
        return true;
      }),
    [agendamentos, dataFiltro, statusFiltro]
  );

  const totalItens = useMemo(() => {
    const total = items.reduce((acc, item) => acc + item.quantidade * item.valor_unitario, 0);
    return Math.max(total - desconto, 0);
  }, [items, desconto]);

  useEffect(() => {
    loadServicos();
    loadProdutos();
    loadAgendamentos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadAgendamentos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataFiltro, statusFiltro]);

  async function loadAgendamentos() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dataFiltro) params.append("data", dataFiltro);
      if (statusFiltro) params.append("status", statusFiltro);
      const res = await fetch(`/api/agendamentos?${params.toString()}`);
      const data = await res.json();
      if (res.ok) setAgendamentos(data.data ?? []);
      else setError(data.error ?? "Erro ao carregar agendamentos");
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar agendamentos");
    } finally {
      setLoading(false);
    }
  }

  async function loadServicos() {
    const res = await fetch("/api/servicos?ativos=true");
    const data = await res.json();
    if (res.ok) setServicos(data.data ?? []);
  }

  async function loadProdutos() {
    const res = await fetch("/api/produtos");
    const data = await res.json();
    if (res.ok) setProdutos(data.data ?? []);
  }

  async function handleIniciar(id: string) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/atendimentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agendamento_id: id, iniciar: true, observacoes }),
      });
      if (res.ok) {
        setSelectedAgendamento(id);
        setFotos([]);
        prepararItens(id);
        await loadFotos(id);
        setOpenModal(true);
        loadAgendamentos();
      }
    } catch (err) {
      console.error(err);
      setError("Erro ao iniciar atendimento");
    } finally {
      setSaving(false);
    }
  }

  async function handleFinalizar(id: string) {
    if (!items.length) {
      alert("Adicione pelo menos um serviço ou produto");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payloadItems = items.map((item) => ({
        ...item,
        valor_total: item.quantidade * item.valor_unitario,
      }));
      const res = await fetch("/api/atendimentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agendamento_id: id,
          encerrar: true,
          itens: payloadItems,
          forma_pagamento: formaPagamento,
          observacoes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao finalizar atendimento");
        return;
      }
      setSelectedAgendamento(null);
      setItems([]);
      setDesconto(0);
      setObservacoes("");
      setOpenModal(false);
      loadAgendamentos();
    } catch (err) {
      console.error(err);
      setError("Erro ao finalizar atendimento");
    } finally {
      setSaving(false);
    }
  }

  const addItem = (tipo: "SERVICO" | "PRODUTO") => {
    if (tipo === "SERVICO") {
      setItems((prev) => [
        ...prev,
        {
          tipo_item: "SERVICO",
          servico_id: servicos[0]?.id ?? "",
          quantidade: 1,
          valor_unitario: servicos[0]?.valor_padrao ?? 0,
        },
      ]);
    } else {
      setItems((prev) => [
        ...prev,
        {
          tipo_item: "PRODUTO",
          produto_id: produtos[0]?.id ?? "",
          quantidade: 1,
          valor_unitario: produtos[0]?.preco_venda ?? 0,
        },
      ]);
    }
  };

  const updateItem = (idx: number, patch: Partial<ItemAtendimento>) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, ...patch } as ItemAtendimento : item
      )
    );
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const prepararItens = (agendamentoId: string) => {
    const ag = agendamentos.find((a) => a.id === agendamentoId);
    if (!ag) return;
    const baseServicos =
      ag.agendamento_servicos?.map((s) => {
        const valor = Number(s.servicos?.valor_padrao ?? 0);
        const servId = s.servico_id || s.servicos?.id || "";
        return {
          tipo_item: "SERVICO",
          servico_id: servId,
          quantidade: 1,
          valor_unitario: valor,
        } as ItemAtendimento;
      }) ?? [];
    setItems(baseServicos);
  };

  async function loadFotos(agendamentoId: string) {
    try {
      const res = await fetch(`/api/atendimentos/fotos?agendamento_id=${agendamentoId}`);
      const data = await res.json();
      if (res.ok) setFotos(data.data ?? []);
    } catch (err) {
      console.error(err);
    }
  }

  const handleUploadFotos = async (file: File | null) => {
    if (!file) return;
    if (!selectedAgendamento) {
      setError("Selecione um atendimento antes de enviar fotos.");
      return;
    }
    setSaving(true);
    try {
      const base64 = await fileToBase64(file);
      const res = await fetch("/api/atendimentos/fotos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agendamento_id: selectedAgendamento,
          fileName: file.name,
          fileBase64: base64,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setFotos((prev) => (data.foto ? [data.foto, ...prev] : prev));
      } else {
        setError(data.error ?? "Erro ao enviar foto");
      }
    } catch (err) {
      console.error(err);
      setError("Erro ao enviar foto");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFoto = async (fotoId: string, url: string) => {
    if (!confirm("Excluir esta foto?")) return;
    try {
      await fetch("/api/atendimentos/fotos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: fotoId, url }),
      });
      setFotos((prev) => prev.filter((f) => f.id !== fotoId));
    } catch (err) {
      console.error(err);
    }
  };

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        resolve(result.split(",")[1] ?? "");
      } else {
        reject(new Error("Nao foi possivel ler o arquivo"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

  return (
    <AppShell>
      <PageHeader
        title="Atendimentos"
        description="Controle os agendamentos, inicie atendimentos, registre itens e finalize com pagamento."
      />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border-brand-primary/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Agendamentos</CardTitle>
              <p className="text-sm text-foreground/70">
                Filtre por data e status, inicie ou finalize atendimentos.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Input
                type="date"
                value={dataFiltro}
                onChange={(e) => setDataFiltro(e.target.value)}
                className="w-40"
              />
              <Select
                className="w-40"
                value={statusFiltro}
                onChange={(e) => setStatusFiltro(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="AGENDADO">Agendado</option>
                <option value="EM_ATENDIMENTO">Em atendimento</option>
                <option value="CONCLUIDO">Concluído</option>
              </Select>
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
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Pet</TableHead>
                  <TableHead>Status</TableHead>
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
                  agendamentosFiltrados.map((ag) => (
                    <TableRow key={ag.id}>
                      <TableCell>
                        <div className="font-semibold text-brand-deep">
                          {formatDate(ag.data)} {ag.hora}
                        </div>
                        <div className="text-xs text-foreground/70">
                          {(ag.agendamento_servicos ?? [])
                            .map((s) => s.servicos?.nome)
                            .filter(Boolean)
                            .join(", ")}
                        </div>
                      </TableCell>
                      <TableCell>{ag.clientes?.nome ?? "-"}</TableCell>
                      <TableCell>{ag.animais?.nome ?? "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            ag.status === "EM_ATENDIMENTO"
                              ? "warning"
                              : ag.status === "CONCLUIDO"
                                ? "success"
                                : "default"
                          }
                        >
                          {ag.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="space-x-2">
                        {ag.status === "AGENDADO" && (
                          <Button size="sm" onClick={() => handleIniciar(ag.id)} disabled={saving}>
                            Iniciar
                          </Button>
                        )}
                        {["AGENDADO", "EM_ATENDIMENTO"].includes(ag.status) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedAgendamento(ag.id);
                              setFotos([]);
                              prepararItens(ag.id);
                              loadFotos(ag.id);
                              setOpenModal(true);
                            }}
                          >
                            Registrar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                {!loading && !agendamentosFiltrados.length && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-foreground/70">
                      Nenhum agendamento encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-brand-primary/30">
          <CardHeader>
            <CardTitle>Atendimento em curso</CardTitle>
            <p className="text-sm text-foreground/70">
              Adicione serviços/produtos, registre observações e finalize com pagamento.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {!selectedAgendamento && (
              <div className="rounded-xl border border-border/70 bg-white/80 px-3 py-3 text-sm text-foreground/70">
                Selecione ou inicie um agendamento para registrar o atendimento.
              </div>
            )}
            {selectedAgendamento && (
              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setFotos([]);
                    if (selectedAgendamento) loadFotos(selectedAgendamento);
                    setOpenModal(true);
                  }}
                >
                  Registrar informacoes
                </Button>
                <div className="rounded-xl border border-border/70 bg-white/80 px-3 py-2 text-sm text-foreground/70">
                  Continue registrando itens, fotos e pagamento para o atendimento selecionado.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Registrar informações do atendimento</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button type="button" size="sm" onClick={() => addItem("SERVICO")}>
                Adicionar serviço
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => addItem("PRODUTO")}>
                Adicionar produto
              </Button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div
                  key={`${item.tipo_item}-${idx}`}
                  className="flex flex-col gap-2 rounded-xl border border-border/70 bg-white/80 p-3"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{item.tipo_item}</Badge>
                    {item.tipo_item === "SERVICO" ? (
                      <Select
                        value={"servico_id" in item ? item.servico_id : ""}
                        onChange={(e) => {
                          const serv = servicos.find((s) => s.id === e.target.value);
                          updateItem(idx, {
                            servico_id: e.target.value,
                            valor_unitario: serv?.valor_padrao ?? item.valor_unitario,
                          });
                        }}
                        className="flex-1"
                      >
                        <option value="">Selecione serviço</option>
                        {servicos.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.nome} ({formatCurrency(s.valor_padrao)})
                          </option>
                        ))}
                      </Select>
                    ) : (
                      <Select
                        value={"produto_id" in item ? item.produto_id : ""}
                        onChange={(e) => {
                          const prod = produtos.find((p) => p.id === e.target.value);
                          updateItem(idx, {
                            produto_id: e.target.value,
                            valor_unitario: prod?.preco_venda ?? item.valor_unitario,
                          });
                        }}
                        className="flex-1"
                      >
                        <option value="">Selecione produto</option>
                        {produtos.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nome} ({formatCurrency(p.preco_venda)})
                          </option>
                        ))}
                      </Select>
                    )}
                    <Input
                      type="number"
                      min={1}
                      className="w-24"
                      value={item.quantidade}
                      onChange={(e) => updateItem(idx, { quantidade: Number(e.target.value) })}
                    />
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      className="w-28"
                      value={item.valor_unitario}
                      onChange={(e) => updateItem(idx, { valor_unitario: Number(e.target.value) })}
                    />
                    <Button type="button" variant="ghost" onClick={() => removeItem(idx)}>
                      Remover
                    </Button>
                  </div>
                  <div className="text-xs text-foreground/70">
                    Total item: {formatCurrency(item.quantidade * item.valor_unitario)}
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Input
                placeholder="Observações do atendimento"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Fotos do atendimento</Label>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-brand-primary/40 bg-brand-primary/10 px-4 py-2 text-sm font-medium text-brand-deep shadow-sm transition hover:bg-brand-primary/20">
                    <UploadCloud className="h-4 w-4" />
                    <span>Enviar foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        handleUploadFotos(file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  <span className="text-xs text-foreground/60">Envie uma imagem por vez.</span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {fotos.map((foto) => (
                    <div
                      key={foto.id}
                      className="group relative overflow-hidden rounded-lg border border-border/70"
                    >
                      <Image
                        src={foto.url_foto}
                        alt="Foto do atendimento"
                        width={200}
                        height={120}
                        className="h-28 w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteFoto(foto.id, foto.url_foto)}
                        className="absolute right-1 top-1 rounded-md bg-black/70 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100"
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                  {!fotos.length && (
                    <div className="col-span-full rounded-lg border border-dashed border-border/70 px-3 py-4 text-center text-sm text-foreground/60">
                      Nenhuma foto enviada. Adicione uma imagem.
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Desconto</Label>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  value={desconto}
                  onChange={(e) => setDesconto(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Forma de pagamento</Label>
                <Select
                  value={formaPagamento}
                  onChange={(e) =>
                    setFormaPagamento(
                      e.target.value as "PIX" | "DINHEIRO" | "DEBITO" | "CREDITO" | "OUTROS"
                    )
                  }
                >
                  <option value="PIX">Pix</option>
                  <option value="DINHEIRO">Dinheiro</option>
                  <option value="DEBITO">Debito</option>
                  <option value="CREDITO">Credito</option>
                  <option value="OUTROS">Outros</option>
                </Select>
              </div>
            </div>
            <div className="rounded-xl border border-border/70 bg-white/80 px-3 py-2 text-sm font-semibold text-brand-deep">
              Total do atendimento: {formatCurrency(totalItens)}
            </div>
            <Button
              type="button"
              className="w-full"
              onClick={() => selectedAgendamento && handleFinalizar(selectedAgendamento)}
              disabled={saving}
            >
              {saving ? "Salvando..." : "Finalizar atendimento"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}




