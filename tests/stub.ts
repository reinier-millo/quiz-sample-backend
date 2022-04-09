/**
 * Copyright (C) 2021 LegalTI
 * All Rights Reserved
 * Author: Reinier Millo Sánchez <reinier.millo88@gmail.com>
 *
 * This file is part of the LegalTI Project API.
 * It can't be copied and/or distributed without the express
 * permission of the author.
 */
import "mocha";
import chai from "chai";
const expect = chai.expect;

describe("Stub module unit test", () => {
  it("Stub test", (done) => {
    expect("hello").to.be.a("string").to.have.length(5);
    done();
  }).timeout(1000);
});
