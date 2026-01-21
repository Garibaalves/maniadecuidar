"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Star,
  Quote,
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

const stagger: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
};

const itemFade: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 1, 0.5, 1] },
  },
};

const petImages = [
  "/images/image1.jpeg",
  "/images/image2.jpeg",
  "/images/image3.jpeg",
  "/images/image4.jpeg",
  "/images/image5.jpeg",
  "/images/image6.jpeg",
  "/images/image7.jpeg",
  "/images/image8.jpeg",
  "/images/image9.jpeg",
  "/images/image10.jpeg",
  "/images/image11.jpeg",
  "/images/image12.jpeg",
  "/images/image13.jpeg",
  "/images/image14.jpeg",
  "/images/2image8.jpeg",
] as const;

const collageFrames = [
  { top: "6%", left: "5%", width: "56%", height: "78%", rotate: "-3deg", z: 30 },
  { top: "14%", left: "42%", width: "46%", height: "72%", rotate: "2deg", z: 40 },
  { top: "44%", left: "8%", width: "48%", height: "58%", rotate: "1deg", z: 35 },
  { top: "10%", left: "18%", width: "50%", height: "80%", rotate: "-8deg", z: 20 },
] as const;

const shuffleArray = <T,>(list: readonly T[]) => {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const pickRandomImages = (count: number) => shuffleArray(petImages).slice(0, count);

function useRandomImages(count: number) {
  const [images, setImages] = useState(() => petImages.slice(0, Math.min(count, petImages.length)));

  useEffect(() => {
    setImages(pickRandomImages(count));
  }, [count]);

  return images;
}

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
            <a href="#contato">Area do cliente</a>
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
                Area do cliente
              </a>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

export function Hero() {
  const heroPetImages = useRandomImages(4);
  const heroFrames = collageFrames;

  return (
    <motion.section
      id="inicio"
      className="relative scroll-mt-32 overflow-hidden bg-brand-soft/90 pb-20 pt-28 sm:scroll-mt-36 sm:pt-32"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(164,34,46,0.12),_transparent_45%),_radial-gradient(circle_at_bottom_right,_rgba(92,49,41,0.12),_transparent_45%)]" />
      <div className="container relative grid items-center gap-10 lg:grid-cols-2">
        <motion.div
          className="space-y-6"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-deep shadow-sm"
            variants={itemFade}
          >
            Desde 2016 · Estética Animal
          </motion.div>
          <motion.h1 className="font-display text-4xl leading-tight text-brand-deep sm:text-5xl" variants={itemFade}>
            Cuidar é a nossa mania.
          </motion.h1>
          <motion.p className="text-lg text-foreground/80 sm:text-xl" variants={itemFade}>
            Banho, tosa e estética animal com carinho, segurança e amor pelos pets desde 2016.
            Transformamos cada visita em uma experiência acolhedora e cheia de cuidado.
          </motion.p>
          <motion.ul className="space-y-3 text-brand-deep/90" variants={itemFade}>
            {[
              { icon: ShieldCheck, text: "Profissionais especializados e apaixonados por pets" },
              { icon: Sparkles, text: "Ambiente higienizado, seguro e climatizado" },
              { icon: Scissors, text: "Banho & tosa personalizados para cada necessidade" },
            ].map((item) => (
              <motion.li key={item.text} className="flex items-center gap-3" variants={itemFade}>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-brand-primary shadow-sm">
                  <item.icon className="h-5 w-5" />
                </span>
                <span>{item.text}</span>
              </motion.li>
            ))}
          </motion.ul>
          <motion.div className="flex flex-wrap gap-3" variants={itemFade}>
            <Button asChild>
              <a href="#contato">Area do cliente</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="#servicos">Ver serviços</a>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/meus-agendamentos">Consultar agendamentos</Link>
            </Button>
          </motion.div>
        </motion.div>

        <div className="relative">
          <div className="absolute -left-6 -top-6 h-28 w-28 rounded-full bg-brand-primary/10 blur-2xl" />
          <div className="absolute -right-8 bottom-10 h-28 w-28 rounded-full bg-brand-deep/10 blur-2xl" />
          <Card className="relative overflow-hidden border-brand-primary/30 bg-white/90 shadow-soft">
            <div className="relative h-[340px] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-brand-soft/80 via-white to-brand-soft/40">
              {heroPetImages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-brand-deep/70">
                  Carregando fotos dos pets
                </div>
              ) : (
                heroPetImages.slice(0, 4).map((src, idx) => (
                  <div
                    key={src}
                    className="absolute overflow-hidden rounded-xl shadow-lg shadow-brand-primary/15"
                    style={{
                      top: heroFrames[idx]?.top,
                      left: heroFrames[idx]?.left,
                      width: heroFrames[idx]?.width,
                      height: heroFrames[idx]?.height,
                      zIndex: heroFrames[idx]?.z,
                      transform: `rotate(${heroFrames[idx]?.rotate})`,
                    }}
                  >
                    <Image
                      src={src}
                      alt="Pet atendido pela Mania de Cuidar"
                      fill
                      sizes="(min-width: 1024px) 520px, 100vw"
                      className="object-cover"
                      priority={idx === 0}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                    <div className="absolute inset-0 ring-2 ring-white/80" />
                  </div>
                ))
              )}
            </div>
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
        <motion.div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
          {services.map((service) => (
            <motion.div key={service.title} variants={itemFade}>
              <Card className="border-brand-primary/20 transition hover:-translate-y-1 hover:shadow-soft">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-brand-primary/15 text-brand-primary">
                    <service.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg text-brand-deep">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-foreground/70">{service.description}</CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
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
        <motion.div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
          {items.map((item) => (
            <motion.div key={item.title} variants={itemFade}>
              <Card className="border-brand-primary/20 bg-white/80 shadow-soft">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-brand-primary/15 text-brand-primary">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg text-brand-deep">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-foreground/70">{item.text}</CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}

export function AboutSection() {
  const aboutPetImages = useRandomImages(4);
  const aboutFrames = collageFrames;

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
        <motion.div className="space-y-4" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }}>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-deep/70">
            Sobre nós
          </p>
          <motion.h2 className="font-display text-3xl text-brand-deep sm:text-4xl" variants={itemFade}>Mania de Cuidar</motion.h2>
          <motion.p className="text-base text-foreground/80" variants={itemFade}>
            Desde 2016, oferecemos serviços de estética animal com carinho, segurança e atenção aos
            detalhes. Tratamos cada pet como membro da nossa família, garantindo uma experiência
            acolhedora e confiante.
          </motion.p>
          <motion.p className="text-base text-foreground/80" variants={itemFade}>
            Nossa equipe é apaixonada por animais e busca sempre o bem-estar, a higiene e a
            tranquilidade do seu pet, do check-in ao retorno para casa.
          </motion.p>
          <motion.div className="grid grid-cols-2 gap-4" variants={itemFade}>
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
          </motion.div>
        </motion.div>
        <motion.div variants={itemFade} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }}>
          <Card className="overflow-hidden border-brand-primary/25 bg-brand-soft/70 shadow-soft">
            <CardContent className="space-y-4 p-6">
              <div className="relative h-[300px] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-brand-primary/15 via-white to-brand-soft/80">
                {aboutPetImages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-brand-deep/70">
                    Carregando fotos dos pets
                  </div>
                ) : (
                  aboutPetImages.slice(0, 4).map((src, idx) => (
                    <div
                      key={src}
                      className="absolute overflow-hidden rounded-xl shadow-lg shadow-brand-primary/15"
                      style={{
                        top: aboutFrames[idx]?.top,
                        left: aboutFrames[idx]?.left,
                        width: aboutFrames[idx]?.width,
                        height: aboutFrames[idx]?.height,
                        zIndex: aboutFrames[idx]?.z,
                        transform: `rotate(${aboutFrames[idx]?.rotate})`,
                      }}
                    >
                      <Image
                        src={src}
                        alt="Equipe cuidando de um pet"
                        fill
                        sizes="(min-width: 1024px) 440px, 100vw"
                        className="object-cover"
                        priority={idx === 0}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                      <div className="absolute inset-0 ring-2 ring-white/80" />
                    </div>
                  ))
                )}
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-white/80 px-4 py-3 text-sm text-brand-deep">
                <ShieldCheck className="h-5 w-5 text-brand-primary" />
                Atendimento humanizado e seguro
              </div>
            </CardContent>
          </Card>
        </motion.div>
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
  const galleryImages = useRandomImages(items.length);
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
            Nossos atendimentos
          </p>
          <h2 className="font-display text-3xl text-brand-deep sm:text-4xl">
            Veja a transformação dos nossos clientes
          </h2>
        </div>
        <motion.div className="grid gap-4 md:grid-cols-3" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
          {items.map((item, index) => (
            <motion.div
              key={item}
              className="relative h-64 overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-white via-brand-soft/80 to-white text-center text-sm font-medium text-brand-deep shadow-soft"
              variants={itemFade}
            >
              {galleryImages[index] && (
                <Image
                  src={galleryImages[index]}
                  alt={`Registro do pet: ${item}`}
                  fill
                  sizes="(min-width: 1024px) 360px, 100vw"
                  className="object-cover"
                  priority={index < 2}
                />
              )}
            </motion.div>
          ))}
        </motion.div>
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

export function LocationSection() {
  const items = [
    { label: "Endereco", value: "Conselheiro Lafaiete - MG" },
    { label: "Horario", value: "Seg a Sab · 08:00 as 18:00" },
    { label: "WhatsApp", value: "(31) 98316-6010" },
  ];

  return (
    <motion.section
      id="localizacao"
      className="bg-white py-16 sm:py-20"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="container grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-deep/70">
            Localizacao
          </p>
          <h2 className="font-display text-3xl text-brand-deep sm:text-4xl">
            Estamos perto de voce
          </h2>
          <p className="text-base text-foreground/80">
            Nosso espaco foi pensado para receber voce e seu pet com conforto,
            seguranca e carinho.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {items.map((item) => (
              <Card key={item.label} className="border-brand-primary/20 bg-brand-soft/60">
                <CardContent className="space-y-1 p-4 text-sm text-brand-deep">
                  <p className="text-xs uppercase tracking-[0.16em] text-brand-deep/70">
                    {item.label}
                  </p>
                  <p className="font-semibold">{item.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button asChild>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Conselheiro%20Lafaiete%20MG"
              target="_blank"
              rel="noreferrer"
            >
              Abrir no mapa
            </a>
          </Button>
        </div>
        <Card className="border-brand-primary/25 bg-brand-soft/70 shadow-soft">
          <CardContent className="p-6">
            <div className="flex h-72 items-center justify-center rounded-2xl border border-border/70 bg-white/80 text-sm text-foreground/70">
              Mapa ilustrativo
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.section>
  );
}

export function FAQSection() {
  const faqs = [
    {
      q: "Preciso levar o pet com antecedencia?",
      a: "Recomendamos chegar 10 minutos antes do horario para acomodar o pet com calma.",
    },
    {
      q: "Como funcionam os planos de assinatura?",
      a: "Os planos incluem quantidades mensais de servicos. Voce acompanha o saldo na area do cliente.",
    },
    {
      q: "Posso remarcar um agendamento?",
      a: "Sim. Fale conosco pelo WhatsApp e ajustamos o melhor horario.",
    },
  ];

  return (
    <motion.section
      id="faq"
      className="bg-brand-soft/60 py-16 sm:py-20"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="container space-y-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-deep/70">
            Duvidas
          </p>
          <h2 className="font-display text-3xl text-brand-deep sm:text-4xl">
            Perguntas frequentes
          </h2>
        </div>
        <motion.div
          className="grid gap-4 md:grid-cols-3"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {faqs.map((item) => (
            <motion.div key={item.q} variants={itemFade}>
              <Card className="border-brand-primary/20 bg-white/90">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{item.q}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-foreground/70">
                  {item.a}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}

export function ContactSection() {
  const router = useRouter();
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [mode, setMode] = useState<"login" | "cadastro">("login");
  const [cadastro, setCadastro] = useState({
    nome: "",
    telefone1: "",
    cpf: "",
    email: "",
    pet_nome: "",
    pet_especie: "Cachorro",
    pet_porte: "PEQUENO",
    pet_temperamento: "CALMO",
    pet_sexo: "MACHO",
    pet_raca: "",
  });
  const [cadastroMsg, setCadastroMsg] = useState<string | null>(null);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10)
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    const p1 = digits.slice(0, 3);
    const p2 = digits.slice(3, 6);
    const p3 = digits.slice(6, 9);
    const p4 = digits.slice(9, 11);
    return [p1, p2, p3].filter(Boolean).join(".") + (p4 ? `-${p4}` : "");
  };

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);
    setLoading(true);
    try {
      const res = await fetch("/api/cliente/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telefone: telefone.replace(/\D/g, ""),
          cpf: cpf.replace(/\D/g, ""),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error ?? "Erro ao entrar");
        return;
      }
      router.push("/cliente");
    } catch (error) {
      console.error(error);
      setErro("Erro ao entrar");
    } finally {
      setLoading(false);
    }
  }

  async function handleCadastro(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);
    setCadastroMsg(null);
    setLoading(true);
    try {
      const payload = {
        nome: cadastro.nome,
        telefone1: cadastro.telefone1.replace(/\D/g, ""),
        cpf: cadastro.cpf.replace(/\D/g, ""),
        email: cadastro.email,
        pet: cadastro.pet_nome
          ? {
              nome: cadastro.pet_nome,
              especie: cadastro.pet_especie,
              porte: cadastro.pet_porte,
              temperamento: cadastro.pet_temperamento,
              sexo: cadastro.pet_sexo,
              raca: cadastro.pet_raca || undefined,
            }
          : undefined,
      };
      const res = await fetch("/api/public/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error ?? "Erro ao cadastrar");
        return;
      }
      setCadastroMsg("Cadastro realizado. Agora voce pode entrar.");
      setMode("login");
      setTelefone(cadastro.telefone1);
      setCpf("");
    } catch (error) {
      console.error(error);
      setErro("Erro ao cadastrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="contato" className="bg-brand-soft/70 py-16 sm:py-20">
      <div className="container grid gap-10 lg:grid-cols-2 lg:items-start">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-deep/70">
            Area do cliente
          </p>
          <h2 className="font-display text-3xl text-brand-deep sm:text-4xl">
            Acesse sua area de cliente
          </h2>
          <p className="text-base text-foreground/80">
            Consulte seus agendamentos, assine planos e gerencie seus pets em um so lugar.
          </p>
          <div className="space-y-2 text-sm text-brand-deep/80">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-brand-primary" /> (31) 98316-6010
            </div>
            <div className="flex items-center gap-2">
              <Instagram className="h-4 w-4 text-brand-primary" /> @mania_de_cuidar
            </div>
          </div>
        </div>

        <Card className="border-brand-primary/20 bg-white shadow-soft">
          <CardContent className="space-y-4 p-6">
            {erro && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {erro}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={mode === "login" ? "default" : "outline"}
                onClick={() => setMode("login")}
              >
                Entrar
              </Button>
              <Button
                type="button"
                variant={mode === "cadastro" ? "default" : "outline"}
                onClick={() => setMode("cadastro")}
              >
                Cadastrar
              </Button>
            </div>

            {mode === "login" ? (
              <form className="space-y-4" onSubmit={handleLogin}>
                {cadastroMsg && (
                  <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                    {cadastroMsg}
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    type="tel"
                    placeholder="(31) 9 8316-6010"
                    value={formatPhone(telefone)}
                    onChange={(e) => setTelefone(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>CPF</Label>
                  <Input
                    placeholder="000.000.000-00"
                    value={formatCpf(cpf)}
                    onChange={(e) => setCpf(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Entrando..." : "Entrar na area do cliente"}
                </Button>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={handleCadastro}>
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    value={cadastro.nome}
                    onChange={(e) => setCadastro((c) => ({ ...c, nome: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    type="tel"
                    placeholder="(31) 9 8316-6010"
                    value={formatPhone(cadastro.telefone1)}
                    onChange={(e) => setCadastro((c) => ({ ...c, telefone1: e.target.value }))}
                    required
                  />
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>CPF</Label>
                    <Input
                      placeholder="000.000.000-00"
                      value={formatCpf(cadastro.cpf)}
                      onChange={(e) => setCadastro((c) => ({ ...c, cpf: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={cadastro.email}
                      onChange={(e) => setCadastro((c) => ({ ...c, email: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="rounded-xl border border-border/70 bg-brand-soft/50 px-3 py-3">
                  <p className="text-sm font-semibold text-brand-deep">Dados do pet (opcional)</p>
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Nome do pet</Label>
                      <Input
                        value={cadastro.pet_nome}
                        onChange={(e) => setCadastro((c) => ({ ...c, pet_nome: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Raca</Label>
                      <Input
                        value={cadastro.pet_raca}
                        onChange={(e) => setCadastro((c) => ({ ...c, pet_raca: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="mt-2 grid gap-2 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Especie</Label>
                      <select
                        className="h-10 w-full rounded-lg border border-input bg-white px-3 text-sm text-brand-deep shadow-sm"
                        value={cadastro.pet_especie}
                        onChange={(e) => setCadastro((c) => ({ ...c, pet_especie: e.target.value }))}
                      >
                        <option value="Cachorro">Cachorro</option>
                        <option value="Gato">Gato</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Porte</Label>
                      <select
                        className="h-10 w-full rounded-lg border border-input bg-white px-3 text-sm text-brand-deep shadow-sm"
                        value={cadastro.pet_porte}
                        onChange={(e) => setCadastro((c) => ({ ...c, pet_porte: e.target.value }))}
                      >
                        <option value="PEQUENO">Pequeno</option>
                        <option value="MEDIO">Medio</option>
                        <option value="GRANDE">Grande</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-2 grid gap-2 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Temperamento</Label>
                      <select
                        className="h-10 w-full rounded-lg border border-input bg-white px-3 text-sm text-brand-deep shadow-sm"
                        value={cadastro.pet_temperamento}
                        onChange={(e) =>
                          setCadastro((c) => ({ ...c, pet_temperamento: e.target.value }))
                        }
                      >
                        <option value="CALMO">Calmo</option>
                        <option value="AGITADO">Agitado</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Sexo</Label>
                      <select
                        className="h-10 w-full rounded-lg border border-input bg-white px-3 text-sm text-brand-deep shadow-sm"
                        value={cadastro.pet_sexo}
                        onChange={(e) => setCadastro((c) => ({ ...c, pet_sexo: e.target.value }))}
                      >
                        <option value="MACHO">Macho</option>
                        <option value="FEMEA">Femea</option>
                      </select>
                    </div>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Cadastrando..." : "Cadastrar cliente"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
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
              <a key={link.href} href={link.href} className="text-white/80 hover:text-white">
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <div className="space-y-3 text-sm text-white/80">
          <p className="font-semibold text-white">Contato</p>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" /> (31) 98316-6010
          </div>
          <div className="flex items-center gap-2">
            <Instagram className="h-4 w-4" /> @mania_de_cuidar
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Conselheiro Lafaiete - MG
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/70">
        © Mania de Cuidar – Estética Animal. Desde 2016. Todos os direitos reservados.{" "}
        Desenvolvido por:{" "}
        <a href="https://www.codenow.com.br/" target="_blank" rel="noreferrer" className="underline text-white/80 hover:text-white">
          Codenow soluções digitais LTDA
        </a>
      </div>
    </footer>
  );
}

export function FloatingButtons() {
  return (
    <>
      <a
        href="https://wa.me/5531983166010"
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

