import { TeaSearchEngine } from "~/components/search/TeaSearchEngine";

export default function TeaSearchPage() {
	return <TeaSearchEngine onSelect={console.debug} />;
}
