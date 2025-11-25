import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button, Form } from 'react-bootstrap';
import { useTemplateStore } from '../../store/useTemplateStore';
import { useTranslation } from 'react-i18next';
import '../../css/Editor.css';

export default function LogoUploader() {
  const { t } = useTranslation("offerletter");

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
    noClick: true,
    accept: { 'image/*': [] },
    multiple: false,
    onDrop
  });

  return (
    <div {...getRootProps()} className="mb-3">
      <input {...getInputProps()} />

      <div className="d-flex align-items-center justify-content-between">
        <div>
          <Form.Label>{t("logo")}</Form.Label>

          <div className="small text-muted">
            {branding.logoUrl ? t("selected") : t("none")}
          </div>
        </div>

        <Button size="sm" className="change_btn" onClick={open}>
          {t("change")}
        </Button>
      </div>
    </div>
  );
}
