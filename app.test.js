const request = require("supertest");
const app = require("./app");

const getRequest = (location) => request(app).get(location);
const postRequest = (location) =>
  request(app).post(location).set("Accept", "application/json");

const getRequestWithToken = (location, token) =>
  getRequest(location).set({ Authorization: `Bearer ${token}` });
const postRequestWithToken = (location, token) =>
  postRequest(location).set({ Authorization: `Bearer ${token}` });

const registerUser = async ({ email, password }) =>
  await postRequest("/register").send({ email, password });

const loginUser = async ({ email, password }) =>
  await postRequest("/login").send({ email, password });

const deleteAll = async () => await getRequest("/deleteall");

const mockUser = { email: "d@there.now", password: "asdasdas" };

describe("auth", () => {
  const unregisterdedUser = mockUser;
  let my_token;
  test("register", async () => {
    const res = await registerUser(unregisterdedUser);
    console.log("res.body", res.body);
    const { token } = res.body;

    my_token = token;
    expect(my_token).toBeDefined();
  });
  test("login", async () => {
    const res = await loginUser(unregisterdedUser);
    expect(res.body.token).toBeDefined();
  });
});
