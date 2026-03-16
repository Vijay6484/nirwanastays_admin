import { useState, useEffect, useRef } from "react";
import axios from "axios";
// import { toast } from "react-toastify";
import { BASE_URL } from "../../config/config";
import AccommodationImageModal from "./AccommodationImageModal";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PropertyImage {
    imageId: number;
    accommodationId: number;
    category: string;
    file: File;
    imgUrl: string;
    accommCategory: string;
    imgTitle: string;
    imgAltText: string;
    imgDescription: string | null;
    imgPosition: number;
}

interface PositionUpdate {
    imageId: number;
    imgPosition: number;
}

interface Toast {
    msg: string;
    type: "success" | "error";
}

interface PropertyImagesProps {
    accommodationId: number;
}

// ─── API ─────────────────────────────────────────────────────────────────────

const fetchImages = async (
    accommodationId: number,
): Promise<PropertyImage[]> => {
    const response = await fetch(
        `${BASE_URL}/admin/properties/accommodations/${accommodationId}/images`,
    );
    if (!response.ok) throw new Error("Failed to fetch images");
    const json = await response.json();
    return json.data as PropertyImage[];
};

const updateImagePositions = async (
    positions: PositionUpdate[],
): Promise<void> => {
    console.log(positions);
    const response = await fetch(
        `${BASE_URL}/admin/properties/accommodations/images-position-reorder`,
        {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(positions),
        },
    );
    if (!response.ok) throw new Error("Failed to update positions");
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function PropertyImages({
    accommodationId,
}: PropertyImagesProps) {
    const [images, setImages] = useState<PropertyImage[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [dragId, setDragId] = useState<number | null>(null);
    const [overId, setOverId] = useState<number | null>(null);
    const [toast, setToast] = useState<Toast | null>(null);
    const [openUploadImageModal, setOpenUploadImageModal] = useState(false);

    const dragIdRef = useRef<number | null>(null);
    const overIdRef = useRef<number | null>(null);
    const imagesRef = useRef<PropertyImage[]>(images);

    // Sync refs with state
    useEffect(() => {
        dragIdRef.current = dragId;
    }, [dragId]);

    useEffect(() => {
        overIdRef.current = overId;
    }, [overId]);

    useEffect(() => {
        imagesRef.current = images;
    }, [images]);

    // ─── Touch drag handlers ──────────────────────────────────────────────

    const onTouchStart = (e: React.TouchEvent<HTMLDivElement>, id: number) => {
        e.preventDefault(); // Prevent page scroll
        setDragId(id);
        setOverId(null);
    };

    // This effect sets up global touchmove/touchend listeners when a drag is active
    useEffect(() => {
        if (dragId === null) return; // No active drag

        const onTouchMove = (e: TouchEvent) => {
            e.preventDefault(); // Stop scrolling while dragging
            const touch = e.touches[0];
            if (!touch) return;

            // Find the draggable element under the finger
            const element = document.elementFromPoint(
                touch.clientX,
                touch.clientY,
            );
            const draggableItem = element?.closest('[data-draggable="true"]');
            if (draggableItem) {
                const idAttr = draggableItem.getAttribute("data-image-id");
                if (idAttr) {
                    const id = Number(idAttr);
                    setOverId(id !== dragIdRef.current ? id : null);
                } else {
                    setOverId(null);
                }
            } else {
                setOverId(null);
            }
        };

        const onTouchEnd = (e: TouchEvent) => {
            e.preventDefault();
            const fromId = dragIdRef.current;
            const toId = overIdRef.current;

            if (fromId !== null && toId !== null && fromId !== toId) {
                // Perform reorder using the current images array
                const reordered = [...imagesRef.current];
                const fromIdx = reordered.findIndex(
                    (i) => i.imageId === fromId,
                );
                const toIdx = reordered.findIndex((i) => i.imageId === toId);
                if (fromIdx !== -1 && toIdx !== -1) {
                    const [moved] = reordered.splice(fromIdx, 1);
                    reordered.splice(toIdx, 0, moved);
                    const updated = reordered.map((img, idx) => ({
                        ...img,
                        imgPosition: idx + 1,
                    }));
                    setImages(updated);

                    // Send updated positions to the API
                    (async () => {
                        try {
                            setLoading(true);
                            const payload: PositionUpdate[] = updated.map(
                                ({ imageId, imgPosition }) => ({
                                    imageId,
                                    imgPosition,
                                }),
                            );
                            await updateImagePositions(payload);
                            showToast("✓ Image order saved");
                        } catch {
                            showToast("⚠ Failed to save order", "error");
                        } finally {
                            setLoading(false);
                        }
                    })();
                }
            }

            // End drag session
            setDragId(null);
            setOverId(null);
        };

        // Attach global listeners
        window.addEventListener("touchmove", onTouchMove, { passive: false });
        window.addEventListener("touchend", onTouchEnd);
        window.addEventListener("touchcancel", onTouchEnd);

        // Cleanup when drag ends (dragId becomes null) or component unmounts
        return () => {
            window.removeEventListener("touchmove", onTouchMove);
            window.removeEventListener("touchend", onTouchEnd);
            window.removeEventListener("touchcancel", onTouchEnd);
        };
    }, [dragId]); // Only re‑run when dragId changes

    // ── Fetch on mount ──

    const loadImages = async () => {
        try {
            setLoading(true);
            const data = await fetchImages(accommodationId);
            setImages(data.sort((a, b) => a.imgPosition - b.imgPosition));
        } catch {
            showToast("Failed to load images", "error");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadImages();
    }, [accommodationId]);

    const showToast = (msg: string, type: Toast["type"] = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 2200);
    };

    // ─── Drag & Drop ─────────────────────────────────────────────────────────────

    const handleDragStart = (
        e: React.DragEvent<HTMLDivElement>,
        id: number,
    ): void => {
        setDragId(id);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (
        e: React.DragEvent<HTMLDivElement>,
        id: number,
    ): void => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setOverId(id);
    };

    const handleDrop = async (
        e: React.DragEvent<HTMLDivElement>,
        targetId: number,
    ): Promise<void> => {
        e.preventDefault();
        if (dragId === null || dragId === targetId) {
            setDragId(null);
            setOverId(null);
            return;
        }

        const reordered = [...images];
        const fromIdx = reordered.findIndex((i) => i.imageId === dragId);
        const toIdx = reordered.findIndex((i) => i.imageId === targetId);
        const [moved] = reordered.splice(fromIdx, 1);
        reordered.splice(toIdx, 0, moved);

        const updated: PropertyImage[] = reordered.map((img, idx) => ({
            ...img,
            imgPosition: idx + 1,
        }));

        setImages(updated);
        setDragId(null);
        setOverId(null);

        try {
            setLoading(true);
            const payload: PositionUpdate[] = updated.map(
                ({ imageId, imgPosition }) => ({
                    imageId,
                    imgPosition,
                }),
            );
            await updateImagePositions(payload);
            showToast("✓ Image order saved");
        } catch {
            showToast("⚠ Failed to save order", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDragEnd = (): void => {
        setDragId(null);
        setOverId(null);
    };

    // ─── Delete ──────────────────────────────────────────────────────────────────

    const handleDelete = async (id: number): void => {
        await axios.delete(
            `${BASE_URL}/admin/properties/accommodations/delete-image/${id}`,
        );
        setImages((prev) =>
            prev
                .filter((i) => i.imageId !== id)
                .map((img, idx) => ({ ...img, imgPosition: idx + 1 })),
        );
    };

    // ─── Upload ──────────────────────────────────────────────────────────────────

    const handleUploadImage = async (uploadImageData: PropertyImage) => {
        // console.log(uploadImageData);
        const imgURL = await getImageUrl(uploadImageData.file);
        if (!imgURL) return;
        const submitData = {
            accommodationId: uploadImageData.accommodationId,
            category: uploadImageData.category,
            imgUrl: imgURL,
            imgAltText: uploadImageData.imgAltText,
            imgDescription: uploadImageData.imgDescription,
            imgPosition: uploadImageData.imgPosition,
            imgTitle: uploadImageData.imgTitle,
        };
        console.log(submitData);
        const response = await axios.post(
            `${BASE_URL}/admin/properties/accommodations/upload-image`,
            submitData,
        );
        if (response.data.success) {
            showToast("Image uploaded successfully!!!");
            loadImages();
        } else {
            showToast(
                response.data.message || "Failed to upload image.",
                "error",
            );
        }
    };

    const getImageUrl = async (file) => {
        if (file.length === 0) return;

        const formDataFile = new FormData();
        formDataFile.append("image", file);
        const res = await axios.post(
            "https://plumeriaretreat.com/upload.php",
            formDataFile,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            },
        );
        if (res.data.success) {
            return res.data.url;
        }
    };

    const handleEditImage = (imageId) => {
        console.log("edit image with id:", imageId);
    };

    // ─── Render ──────────────────────────────────────────────────────────────────

    return (
        <div className="max-w-5xl mx-auto px-6 py-8 font-sans">
            {/* Header */}
            <div className="mb-7">
                <h2 className="text-2xl font-semibold text-zinc-900 tracking-tight">
                    Property Images
                </h2>
                <div className="mt-2 h-px bg-gradient-to-r from-zinc-800 via-zinc-300 to-transparent" />
            </div>

            {/* Upload */}
            <div className="mb-7">
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">
                    Upload Images
                </p>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setOpenUploadImageModal(true)}
                        className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 0L8 8m4-4l4 4"
                            />
                        </svg>
                        Upload Images
                    </button>
                </div>
            </div>

            {openUploadImageModal && (
                <AccommodationImageModal
                    accommodationId={accommodationId}
                    onClose={() => setOpenUploadImageModal(false)}
                    onSuccess={(payload) => {
                        // console.log("Uploaded:", payload);
                        handleUploadImage(payload);
                        setOpenUploadImageModal(false);
                    }}
                />
            )}

            {/* Grid */}
            {images.length === 0 && !loading ? (
                <div className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed border-zinc-200 text-zinc-400">
                    <svg
                        className="w-12 h-12 mb-3 opacity-40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.2}
                        viewBox="0 0 24 24"
                    >
                        <rect
                            x="3"
                            y="3"
                            width="18"
                            height="18"
                            rx="3"
                        />
                        <circle
                            cx="8.5"
                            cy="8.5"
                            r="1.5"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 15l-5-5L5 21"
                        />
                    </svg>
                    <p className="font-medium text-sm">No images yet</p>
                    <p className="text-xs mt-1">
                        Click "Upload Images" to get started
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((img) => {
                        const isDragging = dragId === img.imageId;
                        const isOver =
                            overId === img.imageId && dragId !== img.imageId;

                        return (
                            <div
                                key={img.imageId}
                                draggable // keep for mouse users
                                onDragStart={(e) =>
                                    handleDragStart(e, img.imageId)
                                }
                                onDragOver={(e) =>
                                    handleDragOver(e, img.imageId)
                                }
                                onDrop={(e) => handleDrop(e, img.imageId)}
                                onDragEnd={handleDragEnd}
                                onTouchStart={(e) =>
                                    onTouchStart(e, img.imageId)
                                } // new
                                data-draggable="true" // new
                                data-image-id={img.imageId} // new
                                className={[
                                    "relative rounded-xl overflow-hidden bg-white shadow-sm cursor-grab active:cursor-grabbing transition-all duration-150 group",
                                    isDragging
                                        ? "opacity-30 scale-95"
                                        : "hover:-translate-y-1 hover:shadow-lg",
                                    isOver
                                        ? "ring-2 ring-indigo-500 ring-offset-2 bg-indigo-50"
                                        : "",
                                ].join(" ")}
                                style={{ touchAction: "none" }} // optional, reinforces prevention of scroll
                            >
                                {/* Image */}
                                <div className="relative h-36 overflow-hidden">
                                    <img
                                        src={img.imgUrl}
                                        alt={img.imgAltText}
                                        className="w-full h-full object-cover pointer-events-none"
                                        onError={(
                                            e: React.SyntheticEvent<HTMLImageElement>,
                                        ) => {
                                            e.currentTarget.src = `https://placehold.co/400x280/e4e4e7/71717a?text=Image+${img.imgPosition}`;
                                        }}
                                    />

                                    {/* Drag handle */}
                                    <div className="absolute top-2 left-2 w-7 h-7 rounded-md bg-black/50 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity select-none">
                                        ⠿
                                    </div>

                                    {/* Delete */}
                                    <button
                                        onClick={() =>
                                            handleDelete(img.imageId)
                                        }
                                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white border-2 border-white flex items-center justify-center text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 hover:bg-red-600"
                                        aria-label={`Remove ${img.imgTitle}`}
                                    >
                                        ×
                                    </button>

                                    {/* Position badge */}
                                    <div className="absolute bottom-2 left-2">
                                        <span className="text-[10px] font-semibold uppercase tracking-wider bg-black/60 text-white px-2 py-0.5 rounded">
                                            #{img.imgPosition}
                                        </span>
                                    </div>
                                </div>

                                {/* Caption */}
                                {/* <div className="px-3 py-2.5">
                                    <p className="text-xs font-semibold text-zinc-800 truncate">
                                        {img.imgTitle}
                                    </p>
                                    <p className="text-[10px] text-zinc-400 mt-0.5">
                                        {img.accommCategory}
                                    </p>
                                </div> */}
                                <div className="px-3 py-2.5 flex items-start justify-between">
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-zinc-800 truncate">
                                            {img.imgTitle}
                                        </p>
                                        <p className="text-[10px] text-zinc-400 mt-0.5">
                                            {img.accommCategory}
                                        </p>
                                    </div>

                                    <button
                                        className="ml-2  text-zinc-500 hover:text-zinc-700"
                                        onClick={() =>
                                            handleEditImage(img.imageId)
                                        }
                                    >
                                        ✏️
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div
                    className={[
                        "fixed bottom-6 right-6 px-5 py-3 rounded-xl text-sm font-medium shadow-xl z-50",
                        toast.type === "error"
                            ? "bg-red-600 text-white"
                            : "bg-zinc-900 text-white",
                    ].join(" ")}
                >
                    {toast.msg}
                </div>
            )}
        </div>
    );
}
