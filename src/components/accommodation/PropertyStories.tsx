import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { BASE_URL } from "../../config/config";
import { uploadMediaFile, resolveMediaUrl } from "../../utils/uploadMedia";
import { Film, Loader2, Plus, Trash2, GripVertical } from "lucide-react";
import { toast } from "react-toastify";

export interface PropertyStory {
    id: number;
    accommodation_id: number;
    media_url: string;
    media_type: "image" | "gif" | "video";
    thumbnail_url?: string | null;
    title?: string | null;
    position: number;
}

interface PropertyStoriesProps {
    accommodationId: number;
}

export default function PropertyStories({
    accommodationId,
}: PropertyStoriesProps) {
    const [stories, setStories] = useState<PropertyStory[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchStories = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${BASE_URL}/admin/properties/accommodations/${accommodationId}/stories`,
            );
            if (response.data?.success) {
                setStories(response.data.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch stories:", error);
            toast.error("Failed to load stories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStories();
    }, [accommodationId]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files?.length) return;

        setUploading(true);
        try {
            for (const file of Array.from(files)) {
                const result = await uploadMediaFile(file, "stories");
                await axios.post(
                    `${BASE_URL}/admin/properties/accommodations/${accommodationId}/stories`,
                    {
                        mediaUrl: result.url,
                        title: file.name.replace(/\.[^/.]+$/, ""),
                    },
                );
            }
            toast.success("Story uploaded successfully");
            await fetchStories();
        } catch (error) {
            console.error("Story upload failed:", error);
            toast.error("Failed to upload story");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDelete = async (storyId: number) => {
        if (!window.confirm("Delete this story?")) return;

        try {
            await axios.delete(
                `${BASE_URL}/admin/properties/accommodations/stories/${storyId}`,
            );
            setStories((prev) => prev.filter((s) => s.id !== storyId));
            toast.success("Story deleted");
        } catch (error) {
            console.error("Failed to delete story:", error);
            toast.error("Failed to delete story");
        }
    };

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Film className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-medium text-gray-900">
                                Property Stories
                            </h2>
                            <p className="text-sm text-gray-500">
                                Upload GIFs or short videos shown on the booking
                                page (Instagram-style stories).
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm font-medium"
                    >
                        {uploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Plus className="w-4 h-4" />
                        )}
                        Add Story
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/gif,video/mp4,video/webm,video/quicktime,image/jpeg,image/png,image/webp"
                        multiple
                        className="hidden"
                        onChange={handleUpload}
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                    </div>
                ) : stories.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center">
                        <Film className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">
                            No stories yet. Upload GIFs or videos to showcase
                            this property on the booking page.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {stories.map((story) => {
                            const mediaUrl = resolveMediaUrl(story.media_url);
                            const isVideo =
                                story.media_type === "video" ||
                                /\.(mp4|webm|mov)$/i.test(mediaUrl);

                            return (
                                <div
                                    key={story.id}
                                    className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50"
                                >
                                    <div className="aspect-[9/16] relative">
                                        {isVideo ? (
                                            <video
                                                src={mediaUrl}
                                                className="w-full h-full object-cover"
                                                muted
                                                playsInline
                                                preload="metadata"
                                            />
                                        ) : (
                                            <img
                                                src={mediaUrl}
                                                alt={story.title || "Story"}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <GripVertical className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(story.id)}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                    {story.title && (
                                        <p className="px-2 py-1.5 text-xs text-gray-600 truncate">
                                            {story.title}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
