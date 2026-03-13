const express = require('express');
const app = express();
const router = express.Router();

router.get('/verify/:token', (req, res) => {
    res.send({ status: 'success', token: req.params.token });
});

router.get('/:id', (req, res) => {
    res.send({ status: 'id handler', id: req.params.id });
});

app.use('/api/registrations', router);

app.listen(9999, async () => {
    console.log('Server running');
    const response = await fetch('http://localhost:9999/api/registrations/verify/invalid-token');
    const text = await response.text();
    console.log('Response:', text);
    process.exit(0);
});
