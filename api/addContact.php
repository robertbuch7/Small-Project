<?php
	$inData = getRequestInfo();
	
	$firstName = $inData["FirstName"];
    $lastName = $inData["LastName"];
    $email = $inData["Email"];
    $phone = $inData["Phone"];
	$UserID = $inData["UserID"];

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	} 
	else
	{
        $check = $conn->prepare("SELECT * FROM Contacts WHERE UserID=? AND FirstName=? AND LastName=? AND Email=? AND Phone=?");
		$check->bind_param("sssss", $UserID, $firstName, $lastName, $email, $phone);
		$stmt = $conn->prepare("INSERT into Contacts (UserID, FirstName, LastName, Email, Phone) VALUES (?, ?, ?, ?, ?)");
		$stmt->bind_param("sssss", $UserID, $firstName, $lastName, $email, $phone);

        $check->execute();
		$result = $check->get_result();

        if( $row = $result->fetch_assoc()  )
		{
			returnWithError("Contact Already Exists");
		}
		else
		{
			$stmt->execute();
			returnWithError("");
		}

		$stmt->close();
		$conn->close();
	}

	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}
	
	function returnWithError( $err )
	{
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
?>