/**
 * Paths, other hard coded constants
 */

/**
 *
 * Return path to base collection
 *
 * @returns string for use with firestore
 */
function getCollectionPath() {
  return "mainCollection";
}

/**
 *
 * Returns the string path for collection to student information
 *
 * @param {*} currentId id for user/teacher
 * @returns string for use with firestore
 */
function getStudentCollectionPath(currentId) {
  return "mainCollection/" + currentId + "/students";
}

/**
 *
 * Returns the string path for collections to student performances
 *
 * @param {*} studentId id for student
 * @param {*} currentId id for user/teacher
 * @param {*} target target for instruction
 * @returns string for use with firestore
 */
function getStudentPerformanceCollectionPath(studentId, currentId, target) {
  return (
    "performanceCollection/" +
    currentId +
    "/" +
    target +
    "/students/" +
    studentId
  );
}

/**
 * Database queries
 */

/**
 *
 * Get individual student performance for a given task
 *
 * Get past performance for a given student
 * @param {*} address Address with UserID, Target, and StudentID
 * @returns Map of stored student data
 */
function getIndividualStudentPerformances(address) {
  const snapshot = db.collection(address).get();
  return snapshot.docs.map((doc) => doc.data());
}
