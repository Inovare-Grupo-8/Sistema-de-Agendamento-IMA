import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { useProfileImage } from "@/components/useProfileImage";
import { useVoluntario, DadosPessoaisVoluntario } from "@/hooks/useVoluntario";
import VoluntarioApiService from "@/services/voluntarioApi";
import { useNavigate } from "react-router-dom";
import {
  SidebarProvider,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { professionalNavigationItems } from "@/utils/userNavigation";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  Edit,
  Trash2,
  X,
  Menu,
  LogOut,
} from "lucide-react";
import { useThemeToggleWithNotification } from "@/hooks/useThemeToggleWithNotification";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const ALL_TIMES = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
];

type DayAvailability = {
  times: string[];
  modalidade: "ONLINE" | "PRESENCIAL";
  local?: string;
};

const MeusHorarios = () => {
  const location = useLocation();
  const { profileImage } = useProfileImage();
  const { theme, toggleTheme } = useThemeToggleWithNotification();
  const { buscarDadosPessoais } = useVoluntario();
  const navigate = useNavigate();
  const handleLogout = () => {
    try {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      localStorage.removeItem("userData");
      localStorage.removeItem("savedProfile");
      localStorage.removeItem("profileData");
      localStorage.removeItem("userProfileData");
      localStorage.removeItem("selectedDates");
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i) || "";
        if (
          key.startsWith("availabilityVoluntario:") ||
          key.startsWith("availabilityIds:")
        ) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {}
    navigate("/login", { replace: true });
  };

  const [dadosPessoais, setDadosPessoais] = useState<DadosPessoaisVoluntario>({
    nome: "",
    sobrenome: "",
    email: "",
    telefone: "",
    dataNascimento: "",
  });
  const displayName = useMemo(() => {
    const n = dadosPessoais?.nome?.trim();
    const s = dadosPessoais?.sobrenome?.trim();
    const parts = [n, s].filter(Boolean);
    return parts.length ? parts.join(" ") : "Voluntário";
  }, [dadosPessoais]);

  const userId = useMemo(() => {
    const stored = localStorage.getItem("userData");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.idUsuario ?? "default";
      } catch {}
    }
    return "default";
  }, []);
  const availabilityKey = (volId: string | number) =>
    `availabilityVoluntario:${volId}`;
  const [map, setMap] = useState<Record<string, DayAvailability>>({});
  const [editDateISO, setEditDateISO] = useState<string | null>(null);
  const [editSelection, setEditSelection] = useState<string[]>([]);
  const [editOriginal, setEditOriginal] = useState<string[]>([]);
  const [idsMap, setIdsMap] = useState<Record<string, number>>(() => {
    const stored = localStorage.getItem(`availabilityIds:${userId}`);
    if (!stored) return {};
    try {
      return JSON.parse(stored);
    } catch {
      return {};
    }
  });
  const [filterMonth, setFilterMonth] = useState<string>("");
  const [filterDay, setFilterDay] = useState<string>("");
  const [filterTime, setFilterTime] = useState<string>("");
  const [loadingDay, setLoadingDay] = useState<boolean>(false);

  useEffect(() => {
    buscarDadosPessoais()
      .then((p) => {
        if (p) setDadosPessoais(p);
      })
      .catch(() => {});
    const raw = localStorage.getItem(availabilityKey(userId));
    if (raw) {
      try {
        setMap(JSON.parse(raw));
      } catch {
        setMap({});
      }
    }
    (async () => {
      const uid = typeof userId === "number" ? userId : Number(userId);
      const list =
        await VoluntarioApiService.listarDisponibilidadesPorVoluntario(uid);
      if (list.length) {
        const nextMap: Record<string, DayAvailability> = { ...map };
        const nextIds: Record<string, number> = { ...idsMap };
        list.forEach(({ id, dataHorario }) => {
          const [dateStr, timeStrFull] = String(dataHorario).split("T");
          const timeStr = timeStrFull?.substring(0, 5) ?? "";
          if (dateStr && timeStr) {
            const entry = nextMap[dateStr] ?? {
              times: [],
              modalidade: "ONLINE",
            };
            if (!entry.times.includes(timeStr)) entry.times.push(timeStr);
            entry.times = Array.from(new Set(entry.times)).sort((a, b) =>
              a.localeCompare(b)
            );
            nextMap[dateStr] = entry;
            nextIds[`${dateStr}|${timeStr}`] = id;
          }
        });
        saveMap(nextMap);
        setIdsMap(nextIds);
        localStorage.setItem(
          `availabilityIds:${userId}`,
          JSON.stringify(nextIds)
        );
      }
    })();
  }, [buscarDadosPessoais, userId]);

  const saveMap = (next: Record<string, DayAvailability>) => {
    setMap(next);
    localStorage.setItem(availabilityKey(userId), JSON.stringify(next));
  };

  const sortedDates = useMemo(() => {
    return Object.keys(map).sort((a, b) => a.localeCompare(b));
  }, [map]);

  const monthOptions = useMemo(() => {
    const set = new Set<string>();
    sortedDates.forEach((iso) => set.add(iso.slice(0, 7)));
    return Array.from(set)
      .sort()
      .map((m) => ({
        value: m,
        label: format(new Date(`${m}-01T00:00:00`), "MMMM yyyy", {
          locale: ptBR,
        }),
      }));
  }, [sortedDates]);

  const filteredDates = useMemo(() => {
    const fm = (filterMonth || "").trim();
    return sortedDates.filter((iso) => {
      if (filterDay && iso !== filterDay) return false;
      if (fm && iso.slice(0, 7) !== fm) return false;
      if (filterTime) {
        const day = map[iso];
        if (!day?.times?.includes(filterTime)) return false;
      }
      return true;
    });
  }, [sortedDates, filterDay, filterMonth, filterTime, map]);

  const hasFilters = !!(filterMonth || filterDay || filterTime);
  const hasResults = useMemo(() => {
    if (!hasFilters) return true;
    if (filterDay) {
      const day = map[filterDay];
      if (
        !day ||
        !(filterTime ? day.times.includes(filterTime) : day.times.length > 0)
      )
        return false;
      return true;
    }
    if (filteredDates.length === 0) return false;
    if (filterTime) {
      return filteredDates.some((iso) => map[iso]?.times?.includes(filterTime));
    }
    return filteredDates.some((iso) => (map[iso]?.times?.length ?? 0) > 0);
  }, [hasFilters, filterDay, filterTime, filteredDates, map]);

  const clearFilters = () => {
    setFilterMonth("");
    setFilterDay("");
    setFilterTime("");
  };

  useEffect(() => {
    const fetchDay = async () => {
      if (!filterDay) return;
      setLoadingDay(true);
      try {
        const uid = typeof userId === "number" ? userId : Number(userId);
        const horariosISO =
          await VoluntarioApiService.listarHorariosDisponiveisPorDia(
            filterDay,
            uid
          );
        const times = horariosISO
          .map((iso) => {
            const parts = String(iso).split("T");
            const clock = parts[1]?.substring(0, 5) ?? "";
            return clock;
          })
          .filter(Boolean);
        const existing = map[filterDay] ?? {
          times: [],
          modalidade: "ONLINE" as const,
        };
        const merged = Array.from(
          new Set([...(existing.times || []), ...times])
        ).sort((a, b) => a.localeCompare(b));
        saveMap({ ...map, [filterDay]: { ...existing, times: merged } });
      } finally {
        setLoadingDay(false);
      }
    };
    fetchDay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterDay]);

  const formatTimeRange = (t: string) => {
    const [hh, mm] = t.split(":");
    const endH = String(parseInt(hh) + 1).padStart(2, "0");
    return `${hh}:${mm} - ${endH}:${mm}`;
  };

  const removeTime = async (dateISO: string, t: string) => {
    const id = idsMap[`${dateISO}|${t}`];
    if (id) {
      await VoluntarioApiService.deletarDisponibilidade(id);
      const copy = { ...idsMap };
      delete copy[`${dateISO}|${t}`];
      setIdsMap(copy);
      localStorage.setItem(`availabilityIds:${userId}`, JSON.stringify(copy));
    }
    const day = map[dateISO];
    if (!day) return;
    const next: DayAvailability = {
      ...day,
      times: day.times.filter((x) => x !== t),
    };
    const newMap = { ...map, [dateISO]: next };
    saveMap(newMap);
  };

  const removeDay = async (dateISO: string) => {
    const uid = typeof userId === "number" ? userId : Number(userId);
    const day = map[dateISO];
    if (day?.times?.length) {
      const copy = { ...idsMap };
      for (const t of day.times) {
        const id = copy[`${dateISO}|${t}`];
        if (id) {
          await VoluntarioApiService.deletarDisponibilidade(id);
          delete copy[`${dateISO}|${t}`];
        }
      }
      setIdsMap(copy);
      localStorage.setItem(`availabilityIds:${userId}`, JSON.stringify(copy));
    }
    const { [dateISO]: _, ...rest } = map;
    saveMap(rest);
  };

  const openEdit = (dateISO: string) => {
    const current = map[dateISO]?.times ?? [];
    setEditDateISO(dateISO);
    setEditSelection(current);
    setEditOriginal(current);
  };

  const toggleEditTime = (t: string) => {
    setEditSelection((prev) =>
      prev.includes(t)
        ? prev.filter((x) => x !== t)
        : [...prev, t].sort((a, b) => a.localeCompare(b))
    );
  };

  const confirmEdit = async () => {
    if (!editDateISO) return;
    const uid = typeof userId === "number" ? userId : Number(userId);
    const desired = Array.from(new Set(editSelection)).sort((a, b) =>
      a.localeCompare(b)
    );
    const original = Array.from(new Set(editOriginal)).sort((a, b) =>
      a.localeCompare(b)
    );
    let toAdd = desired.filter((t) => !original.includes(t));
    let toRemove = original.filter((t) => !desired.includes(t));

    // Remover no backend
    // Antes de deletar/crear, tentar atualizar (mover) usando PATCH um-para-um
    const moves = Math.min(toRemove.length, toAdd.length);
    for (let i = 0; i < moves; i++) {
      const oldT = toRemove[i];
      const newT = toAdd[i];
      const id = idsMap[`${editDateISO}|${oldT}`];
      if (id) {
        const out = await VoluntarioApiService.atualizarDisponibilidade(
          id,
          `${editDateISO}T${newT}:00`,
          uid
        );
        if (out?.id) {
          const copy = { ...idsMap };
          delete copy[`${editDateISO}|${oldT}`];
          copy[`${editDateISO}|${newT}`] = out.id;
          setIdsMap(copy);
          localStorage.setItem(
            `availabilityIds:${userId}`,
            JSON.stringify(copy)
          );
        }
      }
    }
    // Remover pares já movidos
    toRemove = toRemove.slice(moves);
    toAdd = toAdd.slice(moves);

    for (const t of toRemove) {
      const id = idsMap[`${editDateISO}|${t}`];
      if (id) {
        const ok = await VoluntarioApiService.deletarDisponibilidade(id);
        if (ok) {
          const copy = { ...idsMap };
          delete copy[`${editDateISO}|${t}`];
          setIdsMap(copy);
          localStorage.setItem(
            `availabilityIds:${userId}`,
            JSON.stringify(copy)
          );
        }
      }
    }

    // Adicionar no backend
    for (const t of toAdd) {
      const out = await VoluntarioApiService.criarDisponibilidade(
        `${editDateISO}T${t}:00`,
        uid
      );
      if (out?.id) {
        const copy = { ...idsMap, [`${editDateISO}|${t}`]: out.id };
        setIdsMap(copy);
        localStorage.setItem(`availabilityIds:${userId}`, JSON.stringify(copy));
      }
    }

    // Atualizar local
    const day = map[editDateISO] ?? { times: [], modalidade: "ONLINE" };
    const next: DayAvailability = { ...day, times: desired };
    const newMap = { ...map, [editDateISO]: next };
    saveMap(newMap);
    setEditDateISO(null);
    setEditSelection([]);
    setEditOriginal([]);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex flex-col md:flex-row bg-background">
        <div className="bg-gradient-to-b from-white via-[#f8fafc] to-[#EDF2FB] dark:from-[#23272F] dark:via-[#23272F] dark:to-[#181A20] shadow-2xl rounded-2xl p-6 flex flex-col gap-6 overflow-hidden fixed md:static z-40 top-0 left-0 h-full md:h-auto border-r border-[#EDF2FB] dark:border-[#23272F] backdrop-blur-[2px] text-sm md:text-base w-4/5 max-w-xs md:w-72">
          <div className="flex flex-col items-center gap-2 mb-8">
            <ProfileAvatar
              profileImage={profileImage}
              name={displayName}
              size="w-16 h-16"
              className="shadow"
            />
            <span className="font-extrabold text-xl text-indigo-900 dark:text-gray-100 tracking-wide">
              {displayName}
            </span>
            <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
              Profissional
            </Badge>
          </div>
          <SidebarMenu className="gap-4 text-sm md:text-base">
            {Object.values(professionalNavigationItems).map((item) => (
              <SidebarMenuItem key={item.path}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton
                      asChild
                      className={`rounded-xl px-4 py-3 font-normal text-sm md:text-base transition-all duration-300 hover:bg-[#ED4231]/20 focus:bg-[#ED4231]/20 ${
                        location.pathname === item.path
                          ? "bg-red-50 dark:bg-red-900/20 border-l-4 border-[#ED4231]"
                          : ""
                      }`}
                    >
                      <Link to={item.path} className="flex items-center gap-3">
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent className="z-50">{item.label}</TooltipContent>
                </Tooltip>
              </SidebarMenuItem>
            ))}
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton
                    onClick={handleLogout}
                    className="rounded-xl px-4 py-3 font-normal text-sm md:text-base transition-all duration-300 hover:bg-red-50 dark:hover:bg-red-900/20 text-[#ED4231] flex items-center gap-3 cursor-pointer"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sair</span>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent className="z-50">Sair da conta</TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
          </SidebarMenu>
          <div className="mt-auto flex flex-col gap-2 text-xs text-gray-400 items-center pt-6 border-t border-[#EDF2FB] dark:border-[#23272F]">
            <span>
              &copy; {new Date().getFullYear()} Desenvolvido por Inovare
            </span>
          </div>
        </div>

        <main className="flex-1 w-full md:w-auto mt-20 md:mt-0 px-2 md:px-6">
          <header className="w-full flex items-center justify-between px-4 md:px-6 py-4 bg-white/90 dark:bg-gray-900/95 shadow-md fixed top-0 left-0 z-20 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <Button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors focus:ring-2 focus:ring-[#ED4231] focus:outline-none"
                aria-label={
                  theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"
                }
              >
                <CalendarIcon className="w-5 h-5 text-[#ED4231]" />
              </Button>
              <span className="font-extrabold text-foreground">
                Meus Horários
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleLogout} className="px-4 py-2">
                Sair
              </Button>
            </div>
          </header>
          <div className="h-20" />

          <div className="max-w-5xl mx-auto w-full pb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-indigo-900 dark:text-gray-100">
              Meus Horários Disponibilizados
            </h1>

            <Card className="rounded-2xl mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Filtros</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Mês
                  </span>
                  <Select
                    onValueChange={(v) => {
                      const next = v === "ALL" ? "" : v;
                      setFilterMonth(next);
                      if (next && filterDay && !filterDay.startsWith(next)) {
                        setFilterDay("");
                      }
                    }}
                    value={filterMonth || "ALL"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os meses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todos os meses</SelectItem>
                      {monthOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Dia
                  </span>
                  <input
                    type="date"
                    value={filterDay}
                    onChange={(e) => setFilterDay(e.target.value)}
                    className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#23272F] px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Horário
                  </span>
                  <Select
                    onValueChange={(v) => setFilterTime(v === "ALL" ? "" : v)}
                    value={filterTime || "ALL"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os horários" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todos os horários</SelectItem>
                      {ALL_TIMES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {formatTimeRange(t)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end gap-2">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    Limpar filtros
                  </Button>
                  {loadingDay && (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      Carregando dia...
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {filteredDates.length === 0 ? (
              <Card className="rounded-2xl mt-4">
                <CardContent className="p-6 text-center">
                  <CalendarIcon className="w-10 h-10 mx-auto text-[#ED4231]" />
                  <p className="text-gray-500 mt-2">
                    Nenhuma disponibilidade cadastrada
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {hasFilters && !hasResults && (
                  <div
                    className="mt-4 p-4 rounded-xl border-l-4 border-[#ED4231] bg-[#FFF7F5] text-gray-800 dark:bg-[#23272F] dark:text-gray-200"
                    role="alert"
                    aria-live="assertive"
                  >
                    <span className="font-medium">
                      {filterTime
                        ? `Nenhum horário disponibilizado em ${formatTimeRange(
                            filterTime
                          )} para o filtro selecionado.`
                        : `Nenhum horário disponibilizado para o filtro selecionado.`}
                    </span>
                  </div>
                )}
                <div className="mt-6 space-y-6">
                  {filteredDates.map((iso) => {
                    const d = new Date(`${iso}T00:00:00`);
                    const day = map[iso];
                    const timesToShow = filterTime
                      ? (day?.times || []).filter((t) => t === filterTime)
                      : day?.times || [];
                    return (
                      <Card key={iso} className="rounded-2xl">
                        <CardHeader className="flex flex-row items-center justify-between py-4 bg-[#f8fafc] rounded-t-2xl">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-[#ED4231]" />
                            <CardTitle className="text-lg md:text-xl">
                              {format(d, "dd/MM/yyyy", { locale: ptBR })}
                            </CardTitle>
                            <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              {day.modalidade === "PRESENCIAL"
                                ? "Presencial"
                                : "Online"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              onClick={() => openEdit(iso)}
                              className="h-9 px-3"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Editar horários
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => removeDay(iso)}
                              className="h-9 px-3 text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Apagar dia
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4">
                          {timesToShow.length === 0 ? (
                            <span className="text-sm text-gray-500">
                              Sem horários neste dia para este filtro
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {timesToShow
                                .sort((a, b) => a.localeCompare(b))
                                .map((t) => (
                                  <div
                                    key={t}
                                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#EDF2FB] dark:border-[#23272F] bg-white dark:bg-[#23272F] text-sm font-medium text-gray-800 dark:text-gray-200 shadow-sm"
                                  >
                                    <span>{formatTimeRange(t)}</span>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-7 w-7"
                                      aria-label={`Remover ${t}`}
                                      onClick={() => removeTime(iso, t)}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <Dialog
            open={!!editDateISO}
            onOpenChange={(o) => !o && setEditDateISO(null)}
          >
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Editar horários</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-3 gap-2">
                {ALL_TIMES.map((t) => {
                  const active = editSelection.includes(t);
                  return (
                    <Button
                      key={t}
                      variant={active ? "default" : "outline"}
                      className={`h-10 px-3 text-sm rounded-xl ${
                        active
                          ? "bg-[#ED4231] text-white border-2 border-[#ED4231]"
                          : "border-2 border-gray-300 bg-white text-gray-800 hover:border-[#ED4231] hover:bg-[#ED4231]/10"
                      }`}
                      onClick={() => toggleEditTime(t)}
                      aria-pressed={active}
                    >
                      {formatTimeRange(t)}
                    </Button>
                  );
                })}
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setEditDateISO(null)}>
                  Cancelar
                </Button>
                <Button
                  onClick={confirmEdit}
                  className="bg-[#ED4231] text-white"
                >
                  Salvar alterações
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default MeusHorarios;
