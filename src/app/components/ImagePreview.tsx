import Image from "next/image";
import dynamic from "next/dynamic";
import { X } from "lucide-react";

export const ImagePreview = dynamic(() => Promise.resolve(({ src, onRemove }: { src: string; onRemove: () => void }) => (
    <div className="relative">
        <div className="relative h-40 w-full rounded-lg overflow-hidden border border-gray-200">
            <Image
                src={src}
                alt="Preview"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
            />
        </div>
        <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors z-10"
        >
            <X className="w-4 h-4" />
        </button>
    </div>
)), { ssr: false });