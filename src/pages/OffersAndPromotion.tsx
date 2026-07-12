import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../config/config";
import { uploadImageFile } from "../utils/uploadMedia";
// ── Icons ──────────────────────────────────────────────────────────────────
import { X, SquarePen, Eye, Plus, Trash2, Search } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
interface OfferBanner {
    offerId: number;
    accommodationId: number;
    title: string;
    subTitle: string | null;
    description: string | null;
    bannerUrl: string | null;
    type: string | null;
    badgeLabel: string | null;
    badgeColor: string | null;
    ctaText: string | null;
    ctaLink: string | null;
    sortOrder: number | null;
    startDate: string | null;
    endDate: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string | null;
}

type FormData = Omit<OfferBanner, "offerId" | "createdAt" | "updatedAt">;

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

const BANNER_TYPES = [
    "deal",
    "seasonal",
    "flash",
    "featured",
    "new",
    "exclusive",
];
const BADGE_COLORS = [
    { label: "Crimson", value: "#DC2626" },
    { label: "Emerald", value: "#059669" },
    { label: "Amber", value: "#D97706" },
    { label: "Indigo", value: "#4F46E5" },
    { label: "Slate", value: "#475569" },
    { label: "Rose", value: "#E11D48" },
];

const ACCOMMODATIONS = [
    { id: 101, name: "The Palm Beach Resort" },
    { id: 202, name: "Mountain View Lodge" },
    { id: 303, name: "Alpine Ski Chalet" },
    { id: 404, name: "City Centre Suites" },
    { id: 505, name: "Riverside Boutique Hotel" },
    { id: 606, name: "Desert Dunes Camp" },
    { id: 707, name: "Forest Retreat Cabins" },
    { id: 808, name: "Harbour Side Inn" },
];

const EMPTY_FORM: FormData = {
    accommodationId: 0,
    title: "",
    subTitle: null,
    description: null,
    bannerUrl: null,
    type: null,
    badgeLabel: null,
    badgeColor: null,
    ctaText: null,
    ctaLink: null,
    sortOrder: null,
    startDate: null,
    endDate: null,
    isActive: true,
};

// ── Helpers ────────────────────────────────────────────────────────────────
const fmt = (d: string | null) =>
    d
        ? new Date(d).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
          })
        : "—";

const str = (v: string | null) => v ?? "";

interface ApiResponse {
    success: boolean;
    data: Location[];
    message: string;
}

// ── Toast ──────────────────────────────────────────────────────────────────
function Toast({
    msg,
    type,
    onClose,
}: {
    msg: string;
    type: "success" | "error" | "info";
    onClose: () => void;
}) {
    useEffect(() => {
        const t = setTimeout(onClose, 3000);
        return () => clearTimeout(t);
    }, [onClose]);
    const colors = {
        success: "bg-emerald-500",
        error: "bg-red-500",
        info: "bg-blue-500",
    };
    return (
        <div
            className={`fixed bottom-6 right-6 z-[999] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-medium ${colors[type]} animate-slide-up`}
        >
            {msg}
            <button
                onClick={onClose}
                className="opacity-70 hover:opacity-100"
            >
                <X />
            </button>
        </div>
    );
}

