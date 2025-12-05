export const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "layout-dashboard" },
  { href: "/clientes", label: "Clientes", icon: "users" },
  { href: "/animais", label: "Animais", icon: "paw-print" },
  { href: "/servicos", label: "Servicos", icon: "sparkles" },
  { href: "/produtos", label: "Produtos", icon: "package" },
  { href: "/atendimentos", label: "Atendimentos", icon: "stethoscope" },
  { href: "/agenda", label: "Agenda", icon: "calendar-clock" },
  { href: "/caixa", label: "Caixa", icon: "wallet-cards" },
  { href: "/estoque", label: "Estoque", icon: "package" },
  { href: "/despesas", label: "Despesas", icon: "receipt" },
];

export const agendamentoStatus = [
  { value: "AGENDADO", label: "Agendado" },
  { value: "EM_ATENDIMENTO", label: "Em atendimento" },
  { value: "CONCLUIDO", label: "Concluido" },
  { value: "CANCELADO", label: "Cancelado" },
  { value: "NAO_COMPARECEU", label: "Nao compareceu" },
] as const;

export const formaPagamento = [
  { value: "PIX", label: "Pix" },
  { value: "DINHEIRO", label: "Dinheiro" },
  { value: "DEBITO", label: "Debito" },
  { value: "CREDITO", label: "Credito" },
  { value: "OUTROS", label: "Outros" },
] as const;
