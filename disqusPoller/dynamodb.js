/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */

'use strict'

const AWS = require('aws-sdk')
AWS.config.update({ region: process.env.REGION || 'us-east-1' })
const documentClient = new AWS.DynamoDB.DocumentClient()

// DynamoDB functions.

// Check table to see if disqusId already exists
// Returns boolean

const postExists = async (disqusId) => {
  console.log('getPost: ', disqusId)

  return new Promise((resolve, reject) => {
    const params = {
      Key: { disqusId },
      TableName: process.env.ddb_table
    }

    documentClient.get(params, function(err, data) {
      if (err) {
        console.error('postExists error: ', err)
        reject(err)
      } else {
        data.hasOwnProperty("Item") ? resolve (true) : resolve(false)
      }
    })
  })
}

// Add post to the table
// Returns result from DocumentClient

/* 
  created attribute will be used for TTL value in DynamoDB.
  This must contain a number in epoch time format which
  represents a time in the future when the item will be expired.
*/

const TTLoffset = (365 * 24 * 60 * 60)  // One year

const putPost = async (post) => {
  console.log('putPost: ', post.id)

  return new Promise((resolve, reject) => {
    const params = {
      TableName: process.env.ddb_table,
      Item: {
        disqusId: post.id,
        post: JSON.stringify(post), 
        created: Math.floor(Date.now() / 1000) + TTLoffset,
        status: post.status,
      }
    }
    console.log(params)
    documentClient.put(params, function(err, data) {
      if (err) reject(err)
      else resolve(data)
    })
  })
}

module.exports = { postExists, putPost }
