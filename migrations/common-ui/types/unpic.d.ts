declare module "@unpic/react" {
  import * as React from "react";

  export type ImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
    src: string;
    width?: number | string;
    height?: number | string;
    sizes?: string;
  };

  export const Image: React.FC<ImageProps>;
}
