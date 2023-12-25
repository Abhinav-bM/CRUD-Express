const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3001;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

let userData = require('./data.json');
let userIdCounter = calculateUserIdCounter();

function calculateUserIdCounter() {
  if (userData.length === 0) {
    return 1;
  } else {
    const maxId = userData.reduce((max, user) => {
      const userId = parseInt(user.id);
      return userId > max ? userId : max;
    }, 0);
    return maxId + 1;
  }
}

app.get('/', (req, res) => {
  res.render('userList', { users: userData });
});

app.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  const user = userData.find(user => user.id === userId);
  res.render('userForm', { user });
});

app.post('/user/save', (req, res) => {
  const { id, name, age, email, phone } = req.body;

  if (id) {
    // Edit existing user
    const existingUserIndex = userData.findIndex(user => user.id === id);
    if (existingUserIndex !== -1) {
      userData[existingUserIndex] = { id, name, age, email, phone };
    }
  } else {
    const newUserId = userIdCounter.toString();
    const newUser = { id: newUserId, name, age, email, phone };
    userData.push(newUser);
    userIdCounter++;
  }
  fs.writeFileSync('./data.json', JSON.stringify(userData, null, 2));
  res.redirect('/');
});

app.get('/user/delete/:id', (req, res) => {
  const userId = req.params.id;
  userData = userData.filter(user => user.id !== userId);

  // Reassign IDs sequentially after deletion
  userData.forEach((user, index) => {
    user.id = (index + 1).toString();
  });

  userIdCounter = userData.length > 0 ? userData.length + 1 : 1;

  fs.writeFileSync('./data.json', JSON.stringify(userData, null, 2));
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

