const request = require("superagent");
process.env.TEST = true;
process.env.MONGO_USER_NAME_PASS = process.env.MONGO_TEST_SERVER
const app = require("./app");
const serverUrl = `http://localhost:${process.env.TESTPORT}`;

beforeAll(async () => {
  await app.listen(process.env.TESTPORT);
  try {
    console.log("Opened port succesfully at port " + process.env.TESTPORT);
    const ok = await getRequest("/deleteall");
    console.log(ok);
  } catch (err) {
    console.error(err);
    debugger;
  }
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

const mockUser = { email: "123", password: "b" };


test("/register", async () => {
  const unregisterdedUser = mockUser;
  const res = await registerUser(unregisterdedUser);
  const { token } = res.body;
  expect(token).toBeDefined();
});

test("update profile", async () => {
  const user = await loginUser(mockUser);
  expect(user).toBeD  efined();
});
