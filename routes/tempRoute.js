const express = require('express');
const router = express.Router({ caseSensitive: false, strict: false })

router.all('*',(req,res)=>{
    res.status(200).send('App Loaded. Please refresh!');
});

module.exports = router;