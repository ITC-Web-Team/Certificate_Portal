interface Props {
  src: string;
  alt?: string;
}

export default function CertificatePreview({ src, alt = "Certificate Preview" }: Props) {
  if (!src) return null;

  return (
    <div className="mx-auto w-full max-w-[900px] rounded-xl border border-border/70 bg-card p-2 shadow-sm">
      <img
        src={src}
        alt={alt}
        className="h-auto w-full rounded-lg"
      />
    </div>
  );
}
