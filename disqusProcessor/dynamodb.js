/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */

'use strict';


const AWS = require('aws-sdk')
AWS.config.update({ region: process.env.REGION || 'us-east-1' })
const documentClient = new AWS.DynamoDB.DocumentClient()

// DynamoDB functions.

// Update post after approval/workflow action.
// Returns result from DocumentClient

const updatePost = async (disqusId) => {
  console.log('updatePost: ', disqusId)

  return new Promise((resolve, reject) => {
    const params = {
      Key: { disqusId: String(disqusId) },
      TableName: process.env.ddb_table,
      UpdateExpression: 'set #a = :newStatus',
      ExpressionAttributeNames: {
        '#a': 'status'
      },
      ExpressionAttributeValues: {
        ':newStatus': 'Processed'
      }
    }
    documentClient.update(params, function(err, data) {
      if (err) {
        console.error('updatePost error: ', err)
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

module.exports = { updatePost }
