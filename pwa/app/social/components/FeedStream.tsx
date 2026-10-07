import { Fragment, useEffect, useRef } from "react";
import { PrimaryButton } from "~/shared/components/Button";
import { FeedListSkeleton } from "~/social/components/FeedListSkeleton";
import { FeedList } from "~/social/components/FeedList";
import { useInfiniteQuery } from "@tanstack/react-query";
import { type Filters as FeedFilters, makeFeedInfiniteOpt } from "~/social/query/feedQuery";

const DEFAULT_AUTOLOAD_CREDITS = 3;

export function FeedStream(props: { filters?: FeedFilters; highlightSelf?: boolean; autoloadMaxCredits?: number }) {
	const filters = props.filters ?? {};
	const { hasNextPage, fetchNextPage, ...feedQuery } = useInfiniteQuery(
		makeFeedInfiniteOpt(filters, { itemsPerPage: 24 }),
	);
	const items = feedQuery.data?.pages?.map((page) => page.member).flat(1) ?? [];

	// Defines how much times the next page is autoloaded until it requires a manual one
	const autoFetchedCredits = useRef(props.autoloadMaxCredits ?? DEFAULT_AUTOLOAD_CREDITS);
	const nextButtonRef = useRef<HTMLDivElement>(null);

	/**
	 * Listen if the loading button appears on the screen
	 * to automatically load the next page.
	 */
	useEffect(() => {
		if (!hasNextPage) {
			return;
		}

		const observer = new IntersectionObserver(
			(entries: IntersectionObserverEntry[]) => {
				// No more autoload credits
				if (0 >= autoFetchedCredits.current) {
					return;
				}

				// Request for next page cannot be triggered
				if (feedQuery.isError || feedQuery.isFetching || !hasNextPage) {
					return;
				}

				// The button isn't visible in the screen yet
				if (!entries.some((entry) => entry.isIntersecting)) {
					return;
				}

				autoFetchedCredits.current--;
				void fetchNextPage();
			},
			{
				rootMargin: "0px 0px 16px 0px",
				threshold: 1.0,
			},
		);

		const nextButton = nextButtonRef.current;
		if (nextButton) {
			observer.observe(nextButton);
		}

		// Cleanup the observation
		return () => observer.disconnect();
	}, [nextButtonRef, hasNextPage, fetchNextPage, feedQuery.isError, feedQuery.isFetching]);

	/**
	 * Manually loads the next page (if possible) and reset the autoload credits
	 */
	function loadNextPageManually() {
		// Request for next page cannot be triggered
		if (feedQuery.isError || feedQuery.isFetching || !hasNextPage) {
			return;
		}

		// Reset the credits
		autoFetchedCredits.current = props.autoloadMaxCredits ?? DEFAULT_AUTOLOAD_CREDITS;
		void fetchNextPage();
	}

	return (
		<Fragment>
			{feedQuery.isLoading ? (
				<FeedListSkeleton amount={5} />
			) : (
				<FeedList items={items} highlightSelf={props.highlightSelf} />
			)}

			<div className="pt-8 pb-4 px-8">
				{hasNextPage && (
					<div ref={nextButtonRef}>
						<PrimaryButton
							className="w-full"
							onClick={loadNextPageManually}
							loading={feedQuery.isFetching}
							disabled={feedQuery.isFetching}
						>
							Next page
						</PrimaryButton>
					</div>
				)}
			</div>
		</Fragment>
	);
}
