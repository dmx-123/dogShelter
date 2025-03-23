export class AdoptionApplication {
    constructor(
      public email: string,
      public submit_date: Date,
      public first_name: string,
      public last_name: string,
      public phone_number: string,
      public household_size: number,
      public street: string,
      public city: string,
      public state: string,
      public zip_code: string
    ) {}
  }
  