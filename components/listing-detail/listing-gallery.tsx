import ListingImageGallery from "@/components/listing-image-gallery";

export function ListingGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  return <ListingImageGallery images={images} title={title} />;
}