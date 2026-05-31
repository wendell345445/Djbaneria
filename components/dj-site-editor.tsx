"use client";

import Link from "next/link";
import type { CSSProperties, FormEvent, ReactNode } from "react";
import { useId, useMemo, useState, useTransition } from "react";
import {
  CalendarPlus,
  Check,
  Copy,
  ExternalLink,
  Globe2,
  ImageIcon,
  Link2,
  Loader2,
  Music2,
  Plus,
  UploadCloud,
  Share2,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import { buildFallbackDjSitePublicPath } from "@/lib/dj-site-validation";
import { buildDjSitePublicUrl } from "@/lib/dj-site-public-url";
import { uploadDjSiteImageToR2 } from "@/lib/dj-site-upload-client";
import type { SupportedLocale } from "@/lib/i18n";

type EditableLink = {
  clientId: string;
  label: string;
  url: string;
  position: number;
  isActive: boolean;
};

type EditableEvent = {
  clientId: string;
  title: string;
  venue: string;
  city: string;
  eventDate: string;
  ticketUrl: string;
  flyerUrl: string;
  position: number;
  isActive: boolean;
};

type DjSiteEditorSite = {
  slug: string;
  artistName: string;
  headline: string | null;
  bio: string | null;
  location: string | null;
  profileImageUrl: string | null;
  coverImageUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  soundcloudUrl: string | null;
  spotifyUrl: string | null;
  youtubeUrl: string | null;
  whatsappUrl: string | null;
  bookingEmail: string | null;
  theme: string;
  accentColor: string | null;
  isPublished: boolean;
  showAgenda?: boolean | null;
  links: Array<{
    label: string;
    url: string;
    position: number;
    isActive: boolean;
  }>;
  events: Array<{
    title: string;
    venue: string | null;
    city: string | null;
    eventDate: string | Date | null;
    ticketUrl: string | null;
    flyerUrl: string | null;
    position: number;
    isActive: boolean;
  }>;
};

type DjSiteEditorProps = {
  initialSite: DjSiteEditorSite;
  locale: SupportedLocale;
};

function getCopy(locale: SupportedLocale) {
  if (locale === "pt-BR") {
    return {
      eyebrow: "DJ Website",
      title: "Seu perfil oficial de DJ",
      subtitle:
        "Crie uma página profissional para DJs com booking, links de música, datas ao vivo, redes sociais e uma presença premium para clubs, promoters, agências e fãs.",
      save: "Publicar site",
      saving: "Publicando...",
      saved: "Site salvo como rascunho.",
      online: "Seu site está online.",
      preview: "Ver preview público",
      copyUrl: "Copiar URL",
      copied: "Copiado",
      published: "Publicado",
      draft: "Rascunho",
      publishLabel: "Publicar site",
      publishHelper:
        "Quando desativado, a página pública retorna 404 e ninguém acessa seu site.",
      publicUrl: "URL pública futura",
      fallbackUrl: "URL pública atual",
      basic: "Identidade",
      links: "Links principais",
      events: "Agenda",
      showAgendaLabel: "Mostrar agenda no site",
      showAgendaHelper:
        "Quando desativado, a seção Live Dates fica oculta no site público.",
      design: "Design",
      paletteTitle: "Paletas de cores",
      paletteHelper:
        "Escolha uma paleta completa para alterar fundo, textos, bordas, botões e destaque visual do site.",
      paletteSelect: "Selecione",
      changeImage: "Trocar imagem",
      onlineHelper: "O link público já pode ser compartilhado.",
      security: "Segurança aplicada",
      securityText:
        "Links aceitam somente HTTPS, o slug é reservado/validado e o site só aparece quando publicado.",
      artistName: "Nome artístico",
      slug: "Slug do site",
      headline: "Headline curta",
      bio: "Bio",
      location: "Localização",
      profileImageUrl: "URL da logo do DJ",
      coverImageUrl: "URL da capa",
      uploadProfileImage: "Enviar logo do DJ",
      uploadCoverImage: "Enviar capa",
      uploadingImage: "Enviando imagem...",
      imageUploadHint:
        "JPG, PNG ou WebP até 5 MB. O arquivo vai para o R2 e salvamos apenas a URL pública.",
      removeImage: "Remover imagem",
      bookingEmail: "Email de booking",
      whatsappUrl: "WhatsApp/booking URL",
      instagramUrl: "Instagram URL",
      tiktokUrl: "TikTok URL",
      spotifyUrl: "Spotify URL",
      soundcloudUrl: "SoundCloud URL",
      youtubeUrl: "YouTube URL",
      theme: "Tema",
      accentColor: "Cor de destaque",
      addLink: "Adicionar link",
      addEvent: "Adicionar evento",
      remove: "Remover",
      label: "Rótulo",
      url: "URL https://",
      eventTitle: "Nome do evento",
      venue: "Local",
      city: "Cidade",
      eventDate: "Data",
      ticketUrl: "Link de ingresso",
      flyerUrl: "URL do flyer",
      errorFallback:
        "Não foi possível salvar. Revise os campos e tente novamente.",
    };
  }

  if (locale === "es") {
    return {
      eyebrow: "DJ Website",
      title: "Tu perfil oficial de DJ",
      subtitle:
        "Crea un sitio público con agenda, enlaces, booking y presencia profesional. La primera versión publica en /s/slug y prepara el futuro subdominio slug.djvisuals.site.",
      save: "Publicar sitio",
      saving: "Publicando...",
      saved: "Sitio guardado como borrador.",
      online: "Tu sitio está online.",
      preview: "Ver preview público",
      copyUrl: "Copiar URL",
      copied: "Copiado",
      published: "Publicado",
      draft: "Borrador",
      publishLabel: "Publicar sitio",
      publishHelper:
        "Cuando está desactivado, la página pública devuelve 404 y nadie puede acceder.",
      publicUrl: "URL pública futura",
      fallbackUrl: "URL pública actual",
      basic: "Identidad",
      links: "Enlaces principales",
      events: "Agenda",
      showAgendaLabel: "Mostrar agenda en el sitio",
      showAgendaHelper:
        "Cuando está desactivado, la sección Live Dates queda oculta en el sitio público.",
      design: "Diseño",
      paletteTitle: "Paletas de colores",
      paletteHelper:
        "Elige una paleta completa para cambiar fondo, textos, bordes, botones y el acento visual del sitio.",
      paletteSelect: "Seleccionar",
      changeImage: "Cambiar imagen",
      onlineHelper: "El enlace público ya se puede compartir.",
      security: "Seguridad aplicada",
      securityText:
        "Los enlaces aceptan solo HTTPS, el slug se valida y el sitio solo aparece publicado.",
      artistName: "Nombre artístico",
      slug: "Slug del sitio",
      headline: "Headline corta",
      bio: "Bio",
      location: "Ubicación",
      profileImageUrl: "URL del logo del DJ",
      coverImageUrl: "URL de portada",
      uploadProfileImage: "Subir logo del DJ",
      uploadCoverImage: "Subir portada",
      uploadingImage: "Subiendo imagen...",
      imageUploadHint:
        "JPG, PNG o WebP hasta 5 MB. El archivo va al R2 y guardamos solo la URL pública.",
      removeImage: "Eliminar imagen",
      bookingEmail: "Email de booking",
      whatsappUrl: "WhatsApp/booking URL",
      instagramUrl: "Instagram URL",
      tiktokUrl: "TikTok URL",
      spotifyUrl: "Spotify URL",
      soundcloudUrl: "SoundCloud URL",
      youtubeUrl: "YouTube URL",
      theme: "Tema",
      accentColor: "Color de acento",
      addLink: "Añadir enlace",
      addEvent: "Añadir evento",
      remove: "Eliminar",
      label: "Etiqueta",
      url: "URL https://",
      eventTitle: "Nombre del evento",
      venue: "Venue",
      city: "Ciudad",
      eventDate: "Fecha",
      ticketUrl: "Link de entradas",
      flyerUrl: "URL del flyer",
      errorFallback:
        "No fue posible guardar. Revisa los campos e inténtalo otra vez.",
    };
  }

  return {
    eyebrow: "DJ Website",
    title: "Your official DJ profile",
    subtitle:
      "Build a professional DJ page with booking, music links, live dates, social channels, and a polished presence for clubs, promoters, agencies, and fans.",
    save: "Publish site",
    saving: "Publishing...",
    saved: "Site saved as draft.",
    online: "Your site is online.",
    preview: "View public preview",
    copyUrl: "Copy URL",
    copied: "Copied",
    published: "Published",
    draft: "Draft",
    publishLabel: "Publish site",
    publishHelper:
      "When disabled, the public page returns 404 and nobody can access your site.",
    publicUrl: "Future public URL",
    fallbackUrl: "Current public URL",
    basic: "Identity",
    links: "Main links",
    events: "Agenda",
    showAgendaLabel: "Show agenda on site",
    showAgendaHelper:
      "When disabled, the Live Dates section is hidden from the public site.",
    design: "Design",
    paletteTitle: "Color palettes",
    paletteHelper:
      "Choose a complete palette to change the background, text, borders, buttons and visual accent of the site.",
    paletteSelect: "Select",
    changeImage: "Change image",
    onlineHelper: "The public link is ready to share.",
    security: "Security applied",
    securityText:
      "Links accept HTTPS only, the slug is reserved/validated and the site only appears when published.",
    artistName: "Artist name",
    slug: "Site slug",
    headline: "Short headline",
    bio: "Bio",
    location: "Location",
    profileImageUrl: "DJ logo URL",
    coverImageUrl: "Cover image URL",
    uploadProfileImage: "Upload DJ logo",
    uploadCoverImage: "Upload cover image",
    uploadingImage: "Uploading image...",
    imageUploadHint:
      "JPG, PNG or WebP up to 5 MB. The file goes to R2 and only the public URL is saved.",
    removeImage: "Remove image",
    bookingEmail: "Booking email",
    whatsappUrl: "WhatsApp/booking URL",
    instagramUrl: "Instagram URL",
    tiktokUrl: "TikTok URL",
    spotifyUrl: "Spotify URL",
    soundcloudUrl: "SoundCloud URL",
    youtubeUrl: "YouTube URL",
    theme: "Theme",
    accentColor: "Accent color",
    addLink: "Add link",
    addEvent: "Add event",
    remove: "Remove",
    label: "Label",
    url: "HTTPS URL",
    eventTitle: "Event name",
    venue: "Venue",
    city: "City",
    eventDate: "Date",
    ticketUrl: "Ticket link",
    flyerUrl: "Flyer URL",
    errorFallback: "Could not save. Review the fields and try again.",
  };
}

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32);
}

