/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */

'use strict';

/* 
  This function is invoked by the DynamoDB stream and will call the
  Disqus API to approve/release the post if the sentiment score is
  above the threshold.
  
	The credentials and forum IDs needed are passed into the environment
	variables used by Lambda from the original SAM template when the
  application was installed from Serverless Application Repository
*/

const axios = require('axios')
const { updatePost } = require('./dynamodb')
const sentimentThreshold = 0.8

const disqusAPIurl = 'https://disqus.com/api/3.0/posts/approve.json'

const disqusProcessor = async (event) => {

  console.log(`disqusProcessor with ${event.Records.length} records`)

  // Process response
  await Promise.all(
    event.Records.map(async (record) => {
      try {
        // Only process if the item is new
        if (record.eventName !== 'INSERT') return console.log("Not a new record - ignoring")
        console.log('New record: ', JSON.stringify(record, null, 2))

        const post = JSON.parse(record.dynamodb.NewImage.post.S)
        const sentiment = post.sentiment.SentimentScore.Positive

        // If sentiment under threshold, do nothing
        if (sentiment < sentimentThreshold) return console.log(`Ignoring - (sentiment=${sentiment}`)

        // Release the post by calling the Disqus API
        console.log(`Releasing the post (sentiment=${sentiment}`)
        const results = await axios({
          url: `${disqusAPIurl}?&access_token=${process.env.access_token}&api_key=${process.env.api_key}&api_secret=${process.env.api_secret}&post=${post.id}`,
          method: 'post',
          port: 443
        })

        // Check status from Disqus API
        if (results.status === 200) {
          await updatePost(post.id)
          console.log('Released post')
        } else {
          console.error('Disqus API error: ', results)
        }
      } catch (err) {
        console.error(`Error with record ${record}: ${err}`)
      }
    })    
  )
}

module.exports = { disqusProcessor }