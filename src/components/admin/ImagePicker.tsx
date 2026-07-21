import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiUpload, FiX } from 'react-icons/fi';
import { uploadsApi } from '@/api/uploads';
import { getErrorMessage } from '@/utils/errors';

interface PendingImage {
  file: File;
  previewUrl: string;
}

export function ImagePicker({
  value,
  onChange,
  subfolder,
  multiple = true,
  label = 'Images',
  shape = 'square',
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  subfolder: 'products' | 'categories';
  multiple?: boolean;
  label?: string;
  shape?: 'square' | 'circle';
}) {
  const [pending, setPending] = useState<PendingImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const atCapacity = !multiple && value.length + pending.length >= 1;
  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-lg';

  function handleFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return;
    const selected = multiple ? Array.from(files) : [files[0]];
    const next = selected.map((file) => ({ file, previewUrl: URL.createObjectURL(file) }));
    setPending((p) => (multiple ? [...p, ...next] : next));
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removePending(index: number) {
    setPending((p) => {
      URL.revokeObjectURL(p[index].previewUrl);
      return p.filter((_, i) => i !== index);
    });
  }

  function removeApplied(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  async function applyPending() {
    if (pending.length === 0) return;
    setUploading(true);
    try {
      const uploadedUrls = await uploadsApi.uploadImages(pending.map((p) => p.file), subfolder);
      onChange(multiple ? [...value, ...uploadedUrls] : uploadedUrls);
      pending.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      setPending([]);
      toast.success(`${uploadedUrls.length} image(s) uploaded`);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not upload images'));
    } finally {
      setUploading(false);
    }
  }

  function addUrl() {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    onChange(multiple ? [...value, trimmed] : [trimmed]);
    setUrlInput('');
  }

  return (
    <div>
      <label className="text-sm font-medium text-cream-200/80">{label}</label>
      <p className="mt-0.5 text-xs text-cream-200/40">
        {shape === 'circle'
          ? 'Preview shows the exact circular crop used on the site.'
          : 'Square previews match exactly how the image is cropped on the site.'}
        {multiple && ' The first image is the primary one.'}
      </p>

      <div className="mt-2 flex flex-wrap gap-3">
        {value.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className={`group relative h-24 w-24 overflow-hidden border border-white/10 bg-ink-800 ${shapeClass}`}
          >
            <img src={url} alt="" className="h-full w-full object-cover" />
            {multiple && index === 0 && (
              <span className="absolute left-1 top-1 rounded-full bg-gold-500/90 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-ink-950">
                Primary
              </span>
            )}
            <button
              type="button"
              onClick={() => removeApplied(index)}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink-950/80 text-cream-100 opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Remove image"
            >
              <FiX size={12} />
            </button>
          </div>
        ))}

        {pending.map((p, index) => (
          <div
            key={p.previewUrl}
            className={`group relative h-24 w-24 overflow-hidden border border-dashed border-gold-500/50 bg-ink-800 ${shapeClass}`}
          >
            <img src={p.previewUrl} alt="" className="h-full w-full object-cover opacity-70" />
            <span className="absolute inset-x-0 bottom-0 bg-ink-950/80 px-1 py-0.5 text-center text-[9px] uppercase tracking-wide text-gold-400">
              Pending
            </span>
            <button
              type="button"
              onClick={() => removePending(index)}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink-950/80 text-cream-100 opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Remove pending image"
            >
              <FiX size={12} />
            </button>
          </div>
        ))}

        {!atCapacity && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`flex h-24 w-24 flex-col items-center justify-center gap-1 border border-dashed border-white/20 text-cream-200/50 transition-colors hover:border-gold-500/50 hover:text-gold-400 ${shapeClass}`}
          >
            <FiUpload size={18} />
            <span className="text-[10px] font-medium uppercase tracking-wide">Upload</span>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFilesSelected(e.target.files)}
        />
      </div>

      {pending.length > 0 && (
        <button
          type="button"
          onClick={applyPending}
          disabled={uploading}
          className="mt-3 w-full rounded-lg border border-gold-500/40 bg-gold-500/10 py-2 text-sm font-medium text-gold-400 transition-colors hover:bg-gold-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? 'Uploading…' : `Apply ${pending.length} image${pending.length > 1 ? 's' : ''}`}
        </button>
      )}

      {!atCapacity && (
        <div className="mt-3 flex gap-2">
          <input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addUrl();
              }
            }}
            placeholder="…or paste an image URL"
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-cream-100 placeholder:text-cream-200/30 focus:border-gold-500/60 focus:outline-none"
          />
          <button
            type="button"
            onClick={addUrl}
            className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-xs text-cream-200/70 hover:border-gold-500/40 hover:text-gold-400"
          >
            <FiPlus size={13} /> Add
          </button>
        </div>
      )}
    </div>
  );
}