// ── View Modal ─────────────────────────────────────────────────────────────
function ViewModal({
    offer,
    onClose,
    accommodationList,
}: {
    offer: OfferBanner;
    onClose: () => void;
    accommodationList: Accommodation[];
}) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" />
            <div
                className="relative bg-white border border-gray-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {offer.bannerUrl && (
                    <div className="relative h-48 overflow-hidden">
                        <img
                            src={offer.bannerUrl}
                            alt={offer.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent" />
                        {offer.badgeLabel && (
                            <span
                                className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold text-white tracking-widest"
                                style={{
                                    backgroundColor:
                                        offer.badgeColor ?? "#4F46E5",
                                }}
                            >
                                {offer.badgeLabel}
                            </span>
                        )}
                    </div>
                )}
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                {offer.title}
                            </h2>
                            {offer.subTitle && (
                                <p className="text-gray-500 text-sm mt-1">
                                    {offer.subTitle}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-700 transition-colors"
                        >
                            <X />
                        </button>
                    </div>
                    {offer.description && (
                        <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                            {offer.description}
                        </p>
                    )}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        {[
                            [
                                "Accommodation",
                                `${accommodationList.find((a) => a.id === offer.accommodationId)?.name ?? "Unknown"} (#${offer.accommodationId})`,
                            ],
                            ["Type", offer.type || "—"],
                            ["Sort Order", offer.sortOrder ?? "—"],
                            ["Status", offer.isActive ? "Active" : "Inactive"],
                            ["Start Date", fmt(offer.startDate)],
                            ["End Date", fmt(offer.endDate)],
                            ["CTA Text", offer.ctaText || "—"],
                            ["CTA Link", offer.ctaLink || "—"],
                            ["Created At", fmt(offer.createdAt)],
                            ["Updated At", fmt(offer.updatedAt)],
                        ].map(([k, v]) => (
                            <div
                                key={String(k)}
                                className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-100"
                            >
                                <div className="text-gray-400 text-xs uppercase tracking-wider mb-0.5">
                                    {k}
                                </div>
                                <div className="text-gray-800 font-semibold truncate">
                                    {String(v)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Delete Confirm ─────────────────────────────────────────────────────────
function DeleteModal({
    offer,
    onConfirm,
    onClose,
}: {
    offer: OfferBanner;
    onConfirm: () => void;
    onClose: () => void;
}) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" />
            <div
                className="relative bg-white border border-red-100 rounded-2xl w-full max-w-md p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4 text-red-500 border border-red-100">
                    <Trash2 />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Delete Banner
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                    Are you sure you want to delete{" "}
                    <span className="text-gray-900 font-semibold">
                        "{offer.title}"
                    </span>
                    ? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all text-sm font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white transition-all text-sm font-bold"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Form Modal ─────────────────────────────────────────────────────────────
function FormModal({
    initial,
    onSave,
    onClose,
    accommodations,
}: {
    initial: OfferBanner | null;
    onSave: (data: FormData) => void;
    onClose: () => void;
    accommodations: Accommodation[];
}) {
    const [form, setForm] = useState<FormData>(
        initial
            ? {
                  accommodationId: initial.accommodationId,
                  title: initial.title,
                  subTitle: initial.subTitle,
                  description: initial.description,
                  bannerUrl: initial.bannerUrl,
                  type: initial.type,
                  badgeLabel: initial.badgeLabel,
                  badgeColor: initial.badgeColor,
                  ctaText: initial.ctaText,
                  ctaLink: initial.ctaLink,
                  sortOrder: initial.sortOrder,
                  startDate: initial.startDate
                      ? initial.startDate.split("T")[0]
                      : "",
                  endDate: initial.endDate ? initial.endDate.split("T")[0] : "",
                  isActive: initial.isActive,
              }
            : { ...EMPTY_FORM },
    );
    const [errors, setErrors] = useState<
        Partial<Record<keyof FormData, string>>
    >({});
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const set = (k: keyof FormData, v: string | number | boolean | null) =>
        setForm((f) => ({ ...f, [k]: v }));

    const handleBannerUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploadingBanner(true);
            const result = await uploadImageFile(file, "promotions");
            set("bannerUrl", result.url);
        } catch (error) {
            console.error("Banner upload error:", error);
        } finally {
            setUploadingBanner(false);
            e.target.value = "";
        }
    };

    const validate = () => {
        const e: typeof errors = {};
        if (!form.title.trim()) e.title = "Title is required";
        if (!form.accommodationId)
            e.accommodationId = "Accommodation ID is required";
        if (form.startDate && form.endDate && form.startDate > form.endDate)
            e.endDate = "End date must be after start date";
        if (!form.type) e.type = "Type is required";
        if (!form.subTitle) e.subTitle = "Sub Title is required";
        if (!form.description) e.description = "Description is required";
        if (!form.bannerUrl) e.bannerUrl = "Banner Image URL is required";
        if (!form.badgeLabel) e.badgeLabel = "Badge Label is required";
        if (!form.badgeColor) e.badgeColor = "Badge Color is required";
        if (!form.ctaText) e.ctaText = "CTA Text is required";
        // if (!form.ctaLink) e.ctaLink = "CTA Link is required";

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const inputCls = (field: keyof FormData) =>
        `w-full bg-white border ${errors[field] ? "border-red-400 ring-2 ring-red-50" : "border-gray-200"} rounded-xl px-3.5 py-2.5 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all`;

    const labelCls =
        "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            // onClick={onClose}
        >
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" />
            <div
                className="relative bg-white border border-gray-200 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            {initial ? "Edit Banner" : "Add New Banner"}
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {initial
                                ? `Offer ID: #${initial.offerId}`
                                : "Fill in the details below"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-700 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className={labelCls}>Title *</label>
                            <input
                                className={inputCls("title")}
                                placeholder="e.g. Summer Flash Sale"
                                value={form.title}
                                onChange={(e) => set("title", e.target.value)}
                            />
                            {errors.title && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.title}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className={labelCls}>Accommodation *</label>
                            <select
                                className={inputCls("accommodationId")}
                                value={form.accommodationId || ""}
                                onChange={(e) =>
                                    set(
                                        "accommodationId",
                                        Number(e.target.value),
                                    )
                                }
                            >
                                <option value="">
                                    — Select accommodation —
                                </option>
                                {accommodations.map((a) => (
                                    <option
                                        key={a.id}
                                        value={a.id}
                                    >
                                        {a.name} (#{a.id})
                                    </option>
                                ))}
                            </select>
                            {errors.accommodationId && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.accommodationId}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className={labelCls}>Type</label>
                            <select
                                className={inputCls("type")}
                                value={str(form.type)}
                                onChange={(e) =>
                                    set("type", e.target.value || null)
                                }
                            >
                                <option value="">— Select type —</option>
                                {BANNER_TYPES.map((t) => (
                                    <option
                                        key={t}
                                        value={t}
                                    >
                                        {t.charAt(0).toUpperCase() + t.slice(1)}
                                    </option>
                                ))}
                            </select>
                            {errors.type && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.type}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className={labelCls}>Sub-title</label>
                        <input
                            className={inputCls("subTitle")}
                            placeholder="Short tagline"
                            value={str(form.subTitle)}
                            onChange={(e) =>
                                set("subTitle", e.target.value || null)
                            }
                        />
                        {errors.subTitle && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.subTitle}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className={labelCls}>Description</label>
                        <textarea
                            className={`${inputCls("description")} resize-none h-20`}
                            placeholder="Brief offer description..."
                            value={str(form.description)}
                            onChange={(e) =>
                                set("description", e.target.value || null)
                            }
                        />
                        {errors.description && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.description}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className={labelCls}>Banner Image</label>
                        <div className="flex flex-col gap-2">
                            <input
                                className={inputCls("bannerUrl")}
                                placeholder="https://api.nirwanastays.com/storage/promotions/..."
                                value={str(form.bannerUrl)}
                                onChange={(e) =>
                                    set("bannerUrl", e.target.value || null)
                                }
                            />
                            <label className="inline-flex items-center gap-2 w-fit px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleBannerUpload}
                                    disabled={uploadingBanner}
                                />
                                {uploadingBanner
                                    ? "Uploading..."
                                    : "Upload banner image"}
                            </label>
                        </div>
                        {errors.bannerUrl && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.bannerUrl}
                            </p>
                        )}
                        {form.bannerUrl && (
                            <img
                                src={form.bannerUrl}
                                alt="preview"
                                className="mt-2 h-24 w-full object-cover rounded-lg border border-gray-200"
                                onError={(e) =>
                                    (e.currentTarget.style.display = "none")
                                }
                            />
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Badge Label</label>
                            <input
                                className={inputCls("badgeLabel")}
                                placeholder="HOT / NEW / SAVE"
                                value={str(form.badgeLabel)}
                                onChange={(e) =>
                                    set("badgeLabel", e.target.value || null)
                                }
                            />
                            {errors.badgeLabel && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.badgeLabel}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className={labelCls}>Badge Color</label>
                            <select
                                className={inputCls("badgeColor")}
                                value={str(form.badgeColor)}
                                onChange={(e) =>
                                    set("badgeColor", e.target.value || null)
                                }
                            >
                                <option value="">— Select color —</option>
                                {BADGE_COLORS.map((c) => (
                                    <option
                                        key={c.value}
                                        value={c.value}
                                    >
                                        {c.label}
                                    </option>
                                ))}
                            </select>
                            {errors.badgeColor && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.badgeColor}
                                </p>
                            )}
                            {form.badgeColor && (
                                <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-400">
                                    <span
                                        className="w-4 h-4 rounded-full border border-gray-200"
                                        style={{
                                            backgroundColor: form.badgeColor,
                                        }}
                                    />
                                    Preview
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>CTA Text</label>
                            <input
                                className={inputCls("ctaText")}
                                placeholder="Book Now"
                                value={str(form.ctaText)}
                                onChange={(e) =>
                                    set("ctaText", e.target.value || null)
                                }
                            />
                            {errors.ctaText && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.ctaText}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className={labelCls}>CTA Link</label>
                            <input
                                className={inputCls("ctaLink")}
                                placeholder="/accommodation/id"
                                value={str(
                                    form.ctaLink ??
                                        `/accommodation/${form.accommodationId ?? ""}`,
                                )}
                                onChange={(e) =>
                                    set("ctaLink", e.target.value || null)
                                }
                            />
                            {errors.ctaLink && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.ctaLink}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className={labelCls}>Start Date</label>
                            <input
                                type="date"
                                className={inputCls("startDate")}
                                value={str(form.startDate)}
                                onChange={(e) =>
                                    set("startDate", e.target.value || null)
                                }
                            />
                        </div>
                        <div>
                            <label className={labelCls}>End Date</label>
                            <input
                                type="date"
                                className={inputCls("endDate")}
                                value={str(form.endDate)}
                                onChange={(e) =>
                                    set("endDate", e.target.value || null)
                                }
                            />
                            {errors.endDate && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.endDate}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className={labelCls}>Sort Order</label>
                            <input
                                type="number"
                                className={inputCls("sortOrder")}
                                placeholder="1"
                                min="0"
                                max="255"
                                value={form.sortOrder ?? ""}
                                onChange={(e) =>
                                    set(
                                        "sortOrder",
                                        e.target.value
                                            ? Number(e.target.value)
                                            : null,
                                    )
                                }
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                        <div>
                            <p className="text-sm font-semibold text-gray-800">
                                Active Status
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Visible to users when enabled
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => set("isActive", !form.isActive)}
                            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${form.isActive ? "bg-indigo-500" : "bg-gray-300"}`}
                        >
                            <span
                                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${form.isActive ? "translate-x-5" : ""}`}
                            />
                        </button>
                    </div>
                </div>

                <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all text-sm font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            if (validate()) onSave(form);
                        }}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all text-sm font-bold shadow shadow-indigo-100"
                    >
                        {initial ? "Save Changes" : "Create Banner"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function OffersAndPromotion() {
    const [data, setData] = useState<OfferBanner[]>([]);
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [viewOffer, setViewOffer] = useState<OfferBanner | null>(null);
    const [editOffer, setEditOffer] = useState<OfferBanner | null | undefined>(
        undefined,
    );
    const [deleteOffer, setDeleteOffer] = useState<OfferBanner | null>(null);
    const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
    const [toast, setToast] = useState<{
        msg: string;
        type: "success" | "error" | "info";
    } | null>(null);
    const [pageNo, setPageNo] = useState(1);
    const [limit, setLimit] = useState(10);

    const showToast = (
        msg: string,
        type: "success" | "error" | "info" = "success",
    ) => setToast({ msg, type });

    const fetchOffersData = async () => {
        // Simulate API call
        const response = await fetch(
            `${BASE_URL}/admin/offers-promotion/get-all-offers?page=${pageNo}&limit=${limit}&search=${search}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            },
        );
        // console.log("Fetch Records: ", response);
        if (!response.ok) {
            showToast(response.statusText, "error");
        }
        const result = await response.json();
        if (result.success) {
            setData(result.data);
        } else {
            showToast(result.error, "error");
        }
        // console.log("Fetch Records 2: ", result);
    };

    useEffect(() => {
        fetchOffersData();
    }, [pageNo, limit, search]);

    const filtered = data.filter((o) => {
        const q = search.toLowerCase();
        const matchSearch =
            !q ||
            o.title.toLowerCase().includes(q) ||
            String(o.accommodationId).includes(q) ||
            (o.type ?? "").toLowerCase().includes(q);
        const matchType = !filterType || o.type === filterType;
        const matchStatus =
            filterStatus === ""
                ? true
                : filterStatus === "active"
                  ? o.isActive
                  : !o.isActive;
        return matchSearch && matchType && matchStatus;
    });

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

    const handleSave = async (formData: FormData) => {
        // console.log("Saving form data:", formData);
        try {
            if (editOffer) {
                const response = await axios.put(
                    `${BASE_URL}/admin/offers-promotion/update/${editOffer.offerId}`,
                    formData,
                );
                // console.log(response);
                if (response.data.success) {
                    fetchOffersData();
                    showToast("Banner updated successfully");
                } else {
                    showToast(
                        response.data.error ||
                            "Error occurred while updating offer/promotion",
                        "error",
                    );
                }
            } else {
                const response = await axios.post(
                    `${BASE_URL}/admin/offers-promotion/save`,
                    formData,
                );
                // console.log(response);
                if (!response.data.success) {
                    showToast(
                        response.data.error ||
                            "Error occurred while creating offer/promotion",
                        "error",
                    );
                } else {
                    fetchOffersData();
                    showToast("Banner created successfully");
                }
            }
            setEditOffer(undefined);
        } catch (error) {
            console.error("Error saving accommodation:", error);
            showToast("Error saving banner", "error");
        }
    };

    const handleDelete = async () => {
        if (!deleteOffer) return;
        const response = await axios.delete(
            `${BASE_URL}/admin/offers-promotion/delete/${deleteOffer.offerId}`,
        );
        console.log(response);
        if (!response.data.success) {
            showToast(
                response.data.error ||
                    "Error occurred while deleting offer/promotion",
                "error",
            );
        } else {
            fetchOffersData();
            showToast("Banner deleted successfully");
        }
        setDeleteOffer(null);
    };

    const stats = {
        total: data.length,
        active: data.filter((o) => o.isActive).length,
        inactive: data.filter((o) => !o.isActive).length,
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans">
            <style>{`
        
        * { font-family: 'DM Sans', sans-serif; }
        .font-display { font-family: 'Syne', sans-serif; }
        @keyframes slide-up { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .animate-slide-up { animation: slide-up 0.25s ease; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #f8fafc; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 3px; }
        input[type="date"]::-webkit-calendar-picker-indicator { cursor: pointer; opacity: 0.5; }
        select option { background: white; color: #111827; }
      `}</style>

            {/* Nav */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow shadow-indigo-200">
                        <span className="text-white text-xs font-bold font-display">
                            OP
                        </span>
                    </div>
                    <div>
                        <h1 className="font-display text-base font-bold text-gray-900 leading-tight">
                            Offers & Promotional Banners
                        </h1>
                        <p className="text-xs text-gray-400 font-mono">
                            offers_promotional_banners
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setEditOffer(null)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow shadow-indigo-200 transition-all"
                >
                    <Plus size={18} /> Add Banner
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-7">
                    {[
                        {
                            label: "Total Banners",
                            value: stats.total,
                            dot: "bg-indigo-500",
                            bg: "bg-indigo-50",
                            text: "text-indigo-700",
                            border: "border-indigo-100",
                        },
                        {
                            label: "Active",
                            value: stats.active,
                            dot: "bg-emerald-500",
                            bg: "bg-emerald-50",
                            text: "text-emerald-700",
                            border: "border-emerald-100",
                        },
                        {
                            label: "Inactive",
                            value: stats.inactive,
                            dot: "bg-amber-400",
                            bg: "bg-amber-50",
                            text: "text-amber-700",
                            border: "border-amber-100",
                        },
                    ].map((s) => (
                        <div
                            key={s.label}
                            className={`bg-white border ${s.border} rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm`}
                        >
                            <div
                                className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}
                            >
                                <span
                                    className={`w-3 h-3 rounded-full ${s.dot}`}
                                />
                            </div>
                            <div>
                                <p
                                    className={`text-2xl font-display font-bold ${s.text}`}
                                >
                                    {s.value}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {s.label}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-5">
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 flex-1 min-w-56 shadow-sm focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-50 transition-all">
                        <span className="text-gray-400 flex-shrink-0">
                            <Search size={20} />
                        </span>
                        <input
                            className="bg-transparent text-gray-900 text-sm placeholder-gray-400 outline-none w-full"
                            placeholder="Search by title, ID or type…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all shadow-sm"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="">All Types</option>
                        {BANNER_TYPES.map((t) => (
                            <option
                                key={t}
                                value={t}
                            >
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                            </option>
                        ))}
                    </select>
                    <select
                        className="bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all shadow-sm"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                {/* Table */}
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-200">
                                    {[
                                        "#ID",
                                        "Banner",
                                        "Type",
                                        "Badge",
                                        "Dates",
                                        "Sort",
                                        "Status",
                                        "Actions",
                                    ].map((h) => (
                                        <th
                                            key={h}
                                            className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="text-center py-16 text-gray-400"
                                        >
                                            <div className="text-4xl mb-3">
                                                🪄
                                            </div>
                                            <p className="text-sm font-medium">
                                                No banners found
                                            </p>
                                            <p className="text-xs mt-1 text-gray-300">
                                                Try adjusting your filters
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((o, i) => (
                                        <tr
                                            key={o.offerId}
                                            className={`hover:bg-indigo-50/30 transition-colors group ${i % 2 !== 0 ? "bg-gray-50/40" : "bg-white"}`}
                                        >
                                            <td className="px-5 py-4 text-gray-400 font-mono text-xs">
                                                #{o.offerId}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    {o.bannerUrl ? (
                                                        <img
                                                            src={o.bannerUrl}
                                                            alt={o.title}
                                                            className="w-14 h-9 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                                                            onError={(e) =>
                                                                (e.currentTarget.style.display =
                                                                    "none")
                                                            }
                                                        />
                                                    ) : (
                                                        <div className="w-14 h-9 rounded-lg bg-gray-100 border border-gray-200 flex-shrink-0" />
                                                    )}
                                                    <div>
                                                        <p className="font-semibold text-gray-900 leading-tight">
                                                            {o.title}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">
                                                            {o.subTitle ??
                                                                o.description ??
                                                                ACCOMMODATIONS.find(
                                                                    (a) =>
                                                                        a.id ===
                                                                        o.accommodationId,
                                                                )?.name ??
                                                                `Accommodation #${o.accommodationId}`}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                {o.type ? (
                                                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-semibold capitalize border border-indigo-100">
                                                        {o.type}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-300">
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                {o.badgeLabel ? (
                                                    <span
                                                        className="px-2.5 py-1 rounded-full text-xs font-bold text-white"
                                                        style={{
                                                            backgroundColor:
                                                                o.badgeColor ??
                                                                "#4F46E5",
                                                        }}
                                                    >
                                                        {o.badgeLabel}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-300">
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 whitespace-nowrap text-xs">
                                                <div className="text-gray-700">
                                                    <span className="text-gray-400 mr-1">
                                                        From
                                                    </span>
                                                    {fmt(o.startDate)}
                                                </div>
                                                <div className="text-gray-700 mt-0.5">
                                                    <span className="text-gray-400 mr-1">
                                                        To
                                                    </span>
                                                    {fmt(o.endDate)}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-center text-gray-500 text-sm">
                                                {o.sortOrder ?? (
                                                    <span className="text-gray-300">
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${o.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}
                                                >
                                                    <span
                                                        className={`w-1.5 h-1.5 rounded-full ${o.isActive ? "bg-emerald-500" : "bg-gray-400"}`}
                                                    />
                                                    {o.isActive
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        onClick={() =>
                                                            setViewOffer(o)
                                                        }
                                                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors"
                                                        title="View"
                                                    >
                                                        <Eye size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            setEditOffer(o)
                                                        }
                                                        className="w-8 h-8 rounded-lg bg-indigo-50 hover:bg-indigo-100 flex items-center justify-center text-indigo-500 hover:text-indigo-700 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <SquarePen size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            setDeleteOffer(o)
                                                        }
                                                        className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-400 hover:text-red-600 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                            Showing{" "}
                            <span className="font-semibold text-gray-600">
                                {filtered.length}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-gray-600">
                                {data.length}
                            </span>{" "}
                            banners
                        </p>
                        <p className="text-xs text-gray-300 font-mono">
                            offers_promotional_banners
                        </p>
                    </div>
                </div>
            </div>

            {viewOffer && (
                <ViewModal
                    offer={viewOffer}
                    onClose={() => setViewOffer(null)}
                    accommodationList={accommodations}
                />
            )}
            {editOffer !== undefined && (
                <FormModal
                    initial={editOffer}
                    onSave={handleSave}
                    onClose={() => setEditOffer(undefined)}
                    accommodations={accommodations}
                />
            )}
            {deleteOffer && (
                <DeleteModal
                    offer={deleteOffer}
                    onConfirm={handleDelete}
                    onClose={() => setDeleteOffer(null)}
                />
            )}
            {toast && (
                <Toast
                    msg={toast.msg}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
