import { Contract } from "ethers";

export type StrategyConstructorParams<T extends Contract> = Parameters<T["initialize"]>;
