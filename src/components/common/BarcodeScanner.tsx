import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
  open: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
}

export function BarcodeScanner({ open, onClose, onScan }: Props) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    const reader = new BrowserMultiFormatReader();

    (async () => {
      try {
        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        if (!devices.length) { setError('No camera detected'); return; }
        const deviceId = devices.find(d => /back|rear|environment/i.test(d.label))?.deviceId || devices[0].deviceId;
        if (!videoRef.current) return;
        const controls = await reader.decodeFromVideoDevice(deviceId, videoRef.current, (result) => {
          if (result) {
            const text = result.getText();
            if (text) {
              onScan(text);
              controls.stop();
              onClose();
            }
          }
        });
        controlsRef.current = controls;
      } catch (e: any) {
        setError(e?.message || 'Camera access denied');
      }
    })();

    return () => { try { controlsRef.current?.stop(); } catch {} };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Camera className="h-5 w-5" /> {t('inventory.scanBarcode')}</DialogTitle>
        </DialogHeader>
        {error ? (
          <div className="text-sm text-destructive p-4 text-center">{error}</div>
        ) : (
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
            <div className="absolute inset-0 pointer-events-none border-2 border-primary/60 m-8 rounded" />
          </div>
        )}
        <Button variant="outline" onClick={onClose}><X className="h-4 w-4 mr-2" />{t('common.close')}</Button>
      </DialogContent>
    </Dialog>
  );
}
