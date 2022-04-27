/**
 *
 * Listener for snapshot changes
 *
 * @param {QuerySnapshot} querySnapshot
 */
function onAdminUpdateCall(querySnapshot) {
  if (!querySnapshot.empty) {
    var selectHolderRef = document.getElementById("selectHolder");
    selectHolderRef.innerHTML = "";

    var selectList = document.createElement("select");
    selectList.id = "selectListId";

    var option = document.createElement("option");
    option.value = null;
    option.text = "Please select teacher";
    selectList.appendChild(option);

    querySnapshot.forEach(function (doc) {
      var option = document.createElement("option");
      option.value = doc.id;
      option.text = doc.data().teacherName;
      selectList.appendChild(option);
    });

    selectHolderRef.addEventListener("change", function () {
      const selRef = document.getElementById("selectListId");

      if (selRef.value != null) {
        document.getElementById("participantDiv").innerHTML = "";
        document.getElementById("tableBody").innerHTML = "";
        document.getElementById("tableBody2").innerHTML = "";

        clearFigure();

        db.collection(getStudentCollectionPath(getCurrentUserId())).onSnapshot(
          snapshotUpdateCall
        );
      }
    });

    selectHolderRef.appendChild(selectList);
  }
}

/**
 *
 * Listener for snapshot changes
 *
 * @param {Array} teacherIds
 */
function onCoordinatorCall(teacherIds) {
  if (teacherIds.length > 0) {
    var selectHolderRef = document.getElementById("selectHolder");
    selectHolderRef.innerHTML = "";

    var selectList = document.createElement("select");
    selectList.id = "selectListId";

    var option = document.createElement("option");
    option.value = null;
    option.text = "Please select teacher";
    selectList.appendChild(option);

    teacherIds.forEach(function (id) {
      db.doc("mainCollection/" + id)
        .get()
        .then((res) => {
          var option = document.createElement("option");
          option.value = id;
          option.text = res.data().teacherName;
          selectList.appendChild(option);
        });
    });

    selectHolderRef.addEventListener("change", function () {
      const selRef = document.getElementById("selectListId");

      if (selRef.value != null) {
        var selectedID = selRef.options[selRef.selectedIndex].value;

        document.getElementById("participantDiv").innerHTML = "";
        document.getElementById("tableBody").innerHTML = "";
        document.getElementById("tableBody2").innerHTML = "";

        clearFigure();

        db.collection(getStudentCollectionPath(selectedID)).onSnapshot(
          snapshotUpdateCall
        );
      }
    });

    selectHolderRef.appendChild(selectList);
  }
}

/**
 *
 * Listener for participant snapshot changes
 *
 * @param {QuerySnapshot} querySnapshot
 */
function snapshotUpdateCall(querySnapshot) {
  if (!querySnapshot.empty) {
    document.getElementById("nParticipantSpan").innerHTML = buildHeader(
      querySnapshot.size
    );

    document.getElementById("participantDiv").innerHTML = "";
    var tableBody = document.getElementById("tableBody2");
    tableBody.innerHTML = "";

    querySnapshot.forEach(function (doc) {
      const data = doc.data();

      //
      var newRow = document.createElement("tr");

      ////
      var cell = document.createElement("td");
      var cellText = document.createTextNode(data.name);
      cell.appendChild(cellText);
      newRow.appendChild(cell);
      tableBody.appendChild(newRow);

      ////
      cell = document.createElement("td");
      cellText = document.createTextNode(
        data.target + " (" + data.metric + ")"
      );
      cell.appendChild(cellText);
      newRow.appendChild(cell);
      tableBody.appendChild(newRow);

      ////
      cell = document.createElement("td");
      cellText = document.createTextNode(data.setSize + " (" + data.set + ")");
      cell.appendChild(cellText);
      newRow.appendChild(cell);
      tableBody.appendChild(newRow);

      ////
      cell = document.createElement("td");
      cellText = document.createTextNode(data.set);
      cell.appendChild(cellText);
      cell.style = "display:none";
      newRow.appendChild(cell);
      tableBody.appendChild(newRow);

      ////
      cell = document.createElement("td");
      cellText = document.createTextNode(doc.id);
      cell.appendChild(cellText);
      cell.style = "display:none";
      newRow.appendChild(cell);
      tableBody.appendChild(newRow);

      ////
      cell = document.createElement("td");
      cellText = document.createTextNode(data.metric);
      cell.appendChild(cellText);
      cell.style = "display:none";
      newRow.appendChild(cell);
      tableBody.appendChild(newRow);

      ////
      cell = document.createElement("td");
      cellText = document.createTextNode(data.aim);
      cell.appendChild(cellText);
      newRow.appendChild(cell);
      tableBody.appendChild(newRow);

      ////
      aTag = document.createElement("a");
      aTag.setAttribute(
        "href",
        'javascript:updateParticipant("' +
          doc.id +
          '","' +
          data.name +
          '","' +
          data.target +
          '","' +
          data.metric +
          '","' +
          data.aim +
          '");'
      );
      aTag.setAttribute("class", "leading btn btn-raised");
      aTag.innerHTML = "Load";
      cell = document.createElement("td");
      cell.appendChild(aTag);
      newRow.appendChild(cell);

      ////
      aTag = document.createElement("a");
      aTag.setAttribute("data-toggle", "modal");
      aTag.setAttribute("data-target", "#editParticipantModal");
      aTag.setAttribute("class", "leading btn btn-raised open-sessionDialog");
      aTag.setAttribute("data-id", doc.id);
      aTag.setAttribute("data-participantTag", data.name);
      aTag.setAttribute("data-participantTarget", data.target);
      aTag.setAttribute("data-participantSetSize", data.setSize);
      aTag.setAttribute("data-participantSet", data.set);
      aTag.setAttribute("data-participantMetric", data.metric);
      aTag.setAttribute("data-participantAim", data.aim);
      aTag.setAttribute("data-participantError", data.errorFeedback);

      aTag.innerHTML = "Edit";
      cell = document.createElement("td");
      cell.appendChild(aTag);
      newRow.appendChild(cell);

      ////
      aTag = document.createElement("a");
      aTag.setAttribute(
        "href",
        'javascript:pullMembersInClass("' +
          data.target +
          '","' +
          data.metric +
          '");'
      );
      aTag.setAttribute("class", "leading btn btn-raised");
      aTag.innerHTML = "Show";
      cell = document.createElement("td");
      cell.appendChild(aTag);
      newRow.appendChild(cell);

      tableBody.appendChild(newRow);
    });
  } else {
    document.getElementById("nParticipantSpan").innerHTML = buildHeader("...");
  }
}
