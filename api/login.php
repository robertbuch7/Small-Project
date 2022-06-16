<?php

    $inData = getRequestInfo();

    $ID = 0;
    $FirstName = "";
    $LastName = "";

    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");

    if( $conn->connect_error )
	{
		returnWithError( $conn->connect_error );
	}
	else
	{
		$stmt = $conn->prepare("SELECT ID, FirstName, LastName FROM Users WHERE Login=? AND Password =?");
		$stmt->bind_param("ss", $inData["Login"], $inData["Password"]);
		$stmt->execute();

		//returns all valid results part of the recordset
		$result = $stmt->get_result();

		if( $row = $result->fetch_assoc()  )
		{
			$updateLoginDate = $conn->prepare("UPDATE Users SET DateLastLoggedIn = CURRENT_TIMESTAMP WHERE ID=?");
			$updateLoginDate->bind_param("s", $row['ID']);
			$updateLoginDate->execute();
			returnWithInfo( $row['FirstName'], $row['LastName'], $row['ID'] );
		}
		else
		{
			returnWithError("No Records Found");
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
		$retValue = '{"ID":0,"FirstName":"","LastName":"","error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
	function returnWithInfo( $FirstName, $LastName, $ID )
	{
		$retValue = '{"ID":' . $ID . ',"FirstName":"' . $FirstName . '","LastName":"' . $LastName . '","error":""}';
		sendResultInfoAsJson( $retValue );
	}
?>