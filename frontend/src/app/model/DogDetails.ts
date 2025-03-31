import { Dog } from "./Dog";
import { ExpenseSummary } from "./ExpenseSummary";

export class DogDetails {
  constructor(
    public dog: Dog,
    public expenses: ExpenseSummary[]
  ) { }
}