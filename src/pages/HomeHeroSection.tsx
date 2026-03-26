import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../config/config";

// ── Icons ──────────────────────────────────────────────────────────────────
import { X, SquarePen, Eye, Plus, Trash2, Search } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
interface HeroSection {
    heroId: number;
    accommodationId: number;
    title: string;
    price: string | null;
    location: string | null;
    imgUrl: string | null;
    isActive: boolean;
    startDate: string | null;
    endDate: string | null;
    createdAt: string;
    updatedAt: string | null;
}

type FormData = Omit<HeroSection, "heroId" | "createdAt" | "updatedAt">;

interface Accommodation {
    id: number;
    name: string;
    description: string;
    price: number;
    available_rooms: number;
    amenities: string;
    address: string;
    latitude: number;
    longitude: number;
    adultPrice?: number;
    childPrice?: number;
    capacity: number;
}

const EMPTY_FORM: FormData = {
    accommodationId: 0,
    title: "",
    price: "",
    location: "",
    imgUrl: "",
    isActive: true,
    startDate: "",
    endDate: "",
};

// ── Mock seed data ─────────────────────────────────────────────────────────
const SEED: HeroSection[] = [
    {
        heroId: 1,
        accommodationId: 101,
        title: "Beachfront Paradise Villa",
        price: "$450/night",
        location: "Maldives",
        imgUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400",
        isActive: true,
        startDate: "2025-06-01",
        endDate: "2025-12-31",
        createdAt: "2025-01-10 09:00:00",
        updatedAt: null,
    },
    {
        heroId: 2,
        accommodationId: 202,
        title: "Mountain Retreat Chalet",
        price: "$280/night",
        location: "Swiss Alps",
        imgUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
        isActive: false,
        startDate: "2025-12-01",
        endDate: "2026-03-31",
        createdAt: "2025-02-15 14:30:00",
        updatedAt: "2025-03-01 10:00:00",
    },
];

