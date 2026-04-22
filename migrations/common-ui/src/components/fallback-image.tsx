import { AppImage as Image, AppImageProps } from "../platform/image";
import { useEffect, useState } from "react";

interface FallbackImageProps extends Omit<AppImageProps, "src"> {
  src?: string;
  fallbackUser: string;
}

export const FallbackImage = ({
  src,
  fallbackUser,
  ...rest
}: FallbackImageProps) => {
  const [imgSrc, setImgSrc] = useState<string>(src || fallbackUser);

  useEffect(() => {
    setImgSrc(src || fallbackUser);
  }, [src, fallbackUser]);

  return (
    <Image
      {...rest}
      src={imgSrc}
      onError={() => setImgSrc(fallbackUser)}
    />
  );
};
