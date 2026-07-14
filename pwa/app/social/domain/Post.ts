export class Post {
	constructor(
		public readonly id: number,
		public readonly content: string,
		public readonly createdAt: Date,
		public readonly updateAt: Date,
	) {
	}
}
