export class User {
    constructor(
        public token: string,
        public isAdmin: boolean,
        public age: number,
        public email: string
    ) { }
}