import * as metaplex from "../src";
import { expect } from "chai";

describe("Hello", () => {
  it("Says", () => {
    expect(metaplex.hello).to.eq("world");
  });
});
