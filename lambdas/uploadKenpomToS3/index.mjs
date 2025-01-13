import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { fromEnv } from '@aws-sdk/credential-provider-env';
import { fetchKenpom } from '/opt/nodejs/fetchKenpom.mjs';

const s3 = new S3Client({
	region: process.env.AWS_DEFAULT_REGION,
	credentials: fromEnv()
});

export const handler = async event => {
	const bucketName = 'kenpom-game-ranking-history';
	const key = `kenpom-rankings-${getCurrentDate()}.json`;

	try {
		const kenpomRankings = await fetchKenpom();

		const params = {
			Bucket: bucketName,
			Key: key,
			Body: JSON.stringify(kenpomRankings),
			ContentType: 'application/json'
		};

		const command = new PutObjectCommand(params);
		const result = await s3.send(command);

		console.log('Rankings successfully uploaded:', result);
	} catch (err) {
		const response = {
			statusCode: 500,
			body: JSON.stringify(`Error uploading rankings: ${err.toString()}`)
		};
		return response;
	}

	const response = {
		statusCode: 200,
		body: JSON.stringify('Successfully uploaded rankings.')
	};
	return response;
};

function getCurrentDate() {
	const today = new Date();
	const year = today.getFullYear();
	const month = String(today.getMonth() + 1).padStart(2, '0');
	const day = String(today.getDate()).padStart(2, '0');

	return `${year}-${month}-${day}`;
}
