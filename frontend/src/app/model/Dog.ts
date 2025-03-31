export class Dog {
    constructor(
        public dogID: number,
        public name: string,
        public sex: string,
        public description: string,
        public alteration_status: boolean,
        public age: number,
        public surrender_date: Date,       
        public surrenderer_phone: string,
        public surrendered_by_animal_control: boolean,
        public add_by: string,
        public microchipID: string | null,  
        public microchip_vendor: string | null,  
        public breeds: string        
    ) { }
}