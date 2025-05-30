import type { Route } from "./+types/home";
import MagnifierIcon from "~/components/icons/magnifier";
import { TypeFilterListAll, type TypeFilterValue } from "~/components/search/TypeFilterListAll";
import { type ChangeEvent, Fragment, useEffect, useState } from "react";
import { OriginFilter, type OriginFilterValue } from "~/components/search/OriginFilter";
import { useQuery } from "@tanstack/react-query";
import { loader as filtersLoader } from "~/api/filters";
import { ResultItem } from "~/components/search/tea-search/resultItem";
import type { Tea } from "~t/types";
import { SearchFilters, type FilterValue } from "~/components/search/tea-search/searchFilters";
import { TeaSearch } from "~/components/search/tea-search/tea-search";

export function meta({}: Route.MetaArgs) {
	return [{ title: "Teatea" }];
}

export async function loader(args: Route.LoaderArgs) {
	return await filtersLoader(args);
}

export default function Home(props: Route.ComponentProps) {
	return <TeaSearch onSelect={console.debug} />;
}
