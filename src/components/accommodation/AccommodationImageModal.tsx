import React, {
    useState,
    useRef,
    useCallback,
    DragEvent,
    ChangeEvent,
    useEffect,
} from "react";
import axios from "axios";
import { BASE_URL } from "../../config/config";
import { set } from "date-fns";

// ─── Types ────────────────────────────────────────────────────────────────────

type Category =
    | "Accommodation"
    | "Room"
    | "Bathroom"
    | "Kitchen"
    | "Common Area"
    | "Exterior"
    | "Amenities"
    | "Surrounding Area";

interface AccommodationImagePayload {
    accommodationId: number;
    imgTitle: string;
    imgAltText: string;
    imgDescription: string | null;
    imgPosition: number;
    category: Category;
    file: File;
}

interface FormErrors {
    file?: string;
    title?: string;
    altText?: string;
}

interface AccommodationImageModalProps {
    accommodationId: number;
    onClose: () => void;
    onSuccess?: (payload: AccommodationImagePayload) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
    "Accommodation",
    "Room",
    "Bathroom",
    "Kitchen",
    "Common Area",
    "Exterior",
    "Amenities",
    "Surrounding Area",
];

// ─── Icons ────────────────────────────────────────────────────────────────────

const UploadCloudIcon: React.FC = () => (
    <svg
        className="w-8 h-8"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="16 16 12 12 8 16" />
        <line
            x1="12"
            y1="12"
            x2="12"
            y2="21"
        />
        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
);

const XIcon: React.FC<{ className?: string }> = ({
    className = "w-3.5 h-3.5",
}) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
    >
        <line
            x1="18"
            y1="6"
            x2="6"
            y2="18"
        />
        <line
            x1="6"
            y1="6"
            x2="18"
            y2="18"
        />
    </svg>
);

