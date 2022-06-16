const urlBase = 'http://contactmanager.me/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";



function show(shown, hidden) {
	document.getElementById(shown).style.display='block';
	document.getElementById(hidden).style.display='none';
	return false;
}


function doLogin() {
	userId = 0;
	firstName = "";
	lastName = "";
  
	let login = document.getElementById( "loginName" ).value;
	let password = document.getElementById( "loginPassword").value;

  if(login == 0)
  {
    document.getElementById("loginResult").style.color = "red";
    document.getElementById("loginResult").style.backgroundColor = "#EBC4C4";
    document.getElementById("loginResult").style.display = "block";
    document.getElementById("loginResult").innerHTML = "Please Enter A Login";
    return;
  }
  if(password == 0)
  {
    document.getElementById("loginResult").style.color = "red";
    document.getElementById("loginResult").style.backgroundColor = "#EBC4C4";
    document.getElementById("loginResult").style.display = "block";
    document.getElementById("loginResult").innerHTML = "Please Enter A Password";
    return;
  }
  
	let hash = md5(password);

	document.getElementById("loginResult").innerHTML = "";
	let tmp = {Login: login, Password: hash};
	let jsonPayload = JSON.stringify(tmp);

	let url = urlBase + '/login.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

	try{
		xhr.onreadystatechange = function(){
			if(this.readyState == 4 && this.status == 200) {
				let jsonObject = JSON.parse(xhr.responseText);//getting back a json
				userId = jsonObject.ID;
				if(userId < 1){
					document.getElementById("loginResult").style.color = "red";
		      document.getElementById("loginResult").style.backgroundColor = "#EBC4C4";
		      document.getElementById("loginResult").style.display = "block";
		      document.getElementById("loginResult").innerHTML = "Login/Password Combination Not Found";
					return;
				}
				firstName = jsonObject.FirstName;
				lastName = jsonObject.LastName;
				saveCookie();
        		localStorage.setItem("userId", userId);
				localStorage.setItem("firstName", firstName);
				localStorage.setItem("lastName", lastName);

				window.location.href = "contacts.html";
				//show('contacts', 'login');
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err){
		document.getElementById("loginResult").innerHTML = err.message;
	}
}


function saveCookie() {
	let minutes = 20;
	let date = new Date();
	date.setTime(date.getTime()+(minutes*60*1000));
	document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}


function readCookie() {
	userId = -1;
	let data = document.cookie;
	let splits = data.split(",");
	for(var i = 0; i < splits.length; i++) {
		let thisOne = splits[i].trim();
		let tokens = thisOne.split("=");
		if( tokens[0] == "firstName" ){
			firstName = tokens[1];
		}
		else if( tokens[0] == "lastName" ){
			lastName = tokens[1];
		}
		else if( tokens[0] == "userId" ){
			userId = parseInt( tokens[1].trim() );
		}
	}

	if( userId < 0 ){
		window.location.href = "index.html";
	}
	else{
		document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;
	}
}


function doDelete() {
	//id = document.getElementById("deleteId").value;
	//let id = element.id;
	// let select = document.getElementById("deleteSelect");
	// let id = select.options[select.selectedIndex].value;
	let id = localStorage.getItem("currentContactID");
	
	let tmp = {ID: id};// <----
	let jsonPayload = JSON.stringify(tmp);

	let url = urlBase + '/deleteContact.' + extension;// <----

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

	try{
		xhr.onreadystatechange = function(){
			if(this.readyState == 4 && this.status == 200) {
				saveCookie();

				//document.getElementById("deleteResult").innerHTML = "contact deleted"
				//deleteThisRow(id);
				//doPostDeleteSearch();
			 //TEMPORARY
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err){
		document.getElementById("deleteResult").innerHTML = err.message;
	}
}


function populateUpdate() {
	let data = localStorage.getItem("loadUser");
	let user = JSON.parse(data);
	if(user == null){
		//document.getElementById("displayResult").innerHTML = "Unable to retrieve user data";
		return;
	}
	document.getElementById("updatefirstName").placeholder = user.FirstName;
	document.getElementById("updatelastName").placeholder = user.LastName;
	document.getElementById("updateEmail").placeholder = user.Email;
	document.getElementById("updatePhone").placeholder = user.Phone;
}


function loadUser() {
	let i = localStorage.getItem("loadUserIndex");
  	let retrievedValue = localStorage.getItem("jsonObject");
	let jsonObject = JSON.parse(retrievedValue);
	//let i = row.parentNode.parentNode.rowIndex - 1;// rowIndex is always 1 more than results index because there is a header row
	if(i < 0){ 
		return;
	}
	
	//jsonObject = localStorage.getItem("jsonObject");
	document.getElementById("contactFirst").value = jsonObject.results[i].FirstName;
	document.getElementById("contactLast").value = jsonObject.results[i].LastName;
	document.getElementById("contactEmail").value = jsonObject.results[i].Email;
	document.getElementById("contactPhone").value = jsonObject.results[i].Phone;
  localStorage.setItem("currentContactID", jsonObject.results[i].ID);

	localStorage.setItem("loadUser", JSON.stringify(jsonObject.results[i]));
}


function doPostDeleteSearch() {
	let srch = localStorage.getItem("searchValue");// get the value searched for

  document.getElementById("searchResult").innerHTML = "";
  document.getElementById("displayUserContainer").style.display = "none";
  
	if (document.getElementById("myTable") != null) {
	    document.getElementById("myTable").remove();
	}   
  
  	userId = localStorage.getItem("userId");
	let tmp = {Search:srch,UserID:userId};
	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + '/search.' + extension;//	is this the correct addendum to the url?

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	
	try {
		xhr.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				let jsonObject = JSON.parse(xhr.responseText);
				localStorage.setItem("jsonObject", JSON.stringify(jsonObject));
				

				let tbl = document.createElement("TABLE");//NEW
				tbl.id = "myTable";
				let trH = tbl.insertRow();
				trH.id = "theHeaderRow";
				//createHeaderRow(); // It cannot finish this function?
				//from function
				let tdhFirst = trH.insertCell();// Add the first name
				tdhFirst.innerHTML = "<b>First Name</b>";
				
				
				let tdhLast = trH.insertCell();// Add the last name
				tdhLast.innerHTML = "<b>Last Name</b>";
				
			
				let tdhUpdate = trH.insertCell();// Add the last name
				tdhUpdate.innerHTML = "<b>Manage</b>";
				
				//from function
				

				//let theSelector = document.getElementById("deleteSelect");
				for(let i = 0; i < jsonObject.results.length; i++) {
					
					let tr = tbl.insertRow();// Create a new row
					//tr.id = jsonObject.results[i].ID.toString();

					//addNewCells(tr.id, jsonObject.results[i]);

					let tdFirst = tr.insertCell();// Add the first name
					tdFirst.innerHTML = jsonObject.results[i].FirstName;
					
					
					let tdLast = tr.insertCell();// Add the last name
					tdLast.innerHTML = jsonObject.results[i].LastName;
					
				
					let tdUpdate = tr.insertCell();// Add the last name
					let link = document.createElement("button");
					//link.onClick = document.getElementById("searchResult").innerHTML = "You clicked it...";//function() {
					link.innerHTML = "Opens";
          link.style.backgroundColor = "grey";
          link.style.color = "white";
					tdUpdate.appendChild(link);
					link.addEventListener ("click", function() {
						localStorage.setItem("loadUserIndex", this.parentNode.parentNode.rowIndex - 1); 
						
						document.getElementById("displayUserContainer").style.display = "block";

						//let x = document.getElementById("displayUser");
						document.getElementById("displayUserContainer").style.visibility = "visible";
						// if (x.style.display === "none") {
						//     x.style.display = "block";
						// } else {
						// 	x.style.display = "none";
						// }
						
						loadUser();
						//window.location.href = 'user.html';
					});
					// 	document.getElementById("searchResult").innerHTML = "You clicked it...";
						
					// };

					
					// let link = document.createElement("a");
					// link.href = "user.html";
					// link.innerHTML = "Open";
					// link.onClick = localStorage.setItem("loadUserIndex", this.parentNode.parentNode.rowIndex - 1);
					// tdUpdate.appendChild(link);
					
					// let option = document.createElement("option")
					// option.value = jsonObject.results[i].ID;
					// option.innerHTML = jsonObject.results[i].FirstName + jsonObject.results[i].LastName;
					// theSelector.add(option);
					
					
					// let tdDelete = document.createElement("td");
					// let deleteBtn = document.createElement("button");
					// deleteBtn.type = "button";
					// deleteBtn.id = jsonObject.results[i].ID;
					// deleteBtn.onClick = doDelete(this);
					// deleteBtn.innerHTML = "(-)";//"<img style = 'width: 1rem; height: auto;' src = '../images/delete.png'/>";
					// tdDelete.appendChild(deleteBtn);
					// tr.appendChild(tdDelete);
					
					// theSelector.style.display = "block";
	
				}
				document.getElementById("userList").appendChild(tbl);//was contactList
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("searchResult").innerHTML = err.message;
	}
	
}


function doSearch() {
	
	let srch = document.getElementById("searchText").value;
	localStorage.setItem("searchValue", srch);
	document.getElementById("searchResult").innerHTML = "";
  	document.getElementById("displayUserContainer").style.display = "none";

	while (document.getElementById("myTable") != null) {
	    document.getElementById("myTable").remove();
	}   

  	userId = localStorage.getItem("userId");
	let tmp = {Search:srch,UserID:userId};
	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + '/search.' + extension;//	is this the correct addendum to the url?

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	
	try {
		xhr.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				let jsonObject = JSON.parse(xhr.responseText);
				localStorage.setItem("jsonObject", JSON.stringify(jsonObject));
				

				let tbl = document.createElement("TABLE");//NEW
				tbl.id = "myTable";
				let trH = tbl.insertRow();
				trH.id = "theHeaderRow";
				//createHeaderRow(); // It cannot finish this function?
				//from function
				let tdhFirst = trH.insertCell();// Add the first name
				tdhFirst.innerHTML = "<b>First Name</b>";
				
				
				let tdhLast = trH.insertCell();// Add the last name
				tdhLast.innerHTML = "<b>Last Name</b>";
				
			
				let tdhUpdate = trH.insertCell();// Add the last name
				tdhUpdate.innerHTML = "<b>Manage</b>";
				
				//from function
				

				//let theSelector = document.getElementById("deleteSelect");
				for(let i = 0; i < jsonObject.results.length; i++) {
					
					let tr = tbl.insertRow();// Create a new row
					//tr.id = jsonObject.results[i].ID.toString();

					//addNewCells(tr.id, jsonObject.results[i]);

					let tdFirst = tr.insertCell();// Add the first name
					tdFirst.innerHTML = jsonObject.results[i].FirstName;
					
					
					let tdLast = tr.insertCell();// Add the last name
					tdLast.innerHTML = jsonObject.results[i].LastName;
					
				
					let tdUpdate = tr.insertCell();// Add the last name
					let link = document.createElement("button");
					//link.onClick = document.getElementById("searchResult").innerHTML = "You clicked it...";//function() {
					link.innerHTML = "Open";
          			link.style.backgroundColor = "#4F8DF4"; // change this
					link.style.color = "white";
          			link.style.font = "bold 10px";
					tdUpdate.appendChild(link);
					link.addEventListener ("click", function() {
						localStorage.setItem("loadUserIndex", this.parentNode.parentNode.rowIndex - 1); 
						
						document.getElementById("displayUserContainer").style.display = "block";
            document.getElementById("displayResult").style.display = "none";

						//let x = document.getElementById("displayUser");
						document.getElementById("displayUserContainer").style.visibility = "visible";
						// if (x.style.display === "none") {
						//     x.style.display = "block";
						// } else {
						// 	x.style.display = "none";
						// }
						
						loadUser();
						document.getElementById("displayUserContainer").scrollIntoView({behavior: 'smooth'});
						//window.location.href = 'user.html';
					});
					// 	document.getElementById("searchResult").innerHTML = "You clicked it...";
						
					// };

					
					// let link = document.createElement("a");
					// link.href = "user.html";
					// link.innerHTML = "Open";
					// link.onClick = localStorage.setItem("loadUserIndex", this.parentNode.parentNode.rowIndex - 1);
					// tdUpdate.appendChild(link);
					
					// let option = document.createEleme.int("option")
					// option.value = jsonObject.results[i].ID;
					// option.innerHTML = jsonObject.results[i].FirstName + jsonObject.results[i].LastName;
					// theSelector.add(option);
					
					
					// let tdDelete = document.createElement("td");
					// let deleteBtn = document.createElement("button");
					// deleteBtn.type = "button";
					// deleteBtn.id = jsonObject.results[i].ID;
					// deleteBtn.onClick = doDelete(this);
					// deleteBtn.innerHTML = "(-)";//"<img style = 'width: 1rem; height: auto;' src = '../images/delete.png'/>";
					// tdDelete.appendChild(deleteBtn);
					// tr.appendChild(tdDelete);
					
					// theSelector.style.display = "block";
	
				}
				document.getElementById("userList").appendChild(tbl);//was contactList
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("searchResult").innerHTML = err.message;
	}
	
}


function doLogout() {
	userId = 0;
	firstName = "";
	lastName = "";
	document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
  	localStorage.clear();
	window.location.href = "index.html";
}


function doRegister(){
	let firstNameRegister = document.getElementById( "registerfirstName" ).value;
	if(firstNameRegister == 0)
	{
    document.getElementById("registerResult").style.color = "red";
    document.getElementById("registerResult").style.backgroundColor = "#EBC4C4";
    document.getElementById("registerResult").style.display = "block";
    document.getElementById("registerResult").innerHTML = "Please Enter A First Name";
		return;
	}
	let lastNameRegister = document.getElementById( "registerlastName" ).value;
	if(lastNameRegister == 0)
	{
    document.getElementById("registerResult").style.color = "red";
    document.getElementById("registerResult").style.backgroundColor = "#EBC4C4";
    document.getElementById("registerResult").style.display = "block";
    document.getElementById("registerResult").innerHTML = "Please Enter A Last Name";
		return;
	}
  let loginRegister = document.getElementById( "registerloginName" ).value;
	if(loginRegister.length < 4)
	{
		document.getElementById("registerResult").style.color = "red";
    document.getElementById("registerResult").style.backgroundColor = "#EBC4C4";
    document.getElementById("registerResult").style.display = "block";
    document.getElementById("registerResult").innerHTML = "Login Must Be At Least 4 Characters";
		return;
	}
  let passwordRegister = document.getElementById( "registerpassword" ).value;
	if(passwordRegister.length < 8)
	{
		document.getElementById("registerResult").style.color = "red";
    document.getElementById("registerResult").style.backgroundColor = "#EBC4C4";
    document.getElementById("registerResult").style.display = "block";
    document.getElementById("registerResult").innerHTML = "Password Must Be At Least 8 Characters";
		return;
	}
	if(!isValidPassword(passwordRegister) || !upperCase(passwordRegister) || !lowerCase(passwordRegister) || !number(passwordRegister))
	{
    document.getElementById("registerResult").style.color = "red";
    document.getElementById("registerResult").style.backgroundColor = "#EBC4C4";
    document.getElementById("registerResult").style.display = "block";
    document.getElementById("registerResult").innerHTML = "Password Must Contain: 1 Special Character, 1 Uppercase Character, 1 Lowercase Character, and 1 Number";
		return;
	}
  let passwordConfirm = document.getElementById("registerpasswordConfirm").value;
  if (passwordConfirm != passwordRegister)
  {
    document.getElementById("registerResult").style.color = "red";
    document.getElementById("registerResult").style.backgroundColor = "#EBC4C4";
    document.getElementById("registerResult").style.display = "block";
    document.getElementById("registerResult").innerHTML = "Passwords Do Not Match";
    return;
  }

  let hash = md5(passwordRegister);
    let tmp = {Login: loginRegister, Password: hash, FirstName: firstNameRegister, LastName: lastNameRegister};
  	let jsonPayload = JSON.stringify(tmp);
    let url = urlBase + '/register.' + extension;
    let xhr = new XMLHttpRequest();
  	xhr.open("POST", url, true);
  	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

  try
	{
		xhr.onreadystatechange = function()
		{
			if (this.readyState == 4 && this.status == 200)
			{
				let jsonObject = JSON.parse( xhr.responseText );
				if(jsonObject.error == "Login Already Exists")
				{
					document.getElementById("registerResult").style.color = "red";
          document.getElementById("registerResult").style.backgroundColor = "#EBC4C4";
          document.getElementById("registerResult").style.display = "block";
          document.getElementById("registerResult").innerHTML = "Login Already Exists";
					return;
				}
					else{
						document.getElementById("registerResult").style.color = "green";
	          document.getElementById("registerResult").style.backgroundColor = "#BAEEBB";
	          document.getElementById("registerResult").style.display = "block";
	          document.getElementById("registerResult").innerHTML = "Account Has Been Created!";
					}
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("registerResult").innerHTML = err.message;
	}




}


function onContactsLoad(){
  userId = localStorage.getItem("userId");
  firstName = localStorage.getItem("firstName");
  lastName = localStorage.getItem("lastName");
  document.getElementById("welcome").innerHTML = "Welcome, " + firstName + " " + lastName;
}


function doUpdate(){
	let firstNameUpdate = document.getElementById( "contactFirst" ).value;

	let lastNameUpdate = document.getElementById( "contactLast" ).value;

	let emailUpdate = document.getElementById( "contactEmail" ).value;


	let phoneUpdate = document.getElementById( "contactPhone" ).value;
  
	let tmp = {FirstName: firstNameUpdate, LastName: lastNameUpdate, Email: emailUpdate, Phone: phoneUpdate, ID: localStorage.getItem("currentContactID")};
	let jsonPayload = JSON.stringify(tmp);
	let url = urlBase + '/updateContact.' + extension;
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function(){
			if (this.readyState == 4 && this.status == 200){
				prepareContactsScreen();
        document.getElementById("displayResult").style.color = "green";
	      document.getElementById("displayResult").style.backgroundColor = "#BAEEBB";
	      document.getElementById("displayResult").style.display = "block";
	      document.getElementById("displayResult").innerHTML = "Contact Updated Successfully";
			}
		}

		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("displayResult").style.color = "red";
		document.getElementById("displayResult").style.backgroundColor = "#EBC4C4";
		document.getElementById("displayResult").style.display = "block";
		document.getElementById("displayResult").innerHTML = err.message;
	}
	

}


function isValidPassword(str){
  const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
  return specialChars.test(str);
}


function upperCase(str){
	const specialChars = /[ABCDEFGHIJKLMNOPQRSTUVWXYZ]/;
  return specialChars.test(str);
}


function lowerCase(str){
	const specialChars = /[abcdefghijklmnopqrstuvwxyz]/;
  	return specialChars.test(str);
}


function number(str){
  const numbers = /[1234567890]/;
  return numbers.test(str);
}


function isEmail(str){
	const specialChars = /[@]/;
	const specialChars2 = /[.]/;
	let test1 = specialChars.test(str);
	let test2 = specialChars2.test(str);
	let retval = test1 && test2;
	return retval;

}


function isPhone(str){
	return /^[0-9]+$/.test(str);
}


function doAdd(){
  userId = localStorage.getItem("userId");
  let firstNameAdd = document.getElementById( "addFirstName" ).value;
  
	let lastNameAdd = document.getElementById( "addLastName" ).value;
  
	let emailAdd = document.getElementById( "addEmail" ).value;
  
	let phoneAdd = document.getElementById( "addPhone" ).value;

	let tmp = {UserID:userId,FirstName:firstNameAdd,LastName:lastNameAdd, Email: emailAdd, Phone: phoneAdd};
  
	let jsonPayload = JSON.stringify(tmp);
	let url = urlBase + '/addContact.' + extension;
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function(){
			if (this.readyState == 4 && this.status == 200){
				let jsonObject = JSON.parse( xhr.responseText );
				if(jsonObject.error == "Contact Already Exists"){
					document.getElementById("addContactResult").style.color = "red";
					document.getElementById("addContactResult").style.backgroundColor = "#EBC4C4";
					document.getElementById("addContactResult").style.display = "block";
					document.getElementById("addContactResult").innerHTML = "Contact Already Exists";
					return;
				}
        else {
					document.getElementById("addContactResult").style.color = "green";
					document.getElementById("addContactResult").style.backgroundColor = "#BAEEBB";
					document.getElementById("addContactResult").style.display = "block";
					document.getElementById("addContactResult").innerHTML = "Contact Successfully Added";
        }
			}
		};
		xhr.send(jsonPayload);
    
	}
	catch(err)
	{
		document.getElementById("addContactResult").style.color = "red";
		document.getElementById("addContactResult").style.backgroundColor = "#EBC4C4";
		document.getElementById("addContactResult").style.display = "block";
		document.getElementById("addContactResult").innerHTML = err.message;
	}

  let container = document.getElementById("addContactContainer");
  container.style.display = "none";
}


function goToAddContact(){
  window.location.href = "addContact.html";
  userId = localStorage.getItem("userId");
}

function init()
{
  onContactsLoad();
//   document.getElementById("searchText").addEventListener("keyup", function() {
//   // let oldSearch = document.getElementById("searchText").value;
//   // sleepFor(50);
//   // let newSearch = document.getElementById("searchText").value;
//   // if (newSearch != oldSearch)
//   // {
//   //   doSearch();
//   // }
//   doSearch();
// });
  let typingTimer;                //timer identifier
  let doneTypingInterval = 250;  //time in ms (5 seconds)
  let myInput = document.getElementById('searchText');

  //on keyup, start the countdown
  myInput.addEventListener('input', () => {
    clearTimeout(typingTimer);
        typingTimer = setTimeout(doSearch, doneTypingInterval);
});
  
}

function startUpdate()
{
  document.getElementById("contactFirst").readOnly = false;
  document.getElementById("contactLast").readOnly = false;
  document.getElementById("contactEmail").readOnly = false;
  document.getElementById("contactPhone").readOnly = false;
  
  //document.getElementById("cancelSearchButton").hidden = true;
  document.getElementById("cancelSearchButton").style.pointerEvents = "none";
  document.getElementById("deleteButton").hidden = true;
  document.getElementById("updateButton").hidden = true;
  document.getElementById("cancelChangesButton").hidden = false;
  document.getElementById("saveChangesButton").hidden = false;

  localStorage.setItem("oldFirst", document.getElementById("contactFirst").value);
  localStorage.setItem("oldLast", document.getElementById("contactLast").value);
  localStorage.setItem("oldEmail", document.getElementById("contactEmail").value);
  localStorage.setItem("oldPhone", document.getElementById("contactPhone").value);
}

function doUpdateAndGoBack()
{
  doUpdate();
  document.getElementById("contactFirst").readOnly = true;
  document.getElementById("contactLast").readOnly = true;
  document.getElementById("contactEmail").readOnly = true;
  document.getElementById("contactPhone").readOnly = true;
  
  document.getElementById("cancelSearchButton").hidden = false;
  document.getElementById("cancelSearchButton").style.pointerEvents = "auto";// keep close button on
  document.getElementById("deleteButton").hidden = false;
  document.getElementById("updateButton").hidden = false;
  document.getElementById("cancelChangesButton").hidden = true;
  document.getElementById("saveChangesButton").hidden = true;
}

function goBackToOpenContact()
{
  document.getElementById("contactFirst").value = localStorage.getItem("oldFirst");
  document.getElementById("contactLast").value = localStorage.getItem("oldLast");
  document.getElementById("contactPhone").value = localStorage.getItem("oldPhone");
  document.getElementById("contactEmail").value = localStorage.getItem("oldEmail");
  
  document.getElementById("contactFirst").readOnly = true;
  document.getElementById("contactLast").readOnly = true;
  document.getElementById("contactEmail").readOnly = true;
  document.getElementById("contactPhone").readOnly = true;
  
  document.getElementById("cancelSearchButton").hidden = false;
  document.getElementById("cancelSearchButton").style.pointerEvents = "auto";// keep close button on
  document.getElementById("deleteButton").hidden = false;
  document.getElementById("updateButton").hidden = false;
  document.getElementById("cancelChangesButton").hidden = true;
  document.getElementById("saveChangesButton").hidden = true;

  document.getElementById("displayResult").innerHTML = "";
  document.getElementById("displayResult").style.display = "none";
}

function returnToSearch()
{
  document.getElementById("displayUserContainer").style.display = "none";
}

function startDelete()
{
  let confirmDelete = confirm("Delete this contact permanently?")
  if (confirmDelete)
  {
    doDelete();
    document.getElementById("displayUserContainer").style.display = "none";
    sleepFor(250);
	document.getElementById("displayResult").style.color = "green";
	document.getElementById("displayResult").style.backgroundColor = "#BAEEBB";
	document.getElementById("displayResult").style.display = "block";
	document.getElementById("displayResult").innerHTML = "Contact Deleted Duccessfully";
    doSearch();
  }
  else
  {
    return;
  }
}

function checkAndDoUpdate()
{
  let flag = false;
  
  let firstNameUpdate = document.getElementById( "contactFirst" ).value;
  let lastNameUpdate = document.getElementById( "contactLast" ).value;
  let emailUpdate = document.getElementById( "contactEmail" ).value;
  let phoneUpdate = document.getElementById( "contactPhone" ).value;

	if(firstNameUpdate == 0)
	{
		document.getElementById("displayResult").style.color = "red";
		document.getElementById("displayResult").style.backgroundColor = "#EBC4C4";
		document.getElementById("displayResult").style.display = "block";
		document.getElementById("displayResult").innerHTML = "First Name Must Be Filled In";
		flag = true;
	}
	else if(lastNameUpdate == 0)
	{
		document.getElementById("displayResult").style.color = "red";
		document.getElementById("displayResult").style.backgroundColor = "#EBC4C4";
		document.getElementById("displayResult").style.display = "block";
		document.getElementById("displayResult").innerHTML = "Last Name Must Be Filled In";
		flag = true;
	}
	else if(emailUpdate == 0)
	{
		document.getElementById("displayResult").style.color = "red";
		document.getElementById("displayResult").style.backgroundColor = "#EBC4C4";
		document.getElementById("displayResult").style.display = "block";
		document.getElementById("displayResult").innerHTML = "Email Must Be Filled In";
		flag = true;
	}
	else if(!isEmail(emailUpdate)){
		document.getElementById("displayResult").style.color = "red";
		document.getElementById("displayResult").style.backgroundColor = "#EBC4C4";
		document.getElementById("displayResult").style.display = "block";
		document.getElementById("displayResult").innerHTML = "A Valid Email Address Is Required";
		flag = true;
	}
	else if (phoneUpdate.length != 12)
	{
		document.getElementById("displayResult").style.color = "red";
		document.getElementById("displayResult").style.backgroundColor = "#EBC4C4";
		document.getElementById("displayResult").style.display = "block";
		document.getElementById("displayResult").innerHTML = "A Valid Phone Number is Required";
		flag = true;
	}
	else if(!isValidPhoneNumber(phoneUpdate)){
		document.getElementById("displayResult").style.color = "red";
		document.getElementById("displayResult").style.backgroundColor = "#EBC4C4";
		document.getElementById("displayResult").style.display = "block";
		document.getElementById("displayResult").innerHTML = "A Valid Phone Number is Required";
		flag = true;
	}
  
  if (flag == false)
  {
    doUpdateAndGoBack();
  }
  else
  {
    return;
  }
}

function doAddAndGoBack()
{
  let flag = false;
  let firstNameAdd = document.getElementById( "addFirstName" ).value;
  let lastNameAdd = document.getElementById( "addLastName" ).value;
  let emailAdd = document.getElementById( "addEmail" ).value;
  let phoneAdd = document.getElementById( "addPhone" ).value;
  
	if(firstNameAdd == 0)
	{
		document.getElementById("addContactResult").style.color = "red";
		document.getElementById("addContactResult").style.backgroundColor = "#EBC4C4";
		document.getElementById("addContactResult").style.display = "block";
		document.getElementById("addContactResult").innerHTML = "First Name Must Be Filled In";
		flag = true;
	}
	else if(lastNameAdd == 0)
	{
		document.getElementById("addContactResult").style.color = "red";
		document.getElementById("addContactResult").style.backgroundColor = "#EBC4C4";
		document.getElementById("addContactResult").style.display = "block";
		document.getElementById("addContactResult").innerHTML = "Last Name Must Be Filled In";
		flag = true;
	}
	else if(emailAdd == 0 || !isEmail(emailAdd))
	{
		document.getElementById("addContactResult").style.color = "red";
		document.getElementById("addContactResult").style.backgroundColor = "#EBC4C4";
		document.getElementById("addContactResult").style.display = "block";
		document.getElementById("addContactResult").innerHTML = "A Valid Email is Required";
		flag = true;
	}
	else if (phoneAdd.length != 12 || !isValidPhoneNumber(phoneAdd))
	{
		document.getElementById("addContactResult").style.color = "red";
		document.getElementById("addContactResult").style.backgroundColor = "#EBC4C4";
		document.getElementById("addContactResult").style.display = "block";
		document.getElementById("addContactResult").innerHTML = "A Valid Phone Number is Required";
		flag = true;
	}

  if(!flag)
  {
    doAdd();
    document.getElementById("addFirstName").value = "";
    document.getElementById("addLastName").value = "";
    document.getElementById("addEmail").value = "";
    document.getElementById("addPhone").value = "";
    document.getElementById("addContactContainer").style.display = "none";
    document.getElementById("addNewContactBtn").style.display = "inline";
    sleepFor(200);
    doSearch();
  }
  else
  {
    return;
  }
  
}

function startAddContact()
{
	document.getElementById("addNewContactBtn").style.display = "none";
  	document.getElementById("addContactContainer").style.display = "flex";
  document.getElementById("addContactResult").style.display = "none";
  	
}

function isValidPhoneNumber(phoneNumber)
{
  //let formattedPhoneNumber = phoneAdd.slice(0,3) + "-" + phoneAdd.slice(3,6) + "-" + phoneAdd.slice(6);

  let firstThree = phoneNumber.slice(0, 3);
  let firstDash = phoneNumber.slice(3, 4);
  let secondThree = phoneNumber.slice(4, 7);
  let secondDash = phoneNumber.slice(7, 8);
  let lastFour = phoneNumber.slice(8);

  let flag = true;

  if (!number(firstThree) || !number(secondThree) || !number(lastFour))
  {
    flag = false;
  }
  if (firstDash != '-' || secondDash != '-')
  {
    flag = false;
  }

  return flag;
}

function prepareContactsScreen()
{
  document.getElementById("displayUserContainer").style.display = "none";
  let oldSearch = localStorage.getItem("searchValue");
  doSearch();
  document.getElementById("searchText").value = oldSearch;
}

function sleepFor(sleepDuration){
    var now = new Date().getTime();
    while(new Date().getTime() < now + sleepDuration){ 
        
    }
}

function clearAddContact()
{
  document.getElementById("addContactResult").innerHTML = "";

  document.getElementById("addFirstName").value = "";
  document.getElementById("addLastName").value = "";
  document.getElementById("addPhone").value = "";
  document.getElementById("addEmail").value = "";

  document.getElementById("addContactContainer").style.display = "none";
  document.getElementById("addContactResult").style.display = "none";
  document.getElementById("addNewContactBtn").style.display = "inline";
  //document.getElementById("emptyDiv").style.display = "none";
}

/*
 * JavaScript MD5
 * https://github.com/blueimp/JavaScript-MD5
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * https://opensource.org/licenses/MIT
 *
 * Based on
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */

/* global define */

/* eslint-disable strict */

;(function($) {
  'use strict'

  /**
   * Add integers, wrapping at 2^32.
   * This uses 16-bit operations internally to work around bugs in interpreters.
   *
   * @param {number} x First integer
   * @param {number} y Second integer
   * @returns {number} Sum
   */
  function safeAdd(x, y) {
    var lsw = (x & 0xffff) + (y & 0xffff)
    var msw = (x >> 16) + (y >> 16) + (lsw >> 16)
    return (msw << 16) | (lsw & 0xffff)
  }

  /**
   * Bitwise rotate a 32-bit number to the left.
   *
   * @param {number} num 32-bit number
   * @param {number} cnt Rotation count
   * @returns {number} Rotated number
   */
  function bitRotateLeft(num, cnt) {
    return (num << cnt) | (num >>> (32 - cnt))
  }

  /**
   * Basic operation the algorithm uses.
   *
   * @param {number} q q
   * @param {number} a a
   * @param {number} b b
   * @param {number} x x
   * @param {number} s s
   * @param {number} t t
   * @returns {number} Result
   */
  function md5cmn(q, a, b, x, s, t) {
    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b)
  }
  /**
   * Basic operation the algorithm uses.
   *
   * @param {number} a a
   * @param {number} b b
   * @param {number} c c
   * @param {number} d d
   * @param {number} x x
   * @param {number} s s
   * @param {number} t t
   * @returns {number} Result
   */
  function md5ff(a, b, c, d, x, s, t) {
    return md5cmn((b & c) | (~b & d), a, b, x, s, t)
  }
  /**
   * Basic operation the algorithm uses.
   *
   * @param {number} a a
   * @param {number} b b
   * @param {number} c c
   * @param {number} d d
   * @param {number} x x
   * @param {number} s s
   * @param {number} t t
   * @returns {number} Result
   */
  function md5gg(a, b, c, d, x, s, t) {
    return md5cmn((b & d) | (c & ~d), a, b, x, s, t)
  }
  /**
   * Basic operation the algorithm uses.
   *
   * @param {number} a a
   * @param {number} b b
   * @param {number} c c
   * @param {number} d d
   * @param {number} x x
   * @param {number} s s
   * @param {number} t t
   * @returns {number} Result
   */
  function md5hh(a, b, c, d, x, s, t) {
    return md5cmn(b ^ c ^ d, a, b, x, s, t)
  }
  /**
   * Basic operation the algorithm uses.
   *
   * @param {number} a a
   * @param {number} b b
   * @param {number} c c
   * @param {number} d d
   * @param {number} x x
   * @param {number} s s
   * @param {number} t t
   * @returns {number} Result
   */
  function md5ii(a, b, c, d, x, s, t) {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t)
  }

  /**
   * Calculate the MD5 of an array of little-endian words, and a bit length.
   *
   * @param {Array} x Array of little-endian words
   * @param {number} len Bit length
   * @returns {Array<number>} MD5 Array
   */
  function binlMD5(x, len) {
    /* append padding */
    x[len >> 5] |= 0x80 << len % 32
    x[(((len + 64) >>> 9) << 4) + 14] = len

    var i
    var olda
    var oldb
    var oldc
    var oldd
    var a = 1732584193
    var b = -271733879
    var c = -1732584194
    var d = 271733878

    for (i = 0; i < x.length; i += 16) {
      olda = a
      oldb = b
      oldc = c
      oldd = d

      a = md5ff(a, b, c, d, x[i], 7, -680876936)
      d = md5ff(d, a, b, c, x[i + 1], 12, -389564586)
      c = md5ff(c, d, a, b, x[i + 2], 17, 606105819)
      b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330)
      a = md5ff(a, b, c, d, x[i + 4], 7, -176418897)
      d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426)
      c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341)
      b = md5ff(b, c, d, a, x[i + 7], 22, -45705983)
      a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416)
      d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417)
      c = md5ff(c, d, a, b, x[i + 10], 17, -42063)
      b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162)
      a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682)
      d = md5ff(d, a, b, c, x[i + 13], 12, -40341101)
      c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290)
      b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329)

      a = md5gg(a, b, c, d, x[i + 1], 5, -165796510)
      d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632)
      c = md5gg(c, d, a, b, x[i + 11], 14, 643717713)
      b = md5gg(b, c, d, a, x[i], 20, -373897302)
      a = md5gg(a, b, c, d, x[i + 5], 5, -701558691)
      d = md5gg(d, a, b, c, x[i + 10], 9, 38016083)
      c = md5gg(c, d, a, b, x[i + 15], 14, -660478335)
      b = md5gg(b, c, d, a, x[i + 4], 20, -405537848)
      a = md5gg(a, b, c, d, x[i + 9], 5, 568446438)
      d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690)
      c = md5gg(c, d, a, b, x[i + 3], 14, -187363961)
      b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501)
      a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467)
      d = md5gg(d, a, b, c, x[i + 2], 9, -51403784)
      c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473)
      b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734)

      a = md5hh(a, b, c, d, x[i + 5], 4, -378558)
      d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463)
      c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562)
      b = md5hh(b, c, d, a, x[i + 14], 23, -35309556)
      a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060)
      d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353)
      c = md5hh(c, d, a, b, x[i + 7], 16, -155497632)
      b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640)
      a = md5hh(a, b, c, d, x[i + 13], 4, 681279174)
      d = md5hh(d, a, b, c, x[i], 11, -358537222)
      c = md5hh(c, d, a, b, x[i + 3], 16, -722521979)
      b = md5hh(b, c, d, a, x[i + 6], 23, 76029189)
      a = md5hh(a, b, c, d, x[i + 9], 4, -640364487)
      d = md5hh(d, a, b, c, x[i + 12], 11, -421815835)
      c = md5hh(c, d, a, b, x[i + 15], 16, 530742520)
      b = md5hh(b, c, d, a, x[i + 2], 23, -995338651)

      a = md5ii(a, b, c, d, x[i], 6, -198630844)
      d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415)
      c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905)
      b = md5ii(b, c, d, a, x[i + 5], 21, -57434055)
      a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571)
      d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606)
      c = md5ii(c, d, a, b, x[i + 10], 15, -1051523)
      b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799)
      a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359)
      d = md5ii(d, a, b, c, x[i + 15], 10, -30611744)
      c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380)
      b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649)
      a = md5ii(a, b, c, d, x[i + 4], 6, -145523070)
      d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379)
      c = md5ii(c, d, a, b, x[i + 2], 15, 718787259)
      b = md5ii(b, c, d, a, x[i + 9], 21, -343485551)

      a = safeAdd(a, olda)
      b = safeAdd(b, oldb)
      c = safeAdd(c, oldc)
      d = safeAdd(d, oldd)
    }
    return [a, b, c, d]
  }

  /**
   * Convert an array of little-endian words to a string
   *
   * @param {Array<number>} input MD5 Array
   * @returns {string} MD5 string
   */
  function binl2rstr(input) {
    var i
    var output = ''
    var length32 = input.length * 32
    for (i = 0; i < length32; i += 8) {
      output += String.fromCharCode((input[i >> 5] >>> i % 32) & 0xff)
    }
    return output
  }

  /**
   * Convert a raw string to an array of little-endian words
   * Characters >255 have their high-byte silently ignored.
   *
   * @param {string} input Raw input string
   * @returns {Array<number>} Array of little-endian words
   */
  function rstr2binl(input) {
    var i
    var output = []
    output[(input.length >> 2) - 1] = undefined
    for (i = 0; i < output.length; i += 1) {
      output[i] = 0
    }
    var length8 = input.length * 8
    for (i = 0; i < length8; i += 8) {
      output[i >> 5] |= (input.charCodeAt(i / 8) & 0xff) << i % 32
    }
    return output
  }

  /**
   * Calculate the MD5 of a raw string
   *
   * @param {string} s Input string
   * @returns {string} Raw MD5 string
   */
  function rstrMD5(s) {
    return binl2rstr(binlMD5(rstr2binl(s), s.length * 8))
  }

  /**
   * Calculates the HMAC-MD5 of a key and some data (raw strings)
   *
   * @param {string} key HMAC key
   * @param {string} data Raw input string
   * @returns {string} Raw MD5 string
   */
  function rstrHMACMD5(key, data) {
    var i
    var bkey = rstr2binl(key)
    var ipad = []
    var opad = []
    var hash
    ipad[15] = opad[15] = undefined
    if (bkey.length > 16) {
      bkey = binlMD5(bkey, key.length * 8)
    }
    for (i = 0; i < 16; i += 1) {
      ipad[i] = bkey[i] ^ 0x36363636
      opad[i] = bkey[i] ^ 0x5c5c5c5c
    }
    hash = binlMD5(ipad.concat(rstr2binl(data)), 512 + data.length * 8)
    return binl2rstr(binlMD5(opad.concat(hash), 512 + 128))
  }

  /**
   * Convert a raw string to a hex string
   *
   * @param {string} input Raw input string
   * @returns {string} Hex encoded string
   */
  function rstr2hex(input) {
    var hexTab = '0123456789abcdef'
    var output = ''
    var x
    var i
    for (i = 0; i < input.length; i += 1) {
      x = input.charCodeAt(i)
      output += hexTab.charAt((x >>> 4) & 0x0f) + hexTab.charAt(x & 0x0f)
    }
    return output
  }

  /**
   * Encode a string as UTF-8
   *
   * @param {string} input Input string
   * @returns {string} UTF8 string
   */
  function str2rstrUTF8(input) {
    return unescape(encodeURIComponent(input))
  }

  /**
   * Encodes input string as raw MD5 string
   *
   * @param {string} s Input string
   * @returns {string} Raw MD5 string
   */
  function rawMD5(s) {
    return rstrMD5(str2rstrUTF8(s))
  }
  /**
   * Encodes input string as Hex encoded string
   *
   * @param {string} s Input string
   * @returns {string} Hex encoded string
   */
  function hexMD5(s) {
    return rstr2hex(rawMD5(s))
  }
  /**
   * Calculates the raw HMAC-MD5 for the given key and data
   *
   * @param {string} k HMAC key
   * @param {string} d Input string
   * @returns {string} Raw MD5 string
   */
  function rawHMACMD5(k, d) {
    return rstrHMACMD5(str2rstrUTF8(k), str2rstrUTF8(d))
  }
  /**
   * Calculates the Hex encoded HMAC-MD5 for the given key and data
   *
   * @param {string} k HMAC key
   * @param {string} d Input string
   * @returns {string} Raw MD5 string
   */
  function hexHMACMD5(k, d) {
    return rstr2hex(rawHMACMD5(k, d))
  }

  /**
   * Calculates MD5 value for a given string.
   * If a key is provided, calculates the HMAC-MD5 value.
   * Returns a Hex encoded string unless the raw argument is given.
   *
   * @param {string} string Input string
   * @param {string} [key] HMAC key
   * @param {boolean} [raw] Raw output switch
   * @returns {string} MD5 output
   */
  function md5(string, key, raw) {
    if (!key) {
      if (!raw) {
        return hexMD5(string)
      }
      return rawMD5(string)
    }
    if (!raw) {
      return hexHMACMD5(key, string)
    }
    return rawHMACMD5(key, string)
  }

  if (typeof define === 'function' && define.amd) {
    define(function() {
      return md5
    })
  } else if (typeof module === 'object' && module.exports) {
    module.exports = md5
  } else {
    $.md5 = md5
  }
})(this)