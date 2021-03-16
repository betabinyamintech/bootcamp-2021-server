const { ExpectationFailed } = require('http-errors');
const request = require('superagent')
process.env.TEST=true
const app = require('./app')

const serverUrl = `http://localhost:${process.env.TESTPORT}`


const  getRequest = (location) => request.get(serverUrl+location);
const  postRequest = (location) => request.post(serverUrl+location).set('Accept', 'application/json')

const getRequestWithToken = (location, token) => getRequest(location).set({ "Authorization": `Bearer ${token}` })
const postRequestWithToken = (location, token) => postRequest(location).set({ "Authorization": `Bearer ${token}` })

const registerUser = async ({email, password}) => 
    await postRequest("/register")
        .send({email,  password})
    

const loginUser = async ({email, password}) => await postRequest("/login")
        .send({email: "a", password: "b"})

beforeAll(async () => {
    await app.listen(process.env.TESTPORT)
    console.log("Opened port succesfully at port " + process.env.TESTPORT);
   }   
)

const mockUser = { email: "123", password:"b"}


test('/register', async () => {
    const unregisterdedUser = mockUser
    const res  =  await registerUser(unregisterdedUser)
    console.log("35" ,res.body)
    const { token } = res.body;
    console.log('37',token);
    expect(token).toBeDefined()
})


 test('update profile', async () => {
    const unregisterdedUser = { email: "", password:""}
    const user =  await registerUser(unregisterdedUser)
})
