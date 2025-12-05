"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  PawPrint,
  Scissors,
  Sparkles,
  ShieldCheck,
  HeartHandshake,
  Droplets,
  Bath,
  Home,
  Phone,
  Instagram,
  MapPin,
  Clock3,
  Star,
  Quote,
  ChevronDown,
  Menu,
  X,
  ArrowUp,
  CalendarClock,
} from "lucide-react";
import Image from "next/image";

const navLinks = [
  { href: "#inicio", label: "Início" },
  { href: "#servicos", label: "Serviços" },
  { href: "#sobre", label: "Sobre" },
  { href: "#galeria", label: "Antes & Depois" },
  { href: "#depoimentos", label: "Depoimentos" },
  { href: "#localizacao", label: "Localização" },
  { href: "#contato", label: "Contato" },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-border/60 bg-brand-soft/90 backdrop-blur-md">
      <div className="container flex items-center justify-between gap-4 py-4">
        <Link href="#inicio" className="flex items-center gap-3">
          <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary shadow-soft">
            <Image
              src="/logomarca.svg"
              alt="Mania de Cuidar"
              width={120}
              height={120}
              className="h-28 w-28 object-contain"
              priority
            />
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-brand-deep md:flex">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="transition hover:text-brand-primary">
              {link.label}
            </a>
          ))}
          <Button asChild>
            <a href="#contato">Agendar horário</a>
          </Button>
        </nav>

        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-brand-deep md:hidden"
          onClick={() => setOpen((p) => !p)}
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-border/60 bg-white/95 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-brand-deep transition hover:bg-brand-soft/60"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Button asChild className="w-full">
              <a href="#contato" onClick={() => setOpen(false)}>
                Agendar horário
              </a>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

