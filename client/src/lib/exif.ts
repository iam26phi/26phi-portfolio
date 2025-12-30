import exifr from 'exifr';

export interface ExifData {
  camera?: string;
  lens?: string;
  settings?: string;
  date?: string;
  location?: string;
}

/**
 * 從圖片檔案中提取 EXIF 資訊
 * @param file 圖片檔案
 * @returns EXIF 資訊物件
 */
export async function extractExifData(file: File): Promise<ExifData> {
  try {
    // 讀取 EXIF 資訊
    const exif = await exifr.parse(file, {
      tiff: true,
      exif: true,
      gps: true,
      interop: true,
    });

    if (!exif) {
      return {};
    }

    // 提取相機型號
    const camera = exif.Make && exif.Model 
      ? `${exif.Make} ${exif.Model}`.trim()
      : exif.Model || undefined;

    // 提取鏡頭資訊
    const lens = exif.LensModel || exif.LensInfo || undefined;

    // 提取拍攝參數
    const settings = buildSettingsString(exif);

    // 提取拍攝日期
    const date = exif.DateTimeOriginal || exif.DateTime || undefined;

    // 提取 GPS 位置資訊
    const location = buildLocationString(exif);

    return {
      camera,
      lens,
      settings,
      date: date ? formatDate(date) : undefined,
      location,
    };
  } catch (error) {
    console.error('Failed to extract EXIF data:', error);
    return {};
  }
}

/**
 * 建立拍攝參數字串
 */
function buildSettingsString(exif: any): string | undefined {
  const parts: string[] = [];

  // ISO
  if (exif.ISO) {
    parts.push(`ISO ${exif.ISO}`);
  }

  // 光圈
  if (exif.FNumber) {
    parts.push(`f/${exif.FNumber}`);
  } else if (exif.ApertureValue) {
    parts.push(`f/${exif.ApertureValue.toFixed(1)}`);
  }

  // 快門速度
  if (exif.ExposureTime) {
    if (exif.ExposureTime < 1) {
      parts.push(`1/${Math.round(1 / exif.ExposureTime)}s`);
    } else {
      parts.push(`${exif.ExposureTime}s`);
    }
  } else if (exif.ShutterSpeedValue) {
    const shutterSpeed = Math.pow(2, -exif.ShutterSpeedValue);
    if (shutterSpeed < 1) {
      parts.push(`1/${Math.round(1 / shutterSpeed)}s`);
    } else {
      parts.push(`${shutterSpeed.toFixed(1)}s`);
    }
  }

  // 焦距
  if (exif.FocalLength) {
    parts.push(`${exif.FocalLength}mm`);
  }

  return parts.length > 0 ? parts.join(', ') : undefined;
}

/**
 * 建立位置資訊字串
 */
function buildLocationString(exif: any): string | undefined {
  if (!exif.latitude || !exif.longitude) {
    return undefined;
  }

  // 格式化經緯度
  const lat = exif.latitude.toFixed(6);
  const lng = exif.longitude.toFixed(6);
  
  return `${lat}, ${lng}`;
}

/**
 * 格式化日期
 */
function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    return '';
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}
