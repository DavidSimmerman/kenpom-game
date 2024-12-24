import express from 'express';
import cors from 'cors';
import { fetchKenpom } from './fetchKenpom.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(express.static('public'));

app.get('/kenpom', async (req, res) => {
	const kenpom = await fetchKenpom();

	res.json({ rankings: kenpom });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
