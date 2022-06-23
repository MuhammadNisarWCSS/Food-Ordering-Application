
//Lets the server know to log the user out
function logoutSubmit() {


    //Create a new XMLHttpRequest
    let req = new XMLHttpRequest();
	req.onreadystatechange = function() {

		//If the request was successful, redirect the user to the home page
        if (this.readyState==4 && this.status==200) {

            window.location.href = "http://localhost:3000/"
        }
	}
	
	//Send a POST request to the server. 
	req.open("POST", '/logout');
	req.send();
}