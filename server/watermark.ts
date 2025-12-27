import sharp from 'sharp';
import * as db from './db';

export interface WatermarkOptions {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity?: number;
  scale?: number;
}

/**
 * Apply watermark to an image buffer
 * @param imageBuffer - Original image buffer
 * @param watermarkUrl - URL of the watermark image
 * @param options - Watermark positioning and styling options
 * @returns Buffer of the watermarked image
 */
export async function applyWatermark(
  imageBuffer: Buffer,
  watermarkUrl: string,
  options: WatermarkOptions = {}
): Promise<Buffer> {
  const {
    position = 'bottom-right',
    opacity = 0.7,
    scale = 0.15,
  } = options;

  // Fetch watermark image
  const watermarkResponse = await fetch(watermarkUrl);
  if (!watermarkResponse.ok) {
    throw new Error(`Failed to fetch watermark: ${watermarkResponse.statusText}`);
  }
  const watermarkBuffer = Buffer.from(await watermarkResponse.arrayBuffer());

  // Get original image metadata
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();
  const imageWidth = metadata.width || 1000;
  const imageHeight = metadata.height || 1000;

  // Resize watermark based on scale
  const watermarkWidth = Math.floor(imageWidth * scale);
  const watermark = await sharp(watermarkBuffer)
    .resize(watermarkWidth)
    .toBuffer();

  // Get watermark dimensions after resize
  const watermarkMetadata = await sharp(watermark).metadata();
  const wmWidth = watermarkMetadata.width || 0;
  const wmHeight = watermarkMetadata.height || 0;

  // Calculate position
  const padding = Math.floor(imageWidth * 0.03); // 3% padding
  let left = 0;
  let top = 0;

  switch (position) {
    case 'top-left':
      left = padding;
      top = padding;
      break;
    case 'top-right':
      left = imageWidth - wmWidth - padding;
      top = padding;
      break;
    case 'bottom-left':
      left = padding;
      top = imageHeight - wmHeight - padding;
      break;
    case 'bottom-right':
      left = imageWidth - wmWidth - padding;
      top = imageHeight - wmHeight - padding;
      break;
    case 'center':
      left = Math.floor((imageWidth - wmWidth) / 2);
      top = Math.floor((imageHeight - wmHeight) / 2);
      break;
  }

  // Apply opacity to watermark
  const watermarkWithOpacity = await sharp(watermark)
    .composite([
      {
        input: Buffer.from([255, 255, 255, Math.floor(opacity * 255)]),
        raw: {
          width: 1,
          height: 1,
          channels: 4,
        },
        tile: true,
        blend: 'dest-in',
      },
    ])
    .toBuffer();

  // Composite watermark onto original image
  const result = await image
    .composite([
      {
        input: watermarkWithOpacity,
        left,
        top,
      },
    ])
    .toBuffer();

  return result;
}

/**
 * Get current watermark settings from database
 */
export async function getWatermarkSettings(): Promise<WatermarkOptions & { watermarkUrl: string | null }> {
  const watermarkImage = await db.getSiteSetting('watermark_image');
  const watermarkPosition = await db.getSiteSetting('watermark_position');
  const watermarkOpacity = await db.getSiteSetting('watermark_opacity');
  const watermarkScale = await db.getSiteSetting('watermark_scale');

  return {
    watermarkUrl: watermarkImage?.settingValue || null,
    position: (watermarkPosition?.settingValue as any) || 'bottom-right',
    opacity: watermarkOpacity?.settingValue ? parseFloat(watermarkOpacity.settingValue) : 0.7,
    scale: watermarkScale?.settingValue ? parseFloat(watermarkScale.settingValue) : 0.15,
  };
}

/**
 * Apply watermark to image buffer using current settings
 * @param imageBuffer - Original image buffer
 * @returns Buffer of the watermarked image, or original if watermark is not configured
 */
export async function applyWatermarkFromSettings(imageBuffer: Buffer): Promise<Buffer> {
  const settings = await getWatermarkSettings();
  
  // If no watermark is configured, return original image
  if (!settings.watermarkUrl) {
    return imageBuffer;
  }

  return await applyWatermark(imageBuffer, settings.watermarkUrl, {
    position: settings.position,
    opacity: settings.opacity,
    scale: settings.scale,
  });
}
