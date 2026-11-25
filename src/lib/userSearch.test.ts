import { describe, expect, it } from "vitest";
import { userSearchParameters } from "./userSearch";

describe("customer-scoped user searches", () => {
  it("searches the requested email within each selected client", () => {
    const email = "mike.moran@thefloow.com";
    expect(userSearchParameters("mobileAndroid", email, "exact", "email")).toEqual({ _customer_id: "mobileAndroid", _query: email, _mode: "exact", _field: "email" });
    expect(userSearchParameters("product", email, "exact", "email")).toEqual({ _customer_id: "product", _query: email, _mode: "exact", _field: "email" });
  });
  it("passes partial queries without turning them into exact searches", () => {
    expect(userSearchParameters("mobileAndroid", " moran@ ", "smart", "email")).toEqual({ _customer_id: "mobileAndroid", _query: "moran@", _mode: "smart", _field: "email" });
  });
});