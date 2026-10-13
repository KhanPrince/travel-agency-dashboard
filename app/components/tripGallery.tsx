const PLACEHOLDER = "/assets/images/placeholder.jpg";

const TripGallery = ({ images, alt }: { images?: string[]; alt: string }) => {
  const list = (images?.length ? images : [PLACEHOLDER]).slice(0, 3);

  // Large screens: first image is the big tile, the rest fill the right column
  const tileClass = (index: number) => {
    if (index !== 0) return "lg:col-span-1";
    if (list.length === 1) return "lg:col-span-3 lg:row-span-2";
    return "lg:col-span-2 lg:row-span-2";
  };

  // With only two images, let the second one fill the full right column height
  const secondClass = list.length === 2 ? "lg:row-span-2" : "";

  return (
    <div
      className="
        flex flex-col gap-3 px-4.5
        lg:grid lg:grid-cols-3 lg:grid-rows-2 lg:h-[420px] lg:px-0
      "
    >
      {list.map((url, index) => (
        <img
          key={url + index}
          src={url}
          alt={`${alt} ${index + 1}`}
          loading={index === 0 ? "eager" : "lazy"}
          className={`
            w-full h-56 sm:h-64
            !rounded-2xl object-cover
            lg:h-full
            ${tileClass(index)} ${index === 1 ? secondClass : ""}
          `}
        />
      ))}
    </div>
  );
};

export default TripGallery;
