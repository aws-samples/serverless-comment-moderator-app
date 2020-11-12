/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */

'use strict';

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 */

const { disqusPoller}  = require('./disqusPoller')

exports.lambdaHandler = async (event, context) => {
	console.log('Starting handler')
	
	try {
		await disqusPoller()
	} catch (err) {
		console.error(err)
		return err
	}

	return  {
		'statusCode': 200
	}
}
