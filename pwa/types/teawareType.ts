export const teawareTypes = {
	gaiwan: "Gaiwan",
	yixing: "Yixing",
	kyusu: "Kyūsu",
	shiboridashi: "Shiboridashi",
	hohin: "Hōhin",
	chawan: "Chawan",
	tajeon: "Tajeon",
	teapot: "Teapot",
	bottle: "Bottle",
	press: "French press",
	mug: "Mug",
	other: "Other",
} as const;

export type TeawareType = keyof typeof teawareTypes;
