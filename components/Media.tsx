import Image from "next/image";
import { jewelSvg } from "@/lib/jewel-art.mjs";
import type { Image as Img, JewelArt } from "@/lib/commerce/types";

type Props = {
  image?: Img | null;
  /** 2e image affichée au survol (photo, ou illustration recadrée) */
  hoverImage?: Img | null;
  hover?: boolean;
  art?: JewelArt;
  seed?: string;
  alt?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  zoom?: boolean;
  style?: React.CSSProperties;
  /** intensité de parallaxe au défilement (ex. 0.12) */
  parallax?: number;
};

/** Photo si disponible, sinon illustration vectorielle du bijou. */
export function Media({ image, hoverImage, hover, art, seed, alt = "", className = "", sizes = "50vw", priority, zoom = true, style, parallax }: Props) {
  const layer = (img: Img | null | undefined, variant: number) =>
    img ? (
      <Image src={img.url} alt={img.alt || alt} fill sizes={sizes} priority={priority} style={{ objectFit: "cover" }} />
    ) : art ? (
      <div className="media__layer" role="img" aria-label={alt} dangerouslySetInnerHTML={{ __html: jewelSvg(art, { seed, variant }) }} />
    ) : (
      <div className="media__layer" />
    );

  return (
    <div className={`media ${zoom ? "media--zoom" : ""} ${className}`} style={style}>
      {parallax ? (
        <div className="media__px" data-parallax={parallax}>
          {layer(image, 0)}
        </div>
      ) : (
        layer(image, 0)
      )}
      {hover && (hoverImage ? layer(hoverImage, 1) : !image && art ? layer(null, 1) : null)}
    </div>
  );
}