function toDateInput(value: string | Date | null | undefined) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function createClientId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function createEmptyLink(position: number): EditableLink {
  return {
    clientId: createClientId("link"),
    label: "",
    url: "",
    position,
    isActive: true,
  };
}

function createEmptyEvent(position: number): EditableEvent {
  return {
    clientId: createClientId("event"),
    title: "",
    venue: "",
    city: "",
    eventDate: "",
    ticketUrl: "",
    flyerUrl: "",
    position,
    isActive: true,
  };
}

const DJ_SITE_COLOR_PALETTES = [
  {
    id: "editorial-light",
    name: "Editorial Light",
    description: "Claro, limpo, press kit premium",
    accent: "#102A9E",
    theme: "CLEAN_WHITE",
    paper: "#ECE8DF",
    ink: "#0C0C0C",
    inkSoft: "rgba(12,12,12,0.55)",
    line: "rgba(12,12,12,0.16)",
    solid: "#0C0C0C",
    solidText: "#ECE8DF",
  },
  {
    id: "cyberpunk-night",
    name: "Cyberpunk Night",
    description: "Preto, ciano e atmosfera futurista",
    accent: "#00E5FF",
    theme: "NEON_DARK",
    paper: "#050613",
    ink: "#F5F7FF",
    inkSoft: "rgba(245,247,255,0.62)",
    line: "rgba(245,247,255,0.15)",
    solid: "#01020A",
    solidText: "#F5F7FF",
  },
  {
    id: "Rave Magenta",
    name: "Rave Magenta",
    description: "Magenta, club e nightlife forte",
    accent: "#FF2BD6",
    theme: "NEON_DARK",
    paper: "#09020F",
    ink: "#FFF4FE",
    inkSoft: "rgba(255,244,254,0.62)",
    line: "rgba(255,244,254,0.15)",
    solid: "#150018",
    solidText: "#FFF4FE",
  },
  {
    id: "ultra-violet",
    name: "Ultra Violet",
    description: "Roxo neon, festival e techno",
    accent: "#8B5CF6",
    theme: "NEON_DARK",
    paper: "#070515",
    ink: "#F4F0FF",
    inkSoft: "rgba(244,240,255,0.62)",
    line: "rgba(244,240,255,0.15)",
    solid: "#120A2A",
    solidText: "#F4F0FF",
  },
  {
    id: "laser-green",
    name: "Laser Green",
    description: "Verde laser, rave e eletrônico",
    accent: "#39FF88",
    theme: "NEON_DARK",
    paper: "#020B08",
    ink: "#EFFFF5",
    inkSoft: "rgba(239,255,245,0.62)",
    line: "rgba(239,255,245,0.15)",
    solid: "#00130B",
    solidText: "#EFFFF5",
  },
  {
    id: "luxury-gold",
    name: "Luxury Gold",
    description: "Preto e dourado para eventos VIP",
    accent: "#C49A3A",
    theme: "LUXURY_BLACK",
    paper: "#090805",
    ink: "#F7EED7",
    inkSoft: "rgba(247,238,215,0.62)",
    line: "rgba(247,238,215,0.16)",
    solid: "#171006",
    solidText: "#F7EED7",
  },
  {
    id: "infrared-club",
    name: "Infrared Club",
    description: "Vermelho profundo, quente e agressivo",
    accent: "#FF3B1F",
    theme: "NEON_DARK",
    paper: "#100303",
    ink: "#FFF1ED",
    inkSoft: "rgba(255,241,237,0.62)",
    line: "rgba(255,241,237,0.15)",
    solid: "#1A0504",
    solidText: "#FFF1ED",
  },
  {
    id: "arctic-blue",
    name: "Arctic Blue",
    description: "Claro frio, moderno e clean",
    accent: "#006B8F",
    theme: "CLEAN_WHITE",
    paper: "#EAF3F6",
    ink: "#06131A",
    inkSoft: "rgba(6,19,26,0.58)",
    line: "rgba(6,19,26,0.16)",
    solid: "#06131A",
    solidText: "#EAF3F6",
  },
] as const;

function normalizePaletteColor(value: string) {
  return value.trim().toUpperCase();
}

function getEditorColorPalette(accentColor: string, theme: string) {
  const normalizedAccent = normalizePaletteColor(accentColor || "");
  const matchedPalette = DJ_SITE_COLOR_PALETTES.find(
    (palette) => normalizePaletteColor(palette.accent) === normalizedAccent,
  );

  if (matchedPalette) {
    return matchedPalette;
  }

  const fallbackPalette =
    theme === "LUXURY_BLACK"
      ? DJ_SITE_COLOR_PALETTES.find((palette) => palette.id === "luxury-gold")!
      : theme === "NEON_DARK"
        ? DJ_SITE_COLOR_PALETTES.find((palette) => palette.id === "cyberpunk-night")!
        : DJ_SITE_COLOR_PALETTES.find((palette) => palette.id === "editorial-light")!;

  return /^#[0-9A-Fa-f]{6}$/.test(accentColor)
    ? { ...fallbackPalette, accent: accentColor }
    : fallbackPalette;
}
function getPaletteText(locale: SupportedLocale, paletteId: string) {
  const dictionary = {
    "pt-BR": {
      "editorial-light": {
        name: "Editorial claro",
        description: "Claro, limpo e premium para press kit.",
      },
      "cyberpunk-night": {
        name: "Cyberpunk noturno",
        description: "Preto, ciano e atmosfera futurista.",
      },
      "Rave Magenta": {
        name: "Rave magenta",
        description: "Magenta, club e nightlife forte.",
      },
      "ultra-violet": {
        name: "Ultra violeta",
        description: "Roxo neon, festival e techno.",
      },
      "laser-green": {
        name: "Laser verde",
        description: "Verde laser, rave e eletrônico.",
      },
      "luxury-gold": {
        name: "Luxo dourado",
        description: "Preto e dourado para eventos VIP.",
      },
      "infrared-club": {
        name: "Clube infravermelho",
        description: "Vermelho profundo, quente e agressivo.",
      },
      "arctic-blue": {
        name: "Azul ártico",
        description: "Claro frio, moderno e clean.",
      },
    },
    es: {
      "editorial-light": {
        name: "Editorial claro",
        description: "Claro, limpio y premium para press kit.",
      },
      "cyberpunk-night": {
        name: "Cyberpunk nocturno",
        description: "Negro, cian y atmósfera futurista.",
      },
      "Rave Magenta": {
        name: "Rave magenta",
        description: "Magenta, club y nightlife potente.",
      },
      "ultra-violet": {
        name: "Ultra violeta",
        description: "Morado neón, festival y techno.",
      },
      "laser-green": {
        name: "Láser verde",
        description: "Verde láser, rave y electrónica.",
      },
      "luxury-gold": {
        name: "Lujo dorado",
        description: "Negro y dorado para eventos VIP.",
      },
      "infrared-club": {
        name: "Club infrarrojo",
        description: "Rojo profundo, cálido y agresivo.",
      },
      "arctic-blue": {
        name: "Azul ártico",
        description: "Claro frío, moderno y clean.",
      },
    },
    en: {
      "editorial-light": {
        name: "Editorial Light",
        description: "Clean, bright and premium for press kits.",
      },
      "cyberpunk-night": {
        name: "Cyberpunk Night",
        description: "Black, cyan and futuristic atmosphere.",
      },
      "Rave Magenta": {
        name: "Rave Magenta",
        description: "Magenta, club energy and strong nightlife.",
      },
      "ultra-violet": {
        name: "Ultra Violet",
        description: "Neon purple, festival and techno.",
      },
      "laser-green": {
        name: "Laser Green",
        description: "Laser green, rave and electronic.",
      },
      "luxury-gold": {
        name: "Luxury Gold",
        description: "Black and gold for VIP events.",
      },
      "infrared-club": {
        name: "Infrared Club",
        description: "Deep red, warm and aggressive.",
      },
      "arctic-blue": {
        name: "Arctic Blue",
        description: "Cool, bright, modern and clean.",
      },
    },
  } as const;

  const normalizedLocale = locale === "pt-BR" || locale === "es" ? locale : "en";
  return dictionary[normalizedLocale][paletteId as keyof typeof dictionary[typeof normalizedLocale]];
}


