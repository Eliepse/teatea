export const brewingTechnic = {
	"cold-brew": "ColdBrew",
	gongfu: "GongFu",
	"western-teapot": "WesternTeapot",
	ceremony: "Ceremony",
} as const;

export type TechnicType = keyof typeof brewingTechnic;

export function BrewingTechnic(props: { value: TechnicType }) {
	return brewingTechnic[props.value];
}