export function Hero() {
  return (
    <motion.section
      id="inicio"
      className="relative overflow-hidden bg-brand-soft/90 pb-20 pt-28 sm:pt-32"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(164,34,46,0.12),_transparent_45%),_radial-gradient(circle_at_bottom_right,_rgba(92,49,41,0.12),_transparent_45%)]" />
      <div className="container relative grid items-center gap-10 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-deep shadow-sm">
            Desde 2016 · Estética Animal
          </div>
          <h1 className="font-display text-4xl leading-tight text-brand-deep sm:text-5xl">
            Cuidar é a nossa mania.
          </h1>
          <p className="text-lg text-foreground/80 sm:text-xl">
            Banho, tosa e estética animal com carinho, segurança e amor pelos pets desde 2016.
            Transformamos cada visita em uma experiência acolhedora e cheia de cuidado.
          </p>
          <ul className="space-y-3 text-brand-deep/90">
            {[
              { icon: ShieldCheck, text: "Profissionais especializados e apaixonados por pets" },
              { icon: Sparkles, text: "Ambiente higienizado, seguro e climatizado" },
              { icon: Scissors, text: "Banho & tosa personalizados para cada necessidade" },
            ].map((item) => (
              <li key={item.text} className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-brand-primary shadow-sm">
                  <item.icon className="h-5 w-5" />
                </span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <a href="#contato">Agendar agora</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="#servicos">Ver serviços</a>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/meus-agendamentos">Consultar agendamentos</Link>
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-6 -top-6 h-28 w-28 rounded-full bg-brand-primary/10 blur-2xl" />
          <div className="absolute -right-8 bottom-10 h-28 w-28 rounded-full bg-brand-deep/10 blur-2xl" />
          <Card className="relative overflow-hidden border-brand-primary/30 bg-white/90 shadow-soft">
            <CardHeader className="pb-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-semibold text-brand-primary">
                <Sparkles className="h-4 w-4" /> Experiência premium
              </div>
              <CardTitle className="text-2xl text-brand-deep">Banho & tosa com carinho</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-52 rounded-2xl bg-gradient-to-br from-brand-soft to-white bg-[length:200%_200%] p-4 shadow-inner">
                <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-brand-primary/30 bg-white/60 text-brand-deep/80">
                  Imagem dos pets em destaque
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-brand-primary/10 px-4 py-3 text-sm text-brand-deep">
                <div>
                  <p className="font-semibold text-brand-primary">Desde 2016</p>
                  <p className="text-xs text-brand-deep/70">Mais de 6.000 banhos realizados</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-brand-deep/80">
                  <ShieldCheck className="h-5 w-5 text-brand-primary" />
                  Atendimento humanizado
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.section>
  );
}

export function ServicesSection() {
  const services = [
    { title: "Banho completo", icon: Bath, description: "Higienização suave, pelagem macia e cheirosa." },
    { title: "Tosa personalizada", icon: Scissors, description: "Tradicional, higiênica ou tesoura para cada raça." },
    { title: "Hidratação & Spa", icon: Droplets, description: "Hidratação profunda e cuidados especiais para a pele." },
    { title: "Limpeza de ouvidos & unhas", icon: Sparkles, description: "Todo cuidado para o conforto e saúde do pet." },
    { title: "Estética avançada", icon: PawPrint, description: "Laços, gravatinhas e detalhes que encantam." },
    { title: "Daycare / Hotelzinho", icon: Home, description: "Conforto e segurança para o dia inteiro do pet." },
  ];

  return (
    <motion.section
      id="servicos"
      className="bg-white py-16 sm:py-20"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="container space-y-6">
        <div className="flex flex-col gap-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-deep/70">
            Serviços
          </p>
          <h2 className="font-display text-3xl text-brand-deep sm:text-4xl">Nossos serviços</h2>
          <p className="text-base text-foreground/80">
            Tudo o que seu pet precisa para ficar limpo, cheiroso e feliz.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.title} className="border-brand-primary/20 transition hover:-translate-y-1 hover:shadow-soft">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-brand-primary/15 text-brand-primary">
                  <service.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg text-brand-deep">{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-foreground/70">{service.description}</CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center">
          <Button asChild>
            <a href="#contato">Ver todos os serviços</a>
          </Button>
        </div>
      </div>
    </motion.section>
  );
}

