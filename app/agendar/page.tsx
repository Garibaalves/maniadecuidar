"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { formatCurrency } from "@/lib/utils";

type Servico = { id: string; nome: string; valor_padrao?: number | null };
type Animal = { id: string; nome: string; especie?: string | null; porte?: string | null; sexo?: string | null };
type Cliente = { id: string; nome: string; telefone1: string; animais?: Animal[] | null };

export default function AgendarPage() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState<string[]>([]);
  const [services, setServices] = useState<Servico[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [telefone, setTelefone] = useState("");
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [buscouTelefone, setBuscouTelefone] = useState(false);
  const [novoClienteNome, setNovoClienteNome] = useState("");
  const [petSelecionado, setPetSelecionado] = useState<string>("");
  const [novoPets, setNovoPets] = useState<
    { key: string; nome: string; especie: string; porte: "PEQUENO" | "MEDIO" | "GRANDE"; sexo: "MACHO" | "FEMEA" }[]
  >([{ key: crypto.randomUUID(), nome: "", especie: "cachorro", porte: "PEQUENO", sexo: "MACHO" }]);
  const [observacoes, setObservacoes] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loadingBusca, setLoadingBusca] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const isNovo = !cliente;

  useEffect(() => {
    loadSlots(date);
  }, [date]);

  useEffect(() => {
    fetch("/api/public/servicos")
      .then((res) => res.json())
      .then((res) => setServices(res.data ?? []))
      .catch(() => setServices([]));
  }, []);

  useEffect(() => {
    if (isNovo && !petSelecionado && novoPets.length) {
      setPetSelecionado(novoPets[0].key);
    }
  }, [isNovo, petSelecionado, novoPets]);

  const total = useMemo(
    () =>
      selectedServices.reduce((acc, id) => {
        const svc = services.find((s) => s.id === id);
        return acc + Number(svc?.valor_padrao ?? 0);
      }, 0),
    [selectedServices, services]
  );

  async function loadSlots(d: string) {
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/public/horarios?data=${d}`);
      const data = await res.json();
      setSlots(res.ok ? data.slots ?? [] : []);
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10)
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  async function buscarCliente() {
    setMessage(null);
    setCliente(null);
    setPetSelecionado("");
    setLoadingBusca(true);
    try {
      const clean = telefone.replace(/\D/g, "");
      const res = await fetch(`/api/public/clientes?telefone=${encodeURIComponent(clean)}`);
      const data = await res.json();
      if (res.ok && data.data) {
        setCliente(data.data);
        setPetSelecionado(data.data.animais?.[0]?.id ?? "");
      } else {
        setCliente(null);
      }
    } catch {
      setMessage("Não foi possível buscar o telefone.");
    } finally {
      setLoadingBusca(false);
      setBuscouTelefone(true);
    }
  }

  const toggleService = (id: string) => {
    setSelectedServices((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const addNovoPet = () =>
    setNovoPets((prev) => [
      ...prev,
      { key: crypto.randomUUID(), nome: "", especie: "cachorro", porte: "PEQUENO", sexo: "MACHO" },
    ]);
  const updateNovoPet = (key: string, patch: Partial<(typeof novoPets)[number]>) =>
    setNovoPets((prev) => prev.map((p) => (p.key === key ? { ...p, ...patch } : p)));
  const removerNovoPet = (key: string) => {
    setNovoPets((prev) => prev.filter((p) => p.key !== key));
    if (petSelecionado === key) setPetSelecionado("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    if (!selectedSlot) return setMessage("Selecione um horário.");
    if (!selectedServices.length) return setMessage("Selecione pelo menos um serviço.");
    const telefoneLimpo = telefone.replace(/\D/g, "");
    if (!telefoneLimpo) return setMessage("Informe o telefone.");
    if (isNovo && !novoClienteNome) return setMessage("Informe seu nome.");

    const isNovoPet = isNovo || novoPets.some((p) => p.key === petSelecionado);
    const petParaEnviar = isNovo
      ? novoPets.find((p) => p.key === petSelecionado) ?? novoPets[0]
      : novoPets.find((p) => p.key === petSelecionado);
    if (isNovo && !petParaEnviar?.nome) return setMessage("Informe o nome do pet.");

    const payload: {
      telefone: string;
      nome: string;
      servicos: string[];
      data: string;
      hora: string;
      observacoes?: string;
      animal_id?: string;
      animal?: {
        nome: string;
        especie: string;
        porte: "PEQUENO" | "MEDIO" | "GRANDE";
        sexo: "MACHO" | "FEMEA";
      };
    } = {
      telefone: telefoneLimpo,
      nome: cliente?.nome ?? novoClienteNome,
      servicos: selectedServices,
      data: date,
      hora: selectedSlot,
      observacoes,
    };

    if (!isNovo && petSelecionado && !isNovoPet) {
      payload.animal_id = petSelecionado;
    } else if (petParaEnviar) {
      payload.animal = {
        nome: petParaEnviar.nome,
        especie: petParaEnviar.especie,
        porte: petParaEnviar.porte,
        sexo: petParaEnviar.sexo,
      };
    }

    setEnviando(true);
    const response = await fetch("/api/public/agendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      setMessage("Agendamento enviado! Entraremos em contato para confirmar.");
      setSelectedServices([]);
      setSelectedSlot(null);
      setTelefone("");
      setCliente(null);
      setObservacoes("");
      setBuscouTelefone(false);
    } else {
      const dataResp = await response.json();
      setMessage(dataResp.error ?? "Erro ao agendar.");
    }
    setEnviando(false);
  };

  return (
    <div className="min-h-screen bg-background/70">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <PageHeader
          title="Agendar atendimento"
          description="Escolha um horário disponível, confirme seu telefone e finalize o agendamento."
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-brand-primary/20">
            <CardHeader>
              <CardTitle>1) Escolha data e horário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Horários disponíveis</Label>
                <div className="flex flex-wrap gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`rounded-full border px-3 py-2 text-sm transition ${
                        selectedSlot === slot
                          ? "border-brand-primary bg-brand-primary text-white shadow-soft"
                          : "border-border/80 bg-white hover:border-brand-primary/60"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                  {!slots.length && (
                    <span className="text-sm text-foreground/70">
                      {loadingSlots ? "Carregando..." : "Nenhum horário disponível para esta data."}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-brand-primary/30">
            <CardHeader>
              <CardTitle>2) Seus dados</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="(31) 9 9999-9999"
                      value={formatPhone(telefone)}
                      onChange={(e) => setTelefone(e.target.value)}
                    />
                    <Button type="button" onClick={buscarCliente} disabled={loadingBusca}>
                      {loadingBusca ? "Buscando..." : "Buscar"}
                    </Button>
                  </div>
                </div>

                {buscouTelefone && !cliente && (
                  <div className="space-y-3 rounded-xl border border-border/70 bg-brand-soft/60 p-3">
                    <div className="space-y-2">
                      <Label>Seu nome</Label>
                      <Input
                        placeholder="Seu nome completo"
                        value={novoClienteNome}
                        onChange={(e) => setNovoClienteNome(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-brand-deep">Cadastre seu pet</p>
                      <Button type="button" size="sm" variant="outline" onClick={addNovoPet}>
                        Adicionar pet
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {novoPets.map((pet, idx) => (
                        <div key={pet.key} className="space-y-2 rounded-xl border border-border/70 p-3">
                          <div className="flex items-center justify-between text-sm font-semibold text-brand-deep">
                            Pet {idx + 1}
                            {novoPets.length > 1 && (
                              <button onClick={() => removerNovoPet(pet.key)} className="text-xs text-brand-primary">
                                Remover
                              </button>
                            )}
                          </div>
                          <Input
                            placeholder="Nome do pet"
                            value={pet.nome}
                            onChange={(e) => updateNovoPet(pet.key, { nome: e.target.value })}
                          />
                          <div className="grid grid-cols-3 gap-2">
                            <Select
                              value={pet.especie}
                              onChange={(e) => updateNovoPet(pet.key, { especie: e.target.value })}
                            >
                              <option value="cachorro">Cachorro</option>
                              <option value="gato">Gato</option>
                              <option value="outro">Outro</option>
                            </Select>
                            <Select
                              value={pet.porte}
                              onChange={(e) =>
                                updateNovoPet(pet.key, {
                                  porte: e.target.value as "PEQUENO" | "MEDIO" | "GRANDE",
                                })
                              }
                            >
                              <option value="PEQUENO">Pequeno</option>
                              <option value="MEDIO">Médio</option>
                              <option value="GRANDE">Grande</option>
                            </Select>
                            <Select
                              value={pet.sexo}
                              onChange={(e) =>
                                updateNovoPet(pet.key, {
                                  sexo: e.target.value as "MACHO" | "FEMEA",
                                })
                              }
                            >
                              <option value="MACHO">Macho</option>
                              <option value="FEMEA">Fêmea</option>
                            </Select>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-brand-deep">
                            <input
                              type="radio"
                              name="pet-selecionado"
                              checked={petSelecionado === pet.key}
                              onChange={() => setPetSelecionado(pet.key)}
                            />
                            Selecionar para agendar
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!isNovo && cliente && (
                  <div className="space-y-3 rounded-xl border border-border/70 bg-brand-soft/60 p-3">
                    <p className="text-sm font-semibold text-brand-deep">
                      {cliente.nome} · selecione o pet
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {(cliente.animais ?? []).map((pet) => (
                        <button
                          key={pet.id}
                          type="button"
                          onClick={() => setPetSelecionado(pet.id)}
                          className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                            petSelecionado === pet.id
                              ? "border-brand-primary bg-brand-primary/10 text-brand-deep"
                              : "border-border/70 bg-white"
                          }`}
                        >
                          <p className="font-semibold">{pet.nome}</p>
                          <p className="text-xs text-foreground/70">{pet.especie ?? "Pet"}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Serviços desejados</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {services.map((service) => {
                      const active = selectedServices.includes(service.id);
                      return (
                        <button
                          type="button"
                          key={service.id}
                          onClick={() => toggleService(service.id)}
                          className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition ${
                            active
                              ? "border-brand-primary bg-brand-primary/10 text-brand-deep"
                              : "border-border/80 bg-white hover:border-brand-primary/50"
                          }`}
                        >
                          <div>
                            <p className="font-semibold text-brand-deep">{service.nome}</p>
                            {service.valor_padrao && (
                              <p className="text-xs text-foreground/70">{formatCurrency(service.valor_padrao)}</p>
                            )}
                          </div>
                          <Badge>{active ? "Selecionado" : "Selecionar"}</Badge>
                        </button>
                      );
                    })}
                  </div>
                  <div className="rounded-xl border border-brand-primary/30 bg-brand-primary/10 px-3 py-2 text-sm font-semibold text-brand-deep">
                    Total estimado: {formatCurrency(total)}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Input
                    placeholder="Conte sobre o pet ou alguma necessidade especial"
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                  />
                </div>

                {message && (
                  <div className="rounded-xl border border-brand-primary/30 bg-brand-primary/10 px-3 py-2 text-sm text-brand-deep">
                    {message}
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={enviando}>
                  {enviando ? "Enviando..." : "Confirmar agendamento"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
