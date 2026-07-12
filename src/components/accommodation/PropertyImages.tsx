import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { BASE_URL } from "../../config/config";
import { uploadImageFile } from "../../utils/uploadMedia";
import AccommodationImageModal from "./AccommodationImageModal";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── API ──────────────────────────────────────────────────────────────────────

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

// ─── Floating clone helper ────────────────────────────────────────────────────

/**
 * Creates a visual clone that follows the user's finger during a touch drag.
 * Returns a cleanup function that removes the clone.
 */
function createDragClone(
    sourceEl: HTMLElement,
    startX: number,
    startY: number,
): {
    move: (x: number, y: number) => void;
    destroy: () => void;
} {
    const rect = sourceEl.getBoundingClientRect();
    const clone = sourceEl.cloneNode(true) as HTMLElement;

    const offsetX = startX - rect.left;
    const offsetY = startY - rect.top;

    Object.assign(clone.style, {
        position: "fixed",
        left: `${startX - offsetX}px`,
        top: `${startY - offsetY}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        opacity: "0.85",
        pointerEvents: "none",
        zIndex: "9999",
        transform: "scale(1.05) rotate(1.5deg)",
        transformOrigin: `${offsetX}px ${offsetY}px`,
        boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        borderRadius: "12px",
        transition: "none",
    });

    document.body.appendChild(clone);

    return {
        move(x: number, y: number) {
            clone.style.left = `${x - offsetX}px`;
            clone.style.top = `${y - offsetY}px`;
        },
        destroy() {
            clone.remove();
        },
    };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PropertyImages({
    accommodationId,
}: PropertyImagesProps) {
    const [images, setImages] = useState<PropertyImage[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [dragId, setDragId] = useState<number | null>(null);
    const [overId, setOverId] = useState<number | null>(null);
    const [toast, setToast] = useState<Toast | null>(null);
    const [openUploadImageModal, setOpenUploadImageModal] = useState(false);

    // Stable refs — avoids stale closures inside touch event listeners
    const dragIdRef = useRef<number | null>(null);
    const overIdRef = useRef<number | null>(null);
    const imagesRef = useRef<PropertyImage[]>(images);
    const cloneRef = useRef<ReturnType<typeof createDragClone> | null>(null);

    useEffect(() => {
        dragIdRef.current = dragId;
    }, [dragId]);
    useEffect(() => {
        overIdRef.current = overId;
    }, [overId]);
    useEffect(() => {
        imagesRef.current = images;
    }, [images]);

    // ─── Utilities ───────────────────────────────────────────────────────────

    const showToast = useCallback(
        (msg: string, type: Toast["type"] = "success") => {
            setToast({ msg, type });
            setTimeout(() => setToast(null), 2200);
        },
        [],
    );

    const persistOrder = useCallback(
        async (updated: PropertyImage[]) => {
            try {
                setLoading(true);
                const payload: PositionUpdate[] = updated.map(
                    ({ imageId, imgPosition }) => ({ imageId, imgPosition }),
                );
                await updateImagePositions(payload);
                showToast("✓ Image order saved");
            } catch {
                showToast("⚠ Failed to save order", "error");
            } finally {
                setLoading(false);
            }
        },
        [showToast],
    );

    const reorder = useCallback(
        (fromId: number, toId: number): PropertyImage[] => {
            const list = [...imagesRef.current];
            const fromIdx = list.findIndex((i) => i.imageId === fromId);
            const toIdx = list.findIndex((i) => i.imageId === toId);
            if (fromIdx === -1 || toIdx === -1) return list;
            const [moved] = list.splice(fromIdx, 1);
            list.splice(toIdx, 0, moved);
            return list.map((img, idx) => ({ ...img, imgPosition: idx + 1 }));
        },
        [],
    );

    // ─── Data loading ─────────────────────────────────────────────────────────

    const loadImages = useCallback(async () => {
        try {
            setLoading(true);
            const data = await fetchImages(accommodationId);
            setImages(data.sort((a, b) => a.imgPosition - b.imgPosition));
        } catch {
            showToast("Failed to load images", "error");
        } finally {
            setLoading(false);
        }
    }, [accommodationId, showToast]);

    useEffect(() => {
        loadImages();
    }, [loadImages]);

    // ─── Mouse / Desktop drag handlers ───────────────────────────────────────

    const handleDragStart = (
        e: React.DragEvent<HTMLDivElement>,
        id: number,
    ) => {
        setDragId(id);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, id: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (id !== dragIdRef.current) setOverId(id);
    };

    const handleDrop = async (
        e: React.DragEvent<HTMLDivElement>,
        targetId: number,
    ) => {
        e.preventDefault();
        const fromId = dragIdRef.current;
        setDragId(null);
        setOverId(null);
        if (fromId === null || fromId === targetId) return;
        const updated = reorder(fromId, targetId);
        setImages(updated);
        await persistOrder(updated);
    };

    const handleDragEnd = () => {
        setDragId(null);
        setOverId(null);
    };

    // ─── Touch drag handlers ──────────────────────────────────────────────────
    //
    //  Key fixes vs. the original implementation:
    //
    //  1. GHOST BLOCKING HIT-TEST: The dragged card was intercepting
    //     elementFromPoint. We temporarily hide it (visibility:hidden) during
    //     the move so the element underneath is found correctly, then restore it.
    //
    //  2. FLOATING CLONE: A visual clone now follows the finger so the user has
    //     clear feedback about what they're dragging.
    //
    //  3. iOS SAFE AREA / SCROLL: touchAction:"none" was already on each card,
    //     but we also need it on the scroll container to prevent the page from
    //     hijacking the gesture mid-drag.
    //
    //  4. TOUCHCANCEL: Now calls the same cleanup path as touchend.

    const onTouchStart = useCallback(
        (e: React.TouchEvent<HTMLDivElement>, id: number) => {
            // Only respond to single-finger touches to allow normal scrolling
            // outside of cards
            if (e.touches.length !== 1) return;
            e.preventDefault();

            const touch = e.touches[0];
            const target = e.currentTarget as HTMLElement;

            // Build the floating clone
            cloneRef.current = createDragClone(
                target,
                touch.clientX,
                touch.clientY,
            );

            // Mark the original as "invisible" so elementFromPoint can see through it
            target.style.visibility = "hidden";

            setDragId(id);
            setOverId(null);
        },
        [],
    );

    // Global touch listeners — registered only while a drag is active
    useEffect(() => {
        if (dragId === null) return;

        const draggedEl = document.querySelector<HTMLElement>(
            `[data-image-id="${dragId}"]`,
        );

        const onTouchMove = (e: TouchEvent) => {
            e.preventDefault();
            const touch = e.touches[0];
            if (!touch) return;

            // Move the clone
            cloneRef.current?.move(touch.clientX, touch.clientY);

            // The dragged card is visibility:hidden — elementFromPoint now sees
            // the card beneath the finger correctly
            const element = document.elementFromPoint(
                touch.clientX,
                touch.clientY,
            );
            const draggableItem = element?.closest<HTMLElement>(
                '[data-draggable="true"]',
            );
            const idAttr = draggableItem?.getAttribute("data-image-id");
            const hoverId = idAttr ? Number(idAttr) : null;
            setOverId(hoverId !== dragIdRef.current ? hoverId : null);
        };

        const finalizeDrag = (e: TouchEvent) => {
            e.preventDefault();

            // Destroy clone
            cloneRef.current?.destroy();
            cloneRef.current = null;

            // Restore the original card's visibility
            if (draggedEl) draggedEl.style.visibility = "";

            const fromId = dragIdRef.current;
            const toId = overIdRef.current;

            setDragId(null);
            setOverId(null);

            if (fromId !== null && toId !== null && fromId !== toId) {
                const updated = reorder(fromId, toId);
                setImages(updated);
                persistOrder(updated);
            }
        };

        window.addEventListener("touchmove", onTouchMove, { passive: false });
        window.addEventListener("touchend", finalizeDrag, { passive: false });
        window.addEventListener("touchcancel", finalizeDrag, {
            passive: false,
        });

        return () => {
            window.removeEventListener("touchmove", onTouchMove);
            window.removeEventListener("touchend", finalizeDrag);
            window.removeEventListener("touchcancel", finalizeDrag);
        };
    }, [dragId, reorder, persistOrder]);

    // ─── Delete ───────────────────────────────────────────────────────────────

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(
                `${BASE_URL}/admin/properties/accommodations/delete-image/${id}`,
            );
            setImages((prev) =>
                prev
                    .filter((i) => i.imageId !== id)
                    .map((img, idx) => ({ ...img, imgPosition: idx + 1 })),
            );
            showToast("✓ Image deleted");
        } catch {
            showToast("⚠ Failed to delete image", "error");
        }
    };

    // ─── Upload ───────────────────────────────────────────────────────────────

    const handleUploadImage = async (uploadImageData: PropertyImage) => {
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
        const response = await axios.post(
            `${BASE_URL}/admin/properties/accommodations/upload-image`,
            submitData,
        );
        if (response.data.success) {
            showToast("Image uploaded successfully!!!");
            loadImages();
            setOpenUploadImageModal(false);
        } else {
            showToast(
                response.data.message || "Failed to upload image.",
                "error",
            );
        }
    };

    const getImageUrl = async (file: File): Promise<string | undefined> => {
        if (!file) return;
        try {
            const result = await uploadImageFile(file, "accommodations");
            return result.url;
        } catch (error) {
            console.error("Image upload error:", error);
            showToast("Failed to upload image", "error");
        }
    };

    const handleEditImage = (imageId: number) => {
        console.log("edit image with id:", imageId);
    };

    // ─── Render ───────────────────────────────────────────────────────────────

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
                        type="button"
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
                        handleUploadImage(payload);
                        // setOpenUploadImageModal(false);
                    }}
                />
            )}

            {/* Grid
                touchAction:"none" on the container prevents the browser from
                claiming the touch gesture for page scrolling when a drag starts
                inside the grid. */}
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
                <div
                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
                    style={{ touchAction: "none" }}
                >
                    {images.map((img) => {
                        const isDragging = dragId === img.imageId;
                        const isOver =
                            overId === img.imageId && dragId !== img.imageId;

                        return (
                            <div
                                key={img.imageId}
                                draggable
                                data-draggable="true"
                                data-image-id={img.imageId}
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
                                }
                                className={[
                                    "relative rounded-xl overflow-hidden bg-white shadow-sm cursor-grab active:cursor-grabbing transition-all duration-150 group select-none",
                                    isDragging
                                        ? "opacity-30 scale-95"
                                        : "hover:-translate-y-1 hover:shadow-lg",
                                    isOver
                                        ? "ring-2 ring-indigo-500 ring-offset-2 bg-indigo-50"
                                        : "",
                                ].join(" ")}
                                style={{ touchAction: "none" }}
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
                                        draggable={false}
                                    />

                                    {/* Drag handle — always visible on mobile (no hover) */}
                                    <div className="absolute top-2 left-2 w-7 h-7 rounded-md bg-black/50 text-white flex items-center justify-center text-xs opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity select-none pointer-events-none">
                                        ⠿
                                    </div>

                                    {/* Delete — always visible on mobile */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(img.imageId);
                                        }}
                                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white border-2 border-white flex items-center justify-center text-sm font-bold opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:scale-110 hover:bg-red-600"
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
                                        className="ml-2 text-zinc-500 hover:text-zinc-700"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditImage(img.imageId);
                                        }}
                                    >
                                        ✏️
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Loading overlay */}
            {loading && (
                <div className="fixed inset-0 bg-black/10 z-40 flex items-center justify-center pointer-events-none">
                    <div className="bg-white rounded-xl px-5 py-3 shadow-lg text-sm text-zinc-600 font-medium flex items-center gap-2">
                        <svg
                            className="w-4 h-4 animate-spin text-blue-600"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeDasharray="32"
                                strokeDashoffset="12"
                            />
                        </svg>
                        Saving…
                    </div>
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
