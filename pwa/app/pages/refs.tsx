import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Teatea - Refs" }];
}

export async function loader() {
  return {
    stores: [
      ["https://chanoki.fr", "Chanoki"],
      ["https://kanchatea.com", "Kancha"],
      ["https://www.letempleduthe.fr", "Le Temple du Thé"],
      ["https://kodamaparis.com", "Kodama"],
      ["https://www.lautrethe.com", "L'Autre Thé"],
      ["https://www.bonthes.com", "Bonthés"],
      ["https://www.lepartiduthe.com", "Le Parti du Thé"],
      ["https://www.humanandtea.com", "Human & Tea"],
      ["https://www.ochaya.fr", "Ochaya"],
      ["https://www.lupicia.fr", "Lupicia"],
      ["https://universdujapon.com", "Univers du Japon"],
      ["https://www.shobi.fr", "Shobi"],
    ],
  };
}

export default function Refs(props: Route.ComponentProps) {
  return (
    <div>
      <header className="p-4">
        <h1>References</h1>
      </header>

      <ul className="list bg-base-100">
        <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">Stores</li>

        {props.loaderData?.stores?.map((site) => (
          <li className="list-row" key={site[0]}>
            <div className="list-col-grow">
              <div>
                <a href={site[0]} className="link">
                  {site[1]}
                </a>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
