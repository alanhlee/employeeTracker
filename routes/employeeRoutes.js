const router = require("express").Router();
// bring in db
const db = require("../db");
// writing grocery routes...

// making routes for groceries
// GET all groceries
router.get("/groceries", (req, res) => {
  // res.send('GET all groceries')

  // second is a variable of (DATA) GROCERIES
  db.query("SELECT * FROM groceries", (err, groceries) => {
    if (err) {
      console.log(err);
    }
    res.json(groceries);
  });
});

// POST a grocery
router.post("/groceries", (req, res) => {
  // res.send('POST a grocery')
  db.query("INSERT INTO groceries SET ?", req.body, (err) => {
    if (err) {
      console.log(err);
    }
  });
  res.sendStatus(200);
});

module.exports = router;
