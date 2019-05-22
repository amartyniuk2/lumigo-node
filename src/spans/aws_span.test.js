import * as awsSpan from './aws_span.js';
import MockDate from 'mockdate';
const exampleApiGatewayEvent = require('../testdata/events/apigw-request.json');

describe('aws', () => {
  const oldEnv = Object.assign({}, process.env);
  MockDate.set('05/14/1998');
  beforeEach(() => {
    const awsEnv = {
      LAMBDA_TASK_ROOT: '/var/task',
      LAMBDA_RUNTIME_DIR: '/var/runtime',
      AWS_REGION: 'us-east-1',
      AWS_DEFAULT_REGION: 'us-east-1',
      AWS_LAMBDA_LOG_GROUP_NAME: '/aws/lambda/aws-nodejs-dev-hello',
      AWS_LAMBDA_LOG_STREAM_NAME:
        '2019/05/16/[$LATEST]8bcc747eb4ff4897bf6eba48797c0d73',
      AWS_LAMBDA_FUNCTION_NAME: 'aws-nodejs-dev-hello',
      AWS_LAMBDA_FUNCTION_MEMORY_SIZE: '1024',
      AWS_LAMBDA_FUNCTION_VERSION: '$LATEST',
      _AWS_XRAY_DAEMON_ADDRESS: '169.254.79.2',
      _AWS_XRAY_DAEMON_PORT: '2000',
      AWS_XRAY_DAEMON_ADDRESS: '169.254.79.2:2000',
      AWS_XRAY_CONTEXT_MISSING: 'LOG_ERROR',
      _X_AMZN_TRACE_ID:
        'Root=1-5cdcf03a-64a1b06067c2100c52e51ef4;Parent=28effe37598bb622;Sampled=0',
      AWS_EXECUTION_ENV: 'AWS_Lambda_nodejs8.10',
    };

    process.env = { ...oldEnv, ...awsEnv };
  });
  afterEach(() => {
    process.env = { ...oldEnv };
  });

  test('getSpanInfo', () => {
    const expectedSpanInfo = {
      traceId: {
        Root: '1-5cdcf03a-64a1b06067c2100c52e51ef4',
        Parent: '28effe37598bb622',
        Sampled: '0',
        transactionId: '64a1b06067c2100c52e51ef4',
      },
      tracer: { name: '@lumigo/tracer', version: '0.0.123' },
      logGroupName: '/aws/lambda/aws-nodejs-dev-hello',
      logStreamName: '2019/05/16/[$LATEST]8bcc747eb4ff4897bf6eba48797c0d73',
      httpMethod: 'POST',
      resource: '/{proxy+}',
      stage: 'testStage',
      api: 'gy415nuibc.execute-api.us-east-1.amazonaws.com',
      triggeredBy: 'apigw',
    };

    expect(awsSpan.getSpanInfo(exampleApiGatewayEvent)).toEqual(
      expectedSpanInfo
    );
  });

  test('getStartSpan', () => {
    const token = 'DEAFBEEF';

    const awsRequestId = '6d26e3c8-60a6-4cee-8a70-f525f47a4caf';
    const functionName = 'w00t';
    const remainingTimeInMillis = 123456;
    const getRemainingTimeInMillis = jest.fn(() => remainingTimeInMillis);
    const awsAccountId = `985323015126`;
    const invokedFunctionArn = `arn:aws:lambda:us-east-1:${awsAccountId}:function:aws-nodejs-dev-hello`;

    const context = {
      awsRequestId,
      functionName,
      invokedFunctionArn,
      getRemainingTimeInMillis,
    };

    const expectedStartSpan = {
      _account: '985323015126',
      _id: '6d26e3c8-60a6-4cee-8a70-f525f47a4caf_started',
      _info: {
        api: 'gy415nuibc.execute-api.us-east-1.amazonaws.com',
        httpMethod: 'POST',
        logGroupName: '/aws/lambda/aws-nodejs-dev-hello',
        logStreamName: '2019/05/16/[$LATEST]8bcc747eb4ff4897bf6eba48797c0d73',
        resource: '/{proxy+}',
        stage: 'testStage',
        traceId: {
          Parent: '28effe37598bb622',
          Root: '1-5cdcf03a-64a1b06067c2100c52e51ef4',
          Sampled: '0',
          transactionId: '64a1b06067c2100c52e51ef4',
        },
        tracer: { name: '@lumigo/tracer', version: '0.0.123' },
        triggeredBy: 'apigw',
      },
      _memoryAllocated: '1024',
      _messageVersion: 2,
      _name: 'w00t',
      _readiness: 'cold ',
      _region: 'us-east-1',
      _runtime: 'AWS_Lambda_nodejs8.10',
      _started: 895093200000,
      _ended: 895093200000,
      _token: 'DEAFBEEF',
      _transactionId: '64a1b06067c2100c52e51ef4',
      _type: 'function',
      _vendor: 'AWS',
      _version: '$LATEST',
      envs: null,
      event: null,
      maxFinishTime: 895093323456,
    };

    expect(
      awsSpan.getStartSpan(exampleApiGatewayEvent, context, token)
    ).toEqual(expectedStartSpan);
  });
});