export function DifferentialsSection() {
  const items = [
    { icon: HeartHandshake, title: "Carinho e respeito", text: "Cuidamos como se fosse da família." },
    { icon: ShieldCheck, title: "Ambiente seguro", text: "Higienizado, climatizado e preparado para qualquer porte." },
    { icon: Sparkles, title: "Personalização", text: "Planos por porte, raça e necessidade especial." },
    { icon: CalendarClock, title: "Agenda inteligente", text: "Horários pensados para conforto e agilidade." },
  ];

  return (
    <motion.section
      className="bg-[#fbe3dd] py-16 sm:py-20"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="container space-y-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-deep/70">
            Por que escolher
          </p>
          <h2 className="font-display text-3xl text-brand-deep sm:text-4xl">Mania de Cuidar</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <Card key={item.title} className="border-brand-primary/20 bg-white/80 shadow-soft">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-brand-primary/15 text-brand-primary">
                  <item.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg text-brand-deep">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-foreground/70">{item.text}</CardContent>
            </Card>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

export function AboutSection() {
  return (
    <motion.section
      id="sobre"
      className="bg-white py-16 sm:py-20"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="container grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-deep/70">
            Sobre nós
          </p>
          <h2 className="font-display text-3xl text-brand-deep sm:text-4xl">Mania de Cuidar</h2>
          <p className="text-base text-foreground/80">
            Desde 2016, oferecemos serviços de estética animal com carinho, segurança e atenção aos
            detalhes. Tratamos cada pet como membro da nossa família, garantindo uma experiência
            acolhedora e confiante.
          </p>
          <p className="text-base text-foreground/80">
            Nossa equipe é apaixonada por animais e busca sempre o bem-estar, a higiene e a
            tranquilidade do seu pet, do check-in ao retorno para casa.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-brand-primary/20 bg-brand-primary/10 text-brand-deep">
              <CardContent className="space-y-1 p-4">
                <p className="text-3xl font-bold text-brand-primary">+8 anos</p>
                <p className="text-sm text-brand-deep/80">de experiência dedicada</p>
              </CardContent>
            </Card>
            <Card className="border-brand-primary/20 bg-brand-soft text-brand-deep">
              <CardContent className="space-y-1 p-4">
                <p className="text-3xl font-bold text-brand-primary">+6.000</p>
                <p className="text-sm text-brand-deep/80">banhos e tosas realizados</p>
              </CardContent>
            </Card>
          </div>
        </div>
        <Card className="overflow-hidden border-brand-primary/25 bg-brand-soft/70 shadow-soft">
          <CardContent className="space-y-4 p-6">
            <div className="h-52 rounded-2xl bg-gradient-to-br from-brand-primary/15 via-white to-brand-soft/80 p-4">
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-brand-primary/30 text-brand-deep/80">
                Espaço para foto da equipe e pets
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white/80 px-4 py-3 text-sm text-brand-deep">
              <ShieldCheck className="h-5 w-5 text-brand-primary" />
              Atendimento humanizado e seguro
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.section>
  );
}

export function GallerySection() {
  const items = [
    "Banho relaxante",
    "Tosa higiênica",
    "Spa & hidratação",
    "Daycare",
    "Antes & Depois",
    "Cuidado especial",
  ];
  return (
    <motion.section
      id="galeria"
      className="bg-brand-soft/60 py-16 sm:py-20"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="container space-y-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-deep/70">
            Antes & Depois
          </p>
          <h2 className="font-display text-3xl text-brand-deep sm:text-4xl">
            Veja a transformação dos nossos clientes
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {items.map((item) => (
            <div
              key={item}
              className="flex h-52 items-center justify-center rounded-2xl border border-border/70 bg-gradient-to-br from-white via-brand-soft/80 to-white text-center text-sm font-medium text-brand-deep shadow-soft"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

export function TestimonialsSection() {
  const testimonials = [
    { tutor: "Ana Paula", pet: "Luna", text: "A Luna voltou cheirosa, calma e linda. Atendimento impecável!" },
    { tutor: "Ricardo e Júlia", pet: "Thor", text: "A equipe é super cuidadosa, Thor adora o dia de spa aqui." },
    { tutor: "Camila", pet: "Mimi", text: "Melhor banho e tosa da região. Confiança total desde 2016!" },
  ];

  return (
    <motion.section id="depoimentos" className="bg-white py-16 sm:py-20" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
      <div className="container space-y-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-deep/70">
            Depoimentos
          </p>
          <h2 className="font-display text-3xl text-brand-deep sm:text-4xl">
            O carinho que fala por si
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <Card key={item.tutor} className="border-brand-primary/20 bg-brand-soft/40 shadow-soft">
              <CardContent className="space-y-3 p-5">
                <Quote className="h-6 w-6 text-brand-primary" />
                <p className="text-base text-brand-deep/90">{item.text}</p>
                <div className="space-y-1 text-sm text-brand-deep/80">
                  <p className="font-semibold text-brand-deep">{item.tutor}</p>
                  <p>Pet: {item.pet}</p>
                  <div className="flex items-center gap-1 text-brand-primary">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-brand-primary text-brand-primary" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

export function ContactSection() {
  type Servico = { id: string; nome: string; valor_padrao: number | null };
  type Animal = { id: string; nome: string; especie?: string | null; porte?: string | null; sexo?: string | null };
  type Cliente = { id: string; nome: string; telefone1: string; animais?: Animal[] | null };

  const [telefone, setTelefone] = useState("");
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [novoClienteNome, setNovoClienteNome] = useState("");
  const [novoPets, setNovoPets] = useState<
    { key: string; nome: string; especie: string; porte: "PEQUENO" | "MEDIO" | "GRANDE"; sexo: "MACHO" | "FEMEA" }[]
  >([{ key: crypto.randomUUID(), nome: "", especie: "cachorro", porte: "PEQUENO", sexo: "MACHO" }]);
  const [petSelecionado, setPetSelecionado] = useState<string>("");
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [servicosSelecionados, setServicosSelecionados] = useState<string[]>([]);
  const [dataDesejada, setDataDesejada] = useState("");
  const [horarios, setHorarios] = useState<string[]>([]);
  const [horaSelecionada, setHoraSelecionada] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [loadingBusca, setLoadingBusca] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [buscouTelefone, setBuscouTelefone] = useState(false);

  const isNovo = !cliente;

  useEffect(() => {
    loadServicos();
  }, []);

  useEffect(() => {
    if (dataDesejada) {
      loadHorarios(dataDesejada);
    }
  }, [dataDesejada]);

  useEffect(() => {
    if (isNovo && !petSelecionado && novoPets.length) {
      setPetSelecionado(novoPets[0].key);
    }
  }, [isNovo, novoPets, petSelecionado]);

  const total = useMemo(() => {
    return servicosSelecionados.reduce((acc, id) => {
      const svc = servicos.find((s) => s.id === id);
      return acc + Number(svc?.valor_padrao ?? 0);
    }, 0);
  }, [servicosSelecionados, servicos]);

  async function loadServicos() {
    try {
      const res = await fetch("/api/public/servicos");
      const data = await res.json();
      if (res.ok) setServicos(data.data ?? []);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadHorarios(date: string) {
    setLoadingHorarios(true);
    try {
      const res = await fetch(`/api/public/horarios?data=${date}`);
      const data = await res.json();
      if (res.ok) setHorarios(data.slots ?? []);
      else setHorarios([]);
    } catch (error) {
      console.error(error);
      setHorarios([]);
    } finally {
      setLoadingHorarios(false);
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
    setErro(null);
    setSucesso(null);
    setCliente(null);
    setPetSelecionado("");
    setLoadingBusca(true);
    try {
      const clean = telefone.replace(/\D/g, "");
      const res = await fetch(`/api/public/clientes?telefone=${encodeURIComponent(clean)}`);
      const data = await res.json();
      if (res.ok && data.data) {
        const found: Cliente = data.data;
        setCliente(found);
        setPetSelecionado(found.animais?.[0]?.id ?? "");
      } else {
        setCliente(null);
      }
    } catch (error) {
      console.error(error);
      setErro("Não foi possível buscar o telefone.");
    } finally {
      setLoadingBusca(false);
      setBuscouTelefone(true);
    }
  }

  const toggleServico = (id: string) => {
    setServicosSelecionados((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const addNovoPet = () => {
    setNovoPets((prev) => [
      ...prev,
      { key: crypto.randomUUID(), nome: "", especie: "cachorro", porte: "PEQUENO", sexo: "MACHO" },
    ]);
  };

  const updateNovoPet = (key: string, patch: Partial<(typeof novoPets)[number]>) => {
    setNovoPets((prev) => prev.map((p) => (p.key === key ? { ...p, ...patch } : p)));
  };

  const removerNovoPet = (key: string) => {
    setNovoPets((prev) => prev.filter((p) => p.key !== key));
    if (petSelecionado === key) setPetSelecionado("");
  };

  async function enviarAgendamento() {
    setErro(null);
    setSucesso(null);
    const telefoneLimpo = telefone.replace(/\D/g, "");
    if (!telefoneLimpo) return setErro("Informe o telefone");
    if (!servicosSelecionados.length) return setErro("Selecione pelo menos um serviço");
    if (!dataDesejada || !horaSelecionada) return setErro("Escolha data e horário");

    const isNovoPet = isNovo || novoPets.some((p) => p.key === petSelecionado);
    const petParaEnviar = isNovo
      ? novoPets.find((p) => p.key === petSelecionado) ?? novoPets[0]
      : novoPets.find((p) => p.key === petSelecionado);

    if (isNovo && !petParaEnviar?.nome) return setErro("Informe os dados do pet");
    if (isNovo && !novoClienteNome) return setErro("Informe seu nome");

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
      servicos: servicosSelecionados,
      data: dataDesejada,
      hora: horaSelecionada,
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
    try {
      const res = await fetch("/api/public/agendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error ?? "Erro ao enviar agendamento");
        return;
      }
      setSucesso("Pedido de agendamento enviado! Entraremos em contato para confirmar.");
      setServicosSelecionados([]);
      setHoraSelecionada("");
      setObservacoes("");
    } catch (error) {
      console.error(error);
      setErro("Erro ao enviar agendamento");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section id="contato" className="bg-brand-soft/70 py-16 sm:py-20">
      <div className="container grid gap-10 lg:grid-cols-2 lg:items-start">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-deep/70">
            Agende um horário
          </p>
          <h2 className="font-display text-3xl text-brand-deep sm:text-4xl">
            Agende o próximo banho do seu pet
          </h2>
          <p className="text-base text-foreground/80">
            Preencha os dados e retornaremos para confirmar o horário. Se preferir, fale direto no
            WhatsApp.
          </p>
          <div className="space-y-2 text-sm text-brand-deep/80">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-brand-primary" /> (31) 99999-9999
            </div>
            <div className="flex items-center gap-2">
              <Instagram className="h-4 w-4 text-brand-primary" /> @maniadecuidar.pet
            </div>
          </div>
        </div>

        <Card className="border-brand-primary/20 bg-white shadow-soft">
          <CardContent className="space-y-4 p-6">
            {erro && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</div>}
            {sucesso && <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{sucesso}</div>}

            <div className="space-y-2">
              <Label>Telefone / WhatsApp</Label>
              <div className="flex gap-2">
                    <Input
                      type="tel"
                      placeholder="(31) 9 9999-9999"
                      value={formatPhone(telefone)}
                      onChange={(e) => setTelefone(e.target.value)}
                />
                <Button type="button" onClick={buscarCliente} disabled={loadingBusca}>
                  {loadingBusca ? "Buscando..." : "Buscar"}
                </Button>
              </div>
              <p className="text-xs text-brand-deep/70">
                Buscamos seu cadastro para agilizar o agendamento.
              </p>
            </div>

            {buscouTelefone && isNovo ? (
              <div className="space-y-2 rounded-xl border border-border/70 bg-brand-soft/60 p-3">
                <p className="text-sm font-semibold text-brand-deep">Novo cliente</p>
                <div className="space-y-2">
                  <Label>Seu nome</Label>
                  <Input value={novoClienteNome} onChange={(e) => setNovoClienteNome(e.target.value)} placeholder="Seu nome completo" />
                </div>
                <div className="space-y-3">
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
                        <div className="grid gap-2 sm:grid-cols-3">
                          <select
                            className="h-10 rounded-lg border border-input bg-white px-3 text-sm text-brand-deep shadow-sm"
                            value={pet.especie}
                            onChange={(e) => updateNovoPet(pet.key, { especie: e.target.value })}
                          >
                            <option value="cachorro">Cachorro</option>
                            <option value="gato">Gato</option>
                            <option value="outro">Outro</option>
                          </select>
                          <select
                            className="h-10 rounded-lg border border-input bg-white px-3 text-sm text-brand-deep shadow-sm"
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
                          </select>
                          <select
                            className="h-10 rounded-lg border border-input bg-white px-3 text-sm text-brand-deep shadow-sm"
                            value={pet.sexo}
                            onChange={(e) =>
                              updateNovoPet(pet.key, {
                                sexo: e.target.value as "MACHO" | "FEMEA",
                              })
                            }
                          >
                            <option value="MACHO">Macho</option>
                            <option value="FEMEA">Fêmea</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-brand-deep">
                          <input
                            type="radio"
                            name="pet-selecionado"
                            checked={petSelecionado ? petSelecionado === pet.key : idx === 0}
                            onChange={() => setPetSelecionado(pet.key)}
                          />
                          Selecionar para este agendamento
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : !isNovo ? (
              <div className="space-y-3 rounded-xl border border-border/70 bg-brand-soft/60 p-3">
                <div className="text-sm text-brand-deep">
                  <p className="font-semibold">{cliente?.nome}</p>
                  <p className="text-brand-deep/70">Telefone confirmado. Selecione o pet:</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {(cliente?.animais ?? []).map((pet) => (
                    <button
                      key={pet.id}
                      className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                        petSelecionado === pet.id
                          ? "border-brand-primary bg-brand-primary/10 text-brand-deep"
                          : "border-border/70 bg-white"
                      }`}
                      onClick={() => setPetSelecionado(pet.id)}
                    >
                      <p className="font-semibold">{pet.nome}</p>
                      <p className="text-xs text-brand-deep/70">{pet.especie ?? "Pet"}</p>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-xs text-brand-deep/80">
                  Se precisar cadastrar um novo pet, refaça a busca com o telefone após cadastrar conosco.
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border/70 bg-brand-soft/60 px-3 py-2 text-sm text-brand-deep/80">
                Informe o telefone e clique em buscar para continuar.
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Dia desejado</Label>
                <Input type="date" value={dataDesejada} onChange={(e) => setDataDesejada(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Horário desejado</Label>
                <select
                  className="h-10 w-full rounded-lg border border-input bg-white px-3 text-sm text-brand-deep shadow-sm"
                  value={horaSelecionada}
                  onChange={(e) => setHoraSelecionada(e.target.value)}
                >
                  <option value="">{loadingHorarios ? "Carregando..." : "Selecione"}</option>
                  {horarios.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Serviços desejados</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                {servicos.map((svc) => (
                  <label
                    key={svc.id}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2 text-sm transition ${
                      servicosSelecionados.includes(svc.id)
                        ? "border-brand-primary bg-brand-primary/10"
                        : "border-border/70 bg-white"
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-brand-deep">{svc.nome}</p>
                      <p className="text-xs text-brand-deep/70">
                        {svc.valor_padrao ? `R$ ${Number(svc.valor_padrao).toFixed(2)}` : "Sob consulta"}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={servicosSelecionados.includes(svc.id)}
                      onChange={() => toggleServico(svc.id)}
                    />
                  </label>
                ))}
              </div>
              <div className="rounded-xl border border-brand-primary/30 bg-brand-primary/5 px-3 py-2 text-sm font-semibold text-brand-deep">
                Total estimado: R$ {total.toFixed(2)}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Mensagem / observações</Label>
              <Textarea
                placeholder="Conte sobre o pet ou alguma necessidade especial"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
              />
            </div>
            <Button className="w-full" type="button" onClick={enviarAgendamento} disabled={enviando}>
              {enviando ? "Enviando..." : "Enviar pedido de agendamento"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export function LocationSection() {
  return (
    <section id="localizacao" className="bg-white py-16 sm:py-20">
      <div className="container grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-deep/70">
            Localização
          </p>
          <h2 className="font-display text-3xl text-brand-deep sm:text-4xl">Onde estamos</h2>
          <p className="text-base text-foreground/80">
            Rua do Pet Feliz, 123 - Centro, Conselheiro Lafaiete - MG
          </p>
          <div className="flex items-center gap-2 text-sm text-brand-deep/80">
            <MapPin className="h-4 w-4 text-brand-primary" /> Fácil acesso, estacionamento próximo.
          </div>
          <div className="flex items-center gap-2 text-sm text-brand-deep/80">
            <Clock3 className="h-4 w-4 text-brand-primary" /> Seg - Sex: 9h às 18h · Sáb: 9h às 14h
          </div>
          <div className="grid gap-2 rounded-2xl border border-border/70 bg-brand-soft/60 p-4 text-sm text-brand-deep">
            <div className="flex items-center justify-between">
              <span>Seg - Sex</span>
              <span>09h às 18h</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Sábado</span>
              <span>09h às 14h</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Domingos e feriados</span>
              <span>Consultar disponibilidade</span>
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-brand-soft/60 shadow-soft">
          <div className="h-[320px] w-full">
            <iframe
              title="Mapa Mania de Cuidar"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3675.2200822985!2d-43.938!3d-22.902!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0:0x0!2zMjLCsDU0JzA3LjIiUyA0M8KwNTYnMTYuOCJX!5e0!3m2!1spt-BR!2sbr!4v00000000000"
              width="100%"
              height="100%"
              loading="lazy"
              className="h-full w-full"
              style={{ border: 0 }}
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export function FAQSection() {
  const faqs = [
    {
      q: "Como funciona o agendamento?",
      a: "Você pode enviar pelo formulário, WhatsApp ou telefone. Confirmamos horário conforme agenda disponível.",
    },
    {
      q: "Quais cuidados com animais idosos?",
      a: "Adaptamos o tempo e os produtos, priorizando conforto e segurança com monitoramento constante.",
    },
    { q: "Posso acompanhar o banho?", a: "Sim, temos área de espera e janela para acompanhamento seguro." },
    {
      q: "E se meu pet tiver medo de banho?",
      a: "Nossa equipe é treinada para conduzir de forma acolhedora, com pausas e mimos para reduzir o estresse.",
    },
  ];

  return (
    <section className="bg-brand-soft/60 py-16 sm:py-20">
      <div className="container space-y-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-deep/70">FAQ</p>
          <h2 className="font-display text-3xl text-brand-deep sm:text-4xl">Perguntas frequentes</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-border/70 bg-white/80 px-4 py-3 text-brand-deep shadow-soft"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-base font-semibold">
                {item.q}
                <ChevronDown className="h-4 w-4 text-brand-primary transition group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-sm text-foreground/80">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-brand-deep text-white">
      <div className="container grid gap-8 py-10 sm:grid-cols-3">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <PawPrint className="h-6 w-6" />
            Mania de Cuidar
          </div>
          <p className="text-sm text-white/80">
            Estética Animal · Desde 2016. Carinho, segurança e bem-estar para o seu pet.
          </p>
        </div>
        <div className="space-y-3">
          <p className="text-sm font-semibold">Links rápidos</p>
          <div className="flex flex-col gap-2 text-sm text-white/80">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-white">
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <div className="space-y-3 text-sm text-white/80">
          <p className="font-semibold text-white">Contato</p>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" /> (31) 99999-9999
          </div>
          <div className="flex items-center gap-2">
            <Instagram className="h-4 w-4" /> @maniadecuidar.pet
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Conselheiro Lafaiete - MG
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/70">
        © Mania de Cuidar – Estética Animal. Desde 2016. Todos os direitos reservados.
      </div>
    </footer>
  );
}

export function FloatingButtons() {
  return (
    <>
      <a
        href="https://wa.me/5531999999999"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary text-white shadow-soft transition hover:scale-105"
      >
        <Phone className="h-6 w-6" />
      </a>
      <a
        href="#inicio"
        className="fixed bottom-6 right-24 z-30 inline-flex h-12 w-12 items-center justify-center rounded-full border border-brand-primary bg-white text-brand-primary shadow-soft transition hover:scale-105 max-sm:hidden"
      >
        <ArrowUp className="h-4 w-4" />
      </a>
    </>
  );
}









