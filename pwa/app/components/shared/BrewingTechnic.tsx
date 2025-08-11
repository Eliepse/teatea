export const brewingTechnic = {
	"cold-brew": "Cold brew",
	gongfu: "Gongfu",
	"western-teapot": "Western teapot",
	ceremony: "Ceremony",
} as const;

export type TechnicType = keyof typeof brewingTechnic;

export function BrewingTechnic(props: { value: TechnicType }) {
	return brewingTechnic[props.value];
}
