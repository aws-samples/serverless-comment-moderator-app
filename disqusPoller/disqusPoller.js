/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */

'use strict'

/* 
	This function polls Disqus for unapproved posts and stores new
	posts in DynamoDB.
	 
	The credentials and forum IDs needed are passed into the environment
	variables used by Lambda from the original SAM template when the
	application was installed from Serverless Application Repository
*/

const axios = require('axios')
const getSentiment = require('./sentiment')
const { postExists, putPost } = require('./dynamodb')

const disqusAPIurl = 'https://disqus.com/api/3.0/forums/listPosts.json'

const disqusPoller = async () => {
	
	try {
		// Get unapproved posts from Disqus forum
		const response = await axios({
			url: `${disqusAPIurl}?forum=${process.env.forum}&access_token=${process.env.access_token}&related=thread&api_key=${process.env.api_key}&api_secret=${process.env.api_secret}&include=unapproved`,
			method: 'get',
			port: 443,
			responseType: JSON
		})
		const results = response.data.response
		console.log(`${results.length} post(s) found`)

		// Process response
		await Promise.all(
			results.map(async (record) => {
				try {
					// Check DynamoDB for existing post ID - ignore
					if (await postExists(record.id)) return console.log(`Found post ID ${record.id} - ignoring`)
					// Get sentiment from Comprehend and append to record
					record.sentiment = await getSentiment(record.message)
					// Set all new records to pending status
					record.status = 'pending'
					// Save new post into DynamoDB
					console.log(`New post ID ${record.id} - saving`)
					await putPost(record)

				} catch (err) {
					console.error(`Error with record ${record.id}: ${err}`)
				}
			})    
		)
	} catch (err) {
		console.error('disqusPoller error: ', err)
	}
}

module.exports = { disqusPoller }