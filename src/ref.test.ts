import { getRefResolver } from "./ref";

describe("ref resolver", () => {
  it("resolves refs", async () => {
    const data = {
      $: { orig: [1, 2, 3], same: { $ref: "$.orig" }, copied: [1, 2, 3] },
    };
    const refs = getRefResolver(data);
    refs.registerValue(data.$.orig, "$.orig");
    const resolved = (await refs.resolve(data)) as typeof data;
    expect(resolved.$.same).toEqual([1, 2, 3]);
    expect(resolved.$.same).toBe(resolved.$.orig);
  });
});
