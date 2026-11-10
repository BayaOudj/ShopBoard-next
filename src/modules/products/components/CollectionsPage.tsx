'use client'

import { useRouter } from 'next/navigation'
import { CollectionsSection } from '../../products/components/CollectionsSection'
export default function CollectionsPage() {
  const { push: navigate } = useRouter()
  return (
    <CollectionsSection
      sectionRef={null}
      disabled={false}
      onSelect={(collection) =>
        navigate(`/products?collection=${collection.id}`)
      }
    />
  )
}
