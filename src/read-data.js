const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    endpoint: new AWS.Endpoint('http://localhost:8000'),
    region: 'us-west-2',
    // what could you do to improve performance?
});

const tableName = 'SchoolStudents';
const studentLastNameGsiName = 'studentLastNameGsi';

/**
 * The entry point into the lambda
 *
 * @param {Object} event
 * @param {string} event.schoolId
 * @param {string} event.studentId
 * @param {string} [event.studentLastName]
 */
exports.handler = async (event) => {
    // TODO use the AWS.DynamoDB.DocumentClient to write a query against the 'SchoolStudents' table and return the results.
    // The 'SchoolStudents' table key is composed of schoolId (partition key) and studentId (range key).
    let params = {
        TableName: tableName,
        // TODO (extra credit) limit the amount of records returned in the query to 5 and then implement the logic to
        //  return all pages of records found by the query (uncomment the test which exercises this functionality)
        Limit: 5,
    };
    if (!event.studentLastName) {
        params.KeyConditionExpression = "schoolId = :schoolId";
        params.ExpressionAttributeValues = {
            ":schoolId": event.schoolId,
        }
        if (event.studentId) {
            params.KeyConditionExpression += " and studentId = :studentId";
            params.ExpressionAttributeValues[":studentId"] = event.studentId;
        }
    } else {
        // TODO (extra credit) if event.studentLastName exists then query using the 'studentLastNameGsi' GSI and return
        //  the results.
        params.IndexName = studentLastNameGsiName;
        params.KeyConditionExpression = "studentLastName = :studentLastName";
        params.ExpressionAttributeValues = {
            ":studentLastName": event.studentLastName,
        }
    }
    const results = [];
    let lastEvaluatedKey = null;
    do {
        await dynamodb.query(params).promise().then(data => {
            results.push(...data.Items);
            lastEvaluatedKey = data.LastEvaluatedKey;
            params.ExclusiveStartKey = lastEvaluatedKey;
        })
    } while (lastEvaluatedKey);
    return results;
};
