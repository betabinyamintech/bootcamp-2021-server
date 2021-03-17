const request = require("superagent");
const app = require("./app");
const serverUrl = `http://localhost:${process.env.TESTPORT}`;

beforeAll(() => {
  app.listen(process.env.TESTPORT, () => {
    console.log("Opened port succesfully at port " + process.env.TESTPORT);
    const ok = deleteAll();
  });
});

const getRequest = (location) => request.get(serverUrl + location);
const postRequest = (location) =>
  request.post(serverUrl + location).set("Accept", "application/json");

const getRequestWithToken = (location, token) =>
  getRequest(location).set({ Authorization: `Bearer ${token}` });
const postRequestWithToken = (location, token) =>
  postRequest(location).set({ Authorization: `Bearer ${token}` });

const registerUser = async ({ email, password }) =>
  await postRequest("/register").send({ email, password });

const loginUser = async ({ email, password }) =>
  await postRequest("/login").send({ email, password });

const deleteAll = async () => await getRequest("/deleteall");

const mockUser = { email: "me@there.now", password: "asdasdas" };
let my_token;

describe("auth", () => {
  const unregisterdedUser = mockUser;
  test("register", async () => {
    const res = await registerUser(unregisterdedUser);
    const { token } = res.body;
    my_token = token;
    expect(my_token).toBeDefined();
  });
  test("login", async () => {
    const res = await loginUser(unregisterdedUser);
    expect(my_token).toEqual(res.body.token);
  });
});
