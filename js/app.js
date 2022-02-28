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
      cellText = document.createTextNode(data.target);
      cell.appendChild(cellText);
      newRow.appendChild(cell);
      tableBody.appendChild(newRow);

      ////
      cell = document.createElement("td");
      cellText = document.createTextNode(data.setSize);
      cell.appendChild(cellText);
      newRow.appendChild(cell);
      tableBody.appendChild(newRow);

      ////
      cell = document.createElement("td");
      cellText = document.createTextNode(data.set);
      cell.appendChild(cellText);
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
          '");'
      );
      aTag.setAttribute("class", "leading btn btn-raised");
      aTag.innerHTML = "Load Progress";
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
      aTag.setAttribute(
        "data-participantPresentation",
        data.preferredOrientation
      );
      aTag.innerHTML = "Edit Session";
      cell = document.createElement("td");
      cell.appendChild(aTag);
      newRow.appendChild(cell);

      ////
      aTag = document.createElement("a");
      aTag.setAttribute(
        "href",
        'javascript:pullMembersInClass("' + data.target + '");'
      );
      aTag.setAttribute("class", "leading btn btn-raised");
      aTag.innerHTML = "Show Class";
      cell = document.createElement("td");
      cell.appendChild(aTag);
      newRow.appendChild(cell);

      tableBody.appendChild(newRow);
    });
  } else {
    document.getElementById("nParticipantSpan").innerHTML = buildHeader("...");
  }
}