export function DjSiteEditor({ initialSite, locale }: DjSiteEditorProps) {
  const copy = useMemo(() => getCopy(locale), [locale]);
  const [isPending, startTransition] = useTransition();
  const [slug, setSlug] = useState(initialSite.slug);
  const [artistName, setArtistName] = useState(initialSite.artistName);
  const [headline, setHeadline] = useState(initialSite.headline || "");
  const [bio, setBio] = useState(initialSite.bio || "");
  const [location, setLocation] = useState(initialSite.location || "");
  const [profileImageUrl, setProfileImageUrl] = useState(
    initialSite.profileImageUrl || "",
  );
  const [coverImageUrl, setCoverImageUrl] = useState(
    initialSite.coverImageUrl || "",
  );
  const [instagramUrl, setInstagramUrl] = useState(
    initialSite.instagramUrl || "",
  );
  const [tiktokUrl, setTiktokUrl] = useState(initialSite.tiktokUrl || "");
  const [soundcloudUrl, setSoundcloudUrl] = useState(
    initialSite.soundcloudUrl || "",
  );
  const [spotifyUrl, setSpotifyUrl] = useState(initialSite.spotifyUrl || "");
  const [youtubeUrl, setYoutubeUrl] = useState(initialSite.youtubeUrl || "");
  const [whatsappUrl, setWhatsappUrl] = useState(initialSite.whatsappUrl || "");
  const [bookingEmail, setBookingEmail] = useState(
    initialSite.bookingEmail || "",
  );
  const [theme, setTheme] = useState(initialSite.theme || "NEON_DARK");
  const [accentColor, setAccentColor] = useState(
    initialSite.accentColor || "#00F5FF",
  );
  const [isPublished, setIsPublished] = useState(initialSite.isPublished);
  const [showAgenda, setShowAgenda] = useState(initialSite.showAgenda ?? true);
  const [links, setLinks] = useState<EditableLink[]>(
    initialSite.links.length > 0
      ? initialSite.links.map((link, index) => ({
          clientId: `initial-link-${link.position ?? index}-${index}`,
          label: link.label,
          url: link.url,
          position: link.position ?? index,
          isActive: link.isActive,
        }))
      : [createEmptyLink(0)],
  );
  const [events, setEvents] = useState<EditableEvent[]>(
    initialSite.events.map((event, index) => ({
      clientId: `initial-event-${event.position ?? index}-${index}`,
      title: event.title,
      venue: event.venue || "",
      city: event.city || "",
      eventDate: toDateInput(event.eventDate),
      ticketUrl: event.ticketUrl || "",
      flyerUrl: event.flyerUrl || "",
      position: event.position ?? index,
      isActive: event.isActive,
    })),
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [profileUploading, setProfileUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);

  const normalizedSlug = normalizeSlug(slug || artistName || "dj-profile");
  const futurePublicUrl = buildDjSitePublicUrl(normalizedSlug || "your-slug");
  const fallbackPath = buildFallbackDjSitePublicPath(
    normalizedSlug || "your-slug",
  );
  const selectedColorPalette = DJ_SITE_COLOR_PALETTES.find(
    (palette) => normalizePaletteColor(palette.accent) === normalizePaletteColor(accentColor),
  );
  const selectedColorPaletteText = selectedColorPalette
    ? getPaletteText(locale, selectedColorPalette.id)
    : null;

  function updateLink(clientId: string, patch: Partial<EditableLink>) {
    setLinks((current) =>
      current.map((link) =>
        link.clientId === clientId ? { ...link, ...patch } : link,
      ),
    );
  }

  function updateEvent(clientId: string, patch: Partial<EditableEvent>) {
    setEvents((current) =>
      current.map((event) =>
        event.clientId === clientId ? { ...event, ...patch } : event,
      ),
    );
  }

  async function handleCopyUrl() {
    try {
      await navigator.clipboard.writeText(futurePublicUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  async function handleImageUpload(
    file: File | null,
    purpose: "profile" | "cover",
  ) {
    if (!file) return;

    setError(null);
    setSuccess(null);

    try {
      if (purpose === "profile") {
        setProfileUploading(true);
      } else {
        setCoverUploading(true);
      }

      const uploaded = await uploadDjSiteImageToR2({ file, purpose });

      if (purpose === "profile") {
        setProfileImageUrl(uploaded.publicUrl);
      } else {
        setCoverImageUrl(uploaded.publicUrl);
      }
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Could not upload image. Please try again.",
      );
    } finally {
      setProfileUploading(false);
      setCoverUploading(false);
    }
  }

  async function saveSite() {
    setError(null);
    setSuccess(null);

    const payload = {
      slug: normalizedSlug,
      artistName,
      headline,
      bio,
      location,
      profileImageUrl,
      coverImageUrl,
      instagramUrl,
      tiktokUrl,
      soundcloudUrl,
      spotifyUrl,
      youtubeUrl,
      whatsappUrl,
      bookingEmail,
      theme,
      accentColor,
      isPublished: true,
      showAgenda,
      links: links
        .map((link, index) => ({
          label: link.label,
          url: link.url,
          isActive: link.isActive,
          position: index,
        }))
        .filter((link) => link.label.trim() && link.url.trim()),
      events: events
        .map((event, index) => ({
          title: event.title,
          venue: event.venue,
          city: event.city,
          eventDate: event.eventDate,
          ticketUrl: event.ticketUrl,
          flyerUrl: event.flyerUrl,
          isActive: event.isActive,
          position: index,
        }))
        .filter((event) => event.title.trim()),
    };

    const response = await fetch("/api/dj-site", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json().catch(() => ({}))) as {
      error?: string;
    };

    if (!response.ok) {
      setError(data.error || copy.errorFallback);
      return;
    }

    setSlug(normalizedSlug);
    setIsPublished(true);
    setSuccess(copy.online);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(() => {
      void saveSite();
    });
  }

  return (
    <div className="dj-site-editor-page relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(0,245,255,0.16),transparent_34%),radial-gradient(circle_at_top_right,rgba(191,95,255,0.14),transparent_32%),linear-gradient(180deg,#050712,#03040a)]" />

      <div className="mx-auto max-w-7xl space-y-6">
        <section className="dashboard-hud relative overflow-hidden border border-cyan-300/12 bg-white/[0.035] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.42)] sm:p-7">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/60 to-transparent" />
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <span className="dashboard-chip-cx">{copy.eyebrow}</span>
              <h1 className="dashboard-orb mt-4 text-3xl font-black uppercase tracking-[-0.04em] text-white sm:text-5xl">
                {copy.title}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/58 sm:text-base">
                {copy.subtitle}
              </p>
            </div>

            <div className="dj-site-action-group flex flex-col gap-3 sm:flex-row lg:items-center">
              <button
                type="submit"
                form="dj-site-editor-form"
                disabled={isPending || profileUploading || coverUploading}
                className={`publish-site-button relative inline-flex min-h-12 items-center justify-center gap-2 overflow-hidden border border-cyan-200/45 bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 px-5 text-sm font-black uppercase tracking-[0.14em] text-black shadow-[0_18px_50px_rgba(34,211,238,0.22)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 ${
                  isPending ? "is-publishing" : ""
                }`}
              >
                <span className="publish-site-button-glow pointer-events-none absolute inset-0 opacity-0" />
                <span className="relative z-10 inline-flex items-center gap-2">
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UploadCloud className="h-4 w-4" />
                  )}
                  {isPending ? copy.saving : copy.save}
                </span>
              </button>

              <button
                type="button"
                onClick={handleCopyUrl}
                title={futurePublicUrl}
                className="inline-flex min-h-11 items-center justify-center gap-2 border border-white/10 bg-white/[0.04] px-4 text-sm font-bold text-white/78 transition hover:border-cyan-300/30 hover:bg-cyan-300/10"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? copy.copied : copy.copyUrl}
              </button>

              <Link
                href={futurePublicUrl}
                target="_blank"
                className="inline-flex min-h-11 items-center justify-center gap-2 border border-cyan-300/24 bg-cyan-300/10 px-4 text-sm font-bold text-cyan-100 transition hover:border-cyan-200/45 hover:bg-cyan-300/16"
              >
                <ExternalLink className="h-4 w-4" />
                {copy.preview}
              </Link>
            </div>
          </div>

          {success ? (
            <div className="publish-online-toast mt-5 flex items-center gap-3 border border-emerald-300/25 bg-emerald-400/10 p-4 text-sm font-black text-emerald-50 shadow-[0_18px_50px_rgba(16,185,129,0.12)]">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-300 text-black shadow-[0_0_24px_rgba(110,231,183,0.35)]">
                <Check className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block uppercase tracking-[0.12em]">
                  {success}
                </span>
                {isPublished ? (
                  <span className="mt-1 block text-xs font-semibold normal-case tracking-normal text-emerald-100/62">
                    {copy.onlineHelper}
                  </span>
                ) : null}
              </span>
            </div>
          ) : null}
        </section>

        <form
          id="dj-site-editor-form"
          onSubmit={handleSubmit}
          className="dj-site-editor-form grid gap-6 lg:grid-cols-[1.05fr_0.95fr]"
        >
          <div className="dj-site-editor-primary space-y-6">
            <Panel title={copy.basic} icon={<Music2 className="h-4 w-4" />}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={copy.artistName}>
                  <input
                    value={artistName}
                    onChange={(event) => setArtistName(event.target.value)}
                    maxLength={80}
                    className="dj-site-input"
                    required
                  />
                </Field>

                <Field label={copy.slug}>
                  <input
                    value={slug}
                    onChange={(event) =>
                      setSlug(normalizeSlug(event.target.value))
                    }
                    maxLength={32}
                    className="dj-site-input"
                    required
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={copy.headline}>
                  <input
                    value={headline}
                    onChange={(event) => setHeadline(event.target.value)}
                    maxLength={120}
                    className="dj-site-input"
                  />
                </Field>

                <Field label={copy.location}>
                  <input
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    maxLength={80}
                    className="dj-site-input"
                  />
                </Field>
              </div>

              <Field label={copy.bio}>
                <textarea
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  maxLength={800}
                  rows={5}
                  className="dj-site-input min-h-32 resize-y"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <ImageUploadField
                  label={copy.uploadProfileImage}
                  value={profileImageUrl}
                  uploading={profileUploading}
                  uploadingText={copy.uploadingImage}
                  hint={copy.imageUploadHint}
                  removeLabel={copy.removeImage}
                  changeLabel={copy.changeImage}
                  onUpload={(file) => handleImageUpload(file, "profile")}
                  onRemove={() => setProfileImageUrl("")}
                />

                <ImageUploadField
                  label={copy.uploadCoverImage}
                  value={coverImageUrl}
                  uploading={coverUploading}
                  uploadingText={copy.uploadingImage}
                  hint={copy.imageUploadHint}
                  removeLabel={copy.removeImage}
                  changeLabel={copy.changeImage}
                  onUpload={(file) => handleImageUpload(file, "cover")}
                  onRemove={() => setCoverImageUrl("")}
                  widePreview
                />
              </div>
            </Panel>

            <Panel title={copy.links} icon={<Link2 className="h-4 w-4" />}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={copy.instagramUrl}>
                  <input
                    value={instagramUrl}
                    onChange={(event) => setInstagramUrl(event.target.value)}
                    placeholder="https://instagram.com/..."
                    className="dj-site-input"
                  />
                </Field>
                <Field label={copy.tiktokUrl}>
                  <input
                    value={tiktokUrl}
                    onChange={(event) => setTiktokUrl(event.target.value)}
                    placeholder="https://tiktok.com/@..."
                    className="dj-site-input"
                  />
                </Field>
                <Field label={copy.spotifyUrl}>
                  <input
                    value={spotifyUrl}
                    onChange={(event) => setSpotifyUrl(event.target.value)}
                    placeholder="https://open.spotify.com/..."
                    className="dj-site-input"
                  />
                </Field>
                <Field label={copy.soundcloudUrl}>
                  <input
                    value={soundcloudUrl}
                    onChange={(event) => setSoundcloudUrl(event.target.value)}
                    placeholder="https://soundcloud.com/..."
                    className="dj-site-input"
                  />
                </Field>
                <Field label={copy.youtubeUrl}>
                  <input
                    value={youtubeUrl}
                    onChange={(event) => setYoutubeUrl(event.target.value)}
                    placeholder="https://youtube.com/..."
                    className="dj-site-input"
                  />
                </Field>
                <Field label={copy.whatsappUrl}>
                  <input
                    value={whatsappUrl}
                    onChange={(event) => setWhatsappUrl(event.target.value)}
                    placeholder="https://wa.me/..."
                    className="dj-site-input"
                  />
                </Field>
              </div>

              <Field label={copy.bookingEmail}>
                <input
                  value={bookingEmail}
                  onChange={(event) => setBookingEmail(event.target.value)}
                  placeholder="booking@example.com"
                  className="dj-site-input"
                />
              </Field>

              <div className="space-y-3">
                {links.map((link, index) => (
                  <div
                    key={link.clientId}
                    className="grid gap-3 border border-white/10 bg-white/[0.025] p-3 sm:grid-cols-[0.8fr_1.2fr_auto]"
                  >
                    <input
                      value={link.label}
                      onChange={(event) =>
                        updateLink(link.clientId, { label: event.target.value })
                      }
                      placeholder={copy.label}
                      className="dj-site-input"
                    />
                    <input
                      value={link.url}
                      onChange={(event) =>
                        updateLink(link.clientId, { url: event.target.value })
                      }
                      placeholder={copy.url}
                      className="dj-site-input"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setLinks((current) =>
                          current.filter(
                            (currentLink) => currentLink.clientId !== link.clientId,
                          ),
                        )
                      }
                      className="inline-flex min-h-11 items-center justify-center border border-red-300/20 bg-red-400/10 px-3 text-red-100 transition hover:bg-red-400/15"
                      aria-label={copy.remove}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {links.length < 12 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setLinks((current) => [
                        ...current,
                        createEmptyLink(current.length),
                      ])
                    }
                    className="inline-flex min-h-11 items-center gap-2 border border-cyan-300/20 bg-cyan-300/10 px-4 text-sm font-bold text-cyan-100 transition hover:bg-cyan-300/15"
                  >
                    <Plus className="h-4 w-4" />
                    {copy.addLink}
                  </button>
                ) : null}
              </div>
            </Panel>

            <Panel
              title={copy.events}
              icon={<CalendarPlus className="h-4 w-4" />}
            >
              <div className="mb-4 flex flex-col gap-3 border border-white/10 bg-white/[0.025] p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.12em] text-white">
                    {copy.showAgendaLabel}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-white/45">
                    {copy.showAgendaHelper}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAgenda((current) => !current)}
                  className={`relative h-8 w-14 shrink-0 rounded-full border transition ${
                    showAgenda
                      ? "border-cyan-300/40 bg-cyan-300/25"
                      : "border-white/15 bg-white/[0.06]"
                  }`}
                  aria-pressed={showAgenda}
                >
                  <span
                    className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-lg transition ${
                      showAgenda ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </div>

              {showAgenda ? (
                <div className="space-y-3">
                {events.map((event, index) => (
                  <div
                    key={event.clientId}
                    className="dj-site-agenda-card space-y-3 overflow-hidden border border-white/10 bg-white/[0.025] p-3"
                  >
                    <div className="dj-site-agenda-grid grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
                      <input
                        value={event.title}
                        onChange={(item) =>
                          updateEvent(event.clientId, { title: item.target.value })
                        }
                        placeholder={copy.eventTitle}
                        className="dj-site-input"
                      />
                      <input
                        value={event.eventDate}
                        onChange={(item) =>
                          updateEvent(event.clientId, { eventDate: item.target.value })
                        }
                        type="date"
                        className="dj-site-input"
                      />
                      <input
                        value={event.venue}
                        onChange={(item) =>
                          updateEvent(event.clientId, { venue: item.target.value })
                        }
                        placeholder={copy.venue}
                        className="dj-site-input"
                      />
                      <input
                        value={event.city}
                        onChange={(item) =>
                          updateEvent(event.clientId, { city: item.target.value })
                        }
                        placeholder={copy.city}
                        className="dj-site-input"
                      />
                      <input
                        value={event.ticketUrl}
                        onChange={(item) =>
                          updateEvent(event.clientId, { ticketUrl: item.target.value })
                        }
                        placeholder={copy.ticketUrl}
                        className="dj-site-input"
                      />
                      <input
                        value={event.flyerUrl}
                        onChange={(item) =>
                          updateEvent(event.clientId, { flyerUrl: item.target.value })
                        }
                        placeholder={copy.flyerUrl}
                        className="dj-site-input"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setEvents((current) =>
                          current.filter(
                            (currentEvent) => currentEvent.clientId !== event.clientId,
                          ),
                        )
                      }
                      className="inline-flex min-h-10 items-center gap-2 border border-red-300/20 bg-red-400/10 px-3 text-sm font-bold text-red-100 transition hover:bg-red-400/15"
                    >
                      <Trash2 className="h-4 w-4" />
                      {copy.remove}
                    </button>
                  </div>
                ))}
                {events.length < 8 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setEvents((current) => [
                        ...current,
                        createEmptyEvent(current.length),
                      ])
                    }
                    className="inline-flex min-h-11 items-center gap-2 border border-cyan-300/20 bg-cyan-300/10 px-4 text-sm font-bold text-cyan-100 transition hover:bg-cyan-300/15"
                  >
                    <Plus className="h-4 w-4" />
                    {copy.addEvent}
                  </button>
                ) : null}
              </div>
              ) : null}
            </Panel>
          </div>

          <aside className="dj-site-editor-side space-y-6 lg:sticky lg:top-6 lg:self-start">
            <LiveDjSitePreview
              locale={locale}
              artistName={artistName}
              headline={headline}
              bio={bio}
              location={location}
              profileImageUrl={profileImageUrl}
              coverImageUrl={coverImageUrl}
              instagramUrl={instagramUrl}
              tiktokUrl={tiktokUrl}
              spotifyUrl={spotifyUrl}
              soundcloudUrl={soundcloudUrl}
              youtubeUrl={youtubeUrl}
              whatsappUrl={whatsappUrl}
              bookingEmail={bookingEmail}
              links={links}
              events={events}
              showAgenda={showAgenda}
              theme={theme}
              accentColor={accentColor}
              isPublished={isPublished}
              fallbackPath={fallbackPath}
            />

            <Panel title={copy.design} icon={<Globe2 className="h-4 w-4" />}>
              <div>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.12em] text-white">
                      {copy.paletteTitle}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-white/45">
                      {copy.paletteHelper}
                    </p>
                  </div>

                  {selectedColorPalette ? (
                    <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/58">
                      {selectedColorPaletteText?.name || selectedColorPalette.name}
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/45">
                      {copy.paletteSelect}
                    </span>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {DJ_SITE_COLOR_PALETTES.map((palette) => {
                    const isActive =
                      normalizePaletteColor(accentColor) === normalizePaletteColor(palette.accent);
                    const paletteText = getPaletteText(locale, palette.id);

                    return (
                      <button
                        key={palette.id}
                        type="button"
                        onClick={() => {
                          setAccentColor(palette.accent);
                          setTheme(palette.theme);
                        }}
                        className={`group flex min-h-[88px] items-center gap-3 border p-3 text-left transition ${
                          isActive
                            ? "border-white/35 bg-white/[0.085] shadow-[0_0_0_1px_rgba(255,255,255,0.05)]"
                            : "border-white/10 bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.05]"
                        }`}
                      >
                        <span className="grid h-12 w-12 shrink-0 grid-cols-2 overflow-hidden rounded-full border border-white/15 shadow-[0_0_22px_rgba(255,255,255,0.08)]">
                          <span style={{ backgroundColor: palette.paper }} />
                          <span style={{ backgroundColor: palette.ink }} />
                          <span style={{ backgroundColor: palette.solid }} />
                          <span style={{ backgroundColor: palette.accent }} />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-black text-white">
                            {paletteText?.name || palette.name}
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-white/45">
                            {paletteText?.description || palette.description}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Panel>

            <Panel
              title={copy.security}
              icon={<ShieldCheck className="h-4 w-4" />}
            >
              <p className="text-sm leading-6 text-white/58">
                {copy.securityText}
              </p>
            </Panel>

            {error ? (
              <div className="border border-red-300/25 bg-red-500/10 p-4 text-sm font-semibold text-red-100">
                {error}
              </div>
            ) : null}

          </aside>
        </form>
      </div>

      <style>{`
        .dj-site-input {
          box-sizing: border-box;
          min-height: 44px;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.035);
          padding: 0.75rem 0.875rem;
          color: white;
          outline: none;
          transition: border-color .2s ease, background-color .2s ease, box-shadow .2s ease;
        }
        input[type="date"].dj-site-input {
          display: block;
          max-width: 100%;
          min-width: 0;
          -webkit-appearance: none;
          appearance: none;
        }
        .dj-site-agenda-card {
          max-width: 100%;
        }
        .dj-site-agenda-grid {
          width: 100%;
          max-width: 100%;
        }
        .dj-site-agenda-grid > * {
          min-width: 0;
          max-width: 100%;
        }
        .dj-site-input::placeholder { color: rgba(255,255,255,0.28); }
        .dj-site-input:focus {
          border-color: rgba(0,245,255,0.42);
          background: rgba(0,245,255,0.055);
          box-shadow: 0 0 0 1px rgba(0,245,255,0.12);
        }
        .publish-site-button.is-publishing {
          animation: publishButtonPulse 1.1s ease-in-out infinite;
        }
        .publish-site-button.is-publishing .publish-site-button-glow {
          opacity: 1;
          background: linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.58) 42%, transparent 70%);
          animation: publishButtonSweep 1.15s linear infinite;
        }
        .publish-online-toast {
          animation: publishOnlineToast .52s cubic-bezier(.16,.84,.3,1) both;
        }
        @keyframes publishButtonPulse {
          0%, 100% {
            transform: translateY(0) scale(1);
            box-shadow: 0 18px 50px rgba(34,211,238,0.22);
          }
          50% {
            transform: translateY(-1px) scale(1.015);
            box-shadow: 0 24px 70px rgba(34,211,238,0.34);
          }
        }
        @keyframes publishButtonSweep {
          0% {
            transform: translateX(-130%) skewX(-12deg);
          }
          100% {
            transform: translateX(150%) skewX(-12deg);
          }
        }
        @keyframes publishOnlineToast {
          0% {
            opacity: 0;
            transform: translate3d(0, -10px, 0) scale(.98);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .publish-site-button.is-publishing,
          .publish-site-button.is-publishing .publish-site-button-glow,
          .publish-online-toast {
            animation: none !important;
          }
        }

        @media (max-width: 1023px) {
          .dj-site-editor-page {
            overflow-x: hidden;
            padding: 1rem 0.75rem 1.25rem;
          }

          .dj-site-editor-page * {
            min-width: 0;
          }

          .dj-site-editor-form {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 1rem !important;
          }

          .dj-site-editor-side {
            order: -1;
            position: static !important;
          }

          .dj-site-editor-primary {
            order: 2;
          }
          .dj-site-editor-page .dashboard-hud,
          .dj-site-editor-page .dashboard-hud-v {
            padding: 1rem;
          }

          .dj-site-editor-page .dashboard-chip-cx {
            font-size: 10px;
            letter-spacing: 0.12em;
          }

          .dj-site-editor-page .dashboard-orb {
            line-height: 1;
            overflow-wrap: anywhere;
          }

          .dj-site-editor-page .dashboard-hud > div > div > div > .dashboard-orb {
            font-size: clamp(24px, 6.6vw, 36px);
            line-height: 0.96;
          }

          .dj-site-editor-page .dashboard-hud p,
          .dj-site-editor-page .dashboard-hud-v p {
            font-size: 13px;
            line-height: 1.55;
          }

          .dj-site-editor-page .dashboard-hud-v h2 {
            font-size: 12px;
            letter-spacing: 0.1em;
          }

          .dj-site-editor-page label,
          .dj-site-editor-page .dashboard-mono {
            font-size: 9px;
            letter-spacing: 0.14em;
          }

          .dj-site-action-group {
            width: 100%;
            display: grid !important;
            grid-template-columns: minmax(0, 1fr);
            gap: 0.5rem !important;
          }

          .dj-site-action-group > * {
            width: 100%;
            min-height: 44px;
            font-size: 12px;
          }

          .publish-site-button {
            width: 100%;
            min-height: 50px;
            font-size: 12px;
            letter-spacing: 0.12em;
          }

          .dj-site-input {
            min-height: 46px;
            font-size: 15px;
            line-height: 1.35;
          }

          textarea.dj-site-input {
            min-height: 112px;
          }

          .dj-site-preview-frame {
            max-width: min(100%, 370px);
          }

          .dj-site-preview-shell {
            border-radius: 26px;
            padding: 8px;
          }

          .dj-site-preview-screen {
            max-height: min(640px, calc(100dvh - 165px)) !important;
            border-radius: 22px;
          }

          .dj-site-preview-hero {
            height: 410px !important;
          }

          .dj-site-preview-title {
            max-width: 270px !important;
            font-size: clamp(26px, 8.2vw, 40px) !important;
            line-height: 0.98 !important;
          }

          .dj-site-preview-mono {
            font-size: 10px;
            letter-spacing: 0.1em;
          }

          .dj-site-preview-body p {
            font-size: 14px;
            line-height: 1.5;
          }

          .dj-site-preview-body a,
          .dj-site-preview-body button {
            font-size: 11px;
          }

          .dj-site-upload-preview {
            height: 128px !important;
          }
        }

        @media (min-width: 640px) and (max-width: 1023px) {
          .dj-site-action-group {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .dj-site-preview-frame {
            max-width: 390px;
          }

          .dj-site-preview-screen {
            max-height: 760px !important;
          }

          .dj-site-preview-hero {
            height: 500px !important;
          }

          .dj-site-preview-title {
            font-size: clamp(32px, 7vw, 48px) !important;
          }
          .dj-site-editor-page .dashboard-hud,
          .dj-site-editor-page .dashboard-hud-v {
            padding: 1.25rem;
          }
        }

        @media (max-width: 639px) {
          .dj-site-agenda-card {
            padding: 0.75rem;
          }

          .dj-site-agenda-grid {
            grid-template-columns: minmax(0, 1fr) !important;
          }

          input[type="date"].dj-site-input {
            font-size: 14px;
            padding-left: 0.75rem;
            padding-right: 0.75rem;
          }
        }

        @media (max-width: 639px) {
          .dj-site-editor-page {
            padding-inline: 0.75rem;
          }

          .dj-site-editor-page .dashboard-hud {
            padding: 0.9rem;
          }

          .dj-site-editor-page .dashboard-hud-v {
            padding: 0.85rem;
          }

          .dj-site-editor-page .dashboard-hud > div > div > div > .dashboard-orb {
            font-size: clamp(22px, 6.4vw, 31px);
          }

          .dj-site-editor-page .dashboard-hud p,
          .dj-site-editor-page .dashboard-hud-v p {
            font-size: 12px;
            line-height: 1.5;
          }

          .dj-site-editor-page .dashboard-hud-v h2 {
            font-size: 11.5px;
          }

          .dj-site-preview-frame {
            max-width: min(100%, 350px);
          }

          .dj-site-preview-shell {
            border-radius: 24px;
            padding: 7px;
          }

          .dj-site-preview-screen {
            max-height: min(590px, calc(100dvh - 155px)) !important;
            border-radius: 20px;
          }

          .dj-site-preview-hero {
            height: 350px !important;
          }

          .dj-site-preview-title {
            max-width: 235px !important;
            font-size: clamp(24px, 7.5vw, 34px) !important;
            line-height: 1 !important;
          }

          .dj-site-preview-body p {
            font-size: 13px;
          }

          .dj-site-preview-body h4 {
            font-size: 28px !important;
          }

          .dj-site-upload-preview {
            height: 118px !important;
          }
        }

      `}</style>
    </div>
  );
}

function Panel({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="dashboard-hud-v relative overflow-hidden border border-white/10 bg-white/[0.032] p-4 shadow-[0_18px_70px_rgba(0,0,0,0.32)] sm:p-5">

      <div className="mb-5 flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center border border-cyan-300/18 bg-cyan-300/10 text-cyan-100">
          {icon}
        </span>
        <h2 className="dashboard-orb text-sm font-black uppercase tracking-[0.12em] text-white">
          {title}
        </h2>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function getPreviewCopy(locale: SupportedLocale) {
  if (locale === "pt-BR") {
    return {
      title: "Preview ao vivo",
      subtitle: "As alterações aparecem em tempo real no mobile.",
      draft: "Rascunho",
      published: "Publicado",
      noCover: "Capa do DJ",
      noLogo: "Logo",
      defaultArtistName: "Artista DJ",
      defaultHeadline: "DJ profissional",
      requestBooking: "Solicitar booking",
      message: "Mensagem",
      share: "Compartilhar",
      selectedSets: "Sets selecionados",
      all: "Todos",
      liveDates: "Próximas datas",
      venueTba: "Local a confirmar",
      connect: "Conectar",
      forBookings: "Para bookings",
      press: "imprensa",
      noEvents: "Adicione eventos para montar sua agenda pública.",
      openPreview: "Abrir página pública",
      tickerItems: [
        "Clubes",
        "Festivais",
        "Eventos privados",
        "Ativações de marca",
        "Corporativo",
        "VIP",
      ],
    };
  }

  if (locale === "es") {
    return {
      title: "Preview en vivo",
      subtitle: "Los cambios aparecen en tiempo real en mobile.",
      draft: "Borrador",
      published: "Publicado",
      noCover: "Portada del DJ",
      noLogo: "Logo",
      defaultArtistName: "Artista DJ",
      defaultHeadline: "DJ profesional",
      requestBooking: "Solicitar booking",
      message: "Mensaje",
      share: "Compartir",
      selectedSets: "Sets seleccionados",
      all: "Todos",
      liveDates: "Próximas fechas",
      venueTba: "Venue por confirmar",
      connect: "Conectar",
      forBookings: "Para bookings",
      press: "prensa",
      noEvents: "Añade eventos para crear tu agenda pública.",
      openPreview: "Abrir página pública",
      tickerItems: [
        "Clubs",
        "Festivales",
        "Eventos privados",
        "Activaciones de marca",
        "Corporativo",
        "VIP",
      ],
    };
  }

  return {
    title: "Live preview",
    subtitle: "Changes update in real time on mobile.",
    draft: "Draft",
    published: "Published",
    noCover: "DJ cover",
    noLogo: "Logo",
    defaultArtistName: "DJ Artist",
    defaultHeadline: "Professional DJ",
    requestBooking: "Request Booking",
    message: "Message",
    share: "Share",
    selectedSets: "Selected Sets",
    all: "All",
    liveDates: "Live Dates",
    venueTba: "Venue TBA",
    connect: "Connect",
    forBookings: "For Bookings",
    press: "Press",
    noEvents: "Add events to build your public agenda.",
    openPreview: "Open public page",
    tickerItems: [
      "Clubs",
      "Festivals",
      "Private Events",
      "Brand Activations",
      "Corporate",
      "VIP",
    ],
  };
}

function LiveDjSitePreview({
  locale,
  artistName,
  headline,
  bio,
  location,
  profileImageUrl,
  coverImageUrl,
  instagramUrl,
  tiktokUrl,
  spotifyUrl,
  soundcloudUrl,
  youtubeUrl,
  whatsappUrl,
  bookingEmail,
  links,
  events,
  showAgenda,
  theme,
  accentColor,
  isPublished,
  fallbackPath,
}: {
  locale: SupportedLocale;
  artistName: string;
  headline: string;
  bio: string;
  location: string;
  profileImageUrl: string;
  coverImageUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  spotifyUrl: string;
  soundcloudUrl: string;
  youtubeUrl: string;
  whatsappUrl: string;
  bookingEmail: string;
  links: EditableLink[];
  events: EditableEvent[];
  showAgenda: boolean;
  theme: string;
  accentColor: string;
  isPublished: boolean;
  fallbackPath: string;
}) {
  const previewCopy = getPreviewCopy(locale);
  const palette = getEditorColorPalette(accentColor, theme);
  const accent = palette.accent;
  const artistLabel = artistName.trim() || previewCopy.defaultArtistName;
  const headlineLabel = headline.trim() || previewCopy.defaultHeadline;
  const locationLabel = location.trim();
  const bookingUrl = bookingEmail ? `mailto:${bookingEmail}` : whatsappUrl || fallbackPath;
  const shareUrl = fallbackPath;

  const musicLinks = [
    { label: "Spotify", url: spotifyUrl },
    { label: "SoundCloud", url: soundcloudUrl },
    { label: "YouTube", url: youtubeUrl },
    ...links.filter((link) => /music|mix|listen|spotify|soundcloud|youtube|set|live|track|playlist/i.test(link.label)),
  ]
    .filter((item) => item.url.trim())
    .slice(0, 4);

  const connectLinks = [
    { label: "Instagram", url: instagramUrl },
    { label: "TikTok", url: tiktokUrl },
    { label: "Spotify", url: spotifyUrl },
    { label: "SoundCloud", url: soundcloudUrl },
    { label: "YouTube", url: youtubeUrl },
    { label: "WhatsApp", url: whatsappUrl },
    ...links,
  ]
    .filter((item) => item.url.trim())
    .slice(0, 5);

  const visibleEvents = showAgenda
    ? events.filter((event) => event.isActive && event.title.trim()).slice(0, 4)
    : [];

  const tickerItems = previewCopy.tickerItems;
  const ticker = [...tickerItems, ...tickerItems];

  function formatPreviewMonth(value: string) {
    if (!value) return "TBA";

    const date = new Date(`${value}T12:00:00`);

    if (Number.isNaN(date.getTime())) {
      return "TBA";
    }

    return new Intl.DateTimeFormat(locale === "pt-BR" ? "pt-BR" : locale, {
      month: "short",
    })
      .format(date)
      .toUpperCase();
  }

  function formatPreviewDay(value: string) {
    if (!value) return "--";

    const date = new Date(`${value}T12:00:00`);

    if (Number.isNaN(date.getTime())) {
      return "--";
    }

    return new Intl.DateTimeFormat(locale === "pt-BR" ? "pt-BR" : locale, {
      day: "2-digit",
    }).format(date);
  }

  return (
    <section className="dashboard-hud-v relative overflow-hidden border border-white/10 bg-white/[0.032] p-4 shadow-[0_18px_70px_rgba(0,0,0,0.32)] sm:p-5">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        .dj-site-preview-display { font-family: 'Anton', 'Archivo', sans-serif; font-weight: 400; }
        .dj-site-preview-body { font-family: 'Archivo', system-ui, sans-serif; }
        .dj-site-preview-mono { font-family: 'Space Mono', monospace; }
        .dj-site-preview-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .dj-site-preview-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-black/40 text-white">
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt={`${artistLabel} logo`}
                className="h-full w-full object-contain p-1"
              />
            ) : (
              <ImageIcon className="h-4 w-4" />
            )}
          </span>

          <div>
            <h2 className="dashboard-orb text-sm font-black uppercase tracking-[0.12em] text-white">
              {previewCopy.title}
            </h2>
            <p className="mt-1 text-xs text-white/42">
              {previewCopy.subtitle}
            </p>
          </div>
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${
            isPublished
              ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-200"
              : "border-amber-400/25 bg-amber-400/10 text-amber-200"
          }`}
        >
          {isPublished ? previewCopy.published : previewCopy.draft}
        </span>
      </div>

      <div className="dj-site-preview-frame mx-auto w-full max-w-[390px]">
        <div className="dj-site-preview-shell rounded-[34px] border border-white/12 bg-[#0b0d14] p-2.5 shadow-[0_28px_90px_rgba(0,0,0,0.42)]">
          <div className="dj-site-preview-body dj-site-preview-scroll relative max-h-[760px] overflow-y-auto rounded-[28px] bg-[var(--preview-solid)] text-[var(--preview-ink)]"
            style={
              {
                "--preview-paper": palette.paper,
                "--preview-ink": palette.ink,
                "--preview-soft": palette.inkSoft,
                "--preview-line": palette.line,
                "--preview-solid": palette.solid,
                "--preview-solid-text": palette.solidText,
                "--preview-accent": accent,
              } as CSSProperties
            }>
            <div className="pointer-events-none sticky top-0 z-30 h-0">
              <div className="mx-auto mt-2 h-5 w-28 rounded-full bg-black/70" />
            </div>

            <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 pt-6 text-white mix-blend-difference">
              <span className="dj-site-preview-mono inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em]">
                ← Index
              </span>

              <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-black/35 p-1 backdrop-blur-sm">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt={`${artistLabel} logo preview`}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-[15px] font-black text-white">
                    {artistLabel.slice(0, 1).toUpperCase()}
                  </span>
                )}
              </span>

              <span className="dj-site-preview-mono inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.14em]">
                Share ↗
              </span>
            </header>

            <section className="dj-site-preview-hero relative h-[520px] overflow-hidden bg-[var(--preview-solid)]">
              {coverImageUrl ? (
                <img
                  src={coverImageUrl}
                  alt={`${artistLabel} cover preview`}
                  className="absolute inset-0 h-full w-full object-cover grayscale-[0.35]"
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center bg-[var(--preview-solid)] text-xs font-black uppercase tracking-[0.18em] text-white/45">
                  {previewCopy.noCover}
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30" />

              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="dj-site-preview-mono mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white/70">
                  {headlineLabel}
                  {locationLabel ? `  /  ${locationLabel}` : ""}
                </p>
                <h3 className="dj-site-preview-display max-w-[310px] text-[clamp(32px,10vw,46px)] uppercase leading-[0.96] tracking-[-0.02em] text-white">
                  {artistLabel}
                </h3>
              </div>
            </section>

            <section className="overflow-hidden border-y border-[var(--preview-solid)] bg-[var(--preview-solid)] py-2.5">
              <div className="flex w-max items-center">
                {ticker.map((tag, index) => (
                  <span
                    key={`${tag}-${index}`}
                    className="dj-site-preview-mono flex items-center text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--preview-solid-text)]"
                  >
                    <span className="px-4" style={{ color: accent }}>
                      ✦
                    </span>
                    {tag}
                  </span>
                ))}
              </div>
            </section>

            <section className="bg-[var(--preview-paper)] px-5 pt-8">
              <div className="dj-site-preview-mono flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--preview-soft)]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                  className="shrink-0"
                >
                  <linearGradient
                    id="editor-preview-verified-artist-badge-gradient"
                    x1="24"
                    x2="24"
                    y1="41.994"
                    y2="6.007"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0" stopColor="#0064e1" />
                    <stop offset=".994" stopColor="#26b7ff" />
                  </linearGradient>
                  <path
                    fill="url(#editor-preview-verified-artist-badge-gradient)"
                    d="M41.92 29.06c-.15.52-.48.94-.95 1.21l-3.22 1.8v3.68c0 1.1-.9 2-2 2h-3.69l-1.79 3.22c-.27.47-.69.8-1.21.95-.51.14-1.05.08-1.52-.18L24 39.76l-3.54 1.98c-.31.17-.64.25-.98.25-.18 0-.36-.02-.54-.07-.52-.15-.94-.48-1.21-.95l-1.79-3.22h-3.69c-1.1 0-2-.9-2-2v-3.68l-3.22-1.8c-.47-.27-.8-.69-.95-1.21-.14-.51-.08-1.05.18-1.52L8.24 24l-1.98-3.54c-.54-.97-.19-2.19.77-2.73l3.22-1.8v-3.68c0-1.1.9-2 2-2h3.69l1.79-3.22c.27-.47.69-.8 1.21-.95.51-.14 1.05-.08 1.52.18L24 8.24l3.54-1.98c.47-.26 1.01-.32 1.52-.18.52.15.94.48 1.21.95l1.79 3.22h3.69c1.1 0 2 .9 2 2v3.68l3.22 1.8c.96.54 1.31 1.76.77 2.73L39.76 24l1.98 3.54c.26.47.32 1.01.18 1.52z"
                  />
                  <path
                    fill="#ffffff"
                    d="M22 30a.997.997 0 0 1-.707-.293l-5-5a1 1 0 1 1 1.414-1.414L22 27.586l9.293-9.293a1 1 0 1 1 1.414 1.414l-10 10A.997.997 0 0 1 22 30z"
                  />
                </svg>
                Verified Artist
              </div>

              {bio.trim() ? (
                <p className="mt-4 text-[18px] font-medium leading-[1.45] tracking-[-0.01em] text-[var(--preview-ink)]">
                  {bio}
                </p>
              ) : null}

              <div className="mt-7 flex flex-col gap-3">
                <a
                  href={bookingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex h-[58px] items-center justify-between border border-[var(--preview-solid)] bg-[var(--preview-solid)] px-5 text-[var(--preview-solid-text)] transition"
                >
                  <span className="dj-site-preview-mono text-[13px] font-bold uppercase tracking-[0.12em]">
                    {previewCopy.requestBooking}
                  </span>
                  <ExternalLink className="h-5 w-5" />
                </a>

                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={whatsappUrl || bookingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="dj-site-preview-mono flex h-[52px] items-center justify-center gap-2 border border-[var(--preview-solid)] text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--preview-ink)]"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="15"
                      viewBox="0 0 548.244 548.244"
                      aria-hidden="true"
                      className="shrink-0"
                    >
                      <path
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M392.19 156.054 211.268 281.667 22.032 218.58C8.823 214.168-.076 201.775 0 187.852c.077-13.923 9.078-26.24 22.338-30.498L506.15 1.549c11.5-3.697 24.123-.663 32.666 7.88 8.542 8.543 11.577 21.165 7.879 32.666L390.89 525.906c-4.258 13.26-16.575 22.261-30.498 22.338-13.923.076-26.316-8.823-30.728-22.032l-63.393-190.153z"
                      />
                    </svg>
                    {previewCopy.message}
                  </a>

                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="dj-site-preview-mono flex h-[52px] items-center justify-center gap-2 border border-[var(--preview-solid)] text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--preview-ink)]"
                  >
                    <Share2 className="h-4 w-4" />
                    {previewCopy.share}
                  </a>
                </div>
              </div>
            </section>

            <div className="space-y-12 bg-[var(--preview-paper)] px-5 pb-10 pt-12">
              {musicLinks.length > 0 ? (
                <section>
                  <div className="mb-6 flex items-baseline justify-between gap-4 border-t border-[var(--preview-line)] pt-4">
                    <h4 className="dj-site-preview-display text-[32px] uppercase leading-[0.88] text-[var(--preview-ink)]">
                      {previewCopy.selectedSets}
                    </h4>
                    <span className="dj-site-preview-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--preview-soft)]">
                      {previewCopy.all} ↗
                    </span>
                  </div>

                  <div className="-mx-5 flex gap-4 overflow-hidden px-5">
                    {musicLinks.slice(0, 2).map((link, index) => (
                      <div
                        key={`${link.label}-${index}`}
                        className="min-w-[150px] max-w-[150px] shrink-0"
                      >
                        <div className="relative aspect-[4/5] overflow-hidden border border-[var(--preview-solid)] bg-[var(--preview-solid)]">
                          {coverImageUrl ? (
                            <img
                              src={coverImageUrl}
                              alt=""
                              className="absolute inset-0 h-full w-full object-cover"
                            />
                          ) : null}
                          <span className="absolute bottom-2 right-2 grid h-9 w-9 place-items-center rounded-full border border-[var(--preview-solid-text)] bg-black/30 text-[var(--preview-solid-text)]">
                            <span className="ml-0.5">▶</span>
                          </span>
                        </div>
                        <p className="mt-2 line-clamp-1 text-[13px] font-bold text-[var(--preview-ink)]">
                          {link.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              <section>
                <div className="mb-6 flex items-baseline justify-between gap-4 border-t border-[var(--preview-line)] pt-4">
                  <h4 className="dj-site-preview-display text-[32px] uppercase leading-[0.88] text-[var(--preview-ink)]">
                    Live Dates
                  </h4>
                </div>

                {visibleEvents.length > 0 ? (
                  <div className="border-t border-[var(--preview-line)]">
                    {visibleEvents.map((event) => (
                      <div
                        key={event.clientId}
                        className="grid grid-cols-[54px_1fr_auto] items-center gap-3 border-b border-[var(--preview-line)] py-4"
                      >
                        <div className="text-center leading-none">
                          <p className="dj-site-preview-mono text-[9px] font-bold uppercase tracking-[0.06em] text-[var(--preview-ink)]">
                            {formatPreviewMonth(event.eventDate)}
                          </p>
                          <p className="dj-site-preview-display mt-1 text-[26px] leading-none text-[var(--preview-ink)]">
                            {formatPreviewDay(event.eventDate)}
                          </p>
                        </div>

                        <div className="min-w-0">
                          <p className="line-clamp-1 text-[15px] font-extrabold tracking-[-0.02em] text-[var(--preview-ink)]">
                            {event.title}
                          </p>
                          <p className="dj-site-preview-mono mt-1 line-clamp-1 text-[9px] font-bold uppercase tracking-[0.06em] text-[var(--preview-soft)]">
                            {[event.city, event.venue].filter(Boolean).join(" — ") || previewCopy.venueTba}
                          </p>
                        </div>

                        <ExternalLink className="h-4 w-4 text-[var(--preview-soft)]" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="dj-site-preview-mono border-t border-[var(--preview-line)] pt-5 text-[11px] font-bold uppercase leading-relaxed tracking-[0.06em] text-[var(--preview-soft)]">
                    {previewCopy.noEvents}
                  </p>
                )}
              </section>

              {connectLinks.length > 0 ? (
                <section>
                  <div className="mb-6 flex items-baseline justify-between gap-4 border-t border-[var(--preview-line)] pt-4">
                    <h4 className="dj-site-preview-display text-[32px] uppercase leading-[0.88] text-[var(--preview-ink)]">
                      {previewCopy.connect}
                    </h4>
                  </div>

                  <div className="border-t border-[var(--preview-line)]">
                    {connectLinks.slice(0, 4).map((link) => (
                      <div
                        key={`${link.label}-${link.url}`}
                        className="flex items-center justify-between border-b border-[var(--preview-line)] py-4"
                      >
                        <span className="text-[15px] font-bold tracking-[-0.01em] text-[var(--preview-ink)]">
                          {link.label}
                        </span>
                        <ExternalLink className="h-4 w-4 text-[var(--preview-soft)]" />
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="border-t border-[var(--preview-line)] pt-6">
                <h4 className="dj-site-preview-display text-[40px] uppercase leading-[0.98] tracking-[-0.02em] text-[var(--preview-ink)]">
                  For Bookings
                  <br />
                  &amp; Press
                </h4>
              </section>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}



function ImageUploadField({
  label,
  value,
  uploading,
  uploadingText,
  hint,
  removeLabel,
  changeLabel,
  onUpload,
  onRemove,
  widePreview = false,
}: {
  label: string;
  value: string;
  uploading: boolean;
  uploadingText: string;
  hint: string;
  removeLabel: string;
  changeLabel: string;
  onUpload: (file: File | null) => void;
  onRemove: () => void;
  widePreview?: boolean;
}) {
  const inputId = useId();

  return (
    <div className="space-y-3">
      <span className="dashboard-mono text-[9px] font-bold uppercase tracking-[0.18em] text-white/48">
        {label}
      </span>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
        <div
          className={
            widePreview ? "dj-site-upload-preview relative h-40 w-full" : "dj-site-upload-preview relative h-36 w-full"
          }
        >
          {value ? (
            <img
              src={value}
              alt={label}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full place-items-center bg-[radial-gradient(circle_at_top,rgba(0,245,255,0.16),transparent_36%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))]">
              <div className="text-center">
                <UploadCloud className="mx-auto h-8 w-8 text-cyan-100/75" />
                <p className="mt-3 text-xs font-black uppercase tracking-[0.16em] text-white/62">
                  {label}
                </p>
              </div>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-80" />

          {uploading ? (
            <div className="absolute inset-0 grid place-items-center bg-black/55 backdrop-blur-sm">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-xs font-bold text-cyan-50">
                <Loader2 className="h-4 w-4 animate-spin" />
                {uploadingText}
              </span>
            </div>
          ) : null}

          <input
            id={inputId}
            type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={uploading}
              onChange={(event) => {
                onUpload(event.target.files?.[0] ?? null);
                event.currentTarget.value = "";
              }}
            className="sr-only"
          />
          <label
            htmlFor={inputId}
            className={`absolute bottom-3 left-3 right-3 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/12 px-4 text-sm font-black text-white shadow-lg backdrop-blur transition hover:bg-white/18 ${
              uploading ? "pointer-events-none opacity-0" : ""
            }`}
          >
            <UploadCloud className="h-4 w-4" />
            {value ? "Trocar imagem" : label}
          </label>
        </div>

        <div className="space-y-3 p-3">
          <p className="text-xs leading-5 text-white/42">{hint}</p>

          {value ? (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-2">
              <p className="min-w-0 truncate text-xs text-white/52">{value}</p>
              <button
                type="button"
                onClick={onRemove}
                className="shrink-0 rounded-xl border border-red-300/20 bg-red-400/10 px-3 py-2 text-xs font-bold text-red-100 transition hover:bg-red-400/15"
              >
                {removeLabel}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="dashboard-mono text-[9px] font-bold uppercase tracking-[0.18em] text-white/48">
        {label}
      </span>
      {children}
    </label>
  );
}
