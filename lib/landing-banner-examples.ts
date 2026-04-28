export type LandingBannerExample = {
  id: string;
  imageUrl?: string;
  category: string;
  title: string;
  subtitle: string;
  footer: string;
  description: string;
  accentClassName?: string;
};

/**
 * COMO ADICIONAR EXEMPLOS PERSONALIZADOS
 *
 * 1. Coloque suas imagens em /public/examples
 * 2. Cadastre cada banner neste array
 * 3. Use imageUrl com o caminho, por exemplo: /examples/meu-banner-01.jpg
 *
 * Exemplo:
 * {
 *   id: "meu-banner-01",
 *   imageUrl: "/examples/meu-banner-01.jpg",
 *   category: "Neon Club",
 *   title: "PULL PARTY FEST",
 *   subtitle: "DJ VISION",
 *   footer: "19/09/2026 • São Paulo",
 *   description: "Banner criado com IA para evento noturno.",
 * }
 */
export const landingBannerExamples: LandingBannerExample[] = [
  {
    id: "banner-01",
    imageUrl: "/examples/banner-01.webp",
    category: "",
    title: "Banner 01",
    subtitle: "",
    footer: "",
    description: "",
  },
  {
    id: "banner-02",
    imageUrl: "/examples/banner-02.webp",
    category: "",
    title: "Banner 02",
    subtitle: "",
    footer: "",
    description: "",
  },
  {
    id: "banner-03",
    imageUrl: "/examples/card/Cyber Rave.webp",
    category: "",
    title: "Banner 03",
    subtitle: "",
    footer: "",
    description: "",
  },
  {
    id: "banner-04",
    imageUrl: "/examples/banner-03.webp",
    category: "",
    title: "Banner 04",
    subtitle: "",
    footer: "",
    description: "",
  },
  {
    id: "banner-05",
    imageUrl: "/examples/banner-05.webp",
    category: "",
    title: "Banner 04",
    subtitle: "",
    footer: "",
    description: "",
  },
  {
    id: "banner-06",
    imageUrl: "/examples/card/Chrome Future.webp",
    category: "",
    title: "Banner 06",
    subtitle: "",
    footer: "",
    description: "",
  },
  {
    id: "banner-07",
    imageUrl: "/examples/card/Summer Vibes.webp",
    category: "",
    title: "Banner 07",
    subtitle: "",
    footer: "",
    description: "",
  },
  {
    id: "banner-08",
    imageUrl: "/examples/card/y2k-club.webp",
    category: "",
    title: "Banner 07",
    subtitle: "",
    footer: "",
    description: "",
  },
];
