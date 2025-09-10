import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from 'react-bootstrap';
import { useTemplateStore } from '../../store/useTemplateStore';

export default function LogoUploader() {
  const branding = useTemplateStore(s => s.template.branding);
  const setBranding = useTemplateStore(s => s.setBranding);

  const onDrop = useCallback((files) => {
    const file = files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setBranding({ logoUrl: reader.result });
    reader.readAsDataURL(file);
  }, [setBranding]);

  const { getRootProps, getInputProps, open } = useDropzone({
    noClick: true, accept: { 'image/*': [] }, multiple: false, onDrop
  });

  return (
    <div {...getRootProps()} className="mb-3">
      <input {...getInputProps()} />
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <strong>Logo</strong>
          <div className="small text-muted">{branding.logoUrl ? 'Selected' : 'None'}</div>
        </div>
        <Button size="sm" onClick={open}>Change</Button>
      </div>
    </div>
  );
}