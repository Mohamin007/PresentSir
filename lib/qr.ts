import QRCode from 'qrcode'

export async function generateQR(data: string): Promise<string> {
  return await QRCode.toDataURL(data)
}
