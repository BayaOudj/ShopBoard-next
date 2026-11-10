'use client'
import Image from 'next/image'
import { useState, type ImgHTMLAttributes } from 'react'
type Props = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  'src' | 'width' | 'height' | 'loading'
> & { src?: string; width: number; height: number; loading?: 'eager' | 'lazy' }
export function SafeImage({ src, alt = '', className, ...props }: Props) {
  const [failed, setFailed] = useState<string>()
  if (!src || failed === src)
    return (
      <div
        className={className}
        role={alt ? 'img' : undefined}
        aria-label={alt || undefined}
        aria-hidden={!alt || undefined}
      >
        Photo unavailable
      </div>
    )
  return (
    <Image
      {...props}
      unoptimized
      className={className}
      src={src}
      alt={alt}
      onError={() => setFailed(src)}
    />
  )
}