const CheckIcon: React.FC = () => (
    <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const PhotoIcon: React.FC = () => (
    <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="2"
        />
        <circle
            cx="8.5"
            cy="8.5"
            r="1.5"
        />
        <polyline points="21 15 16 10 5 21" />
    </svg>
);

const ChevronDownIcon: React.FC = () => (
    <svg
        className="w-4 h-4 text-slate-400 pointer-events-none"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
    >
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────

const AccommodationImageModal: React.FC<AccommodationImageModalProps> = ({
    accommodationId,
    onClose,
    onSuccess,
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [dragging, setDragging] = useState(false);
    const [category, setCategory] = useState<Category>("Accommodation");
    const [title, setTitle] = useState("");
    const [altText, setAltText] = useState("");
    const [description, setDescription] = useState("");
    const [position, setPosition] = useState<number>(1);
    const [errors, setErrors] = useState<FormErrors>({});
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── File Handling ──

    const setImageFile = useCallback((incoming: File) => {
        if (!incoming.type.startsWith("image/")) return;
        setFile(incoming);
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(incoming);
        setErrors((prev) => ({ ...prev, file: undefined }));
    }, []);

    const clearFile = () => {
        setFile(null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const onDrop = useCallback(
        (e: DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setDragging(false);
            const dropped = e.dataTransfer.files[0];
            if (dropped) setImageFile(dropped);
        },
        [setImageFile],
    );

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) setImageFile(selected);
    };

    useEffect(() => {
        const getImgPosition = async (accommodationId: number) => {
            const response = await axios.get(
                `${BASE_URL}/admin/properties/accommodations/${accommodationId}/fetch-position`,
            );
            console.log(response);
            setPosition(response.data.imgPositionId + 1);
        };
        getImgPosition(accommodationId);
    }, []);

    // ── Validation ──

    const validate = (): boolean => {
        const errs: FormErrors = {};
        if (!file) errs.file = "Please select an image.";
        if (!title.trim()) errs.title = "Title is required.";
        if (!altText.trim())
            errs.altText = "Alt text is required for accessibility.";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // ── Submit ──

    const handleSubmit = async () => {
        if (!validate() || !file) return;
        setUploading(true);

        const payload: AccommodationImagePayload = {
            accommodationId,
            imgTitle: title.trim(),
            imgAltText: altText.trim(),
            imgDescription: description.trim() || null,
            imgPosition: position,
            category,
            file,
        };

        // Replace with your real API call:
        // const formData = new FormData();
        // formData.append("image", file);
        // formData.append("imgTitle", payload.imgTitle);
        // formData.append("imgAltText", payload.imgAltText);
        // formData.append("imgDescription", payload.imgDescription ?? "");
        // formData.append("imgPosition", String(payload.imgPosition));
        // formData.append("accommodationId", String(accommodationId));
        // await fetch(`/api/accommodations/${accommodationId}/images`, { method: "POST", body: formData });

        await new Promise((r) => setTimeout(r, 1500));
        setUploading(false);
        setSuccess(true);
        setTimeout(() => {
            onSuccess?.(payload);
            onClose();
        }, 1000);
    };

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm"
            style={{ animation: "fadeIn 0.2s ease" }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                className="relative w-full max-w-[490px] mx-4 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]"
                style={{
                    animation: "slideUp 0.25s cubic-bezier(0.16,1,0.3,1)",
                }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                {/* ── Header ── */}
                <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                            <PhotoIcon />
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold tracking-widest uppercase text-blue-500 mb-0.5">
                                Accommodation #{accommodationId}
                            </p>
                            <h2
                                id="modal-title"
                                className="text-[17px] font-semibold text-slate-900 leading-tight"
                            >
                                Upload Image Details
                            </h2>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close modal"
                        className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        <XIcon className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* ── Body ── */}
                <div className="flex flex-col gap-4 px-6 py-5 overflow-y-auto">
                    {/* Drop Zone / Preview */}
                    <div>
                        {!preview ? (
                            <div
                                className={[
                                    "border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 min-h-[120px] flex items-center justify-center",
                                    dragging
                                        ? "border-blue-400 bg-blue-50 ring-4 ring-blue-100"
                                        : errors.file
                                          ? "border-red-300 bg-red-50"
                                          : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/50",
                                ].join(" ")}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setDragging(true);
                                }}
                                onDragLeave={() => setDragging(false)}
                                onDrop={onDrop}
                                onClick={() => fileInputRef.current?.click()}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) =>
                                    e.key === "Enter" &&
                                    fileInputRef.current?.click()
                                }
                                aria-label="Image upload drop zone"
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={onFileChange}
                                />
                                <div className="flex flex-col items-center gap-1.5 py-6 px-6 text-center">
                                    <div className="text-slate-300 mb-1">
                                        <UploadCloudIcon />
                                    </div>
                                    <p className="text-sm font-medium text-slate-600">
                                        Drop an image here or{" "}
                                        <span className="text-blue-500 underline underline-offset-2 cursor-pointer">
                                            browse
                                        </span>
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        PNG, JPG, WEBP — up to 10 MB
                                    </p>
                                </div>
                            </div>
                        ) : (
                            /* Image Preview */
                            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group">
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="w-full h-48 object-cover"
                                />
                                {/* Overlay on hover */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            fileInputRef.current?.click();
                                        }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg shadow mr-2"
                                    >
                                        Replace
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            clearFile();
                                        }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow"
                                    >
                                        Remove
                                    </button>
                                </div>
                                {/* File name badge */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                                    <p className="text-white text-xs truncate font-medium">
                                        {file?.name}
                                    </p>
                                    <p className="text-white/70 text-[10px]">
                                        {file
                                            ? (file.size / 1024 / 1024).toFixed(
                                                  2,
                                              ) + " MB"
                                            : ""}
                                    </p>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={onFileChange}
                                />
                            </div>
                        )}
                        {errors.file && (
                            <p className="mt-1.5 text-xs font-medium text-red-500">
                                {errors.file}
                            </p>
                        )}
                    </div>

                    {/* Category + Position row */}
                    <div className="flex gap-3">
                        <div className="flex flex-col gap-1.5 flex-1">
                            <label
                                htmlFor="aim-category"
                                className="text-[12.5px] font-semibold text-slate-700"
                            >
                                Category <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    id="aim-category"
                                    value={category}
                                    onChange={(e) =>
                                        setCategory(e.target.value as Category)
                                    }
                                    className="w-full appearance-none px-3 py-2.5 pr-9 border border-slate-200 rounded-lg text-sm text-slate-800 bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
                                >
                                    {CATEGORIES.map((c) => (
                                        <option
                                            key={c}
                                            value={c}
                                        >
                                            {c}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <ChevronDownIcon />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5 w-[86px]">
                            <label
                                htmlFor="aim-position"
                                className="text-[12.5px] font-semibold text-slate-700"
                            >
                                Position <span className="text-red-400">*</span>
                            </label>
                            <input
                                id="aim-position"
                                type="number"
                                min={1}
                                max={99}
                                value={position}
                                onChange={(e) =>
                                    setPosition(
                                        Math.max(1, Number(e.target.value)),
                                    )
                                }
                                className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 text-center focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                        </div>
                    </div>

                    {/* Title */}
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="aim-title"
                            className="text-[12.5px] font-semibold text-slate-700"
                        >
                            Title <span className="text-red-400">*</span>
                        </label>
                        <input
                            id="aim-title"
                            type="text"
                            placeholder="e.g. Deluxe Room — Ocean View"
                            maxLength={150}
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                setErrors((p) => ({ ...p, title: undefined }));
                            }}
                            className={[
                                "px-3 py-2.5 border rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 transition-all",
                                errors.title
                                    ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100"
                                    : "border-slate-200 focus:border-blue-400 focus:ring-blue-100",
                            ].join(" ")}
                        />
                        {errors.title && (
                            <p className="text-xs font-medium text-red-500">
                                {errors.title}
                            </p>
                        )}
                    </div>

                    {/* Alt Text */}
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="aim-alt"
                            className="text-[12.5px] font-semibold text-slate-700"
                        >
                            Alt Text <span className="text-red-400">*</span>
                        </label>
                        <input
                            id="aim-alt"
                            type="text"
                            placeholder="Describe the image for screen readers"
                            maxLength={150}
                            value={altText}
                            onChange={(e) => {
                                setAltText(e.target.value);
                                setErrors((p) => ({
                                    ...p,
                                    altText: undefined,
                                }));
                            }}
                            className={[
                                "px-3 py-2.5 border rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 transition-all",
                                errors.altText
                                    ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100"
                                    : "border-slate-200 focus:border-blue-400 focus:ring-blue-100",
                            ].join(" ")}
                        />
                        {errors.altText && (
                            <p className="text-xs font-medium text-red-500">
                                {errors.altText}
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="aim-desc"
                            className="text-[12.5px] font-semibold text-slate-700 flex items-center gap-1.5"
                        >
                            Description
                            <span className="text-[11px] font-normal text-slate-400">
                                (optional)
                            </span>
                        </label>
                        <textarea
                            id="aim-desc"
                            placeholder="Additional details about this image…"
                            maxLength={255}
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 resize-y focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all leading-relaxed"
                        />
                        <p className="text-[11px] text-slate-400 text-right">
                            {description.length} / 255
                        </p>
                    </div>
                </div>

                {/* ── Footer ── */}
                <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-100 bg-slate-50/80">
                    <button
                        onClick={onClose}
                        disabled={uploading}
                        className="px-5 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={uploading || success}
                        className={[
                            "flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold min-w-[130px] transition-all",
                            success
                                ? "bg-emerald-500 cursor-default"
                                : uploading
                                  ? "bg-blue-400 cursor-not-allowed"
                                  : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]",
                        ].join(" ")}
                    >
                        {success ? (
                            <>
                                <CheckIcon />
                                <span>Uploaded!</span>
                            </>
                        ) : uploading ? (
                            <>
                                <svg
                                    className="w-4 h-4 animate-spin"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="white"
                                        strokeWidth="3"
                                    />
                                    <path
                                        className="opacity-80"
                                        fill="white"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                    />
                                </svg>
                                <span>Uploading…</span>
                            </>
                        ) : (
                            <span>Upload Image</span>
                        )}
                    </button>
                </div>
            </div>

            <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
        </div>
    );
};

export default AccommodationImageModal;
export type { AccommodationImageModalProps, AccommodationImagePayload };
