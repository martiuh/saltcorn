/**
 * @category server
 * @module auth/testhelp
 * @subcategory auth
 */
/*global it, expect*/
const request = require("supertest");
const app = require("../app");
const getApp = require("../app");
const fixtures = require("@saltcorn/data/db/fixtures");
const reset = require("@saltcorn/data/db/reset_schema");

/**
 *
 * @param {string} loc
 * @returns {void}
 * @throws {Error}
 */
const toRedirect = (loc) => (res) => {
  if (res.statusCode !== 302) {
    console.log(res.text);
    throw new Error("Expected redirect, received " + res.statusCode);
  }
  const gotLoc = res.headers["location"];
  if (gotLoc !== loc) {
    throw new Error(`Expected location ${loc} received ${gotLoc}`);
  }
};

/**
 *
 * @param {number} txt
 * @param {number} expCode
 * @returns {void}
 * @throws {Error}
 */
const toInclude =
  (txt, expCode = 200) =>
  (res) => {
    if (res.statusCode !== expCode) {
      console.log(res.text);
      throw new Error(
        `Expected status ${expCode} when lookinng for "${txt}", received ${res.statusCode}`
      );
    }

    if (!res.text.includes(txt)) {
      console.log(res.text);
      throw new Error(`Expected text ${txt} not found`);
    }
  };

/**
 *
 * @param {number} expCode
 * @returns {void}
 * @throws {Error}
 */
const toSucceed =
  (expCode = 200) =>
  (res) => {
    if (res.statusCode !== expCode) {
      console.log(res.text);
      throw new Error(`Expected status ${expCode}, received ${res.statusCode}`);
    }
  };

/**
 *
 * @param {number} txt
 * @param {number} expCode
 * @returns {void}
 * @throws {Error}
 */
const toNotInclude =
  (txt, expCode = 200) =>
  (res) => {
    if (res.statusCode !== expCode) {
      console.log(res.text);
      throw new Error(
        `Expected status ${expCode} when not lookinng for "${txt}", received ${res.statusCode}`
      );
    }

    if (res.text.includes(txt)) {
      console.log(res.text);
      throw new Error(`Expected text ${txt} to be absent, but was present`);
    }
  };

const resToLoginCookie = (res) =>
  res.headers["set-cookie"].find((c) => c.includes("connect.sid"));

/**
 *
 * @returns {Promise<void>}
 */
const getStaffLoginCookie = async () => {
  const app = await getApp({ disableCsrf: true });
  const res = await request(app)
    .post("/auth/login/")
    .send("email=staff@foo.com")
    .send("password=ghrarhr54hg");
  if (res.statusCode !== 302) console.log(res.text);
  return resToLoginCookie(res);
};

/**
 *
 * @returns {Promise<void>}
 */
const getAdminLoginCookie = async () => {
  const app = await getApp({ disableCsrf: true });
  const res = await request(app)
    .post("/auth/login/")
    .send("email=admin@foo.com")
    .send("password=AhGGr6rhu45");
  if (res.statusCode !== 302) console.log(res.text);
  return resToLoginCookie(res);
};

/**
 *
 * @param {string} path
 * @param {string} dest
 * @returns {void}
 */
const itShouldRedirectUnauthToLogin = (path, dest) => {
  it(`should redirect unauth ${path} to ${dest || "login"}`, async () => {
    const app = await getApp({ disableCsrf: true });
    const res = await request(app)
      .get(path)
      .expect(302)
      .expect("Location", dest || "/auth/login");

    expect(res.statusCode).toEqual(302);
  });
};

/**
 * @returns {Promise<void>}
 */
const resetToFixtures = async () => {
  await reset();
  await fixtures();
};

/**
 *
 * @param {*} pred
 * @returns {void}
 * @throws {Error}
 */
const succeedJsonWith = (pred) => (res) => {
  if (res.statusCode !== 200) {
    console.log(res.text);
    throw new Error(`Expected status 200, received ${res.statusCode}`);
  }

  if (!pred(res.body.success)) {
    console.log(res.body);
    throw new Error(`Not satisfied`);
  }
};

/**
 *
 * @param {number} code
 * @param {number} pred
 * @returns {void}
 * @throws {Error}
 */
const respondJsonWith = (code, pred) => (res) => {
  if (res.statusCode !== code) {
    console.log(res.text);
    throw new Error(`Expected status ${code}, received ${res.statusCode}`);
  }

  if (!pred(res.body)) {
    console.log(res.body);
    throw new Error(`Not satisfied`);
  }
};

/**
 *
 * @param {object} res
 * @returns {void}
 * @throws {Error}
 */
const notAuthorized = (res) => {
  if (res.statusCode !== 401) {
    console.log(res.text);
    throw new Error(`Expected status 401, received ${res.statusCode}`);
  }
};
module.exports = {
  getStaffLoginCookie,
  getAdminLoginCookie,
  itShouldRedirectUnauthToLogin,
  toRedirect,
  toInclude,
  toNotInclude,
  toSucceed,
  resetToFixtures,
  succeedJsonWith,
  notAuthorized,
  respondJsonWith,
};
