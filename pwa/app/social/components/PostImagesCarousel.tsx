import type { MediaObject } from "~t/types";
import { useRef, useState, type UIEvent, useEffect } from "react";

function getActiveIndex(container: HTMLElement): number {
	const scrollLeft = container.scrollLeft;
	const itemWidth = container.clientWidth;
	return Math.round(scrollLeft / itemWidth);
}

export function PostImagesCarousel(props: { images: Array<MediaObject> }) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [activeIndex, setActiveIndex] = useState(0);

	function handleScrollEnd(e: UIEvent<HTMLDivElement>) {
		setActiveIndex(getActiveIndex(e.currentTarget));
	}

	useEffect(() => {
		if(!containerRef.current) {
			return;
		}

		setActiveIndex(getActiveIndex(containerRef.current));
	}, []);

	return (
		<div className="mb-4 relative">
			<div
				ref={containerRef}
				className="flex flex-nowrap align-top justify-start overflow-y-auto snap-mandatory snap-x"
				onScrollEnd={handleScrollEnd}
			>
				{props.images.map((img) => (
					<div key={img.id} className="snap-start shrink-0 w-full">
						<img
							src={img.contentUrl}
							style={{ backgroundImage: `url(data:image/webp;base64,${img.placeholder})` }}
							className="w-full h-full min-h-48 max-h-96 object-cover bg-center bg-cover z-0"
							alt=""
						/>
					</div>
				))}
			</div>

			<div className="absolute right-2 bottom-2">
				<div className="w-min whitespace-nowrap leading-none px-2 py-1 bg-stone-600/60 rounded-lg text-white text-xs">
					{activeIndex + 1} / {props.images.length}
				</div>
			</div>
		</div>
	);
}