// ── Notification component ─────────────────────────────────────────────────
type NotifType = "success" | "error" | "info";
interface Notif {
    id: number;
    type: NotifType;
    msg: string;
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function HomeHeroSection() {
    const [rows, setRows] = useState<HeroSection[]>([]);
    const [modal, setModal] = useState<"create" | "edit" | "view" | null>(null);
    const [selected, setSelected] = useState<HeroSection | null>(null);
    const [form, setForm] = useState<FormData>(EMPTY_FORM);
    const [deleteTarget, setDeleteTarget] = useState<HeroSection | null>(null);
    const [notifs, setNotifs] = useState<Notif[]>([]);
    const [search, setSearch] = useState("");
    const [filterActive, setFilterActive] = useState<
        "all" | "active" | "inactive"
    >("all");
    const [nextId, setNextId] = useState(3);
    const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
    const [pageNo, setPageNo] = useState(1);
    const [limit, setLimit] = useState(10);

    const pushNotif = (type: NotifType, msg: string) => {
        const id = Date.now();
        setNotifs((p) => [...p, { id, type, msg }]);
        setTimeout(() => setNotifs((p) => p.filter((n) => n.id !== id)), 3500);
    };

    const getAccommodations = async () => {
        try {
            const response = await fetch(
                `${BASE_URL}/admin/properties/accommodations`,
            );
            const data = await response.json();

            const accommodationsData = data.data || [];
            if (Array.isArray(accommodationsData)) {
                // console.log(accommodationsData);
                setAccommodations(accommodationsData);
            } else {
                console.error("Unexpected accommodations data format:", data);
                setAccommodations([]);
            }
        } catch (error) {
            console.error("Error fetching accommodations:", error);
            // alert("Failed to load accommodations");
        }
    };

    useEffect(() => {
        getAccommodations();
    }, []);

    const fetchAllHeroBanners = async () => {
        const response = await fetch(
            `${BASE_URL}/admin/hero-section/get-all-banners-info?page=${pageNo}&limit=${limit}&search=${search}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            },
        );
        // console.log("Fetch Records: ", response);
        // if (!response.ok) {
        //     pushNotif("error", response.statusText);
        // }
        const result = await response.json();
        if (result.success) {
            setRows(result.data);
        } else {
            // pushNotif("error", result.error);
        }
    };

    useEffect(() => {
        fetchAllHeroBanners();
    }, [pageNo, limit, search]);

    // ── Derived filtered rows ──────────────────────────────────────────────
    const filtered = rows.filter((r) => {
        const matchSearch =
            r.title.toLowerCase().includes(search.toLowerCase()) ||
            (r.location ?? "").toLowerCase().includes(search.toLowerCase()) ||
            String(r.accommodationId).includes(search);
        const matchActive =
            filterActive === "all" ||
            (filterActive === "active" && r.isActive) ||
            (filterActive === "inactive" && !r.isActive);
        return matchSearch && matchActive;
    });

    // ── Handlers ──────────────────────────────────────────────────────────
    const openCreate = () => {
        setForm(EMPTY_FORM);
        setModal("create");
    };
    const openEdit = (row: HeroSection) => {
        setSelected(row);
        setForm({
            accommodationId: row.accommodationId,
            title: row.title,
            price: row.price ?? "",
            location: row.location ?? "",
            imgUrl: row.imgUrl ?? "",
            isActive: row.isActive,
            startDate: row.startDate ?? "",
            endDate: row.endDate ?? "",
        });
        setModal("edit");
    };
    const openView = (row: HeroSection) => {
        setSelected(row);
        setModal("view");
    };
    const closeModal = () => {
        setModal(null);
        setSelected(null);
    };

    const handleSubmitCreate = async () => {
        console.log("Submit Data: ", form);
        const response = await axios.post(
            `${BASE_URL}/admin/hero-section/save`,
            form,
        );
        // console.log(response);
        if (!response.data.success) {
            pushNotif("error", `Error occurred while creating Hero Section.`);
        } else {
            closeModal();
            fetchAllHeroBanners();
            pushNotif(
                "success",
                `Hero section "${form.title}" created successfully.`,
            );
        }
    };

    const handleSubmitEdit = async () => {
        if (!selected) return;

        const response = await axios.put(
            `${BASE_URL}/admin/hero-section/update/${selected.heroId}`,
            form,
        );
        // console.log(response);
        if (response.data.success) {
            closeModal();
            fetchAllHeroBanners();
            pushNotif(
                "success",
                `Hero section "${form.title}" updated successfully.`,
            );
        } else {
            pushNotif(
                "error",
                response.data.error ||
                    "Error occurred while updating offer/promotion",
            );
        }
        setSelected(null);
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const response = await axios.delete(
            `${BASE_URL}/admin/hero-section/delete/${deleteTarget.heroId}`,
        );
        console.log(response);
        if (!response.data.success) {
            pushNotif(
                "error",
                response.data.error ||
                    "Error occurred while deleting Hero section Banner",
            );
        } else {
            fetchAllHeroBanners();
            pushNotif("success", "Hero section Banner deleted successfully");
        }
        setDeleteTarget(null);
    };

    const toggleActive = (id: number) => {
        setRows((p) =>
            p.map((r) =>
                r.heroId === id
                    ? {
                          ...r,
                          isActive: !r.isActive,
                          updatedAt: new Date()
                              .toISOString()
                              .replace("T", " ")
                              .slice(0, 19),
                      }
                    : r,
            ),
        );
    };

    const inputCls =
        "w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#4f8ef7] focus:ring-1 focus:ring-[#4f8ef7] transition-all";
    const labelCls =
        "block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1";

    return (
        <div className="min-h-screen bg-white text-slate-800 font-sans">
            {/* ── Notification stack ── */}
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
                {notifs.map((n) => (
                    <div
                        key={n.id}
                        className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl text-sm shadow-2xl border backdrop-blur-sm animate-fade-in
              ${
                  n.type === "success"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : n.type === "error"
                        ? "bg-red-50 border-red-200 text-red-800"
                        : "bg-blue-50 border-blue-200 text-blue-800"
              }`}
                    >
                        <span className="text-lg">
                            {n.type === "success"
                                ? "✓"
                                : n.type === "error"
                                  ? "✕"
                                  : "ℹ"}
                        </span>
                        {n.msg}
                    </div>
                ))}
            </div>

            {/* ── Header ── */}
            <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4f8ef7] to-[#7c3aed] flex items-center justify-center text-white text-sm font-bold shadow-lg">
                            H
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-slate-800 tracking-tight">
                                Hero Section Manager
                            </h1>
                            <p className="text-xs text-slate-400">
                                Manage hero banner records
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 bg-[#4f8ef7] hover:bg-[#3b7aed] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-lg shadow-blue-900/40 active:scale-95"
                    >
                        <span className="text-base leading-none">+</span> New
                        Hero
                    </button>
                </div>
            </header>

            {/* ── Main ── */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats bar */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                        {
                            label: "Total Records",
                            value: rows.length,
                            color: "text-[#4f8ef7]",
                        },
                        {
                            label: "Active",
                            value: rows.filter((r) => r.isActive).length,
                            color: "text-emerald-600",
                        },
                        {
                            label: "Inactive",
                            value: rows.filter((r) => !r.isActive).length,
                            color: "text-slate-400",
                        },
                    ].map((s) => (
                        <div
                            key={s.label}
                            className="bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm"
                        >
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                                {s.label}
                            </p>
                            <p className={`text-2xl font-bold mt-1 ${s.color}`}>
                                {s.value}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                            ⌕
                        </span>
                        <input
                            className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#4f8ef7] transition-all shadow-sm"
                            placeholder="Search by title, location, accommodation ID…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                        {(["all", "active", "inactive"] as const).map((v) => (
                            <button
                                key={v}
                                onClick={() => setFilterActive(v)}
                                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${filterActive === v ? "bg-[#4f8ef7] text-white" : "bg-white text-slate-500 hover:text-slate-800"}`}
                            >
                                {v}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">
                                    {[
                                        "ID",
                                        "Accommodation ID",
                                        "title",
                                        "Price",
                                        "Location",
                                        "Status",
                                        "Start Date",
                                        "End Date",
                                        "Actions",
                                    ].map((h) => (
                                        <th
                                            key={h}
                                            className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            className="text-center py-16 text-slate-300"
                                        >
                                            <div className="text-4xl mb-3">
                                                ◫
                                            </div>
                                            <p className="text-sm">
                                                No records found
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((row, i) => (
                                        <tr
                                            key={row.heroId}
                                            className={`border-b border-slate-100 hover:bg-blue-50/40 transition-colors ${i % 2 === 0 ? "" : "bg-slate-50/50"}`}
                                        >
                                            <td className="px-4 py-3 font-mono text-[#4f8ef7] font-bold text-xs">
                                                #{row.heroId}
                                            </td>
                                            <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                                                <div>{row.accommodationId}</div>
                                                <div className="text-slate-400 font-sans normal-case font-normal truncate max-w-[120px]">
                                                    {accommodations.find(
                                                        (a) =>
                                                            a.id ===
                                                            row.accommodationId,
                                                    )?.name ?? "—"}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    {row.imgUrl && (
                                                        <img
                                                            src={row.imgUrl}
                                                            alt=""
                                                            className="w-8 h-8 rounded-md object-cover shrink-0 border border-slate-200"
                                                        />
                                                    )}
                                                    <span className="font-semibold text-slate-800 truncate max-w-[160px]">
                                                        {row.title}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-emerald-600 font-semibold whitespace-nowrap">
                                                {row.price ?? "—"}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                                                {row.location ?? "—"}
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() =>
                                                        toggleActive(row.heroId)
                                                    }
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${row.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100" : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"}`}
                                                >
                                                    <span
                                                        className={`w-1.5 h-1.5 rounded-full ${row.isActive ? "bg-emerald-400" : "bg-slate-500"}`}
                                                    />
                                                    {row.isActive
                                                        ? "Active"
                                                        : "Inactive"}
                                                </button>
                                            </td>
                                            <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                                                {row.startDate
                                                    ? row.startDate.split(
                                                          "T",
                                                      )[0]
                                                    : "—"}
                                            </td>
                                            <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                                                {row.endDate
                                                    ? row.endDate.split("T")[0]
                                                    : "—"}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    <ActionBtn
                                                        onClick={() =>
                                                            openView(row)
                                                        }
                                                        title="View"
                                                        color="blue"
                                                    >
                                                        <Eye size={15} />
                                                    </ActionBtn>
                                                    <ActionBtn
                                                        onClick={() =>
                                                            openEdit(row)
                                                        }
                                                        title="Edit"
                                                        color="amber"
                                                    >
                                                        <SquarePen size={15} />
                                                    </ActionBtn>
                                                    <ActionBtn
                                                        onClick={() =>
                                                            setDeleteTarget(row)
                                                        }
                                                        title="Delete"
                                                        color="red"
                                                    >
                                                        <Trash2 size={15} />
                                                    </ActionBtn>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Table footer */}
                    <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 bg-slate-50">
                        <span>
                            Showing {filtered.length} of {rows.length} records
                        </span>
                        <span>hero_section table</span>
                    </div>
                </div>
            </main>

            {/* ── Create / Edit Modal ── */}
            {(modal === "create" || modal === "edit") && (
                <ModalOverlay onClose={closeModal}>
                    <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl">
                        {/* Modal header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm text-white ${modal === "create" ? "bg-blue-500" : "bg-amber-500"}`}
                                >
                                    {modal === "create" ? "+" : "✎"}
                                </div>
                                <h2 className="font-bold text-slate-800">
                                    {modal === "create"
                                        ? "Create Hero Section"
                                        : "Edit Hero Section"}
                                </h2>
                            </div>
                            <button
                                onClick={closeModal}
                                className="text-slate-400 hover:text-slate-800 text-lg leading-none transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal body */}
                        <div className="p-6 grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className={labelCls}>Title *</label>
                                <input
                                    className={inputCls}
                                    placeholder="e.g. Beachfront Paradise Villa"
                                    value={form.title}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            title: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className={labelCls}>
                                    Accommodation *
                                </label>
                                <select
                                    className={inputCls}
                                    value={form.accommodationId || ""}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            accommodationId: Number(
                                                e.target.value,
                                            ),
                                        })
                                    }
                                >
                                    <option
                                        value=""
                                        disabled
                                    >
                                        Select accommodation…
                                    </option>
                                    {accommodations.map((a) => (
                                        <option
                                            key={a.id}
                                            value={a.id}
                                        >
                                            {a.name} [#{a.id}]
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Price *</label>
                                <input
                                    className={inputCls}
                                    placeholder="₹450/night"
                                    value={form.price ?? "₹"}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            price: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className={labelCls}>Location *</label>
                                <input
                                    className={inputCls}
                                    placeholder="Maldives"
                                    value={form.location ?? ""}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            location: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className={labelCls}>Image URL *</label>
                                <input
                                    className={inputCls}
                                    placeholder="https://…"
                                    value={form.imgUrl ?? ""}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            imgUrl: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className={labelCls}>Start Date</label>
                                <input
                                    type="date"
                                    className={inputCls}
                                    value={form.startDate ?? ""}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            startDate: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className={labelCls}>End Date</label>
                                <input
                                    type="date"
                                    className={inputCls}
                                    value={form.endDate ?? ""}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            endDate: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="flex items-center gap-3 cursor-pointer select-none group">
                                    <div
                                        onClick={() =>
                                            setForm({
                                                ...form,
                                                isActive: !form.isActive,
                                            })
                                        }
                                        className={`relative w-11 h-6 rounded-full transition-all ${form.isActive ? "bg-[#4f8ef7]" : "bg-slate-300"}`}
                                    >
                                        <span
                                            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.isActive ? "translate-x-5" : ""}`}
                                        />
                                    </div>
                                    <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                                        Active
                                    </span>
                                </label>
                            </div>

                            {/* Image preview */}
                            {form.imgUrl && (
                                <div className="col-span-2">
                                    <label className={labelCls}>
                                        Image Preview
                                    </label>
                                    <img
                                        src={form.imgUrl}
                                        alt="preview"
                                        className="h-28 w-full object-cover rounded-lg border border-slate-200"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Modal footer */}
                        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 text-sm text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={
                                    modal === "create"
                                        ? handleSubmitCreate
                                        : handleSubmitEdit
                                }
                                disabled={
                                    !form.title ||
                                    !form.accommodationId ||
                                    !form.price ||
                                    !form.location ||
                                    !form.imgUrl
                                }
                                className="px-5 py-2 text-sm font-semibold bg-[#4f8ef7] hover:bg-[#3b7aed] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-all active:scale-95 shadow-lg shadow-blue-900/30"
                            >
                                {modal === "create"
                                    ? "Create Record"
                                    : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </ModalOverlay>
            )}

            {/* ── View Modal ── */}
            {modal === "view" && selected && (
                <ModalOverlay onClose={closeModal}>
                    <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                        {selected.imgUrl && (
                            <div className="relative h-44 overflow-hidden">
                                <img
                                    src={selected.imgUrl}
                                    alt=""
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent" />
                                <div className="absolute bottom-4 left-5">
                                    <span
                                        className={`text-xs font-bold px-2 py-1 rounded-full ${selected.isActive ? "bg-emerald-100 text-emerald-700 border border-emerald-300" : "bg-slate-100 text-slate-500 border border-slate-300"}`}
                                    >
                                        {selected.isActive
                                            ? "● Active"
                                            : "● Inactive"}
                                    </span>
                                </div>
                            </div>
                        )}
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className="text-xs text-[#4f8ef7] font-mono mb-1">
                                        Hero #{selected.heroId}
                                    </p>
                                    <h3 className="text-xl font-bold text-slate-800">
                                        {selected.title}
                                    </h3>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="text-slate-400 hover:text-slate-800 text-lg transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                {[
                                    {
                                        label: "Accommodation",
                                        value: `[${selected.accommodationId}] ${accommodations.find((a) => a.id === selected.accommodationId)?.name ?? "Unknown"}`,
                                    },
                                    {
                                        label: "Price",
                                        value: selected.price ?? "—",
                                    },
                                    {
                                        label: "Location",
                                        value: selected.location ?? "—",
                                    },
                                    {
                                        label: "Start Date",
                                        value: selected.startDate ?? "—",
                                    },
                                    {
                                        label: "End Date",
                                        value: selected.endDate ?? "—",
                                    },
                                    {
                                        label: "Created At",
                                        value: selected.createdAt,
                                    },
                                    {
                                        label: "Updated At",
                                        value: selected.updatedAt ?? "—",
                                    },
                                ].map((item) => (
                                    <div
                                        key={item.label}
                                        className="bg-slate-50 border border-slate-100 rounded-lg p-3"
                                    >
                                        <p className="text-xs text-slate-400 mb-1">
                                            {item.label}
                                        </p>
                                        <p className="text-slate-700 font-semibold truncate">
                                            {String(item.value)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 flex gap-3">
                                <button
                                    onClick={() => {
                                        closeModal();
                                        openEdit(selected);
                                    }}
                                    className="flex-1 py-2 text-sm font-semibold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg transition-all"
                                >
                                    Edit Record
                                </button>
                                <button
                                    onClick={closeModal}
                                    className="px-5 py-2 text-sm text-slate-500 border border-slate-200 rounded-lg hover:text-slate-800 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </ModalOverlay>
            )}

            {/* ── Delete Confirm Modal ── */}
            {deleteTarget && (
                <ModalOverlay onClose={() => setDeleteTarget(null)}>
                    <div className="bg-white border border-red-200 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
                        <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-2xl mx-auto mb-4">
                            🗑
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg mb-2">
                            Delete Hero Section?
                        </h3>
                        <p className="text-slate-500 text-sm mb-6">
                            Are you sure you want to delete{" "}
                            <span className="text-slate-800 font-semibold">
                                "{deleteTarget.title}"
                            </span>
                            ? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="flex-1 py-2 text-sm text-slate-500 border border-slate-200 rounded-lg hover:text-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 py-2 text-sm font-semibold bg-red-700 hover:bg-red-600 text-white rounded-lg transition-all active:scale-95"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </ModalOverlay>
            )}

            <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.2s ease; }
      `}</style>
        </div>
    );
}

// ── Sub-components ─────────────────────────────────────────────────────────
function ModalOverlay({
    children,
    onClose,
}: {
    children: React.ReactNode;
    onClose: () => void;
}) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative z-10 w-full flex justify-center animate-fade-in">
                {children}
            </div>
        </div>
    );
}

function ActionBtn({
    onClick,
    title,
    color,
    children,
}: {
    onClick: () => void;
    title: string;
    color: "blue" | "amber" | "red";
    children: React.ReactNode;
}) {
    const colors = {
        blue: "hover:bg-blue-50 hover:text-blue-600",
        amber: "hover:bg-amber-50 hover:text-amber-600",
        red: "hover:bg-red-50 hover:text-red-600",
    };
    return (
        <button
            onClick={onClick}
            title={title}
            className={`w-7 h-7 rounded-md flex items-center justify-center text-slate-500 transition-all text-xs ${colors[color]}`}
        >
            {children}
        </button>
    );
}
