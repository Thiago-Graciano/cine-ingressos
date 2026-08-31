import { useEffect, useRef, useState } from 'react'

type CameraScannerProps = { onCode: (code: string) => void }

export function CameraScanner({ onCode }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [aviso, setAviso] = useState('Câmera desativada')
  const [ativo, setAtivo] = useState(false)

  useEffect(() => {
    let stream: MediaStream | undefined
    let timer: number | undefined
    let mounted = true
    async function iniciar() {
      const Detector = (window as unknown as { BarcodeDetector?: new () => { detect(video: HTMLVideoElement): Promise<Array<{ rawValue: string }>> } }).BarcodeDetector
      if (!Detector) return setAviso('Leitura automática indisponível neste navegador.')
      try { stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }); if (!mounted || !videoRef.current) return; videoRef.current.srcObject = stream; await videoRef.current.play(); setAtivo(true); const detector = new Detector(); timer = window.setInterval(async () => { if (!videoRef.current) return; const codes = await detector.detect(videoRef.current); if (codes[0]?.rawValue) onCode(codes[0].rawValue) }, 700) } catch { setAviso('Permita o acesso à câmera ou use a digitação manual.') }
    }
    void iniciar()
    return () => { mounted = false; if (timer) window.clearInterval(timer); stream?.getTracks().forEach((track) => track.stop()) }
  }, [onCode])

  return <div className="mt-5 overflow-hidden rounded-xl border border-dashed border-zinc-700 bg-zinc-950"><video className="max-h-56 w-full object-cover" ref={videoRef} muted playsInline /><span className="block px-3 py-2 text-center text-xs text-zinc-400">{ativo ? 'Aponte para o QR Code' : aviso}</span></div>
}
