const request = require("supertest");
const app = require("./app");

const getRequest = (location) => request(app).get(location);
const postRequest = (location) =>
  request(app).post(location).set("Accept", "application/json");
const putRequest = (location) =>
  request(app).put(location).set("Accept", "application/json");

const getRequestWithToken = (location, token) =>
  getRequest(location).set({ Authorization: `Bearer ${token}` });
const postRequestWithToken = (location, token) =>
  postRequest(location).set({ Authorization: `Bearer ${token}` });
const putRequestWithToken = (location, token) =>
  putRequest(location).set({ Authorization: `Bearer ${token}` });

const registerUser = async ({ email, password }) =>
  await postRequest("/register").send({ email, password });

const loginUser = async ({ email, password }) =>
  await postRequest("/login").send({ email, password });

const deleteAll = async () => await getRequest("/deleteall");

const mockUser = { email: "reut@there.now", password: "asdasdas" };

beforeAll(async () => {
  await deleteAll();
});

describe("auth", () => {
  const unregisterdedUser = mockUser;
  let my_token;
  test("register", async () => {
    const res = await registerUser(unregisterdedUser);
    const { token } = res.body;

    my_token = token;
    expect(my_token).toBeDefined();
  });
  test("login", async () => {
    const res = await loginUser(unregisterdedUser);
    expect(res.body.token).toBeDefined();
  });
  test("update user", async () => {
    const res = await putRequestWithToken("/users/", my_token).send({
      firstName: "reut",
      isExpert: true,
    });
    expect(res.body).toBeDefined();
  });
  test("without token", async () => {
      const res = await putRequestWithToken("/users/", "123").send({
        firstName: "reut",
        isExpert: true,
      });

    expect(res.text).toBe("invalid token");
  });
  test("get experts", async () => {
    const res = await getRequestWithToken("/users/experts", my_token);
    expect(res.body[0].isExpert).toBe(true);
  });
});
