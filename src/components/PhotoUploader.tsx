import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

export function useSignedPhotoUrls() {
  return async (paths: string[]) => {
    if (!paths.length) return [] as string[];
    const { data } = await supabase.storage.from("booking-photos").createSignedUrls(paths, 3600);
    return (data ?? []).map((d) => d.signedUrl);
  };
}

export default function PhotoUploader({
  value,
  onChange,
  folder,
}: {
  value: string[];
  onChange: (paths: string[]) => void;
  folder: string;
}) {
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files).slice(0, 5)) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${folder}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("booking-photos").upload(path, file);
        if (error) throw error;
        uploaded.push(path);
      }
      onChange([...value, ...uploaded]);
      toast.success(`${uploaded.length} photo(s) uploaded`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-input px-4 py-6 text-sm font-medium text-muted-foreground transition-colors hover:border-secondary hover:text-secondary">
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
        {uploading ? "Uploading..." : "Add condition photos"}
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          disabled={uploading}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {value.map((p) => (
            <li key={p} className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-xs">
              <span className="max-w-[160px] truncate">{p.split("/").pop()}</span>
              <button type="button" onClick={() => onChange(value.filter((x) => x !== p))} aria-label="Remove photo">
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function PhotoGallery({ paths }: { paths: string[] }) {
  const [urls, setUrls] = useState<string[] | null>(null);
  const sign = useSignedPhotoUrls();

  if (!paths.length) return null;

  if (!urls) {
    return (
      <Button variant="soft" size="sm" onClick={() => sign(paths).then(setUrls)}>
        View {paths.length} photo(s)
      </Button>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {urls.map((u) => (
        <a key={u} href={u} target="_blank" rel="noreferrer">
          <img src={u} alt="Vehicle condition" loading="lazy" className="h-24 w-full rounded-lg object-cover" />
        </a>
      ))}
    </div>
  );
}
