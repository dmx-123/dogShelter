export class ApprovedApplication {
    constructor(
      public email: string,
      public submit_date: Date,
      public approved_date: Date,
      public adoption_date: Date | null,
      public dogID: number | null
    ) {}
  }
  