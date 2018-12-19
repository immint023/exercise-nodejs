const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = 3000;
const fs = require('fs');


app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// app.set('view engine', 'pug');
// app.set('views', './views');

// CRUD users; create read update delete
// const users = [];
// Get one user api
// Get list user api
// ...
// ....
// ....
// let users = [];

let users = [
  {
    id: 1,
    name: 'Minh',
    age: 18
  },
  {
    id: 2,
    name: 'Thao',
    age: 18
  },
  {
    id: 3,
    name: 'Giang',
    age: 18
  }
]
// read file 
function readFileSync(path) {
  return new Promise((res, rej) => {
    fs.readFile(path, (err, data) => {
      if (err) {
        return rej(err);
      } 
      return res(JSON.parse(data));
    });
  });
}
// write file
function writeFileSync(path, data) {
  return new Promise((res, rej) => {
    fs.writeFile(path, data, err => {
      if (err) {
        return  rej(err);
      } 
      return  res();
    });
  });
}
// get index of user by user's id
function getIndexOfUserById(users, id) {
  for (let i = 0; i < users.length; i++) {
    if (users[i].id === id) {
      return i;
    }
  }
}
// api get list users
app.get('/read-file', (req, res) => {
  (async function() {
    let listUsers =  await readFileSync('./data/users.json');
    return listUsers;
  })()
    .then(users => { res.json({ users: users })})
    .catch(e => res.json( { message: e.message }));
});

// api write user's data to file
app.get('/write-file', async (req, res) => {
  try {
    await writeFileSync('./data/users.json', JSON.stringify(users));
    return res.json({ message: 'Success' });
  } catch (e) {
    return res.json({ message: e.message });
  }
});

// api get user by id
app.get('/users/:userId', async function (req, res) {
  let userId = parseInt(req.params.userId);
  (async function() {
    let listUsers =  await readFileSync('./data/users.json');
    let user = listUsers.find(item => item.id === userId);
    return user;
  })()
    .then(user => res.json({ user }))
    .catch(e => resjson({ message: e.message }));
});

// api create new user
app.post('/users/post', async function (req, res) {
  try {
    const listUsers = await readFileSync('./data/users.json');
    const body = req.body;
    const newUser = {
      id: parseInt(body.id),
      name: body.name,
      age: body.age,
      createAt: new Date()
    }
    let indexOfUser = getIndexOfUserById(listUsers, newUser.id);

    if (!body.id) {
      return res.status(400).json({ error: 'Id is required field'});
    }
    if (!body.name) {
      return res.status(400).json({ error: 'Name is required field'});
    }
    if (!body.age) {
      return res.status(400).json({ error: 'Age is required field'});
    }

    if (!indexOfUser) {
      listUsers.push(newUser);
    } else {
      return res.json({ message: 'User is existed' });
    }

    await writeFileSync('./data/users.json', JSON.stringify(listUsers));
    return res.json({ message: 'Created User', newUser });
  } catch (e)  {
    return res.json({ message: 'Cannot read user file', error: e.message });
  }
});


// api delete user by id
app.delete('/users/delete/:id', async (req, res) => {
  try {
    let userId = parseInt(req.params.id);
    let users = await readFileSync('./data/users.json');
    let listUsers = JSON.parse(users);
    let indexOfUser = getIndexOfUserById(listUsers, userId);

    if (!userId) {
      return res.json({ error: 'Id is required filed'});
    } 

    if (indexOfUser !== undefined) {
      listUsers.splice(indexOfUser, 1);
      await writeFileSync('./data/users.json', JSON.stringify(listUsers));
      return res.json({ message: 'Susscess'});
    }

    return res.json({ message: 'Cannot delete user'});
  } catch (e) {
      return res.json({ message: e.message });
  }
});

app.post('/users/update/:id', async (req, res) => {
  try {
    let listUsers = await readFileSync('./data/users.json');
    let userId = parseInt(req.params.id);
    let body = req.body;
    let indexOfUser = getIndexOfUserById(listUsers, userId);

    if (!userId) {
      return res.json({ error: 'Id is required filed'});
    }
    // update user's id
    if (body.id) {
      listUsers[indexOfUser].id = parseInt(body.id);
    } 
    // update user's name
    if (body.name) {
      listUsers[indexOfUser].name = body.name;
    }
    // update user's age
    if (body.age) {
      listUsers[indexOfUser].age = body.age;
    }
    await writeFileSync('./data/users.json', JSON.stringify(listUsers));
    return res.json({ message: 'Update Successly', user: listUsers[indexOfUser] });
  } catch (e) {
    return res.json({ message: 'Can not update user', error: e.message });
  }
});

// Code api method Get, name '/users/search/:name'. Return user with name equal to name passed in params
app.get('/users/search/:name', async (req, res) => {
  try {
    let listUsers = await readFileSync('./data/users.json');
    let userName = req.params.name;
    let user = listUsers.filter(item => item.name === userName);

    if (!user.length) {
      return res.json({ message: 'User not found!!'});
    }

    return res.json({ message: 'Success!', user });
  } catch (e) {
    return res.json({ message: 'Fail!!', error: e.message });
  }
});

// Code api method Get, name '/users/search/:name'. Return user with name similar to name passed in params
app.get('/users/search-similar/:name', async (req, res) => {
  try {
    let listUsers = await readFileSync('./data/users.json');
    let userName = req.params.name;
    let user = listUsers.filter(item => item.name.toLowerCase().indexOf(userName.toLowerCase()) !== -1);

    if (!user.length) {
      return res.json({ message: 'User not found!!'});
    }

    return res.json({ message: 'Success!', user });
  } catch (e) {
    return res.json({ message: 'Fail!!', error: e.message });
  }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
