/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */

'use strict';

const AWS = require('aws-sdk')
AWS.config.update({ region: process.env.REGION || 'us-east-1' })
const comprehend = new AWS.Comprehend()

/* Submits an arbitrary snippet of text to the AWS Comprehend service
   for sentiment analysis. The service returns a JSON payload with scores
   for the text. 

   For more information on AWS Comprehend pricing see
   https://aws.amazon.com/comprehend/

   This application defaults to English but other languages are available.
*/

module.exports = async function(Text) {
    console.log(`getSentiment: text=${Text}`)
    if (!Text) return null
  
    const params = {
      LanguageCode: "en",
      Text
    }
    return new Promise((resolve, reject) => {
			comprehend.detectSentiment(params, (err, data) => {
				if (err) return reject(err)
				else return resolve(data)
			})
    })
}
