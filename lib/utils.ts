// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import qs from "qs";
import { twMerge } from "tailwind-merge";
import { aspectRatioOptions } from "@/constants";

// TypeScript interfaces
interface FormUrlQueryParams {
  searchParams: URLSearchParams;
  key: string;
  value: string;
}

interface RemoveUrlQueryParams {
  searchParams: string | URLSearchParams;
  keysToRemove: string[];
}
interface ImageData {
  aspectRatio?: AspectRatioKey;
  width?: number;
  height?: number;
  [key: string]: unknown;
}

type DeepObject = {
  [key: string]: unknown;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const handleError = (error: unknown) => {
  if (error instanceof Error) {
    console.error(error.message);
    throw new Error(`Error: ${error.message}`);
  } else if (typeof error === "string") {
    console.error(error);
    throw new Error(`Error: ${error}`);
  } else {
    console.error(error);
    throw new Error(`Unknown error: ${JSON.stringify(error)}`);
  }
};

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#7986AC" offset="20%" />
      <stop stop-color="#68769e" offset="50%" />
      <stop stop-color="#7986AC" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#7986AC" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string): string =>
  typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str);

export const dataUrl = `data:image/svg+xml;base64,${toBase64(shimmer(1000, 1000))}`;
export const formUrlQuery = ({
  searchParams,
  key,
  value,
}: FormUrlQueryParams): string => {
  // Convert URLSearchParams to string if needed
  const searchParamsString = searchParams instanceof URLSearchParams 
    ? searchParams.toString() 
    : searchParams;

  const params = { ...qs.parse(searchParamsString), [key]: value };

  return `${window.location.pathname}?${qs.stringify(params, {
    skipNulls: true,
  })}`;
};

export function removeKeysFromQuery({
  searchParams,
  keysToRemove,
}: RemoveUrlQueryParams): string {
  // Convert URLSearchParams to string if needed
  const searchParamsString = searchParams instanceof URLSearchParams 
    ? searchParams.toString() 
    : searchParams;

  const currentUrl = qs.parse(searchParamsString);

  keysToRemove.forEach((key) => {
    delete currentUrl[key];
  });

  Object.keys(currentUrl).forEach(
    (key) => currentUrl[key] == null && delete currentUrl[key]
  );

  return `${window.location.pathname}?${qs.stringify(currentUrl)}`;
}

type DebouncedFunction<T extends (...args: unknown[]) => void> = (...args: Parameters<T>) => void;

export const debounce = <T extends (...args: unknown[]) => void>(
  func: T,
  delay: number
): DebouncedFunction<T> => {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export type AspectRatioKey = keyof typeof aspectRatioOptions;

export const getImageSize = (
  type: string,
  image: ImageData,
  dimension: "width" | "height"
): number => {
  if (type === "fill") {
    return (
      aspectRatioOptions[image.aspectRatio as AspectRatioKey]?.[dimension] ||
      1000
    );
  }
  return image?.[dimension] || 1000;
};

export const download = (url: string, filename: string): void => {
  if (!url) {
    throw new Error("Resource URL not provided! You need to provide one");
  }

  fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      const blobURL = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobURL;

      if (filename && filename.length) {
        a.download = `${filename.replace(" ", "_")}.png`;
      }
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobURL);
    })
    .catch((error) => console.error("Download error:", error));
};

export const deepMergeObjects = (obj1: DeepObject, obj2: DeepObject): DeepObject => {
  if (obj2 === null || obj2 === undefined) {
    return obj1;
  }

  const output: DeepObject = { ...obj2 };

  for (const key in obj1) {
    if (Object.prototype.hasOwnProperty.call(obj1, key)) {
      if (
        obj1[key] &&
        typeof obj1[key] === "object" &&
        obj2[key] &&
        typeof obj2[key] === "object"
      ) {
        output[key] = deepMergeObjects(
          obj1[key] as DeepObject,
          obj2[key] as DeepObject
        );
      } else {
        output[key] = obj1[key];
      }
    }
  }

  return output;
};