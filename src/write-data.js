const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    endpoint: new AWS.Endpoint('http://localhost:8000'),
    region: 'us-west-2',
    // what could you do to improve performance?
});

const tableName = 'SchoolStudents';

/**
 * The entry point into the lambda
 *
 * @param {Object} event
 * @param {string} event.schoolId
 * @param {string} event.schoolName
 * @param {string} event.studentId
 * @param {string} event.studentFirstName
 * @param {string} event.studentLastName
 * @param {string} event.studentGrade
 */
exports.handler = async (event) => {
    // TODO validate that all expected attributes are present (assume they are all required)
    let valid = true;
    for (let prop in ["schoolId", "schoolName", "studentId", "studentFirstName", "studentLastName", "studentGrade"]) {
        if (!prop in event) {
            console.error(`Missing property '${prop}' on record`);
            valid = false;
        }
    }
    if (!valid) {
        throw "Write failed: invalid properties"
    }
    // TODO use the AWS.DynamoDB.DocumentClient to save the 'SchoolStudent' record
    // The 'SchoolStudents' table key is composed of schoolId (partition key) and studentId (range key).
    return dynamodb.put({
        TableName: tableName,
        Item: {
            ...event
        },
    }).promise()
};
