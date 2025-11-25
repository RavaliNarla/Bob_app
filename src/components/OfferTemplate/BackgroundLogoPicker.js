import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button, Form, Image } from 'react-bootstrap';
import { useTemplateStore } from '../../store/useTemplateStore';
import { useTranslation } from 'react-i18next';
import '../../css/Editor.css';

export default function BackgroundLogoPicker() {
  const { t } = useTranslation("offerletter");

  const branding = useTemplateStore(s => s.template.branding);
  const setBranding = useTemplateStore(s => s.setBranding);

  const onDrop = useCallback((files) => {
    const file = files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setBranding({ backgroundLogoUrl: reader.result });
    reader.readAsDataURL(file);
  }, [setBranding]);

  const { getRootProps, getInputProps, open } = useDropzone({
    noClick: true,
    multiple: false,
    accept: { 'image/*': [] },
    onDrop
  });

  return (
    <div className="mb-3" {...getRootProps()}>
      <input {...getInputProps()} />

      <div className="d-flex align-items-center justify-content-between mb-2">
        <div>
          <Form.Label>{t("backgroundLogo")}</Form.Label>
          <div className="small text-muted">
            {branding.backgroundLogoUrl ? t("selected") : t("none")}
          </div>
        </div>

        <div className="d-flex gap-2">
          <Button size="sm" variant="secondary" onClick={open}>
            {t("upload")}
          </Button>

          <Button
            size="sm"
            variant="outline-danger"
            onClick={() => setBranding({ backgroundLogoUrl: '' })}
            disabled={!branding.backgroundLogoUrl}
          >
            {t("clear")}
          </Button>
        </div>
      </div>

      {/* URL Input */}
      <Form.Control
        className="mb-2"
        placeholder={t("pasteUrl")}
        value={branding.backgroundLogoUrl}
        onChange={(e) => setBranding({ backgroundLogoUrl: e.target.value })}
      />

      {/* Preview */}
      {branding.backgroundLogoUrl && (
        <div className="mb-2">
          <Image
            src={branding.backgroundLogoUrl}
            alt={t("backgroundPreview")}
            thumbnail
            style={{ maxHeight: 120, objectFit: 'contain' }}
          />
        </div>
      )}

      {/* Size */}
      <div className="small text-muted w-48">
        {t("sizePx")}
        <Form.Range
          min={40}
          max={300}
          value={branding.backgroundLogoSizePx}
          onChange={(e) => setBranding({ backgroundLogoSizePx: Number(e.target.value) })}
        />
      </div>

      {/* Opacity */}
      <div className="small text-muted w-48">
        {t("opacity")}
        <Form.Range
          min={0}
          max={0.2}
          step={0.01}
          value={branding.backgroundLogoOpacity}
          onChange={(e) => setBranding({ backgroundLogoOpacity: Number(e.target.value) })}
        />
      </div>
    </div>
  );
}
