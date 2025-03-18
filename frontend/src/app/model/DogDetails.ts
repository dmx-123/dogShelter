import { Dog } from "./Dog";
import { Expense } from "./Expense";

export class DogDetails {
  constructor(
    public dog: Dog,
    public expenses: Expense[]
  ) { }
}