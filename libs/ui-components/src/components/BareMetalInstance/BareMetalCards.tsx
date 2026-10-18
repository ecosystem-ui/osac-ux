import { Gallery, GalleryItem } from '@patternfly/react-core';

import type { BareMetalInstance } from '@osac/types';

import BareMetalCard from './BareMetalCard';

interface BareMetalCardsProps {
  instances: BareMetalInstance[];
}

const BareMetalCards = ({ instances }: BareMetalCardsProps) => (
  <Gallery hasGutter minWidths={{ default: '20.875rem' }} maxWidths={{ default: '20.875rem' }}>
    {instances.map((instance) => (
      <GalleryItem key={instance.id}>
        <BareMetalCard instance={instance} />
      </GalleryItem>
    ))}
  </Gallery>
);

export default BareMetalCards;
