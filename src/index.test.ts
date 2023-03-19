import { fromJSON, toJSON } from "./index";
describe("toJSON", () => {
  it("handles ordinary objects", () => {
    const inputs = [
      null,
      { a: 1, b: { c: 3 }, d: [4, 5, 6], e: undefined },
      [1, 2, 3],
      1,
      "a",
      true,
      false,
    ];
    inputs.forEach((input) => {
      expect(toJSON(input)).toEqual(JSON.stringify(input));
      expect(fromJSON(toJSON(input))).toEqual(input);
    });
  });

  it("restores duplicate properties", () => {
    const a = [1, 2, 3];
    const obj = { orig: a, same: a, copied: [...a] };
    expect(obj.same).toBe(obj.orig);
    expect(obj.copied).not.toBe(obj.orig);
    const deserialized = fromJSON(toJSON(obj));
    expect(deserialized.same).toBe(deserialized.orig);
    expect(deserialized.copied).not.toBe(deserialized.orig);
  });

  it("restores circular refs", () => {
    const obj: { self?: unknown; num: number } = { num: 2 };
    obj.self = obj;
    const serialized = toJSON(obj);
    expect(serialized).toEqual('{"num":2,"self":{"_refId":"$"}}');
    const deserialized = fromJSON(serialized);
    expect(deserialized).toEqual(obj);
    expect(deserialized.self).toBe(deserialized);

    // a more nested example
    const obj2 = { a: 1, b: [4, 5, obj], c: undefined };
    const serialized2 = toJSON(obj2);
    expect(serialized2).toEqual(
      '{"a":1,"b":[4,5,{"num":2,"self":{"_refId":"$.b.2"}}]}'
    );
    const deserialized2 = fromJSON(serialized2);
    expect(deserialized2).toEqual(obj2);
    expect(deserialized2.b[2]).toBe(deserialized2.b[2].self);
  });
});