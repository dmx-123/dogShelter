export class Expense {
    constructor(
        public dogID: number,
        public date: Date, 
        public vendor_name: string,
        public amount: number,
        public category_name: string
    ) { }
}