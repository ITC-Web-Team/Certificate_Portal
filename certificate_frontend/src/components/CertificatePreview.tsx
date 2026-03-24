interface Props {
  src: string;
  alt?: string;
}

export default function CertificatePreview({ src, alt = "Certificate Preview" }: Props) {
  if (!src) return null;

  return (
    <div className="w-full max-w-[800px] mx-auto">
      <img
        src={src}
        alt={alt}
        className="w-full h-auto rounded-lg border border-[#E4E7EC]"
      />
    </div>
  );
}
