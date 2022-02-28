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
 * @param {String} currentId id for user/teacher
 * @returns {String} string for use with firestore
 */
function getStudentCollectionPath(currentId) {
  return "mainCollection/" + currentId + "/students";
}

/**
 *
 * Returns the string path for collections to student performances
 *
 * @param {String} studentId id for student
 * @param {String} currentId id for user/teacher
 * @param {String} targetSkill target for instruction
 * @returns {String} string for use with firestore
 */
function getStudentPerformanceCollectionPath(
  studentId,
  currentId,
  targetSkill
) {
  return (
    "performanceCollection/" +
    currentId +
    "/" +
    targetSkill +
    "/students/" +
    studentId
  );
}

/**
 *
 * Get current user id (logged in)
 *
 * @returns {String} currentUserId string
 */
function getCurrentUserId() {
  return firebase.auth().currentUser.uid;
}

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

/**
 *
 * Get data from all members of class
 *
 * @param {String} targetSkill current skill being targeted
 */
function pullMembersInClass(targetSkill) {
  const individualProgressTable = document.getElementById("tableBody2");
  const rowCount = individualProgressTable.rows.length;
  var promiseArray = [];

  for (var i = 0; i < rowCount; i++) {
    const studentId = individualProgressTable.rows[i].cells[4].innerText;
    const userId = getCurrentUserId();
    const name = individualProgressTable.rows[i].cells[0].innerText;

    const currPath = getStudentPerformanceCollectionPath(
      studentId,
      userId,
      targetSkill
    );

    var studentPerfs = db
      .collection(currPath)
      .get()
      .then((qs) => {
        var dataObject = {
          data: qs.docs.map((doc) => ({
            ...doc.data(),
          })),
          name: name,
          target: targetSkill,
        };

        return dataObject;
      });

    promiseArray.push(studentPerfs);
  }

  Promise.all(promiseArray).then((arrayOfArrays) =>
    updateFigureClasswide(arrayOfArrays)
  );
}
