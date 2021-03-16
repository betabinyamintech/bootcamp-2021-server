const request = require("superagent");
process.env.TEST = true;
process.env.MONGO_USER_NAME_PASS =
  "mongodb+srv://bootcamp032021:atlasBTech123@cluster0.nnxlj.mongodb.net/test";
const app = require("./app");

beforeAll(async () => {
  await app.listen(process.env.TESTPORT);
  console.log("Opened port succesfully at port " + process.env.TESTPORT);
});

const serverUrl = `http://localhost:${process.env.TESTPORT}`;

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
  await postRequest("/login").send({ email: "a", password: "b" });

const deleteAll = async () => await getRequest("/deleteall");

const mockUser = { email: "123", password: "b" };

test("/register", async () => {
  const unregisterdedUser = mockUser;
  const res = await registerUser(unregisterdedUser);
  console.log("res.body", res.body);
  const { token } = res.body;
  expect(token).toBeDefined();
});

test("update profile", async () => {
  const unregisterdedUser = { email: "a", password: "v" };
  const user = await registerUser(unregisterdedUser);
});
