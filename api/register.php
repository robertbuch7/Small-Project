<?php

    $inData = getRequestInfo();

    $Login = $inData["Login"];
    $Password = $inData["Password"];
    $FirstName = $inData["FirstName"];
    $LastName = $inData["LastName"];
	$ID = 4;

    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");

    if( $conn->connect_error )
	{
		returnWithError( $conn->connect_error );
	}
	else
	{	
        //prepare statement to add user and add them to the table
		$check = $conn->prepare("SELECT * FROM Users WHERE Login=?");
		$check->bind_param("s", $Login);
		$stmt = $conn->prepare("insert into Users (FirstName, LastName, Login, Password) VALUES (?, ?, ?, ?)");
		$stmt->bind_param("ssss", $FirstName, $LastName, $Login, $Password);
		$check->execute();
		$result = $check->get_result();
		
		if( $row = $result->fetch_assoc()  )
		{
			returnWithError("Login Already Exists");
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
	
	function returnWithInfo( $FirstName, $LastName, $ID )
	{
		$retValue = '{"ID":' . $ID . ',"FirstName":"' . $FirstName . '","LastName":"' . $LastName . '","error":""}';
		sendResultInfoAsJson( $retValue );
	}
?>